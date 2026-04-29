//-------------------------------------------------------
/**
 * 指定要素の次のフォーカス可能な要素へフォーカスを移動
 * @param {HTMLElement} currentElement - 現在の要素
 */
function moveFocusToNextElement(currentElement) {
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const allFocusables = Array.from(document.querySelectorAll(focusableSelector));
  const currentIndex = allFocusables.indexOf(currentElement);
  
  if (currentIndex !== -1 && currentIndex + 1 < allFocusables.length) {
    allFocusables[currentIndex + 1].focus();
  }
}

//-------------------------------------------------------
/**
 * 印刷ボタンのクリックと印刷後の処理（搭乗券ページ用）
 */
function initPrintButton() {
  const printButtons = document.querySelectorAll('[data-print="printOn"]');
  let sectionToReset = null;

  const handlePrintClick = (event) => {
    const targetSection = event.currentTarget.closest('.sky-ticket');

    if (targetSection) {
      document.body.classList.add('is-printing');

      // 高さ調整用クラスのリセット（印刷用）
      const heightAdjustEls = document.querySelectorAll('.js-height-adjust');
      heightAdjustEls.forEach(el => el.style.setProperty('height', 'auto', 'important'));

      targetSection.classList.remove('print_off');
      targetSection.classList.add('print_on');
      sectionToReset = targetSection;
      
      setTimeout(() => {
        window.print();
      }, 200);
    }
  };

  const handleAfterPrint = () => {
    document.body.classList.remove('is-printing');

    if (sectionToReset) {
      sectionToReset.classList.remove('print_on');
      sectionToReset.classList.add('print_off');
      sectionToReset = null;
    }

    // 高さ調整を再適用
    // まずimportant付きのautoを削除
    const heightAdjustEls = document.querySelectorAll('.js-height-adjust');
    heightAdjustEls.forEach(el => el.style.removeProperty('height'));

    const bpCarousels = document.querySelectorAll('.js-bpCarousel');
    bpCarousels.forEach(carousel => {
      // 関数が定義されているか確認してから実行
      if (typeof alignTicketBodyHeights === 'function') {
        alignTicketBodyHeights(carousel);
      }
    });
  };

  printButtons.forEach(button => {
    button.addEventListener('click', handlePrintClick);
  });

  window.addEventListener('afterprint', handleAfterPrint);
}


//-------------------------------------------------------
/**
 * タブ切り替え
 */
function initTabs() {
  const tabs = document.querySelectorAll('[role="tab"]');
  const tabLists = document.querySelectorAll('[role="tablist"]');

  // 各タブに click イベントハンドラー を追加
  tabs.forEach(tab => {
    tab.addEventListener("click", changeTabs);
  });

  // 各タブリストに keydown イベントリスナーを追加
  tabLists.forEach((tabList, index) => {
    let tabFocus = 0; // タブフォーカスの初期値

    tabList.addEventListener("keydown", e => {
      // 左矢印キーまたは右矢印キーが押された場合
      if (e.keyCode === 37 || e.keyCode === 39) {
        const tabsInList = tabList.querySelectorAll('[role="tab"]'); // タブリスト内のタブを取得
        tabsInList[tabFocus].setAttribute("tabindex", -1);

        if (e.keyCode === 37) {
          // ← を押したら
          tabFocus--;
          // 最初にいる場合は、最後に移動します
          if (tabFocus < 0) {
            tabFocus = tabsInList.length - 1;
          }
        } else if (e.keyCode === 39) {
          // → を押したら
          tabFocus++;
          // 最後にいる場合は、最初に移動します
          if (tabFocus >= tabsInList.length) {
            tabFocus = 0;
          }
        }

        tabsInList[tabFocus].setAttribute("tabindex", 0);
        tabsInList[tabFocus].focus();
      }
    });
  });
}

function changeTabs(e) {
  const target = e.target;
  const parent = target.parentNode;
  const grandparent = parent.parentNode;

  // タブから現在すべての選択状態を取り除きます
  parent
    .querySelectorAll('[aria-selected="true"]')
    .forEach(t => t.setAttribute("aria-selected", false));

  // このタブを選択されたタブとして設定します
  target.setAttribute("aria-selected", true);

  // すべてのタブパネルを非表示にします
  grandparent
    .querySelectorAll('[role="tabpanel"]')
    .forEach(p => p.setAttribute("hidden", ""));

  // 選択されたパネルを表示します
  grandparent.parentNode
    .querySelector(`#${target.getAttribute("aria-controls")}`)
    .removeAttribute("hidden");
}


//-------------------------------------------------------
/**
 * Modal Dialog（mail）
 */
const modalButtons = document.querySelectorAll('[data-modal="mail"]');

modalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // data-modal の値を取得 (例:"mail")
    const modalValue = button.dataset.modal;
    const container = button.parentElement;
    if (container) {
      const dialog = container.querySelector(`dialog[data-modal="${modalValue}"]`);
      if (dialog) {
        dialog.showModal();
      }
    }
  });
});

const modalcloseBtns = document.querySelectorAll(".modal-close");

modalcloseBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.parentElement.close();
  });
});

/**
 * メール送信モーダルのinput/label ID重複をJSで解消
 * 動的にDOM追加された場合にも追従する
 */
function initUniqueMailInputIds() {
  const baseId = 'skyInputMail';
  const root = document.querySelector('.wc-boardingpass') || document;
  let nextNumber = 1;

  const getUniqueId = () => {
    let candidate = `${baseId}-${String(nextNumber).padStart(2, '0')}`;
    while (document.getElementById(candidate)) {
      nextNumber += 1;
      candidate = `${baseId}-${String(nextNumber).padStart(2, '0')}`;
    }
    nextNumber += 1;
    return candidate;
  };

  const resolveDuplicateIds = () => {
    const labels = root.querySelectorAll(`label[for="${baseId}"]`);

    labels.forEach((label) => {
      const dialog = label.closest('dialog[data-modal="mail"]');
      if (!dialog) return;

      const input = dialog.querySelector(`input#${baseId}`);
      if (!input) return;

      const uniqueId = getUniqueId();
      input.id = uniqueId;
      label.setAttribute('for', uniqueId);
    });
  };

  resolveDuplicateIds();

  const observer = new MutationObserver((mutations) => {
    const hasRelevantChange = mutations.some((mutation) => {
      return Array.from(mutation.addedNodes).some((node) => {
        if (!(node instanceof Element)) return false;
        return node.matches('dialog[data-modal="mail"], label[for="skyInputMail"], input#skyInputMail')
          || Boolean(node.querySelector('dialog[data-modal="mail"], label[for="skyInputMail"], input#skyInputMail'));
      });
    });

    if (hasRelevantChange) {
      resolveDuplicateIds();
    }
  });

  observer.observe(root, { childList: true, subtree: true });
}


//-------------------------------------------------------
/**
 * Modal Dialog（seat）
 */

// data-modal属性を持つすべてのボタンを取得
const seatModalButtons = document.querySelectorAll('[data-modal="seat"],[data-modal="seat-ch"],[data-modal="fwrd"],[data-modal="na-fwrd"]');

seatModalButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    // イベントの伝播を停止
    event.stopPropagation();
    
    const modalType = button.getAttribute('data-modal');
    const targetDialog = document.querySelector(`dialog[data-modal="${modalType}"]`);

    if (targetDialog) {
      // 座席番号を更新（ボタン内の.seat-numberテキストを取得）
      const seatNumber = button.querySelector('.seat-number');
      const modalSeatNumber = targetDialog.querySelector('.js-modal-seat-number');
      
      if (seatNumber && modalSeatNumber) {
        modalSeatNumber.textContent = seatNumber.textContent;
      }

      // ダイアログを開く
      targetDialog.showModal();
    }
  });
});


//-------------------------------------------------------
/**
 * tooltip
 */
function initTooltips() {
  // --- 定数・設定 ---
  const SELECTOR = {
    WRAPPER: '.sky-tooltip-wrap',
    TRIGGER: '[data-tooltip-trigger]',
    CONTENT: '[data-tooltip-content]',
    // フォーカス可能な要素（タブ移動用）
    FOCUSABLE: 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  };

  // --- 状態管理 ---
  let activeTrigger = null; // 現在開いているトリガー
  let activeContent = null; // 現在開いているコンテンツ

  // --- 1. 初期化処理 ---
  const wrappers = document.querySelectorAll(SELECTOR.WRAPPER);
  
  wrappers.forEach((wrapper, index) => {
    const trigger = wrapper.querySelector(SELECTOR.TRIGGER);
    const content = wrapper.querySelector(SELECTOR.CONTENT);

    if (!trigger || !content) return;

    // IDとARIA属性の設定
    const uniqueId = `sky-tooltip-${index}`;
    content.setAttribute('id', uniqueId);
    content.setAttribute('role', 'tooltip');
    content.setAttribute('aria-hidden', 'true');

    trigger.setAttribute('aria-controls', uniqueId);
    trigger.setAttribute('aria-expanded', 'false');
    if (!trigger.getAttribute('role')) trigger.setAttribute('role', 'button');

    // コンテンツをbody直下へ移動（デザイン崩れ防止）
    document.body.appendChild(content);

    // イベント登録（トリガー）
    setupTriggerEvents(trigger, content);
    
    // イベント登録（コンテンツ）
    setupContentEvents(trigger, content);
  });

  // --- 2. 共通イベント（全体制御） ---
  
  // 外部クリックで閉じる
  document.addEventListener('click', (e) => {
    // ツールチップ内部やトリガーのクリックでなければ閉じる
    if (!e.target.closest(SELECTOR.CONTENT) && !e.target.closest(SELECTOR.TRIGGER)) {
      closeAll();
    }
  });

  // ESCキー制御
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeTrigger) {
      const triggerToFocus = activeTrigger; // 閉じる前に保存
      closeAll();
      triggerToFocus.focus(); // フォーカスを戻す
    }
  });

  // スクロール・リサイズ時の位置調整（開いている時のみ実行）
  const updatePositionOnEvent = () => {
    if (activeTrigger && activeContent) {
      updatePosition(activeTrigger, activeContent);
    }
  };
  window.addEventListener('resize', updatePositionOnEvent, { passive: true });
  // window.addEventListener('scroll', updatePositionOnEvent, { passive: true });


  // --- 3. ロジック関数群 ---

  function setupTriggerEvents(trigger, content) {
    // クリックで開閉
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      isExpanded ? close(trigger, content) : open(trigger, content);
    });

    // キーボード操作（Enter/Space）
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
          close(trigger, content);
        } else {
          open(trigger, content);
          // 描画待ち後にコンテンツ内へフォーカス移動
          setTimeout(() => {
            const firstFocusable = content.querySelector(SELECTOR.FOCUSABLE);
            if (firstFocusable) firstFocusable.focus();
          }, 50);
        }
      }
    });
  }

  function setupContentEvents(trigger, content) {
    // コンテンツ内の非インタラクティブ要素クリックで閉じる
    content.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!e.target.closest(SELECTOR.FOCUSABLE)) {
        close(trigger, content);
      }
    });

    // Tabキー制御（フォーカストラップ解除）
    content.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      const focusables = content.querySelectorAll(SELECTOR.FOCUSABLE);
      if (focusables.length === 0) return;

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      // Shift + Tab: 先頭ならトリガーに戻る
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        trigger.focus();
      } 
      // Tab: 末尾なら閉じて次の要素へ
      else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        close(trigger, content);
        moveFocusToNextElement(trigger);
      }
    });
  }

  // ツールチップを開く
  function open(trigger, content) {
    closeAll(); // 他を閉じる

    // 状態更新
    activeTrigger = trigger;
    activeContent = content;

    content.classList.add('is-active');
    updatePosition(trigger, content);
    
    trigger.setAttribute('aria-expanded', 'true');
    content.setAttribute('aria-hidden', 'false');
  }

  // ツールチップを閉じる
  function close(trigger, content) {
    trigger.setAttribute('aria-expanded', 'false');
    content.setAttribute('aria-hidden', 'true');
    content.classList.remove('is-active');

    if (activeTrigger === trigger) {
      activeTrigger = null;
      activeContent = null;
    }
  }

  // 全て閉じる
  function closeAll() {
    if (activeTrigger && activeContent) {
      close(activeTrigger, activeContent);
    }
  }

  // 位置計算
  function updatePosition(trigger, content) {
    const triggerRect = trigger.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    
    // Visual Viewport APIを利用して正確なスクロール位置を取得
    // visualViewport.pageLeft/Top は「拡大やスクロールを含めた」ページ左上からの距離を返す
    const vv = window.visualViewport;
    const scrollX = vv ? vv.pageLeft : (window.pageXOffset || document.documentElement.scrollLeft);
    const scrollY = vv ? vv.pageTop  : (window.pageYOffset || document.documentElement.scrollTop);

    const viewportWidth = window.innerWidth;
    const gap = 10; 

    // ■ 横位置の計算
    let left = triggerRect.left + scrollX + (triggerRect.width / 2) - (contentRect.width / 2);

    // 横位置のはみ出し補正
    // ※補正計算の基準も拡大率の影響を受ける可能性があるため、少し余裕を持たせます
    if (left < 10) {
      left = 10;
    } else if (left + contentRect.width > document.documentElement.clientWidth - 10) {
      left = document.documentElement.clientWidth - contentRect.width - 10;
    }

    // ■ 縦位置の計算（上下フリップ機能付き）
    const spaceAbove = triggerRect.top - gap - contentRect.height;

    let top;
    let isBottom = false;

    // 「上にスペースがなく」かつ「下にスペースがある」場合
    if (spaceAbove < 0 && (window.innerHeight - triggerRect.bottom > contentRect.height + gap)) {
      // 下に表示
      top = triggerRect.bottom + scrollY + gap;
      isBottom = true;
    } else {
      // 上に表示
      top = triggerRect.top + scrollY - contentRect.height - gap;
      isBottom = false;
    }

    // ■ 矢印位置の調整
    const triggerCenterAbs = triggerRect.left + scrollX + (triggerRect.width / 2);
    const arrowRelPos = triggerCenterAbs - left;
    
    content.style.setProperty('--arrow-left', `${arrowRelPos}px`);
    content.style.top = `${top}px`;
    content.style.left = `${left}px`;

    // 矢印の向き用クラス
    if (isBottom) {
      content.classList.add('tooltip-bottom');
    } else {
      content.classList.remove('tooltip-bottom');
    }
  }
}


//-------------------------------------------------------
/**
 * Dialog closedby="any" Polyfill
 * Safari等、closedby属性未対応ブラウザ向けに
 * ダイアログ外側（backdrop）をクリックでの閉じる動作を実装
 */
function initDialogClosedByAny() {
  const dialogs = document.querySelectorAll('dialog[closedby="any"]');

  dialogs.forEach(dialog => {
    // backdropクリックで閉じる処理
    dialog.addEventListener('click', (event) => {
      // クリックされた要素がdialog要素そのものである場合（＝backdropをクリック）
      // 中身(.dialog-content)をクリックした場合は event.target が中身になるため閉じません
      if (event.target === dialog) {
        dialog.close('dismiss');
      }
    });

    // 閉じるボタンの処理
    const closeButtons = dialog.querySelectorAll('.button-close, .icon-close, button[type="reset"]');
    closeButtons.forEach(btn => {
      // 既にイベントリスナーが登録されていないか確認は難しいですが、
      // 念のため重複動作を防ぐために stopPropagation を入れています
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dialog.close('close');
      });
    });
  });
}


//-------------------------------------------------------
/**
 * more button
 */
function initMoreButton() {
  const moreNum = 2; // 初期表示の件数

  // itemListContainerごとに処理を繰り返し
  const itemlistContainers = document.querySelectorAll('.sky-moreContent');
  itemlistContainers.forEach(itemlistContainer => {
    // 各itemListContainer内のitemListを取得
    const itemList = itemlistContainer.querySelectorAll('.item');

    // 各itemListContainer内のmoreBtnContainerを取得
    const moreBtnContainer = itemlistContainer.nextElementSibling;
    const moreBtn = moreBtnContainer.querySelector('.button-more');

    // moreBtnContainerが存在する場合に処理を実行
    if (moreBtnContainer && moreBtn) {
      // 初期表示件数以降のリストを隠す
      for (let i = moreNum; i < itemList.length; i++) {
        itemList[i].classList.add('isHidden');
      }

      // itemListの要素数がmoreNum以下の場合にのみ、moreBtnContainerにisHiddenを付与
      if (itemList.length <= moreNum) {
        moreBtnContainer.classList.add('isHidden');
      }

      // 「もっとみる」ボタンをクリックしたら、全件表示（isHidden削除）
      moreBtn.addEventListener('click', () => {
        for (const list of itemList) {
          list.classList.remove('isHidden');
        }

        moreBtnContainer.classList.add('isHidden');

        // itemListを配列に変換
        const itemListArray = Array.from(itemList);
        // 隠れていたitemListにtab移動
        itemListArray[moreNum].setAttribute("tabindex", 0);
        itemListArray[moreNum].focus();
      });
    }
  });
}


//-------------------------------------------------------
/**
 * scroll active button
 */

const scrollElm = document.getElementById('scrollElm');
const checkElm = document.getElementById('checkElm');
if (scrollElm && checkElm) {
  scrollElm.addEventListener('scroll', function() {
    if (scrollElm.scrollHeight - scrollElm.scrollTop <= scrollElm.clientHeight) {
      checkElm.disabled = false;
    }
  });
}


//-------------------------------------------------------
/**
 * ページ内リンクのスムーズスクロール（URLに#を付けない）
 */
function initAnchorLinks() {
  // href属性が#で始まるすべてのリンクを取得
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const spMediaQuery = window.matchMedia('(max-width: 768px)');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); // デフォルトの動作を防ぐ
      
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      // ターゲット要素が存在し、かつ表示されている場合のみ処理
      if (targetElement && targetElement.offsetParent !== null) {

        // フォーカス移動（フォーカスを受け取れるようにtabindexを設定）
        if (!targetElement.getAttribute('tabindex')) {
          targetElement.setAttribute('tabindex', '-1');
          targetElement.style.outline = 'none'; // プログラムによるフォーカス時の枠線を消す
        }
        targetElement.focus();
        
        // SP表示時の処理
        if (spMediaQuery.matches) {
          const targetPos = targetElement.getBoundingClientRect().top + window.pageYOffset;
          let scrollToPos;

          // IDごとに着地地点の計算を分ける
          if (targetId === 'seat-back') {
            // 機体後方：要素が画面下端に来るように計算
            const marginBottom = parseFloat(getComputedStyle(document.documentElement).fontSize) * 5;
            scrollToPos = targetPos - window.innerHeight + targetElement.offsetHeight + marginBottom;
          } else if (targetId === 'seat-front') {
            // ★機体前方：要素の 5rem 手前に着地
            const offset = parseFloat(getComputedStyle(document.documentElement).fontSize) * 5;
            scrollToPos = targetPos - offset;
          } else {
            // その他のリンク：要素のちょうどTOPに着地
            scrollToPos = targetPos;
          }
          
          window.scrollTo({
            top: scrollToPos,
            behavior: 'smooth'
          });

        // PC表示時の処理
        } else {
          const scrollContainer = document.querySelector('.sky-seatmap');
          if (!scrollContainer) return;

          if (targetId === 'seat-back') {
            // .sky-seatmap-wrap を画面下部に表示
            const seatmapWrap = document.querySelector('.sky-seatmap-wrap');
            if (seatmapWrap) {
              seatmapWrap.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
              });
            }
            
            // .sky-seatmap 内部を一番下までスクロール
            const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            scrollContainer.scrollTo({
              top: maxScrollTop,
              behavior: 'smooth'
            });

          } else { // #seat-frontなど
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      }
    });
  });
}


//-------------------------------------------------------
/** 
 * カルーセル制御（768px以下） - 座席選択
 */

let seatSwipers = [];
const carouselMediaQuery = window.matchMedia('(max-width: 768px)');
let isCarouselActive = false; // カルーセルの状態を管理
const removedDisabledSlides = {}; // { carouselId: { slides: [Element...], positions: [index...] } }

/**
 * カルーセルトグルボタンの言語別テキストを取得
 * @returns {Object} - { active: string, inactive: string }
 */
function getCarouselButtonTexts() {
  const currentLang = document.documentElement.lang || 'ja';
  const buttonTexts = {
    'ja': { active: '搭乗者すべて表示', inactive: '閉じる' },
    'en': { active: 'Show all passengers', inactive: 'Close' },
    'zh': { active: '顯示所有乘客', inactive: '關閉' },
    'ko': { active: '탑승자 모두 보기', inactive: '닫다' }
  };
  return buttonTexts[currentLang] || buttonTexts['ja'];
}

/**
 * カルーセル初期化（座席選択）
 * @param {Object} startIndices - { 'ID名': インデックス番号 } の形式のオブジェクト
 */
function initSeatSwiper(startIndices = {}) {
  // 既存のSwiperインスタンスがあれば全て破棄
  seatSwipers.forEach(swiper => {
    if (swiper) {
      swiper.destroy(false, true);
    }
  });
  seatSwipers = [];
  
  // 全ての.js-carousel要素を取得して初期化
  const carouselEls = document.querySelectorAll('.js-carousel');
  carouselEls.forEach((carouselEl) => {
    // 前回削除されたスライドを復元
    if (removedDisabledSlides[carouselEl.id]) {
      const { slides: disabledSlides, metadata: disabledMetadata } = removedDisabledSlides[carouselEl.id];
      disabledSlides.forEach((slide, idx) => {
        const meta = disabledMetadata[idx];
        let insertedBefore = false;
        
        if (meta.nextVisibleOriginalIndex !== null) {
          // 同じoriginalIndexを持つスライドを探す
          const allCurrentSlides = carouselEl.querySelectorAll('.swiper-slide');
          for (let currentSlide of allCurrentSlides) {
            if (parseInt(currentSlide.dataset.originalIndex) === meta.nextVisibleOriginalIndex) {
              carouselEl.insertBefore(slide, currentSlide);
              insertedBefore = true;
              break;
            }
          }
        }
        
        if (!insertedBefore) {
          carouselEl.appendChild(slide);
        }
      });
      delete removedDisabledSlides[carouselEl.id];
    }
    
    // スライドの枚数を確認
    const slides = Array.from(carouselEl.querySelectorAll('.swiper-slide'));
    
    // スライドが1枚以下の場合はカルーセルを初期化しない
    if (slides.length <= 1) {
      carouselEl.classList.add('js-carousel-none');
      return;
    }
    
    // js-carousel-noneクラスを削除（カルーセル再初期化時）
    carouselEl.classList.remove('js-carousel-none');

    // disabledスライドをDOMから削除して、表示スライドのみの配列を作成
    const visibleSlides = [];
    const disabledSlidesToRemove = [];
    const disabledMetadata = [];
    
    slides.forEach((slide, originalIndex) => {
      if (slide.getAttribute('data-paxSeat') === 'disabled') {
        disabledSlidesToRemove.push(slide);
        slide.dataset.originalIndex = originalIndex; // 元のインデックスを保存
        
        // 次のvisibleスライドのoriginalIndexを探す
        let nextVisibleOriginalIndex = null;
        for (let i = originalIndex + 1; i < slides.length; i++) {
          if (slides[i].getAttribute('data-paxSeat') !== 'disabled') {
            nextVisibleOriginalIndex = i;
            break;
          }
        }
        disabledMetadata.push({ nextVisibleOriginalIndex });
      } else {
        slide.dataset.originalIndex = originalIndex;
        visibleSlides.push({ slide, originalIndex });
      }
    });

    // disabledスライドをDOMから削除
    if (disabledSlidesToRemove.length > 0) {
      removedDisabledSlides[carouselEl.id] = {
        slides: disabledSlidesToRemove,
        metadata: disabledMetadata
      };
      disabledSlidesToRemove.forEach(slide => slide.remove());
    }

    // disabledを除いた後、スライドが1枚以下の場合は初期化しない
    if (visibleSlides.length <= 1) {
      carouselEl.classList.add('js-carousel-none');
      return;
    }

    // "active" なスライドのインデックスを探す ---
    let startIndex = 0;
    
    if (startIndices[carouselEl.id] !== undefined) {
      // 保存されたインデックスに対応するスライドを探す
      const savedOriginalIndex = startIndices[carouselEl.id];
      startIndex = visibleSlides.findIndex(item => item.originalIndex === savedOriginalIndex);
      if (startIndex === -1) startIndex = 0; // 見つからない場合は0から開始
    } else {
      // activeアトリビュートを持つスライドを探す
      const activeIdx = visibleSlides.findIndex(item => item.slide.getAttribute('data-paxSeat') === 'active');
      startIndex = activeIdx !== -1 ? activeIdx : 0;
    }
    
    const swiperInstance = new Swiper(carouselEl, {
      initialSlide: 0, // 仮に0から開始（init内で正しいスライドに移動）
      direction: 'horizontal',
      slidesPerView: 'auto',
      spaceBetween: 8,
      watchSlidesProgress: true,
      loop: false,
      threshold: 15,
      touchStartPreventDefault: false, // タッチ開始時のデフォルト動作防止を解除
      edgeSwipeDetection: true, // Edgeでのスワイプ検知を有効化
      mousewheel: false, // マウスホイールでカルーセルが動く必要がない
      freeMode: false, // ユーザー操作による「中途半端な位置」での停止を防ぐ
      navigation: {
        nextEl: carouselEl.querySelector('.swiper-button-next'),
        prevEl: carouselEl.querySelector('.swiper-button-prev'),
      },
      a11y: {
        prevSlideMessage: '前のスライドへ',
        nextSlideMessage: '次のスライドへ',
        slideLabelMessage: '{{index}}枚目',
      },
      on: {
        // 各タイミングでフォーカス制御を実行
        init: function() {
          // 正しいスライドに移動
          if (startIndex > 0) {
            this.slideTo(startIndex, 0, false);
          }
          controlSlideFocus(this);
        },
        slideChange: function() {
          // disabledスライド検出ロジックは不要（display: noneで隠されているため）
          controlSlideFocus(this);
        }
      },
    });
    seatSwipers.push(swiperInstance);
  });
  
  // Swiperインスタンスが作成されなかった場合（スライドが0〜1枚）
  const carouselTrigger = document.getElementById('sky-carousel__trigger');
  if (seatSwipers.length === 0) {
    isCarouselActive = false;
    if (carouselTrigger) {
      carouselTrigger.style.display = 'none';
    }
  } else {
    isCarouselActive = true;
    if (carouselTrigger) {
      carouselTrigger.style.display = '';
    }
  }
}

function destroySeatSwiper() {
  // 全てのSwiperインスタンスを破棄
  seatSwipers.forEach(swiper => {
    if (swiper) {
      swiper.destroy(false, true);
    }
  });
  seatSwipers = [];
  
  // 全ての.js-carousel要素にclass="js-carousel-none"を付与
  const carouselEls = document.querySelectorAll('.js-carousel');
  carouselEls.forEach((carouselEl) => {
    carouselEl.classList.add('js-carousel-none');
    
    // カルーセル破棄時にスライド要素のinert/aria-hidden属性を削除
    const slides = carouselEl.querySelectorAll('.swiper-slide');
    slides.forEach((slide) => {
      slide.removeAttribute('inert');
      slide.removeAttribute('aria-hidden');
    });
    
    // 削除されたdisabledスライドをDOMに復元
    if (removedDisabledSlides[carouselEl.id]) {
      const { slides: disabledSlides, metadata: disabledMetadata } = removedDisabledSlides[carouselEl.id];
      disabledSlides.forEach((slide, idx) => {
        const meta = disabledMetadata[idx];
        let insertedBefore = false;
        
        if (meta.nextVisibleOriginalIndex !== null) {
          // 同じoriginalIndexを持つスライドを探す
          const allCurrentSlides = carouselEl.querySelectorAll('.swiper-slide');
          for (let currentSlide of allCurrentSlides) {
            if (parseInt(currentSlide.dataset.originalIndex) === meta.nextVisibleOriginalIndex) {
              // currentSlideの実際の親に対して挿入（swiper-wrapperの中にある場合も対応）
              currentSlide.parentNode.insertBefore(slide, currentSlide);
              insertedBefore = true;
              break;
            }
          }
        }
        
        if (!insertedBefore) {
          // スライドがwrapper内にある場合はwrapperに、そうでなければcarouselに追加
          const swiperWrapper = carouselEl.querySelector('.swiper-wrapper');
          if (swiperWrapper) {
            swiperWrapper.appendChild(slide);
          } else {
            carouselEl.appendChild(slide);
          }
        }
      });
      delete removedDisabledSlides[carouselEl.id];
    }
  });
  
  isCarouselActive = false; // カルーセルが非アクティブ状態
}

function checkBreakpoint(e) {
  if (e.matches) {
    // SP表示（768px以下）
    initSeatSwiper();
    
    // カルーセルトグルボタンのテキストとaria-pressedを更新
    const carouselTrigger = document.getElementById('sky-carousel__trigger');
    if (carouselTrigger) {
      // Swiperインスタンスが作成された場合のみボタンを表示
      if (seatSwipers.length > 0) {
        const toggleText = carouselTrigger.querySelector('.js-toggle-text');
        const texts = getCarouselButtonTexts();
        
        carouselTrigger.setAttribute('aria-pressed', 'true');
        if (toggleText) toggleText.textContent = texts.active;
        carouselTrigger.style.display = '';
      } else {
        carouselTrigger.style.display = 'none';
      }
    }
  } else {
    // PC表示（768px以上）
    // destroySeatSwiper()内で復元処理を行うため、ここでは単に破棄を呼ぶ
    if (seatSwipers.length > 0) {
      destroySeatSwiper();
    }
    
    // PC表示時はボタンを非表示
    const carouselTrigger = document.getElementById('sky-carousel__trigger');
    if (carouselTrigger) {
      carouselTrigger.style.display = 'none';
    }
  }
}

carouselMediaQuery.addEventListener('change', checkBreakpoint);
checkBreakpoint(carouselMediaQuery);


//-------------------------------------------------------
/**
 * カルーセルトグルボタン
 */
function initCarouselToggle() {
  const carouselTrigger = document.getElementById('sky-carousel__trigger');
  
  if (carouselTrigger) {
    const toggleText = carouselTrigger.querySelector('.js-toggle-text');
    const texts = getCarouselButtonTexts();
    
    carouselTrigger.addEventListener('click', () => {
      // 768px以下の場合のみトグル機能を有効化
      if (carouselMediaQuery.matches) {
        if (isCarouselActive) {
          // カルーセルがアクティブな場合は破棄（全て展開）
          destroySeatSwiper();
          carouselTrigger.setAttribute('aria-pressed', 'false');
          if (toggleText) toggleText.textContent = texts.inactive;
          // スライドが2枚以上ある場合は「閉じる」ボタンとして表示したまま
        } else {
          // カルーセルが非アクティブな場合は初期化
          // SP状態のdisabledスライドをDOMから復元（念のため）
          const carouselEls = document.querySelectorAll('.js-carousel');
          carouselEls.forEach((carouselEl) => {
            if (removedDisabledSlides[carouselEl.id]) {
              const { slides: disabledSlides, metadata: disabledMetadata } = removedDisabledSlides[carouselEl.id];
              disabledSlides.forEach((slide, idx) => {
                const meta = disabledMetadata[idx];
                let insertedBefore = false;
                
                if (meta.nextVisibleOriginalIndex !== null) {
                  const allCurrentSlides = carouselEl.querySelectorAll('.swiper-slide');
                  for (let currentSlide of allCurrentSlides) {
                    if (parseInt(currentSlide.dataset.originalIndex) === meta.nextVisibleOriginalIndex) {
                      // currentSlideの実際の親に対して挿入
                      currentSlide.parentNode.insertBefore(slide, currentSlide);
                      insertedBefore = true;
                      break;
                    }
                  }
                }
                
                if (!insertedBefore) {
                  // スライドがwrapper内にある場合はwrapperに、そうでなければcarouselに追加
                  const swiperWrapper = carouselEl.querySelector('.swiper-wrapper');
                  if (swiperWrapper) {
                    swiperWrapper.appendChild(slide);
                  } else {
                    carouselEl.appendChild(slide);
                  }
                }
              });
              delete removedDisabledSlides[carouselEl.id];
            }
          });
          
          initSeatSwiper();
          // initSeatSwiper内でseatSwipers.lengthに基づいて表示/非表示が制御される
          if (seatSwipers.length > 0) {
            carouselTrigger.setAttribute('aria-pressed', 'true');
            if (toggleText) toggleText.textContent = texts.active;
          } else {
            // スライドが0〜1枚の場合のみ非表示
            carouselTrigger.style.display = 'none';
          }
        }
      }
    });
    
    // 初期状態のaria-pressed属性とテキスト、表示/非表示を設定
    if (carouselMediaQuery.matches && isCarouselActive && seatSwipers.length > 0) {
      carouselTrigger.setAttribute('aria-pressed', 'true');
      if (toggleText) toggleText.textContent = texts.active;
      carouselTrigger.style.display = ''; // 表示
    } else if (carouselMediaQuery.matches && !isCarouselActive) {
      carouselTrigger.setAttribute('aria-pressed', 'false');
      if (toggleText) toggleText.textContent = texts.inactive;
      carouselTrigger.style.display = 'none'; // 非表示
    } else {
      carouselTrigger.setAttribute('aria-pressed', 'false');
      if (toggleText) toggleText.textContent = texts.inactive;
      carouselTrigger.style.display = 'none'; // PC表示時は非表示
    }
  }
}


//-------------------------------------------------------
/**
 * マップのスクロール連動インジケーター
 */
function initMapIndicator() {
  // 要素の取得
  const mainmap = document.getElementById('js-map');
  const minimap = document.getElementById('js-minimap');
  const indicator = document.getElementById('js-indicator');

  // 要素が存在しない場合は処理を中断
  if (!mainmap || !minimap || !indicator) return;

  function updateIndicator() {
    // コンテンツ全体の高さと、ミニマップの高さの比率
    // scrollHeight: コンテンツの総高さ
    // clientHeight: コンテンツの表示されている高さ
    const totalHeight = mainmap.scrollHeight;
    const visibleHeight = mainmap.clientHeight;
    const minimapHeight = minimap.clientHeight;

    // 比率 = ミニマップの高さ / コンテンツの総高さ
    const ratio = minimapHeight / totalHeight;

    // 表示領域の高さに比率を掛けて、インジケーターの高さを決定
    const indicatorHeight = visibleHeight * ratio;
    indicator.style.height = `${indicatorHeight}px`;

    // 現在のスクロール位置に比率を掛けて、インジケーターの位置を決定
    const scrollTop = mainmap.scrollTop;
    const indicatorTop = scrollTop * ratio;
    indicator.style.top = `${indicatorTop}px`;
  }

  // スクロール時に実行
  mainmap.addEventListener('scroll', updateIndicator);

  // 初期化時とウィンドウサイズ変更時にも実行して調整
  window.addEventListener('resize', updateIndicator);
  // 画像読み込み後などを考慮して少し待ってから初期実行、または即時実行
  updateIndicator();
}


//-------------------------------------------------------
/**
 * popover（座席選択時のページ内リンク設置）
 */
function initPopover() {
  const popoverElm = document.getElementById('js-popover');
  
  // ブラウザがPopover APIに対応しているかチェック
  if (popoverElm && typeof popoverElm.showPopover === 'function') {
    // ページ読み込み時にpopoverを表示
    popoverElm.showPopover();

    // ポップオーバー内の最初のフォーカス可能要素へフォーカス移動
    setTimeout(() => {
      const firstFocusable = popoverElm.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 100);
    
    // フェードアウトして非表示にする関数
    const fadeOutAndHide = (event) => {
      // イベント発生元のIDを事前に取得しておく（setTimeout内ではevent参照が不安定になる可能性があるため）
      // また、event.currentTarget はイベントハンドラが設定された要素
      const targetId = event && event.currentTarget ? event.currentTarget.id : '';
      const isLink = targetId === 'js-popover-link';

      popoverElm.classList.add('fade-out');
      setTimeout(() => {
        popoverElm.hidePopover();
        popoverElm.style.display = 'none';
        popoverElm.classList.add('hidden');

        // リンククリック以外の場合のみ、マップエリアへフォーカスを戻す
        if (!isLink) {
          const mapArea = document.getElementById('js-map');
          if (mapArea) {
            if (!mapArea.hasAttribute('tabindex')) {
              mapArea.setAttribute('tabindex', '-1');
            }
            // スクロール位置を保存してからfocusを実行
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            mapArea.focus();
            // スクロール位置を復元
            window.scrollTo(0, scrollTop);
          }
        }
      }, 300); // CSSのtransition時間と同じ
    };
    
    const closeButton = document.getElementById('js-popover-close');
    if (closeButton) {
      closeButton.addEventListener('click', fadeOutAndHide);
    }
    
    const popoverLink = document.getElementById('js-popover-link');
    if (popoverLink) {
      popoverLink.addEventListener('click', fadeOutAndHide);
    }
  }
}

//-------------------------------------------------------
/**
 * スティッキー表示の共通判定（mapが画面上端に到達し、かつ表示余地がある）
 * @param {HTMLElement} mapEl - マップ要素
 * @param {number} stickyHeight - 固定表示要素の高さ
 * @returns {boolean}
 */
function shouldShowStickyByMap(mapEl, stickyHeight = 0) {
  if (!mapEl) return false;

  const mapRect = mapEl.getBoundingClientRect();
  const isMapTopHit = mapRect.top <= 0;
  const isMapRemaining = mapRect.bottom > stickyHeight;

  return isMapTopHit && isMapRemaining;
}

//-------------------------------------------------------
/**
 * シート凡例の追従表示（SPのみ）
 * - SP: 元の凡例は閉じ、SP専用クローンを追従表示
 * - PC: 元の凡例を展開状態で表示
 */
function initStickySeatLegend() {
  const mapEl = document.getElementById('js-map');
  const legendSection = document.getElementById('js-seat-legend');
  const legendAccordion = document.getElementById('js-seat-legend-accordion');
  const carouselMediaQuery = window.matchMedia('(max-width: 768px)');

  if (!mapEl || !legendSection || !legendAccordion) return;

  let stickyLegend = null;
  let stickyAccordion = null;
  let stickySummary = null;

  const createStickyLegend = () => {
    if (stickyLegend && document.body.contains(stickyLegend)) return;

    const clonedLegend = legendSection.cloneNode(true);
    clonedLegend.id = 'js-seat-legend-sticky';
    clonedLegend.classList.add('sticky-seat-legend');
    clonedLegend.setAttribute('aria-hidden', 'true');

    const clonedAccordion = clonedLegend.querySelector('details.sky-accordion.acc_C');
    const clonedSummary = clonedAccordion ? clonedAccordion.querySelector('summary.accTitle') : null;
    const clonedDetail = clonedAccordion ? clonedAccordion.querySelector('.accDetail') : null;
    if (!clonedAccordion || !clonedSummary || !clonedDetail) return;

    let detailTitle = clonedDetail.querySelector('.detail-title');
    if (!detailTitle) {
      detailTitle = document.createElement('p');
      detailTitle.className = 'detail-title';
      detailTitle.textContent = '座席の説明';
      clonedDetail.insertBefore(detailTitle, clonedDetail.firstChild);
    }

    clonedAccordion.id = 'js-seat-legend-accordion-sticky';
    clonedAccordion.removeAttribute('open');

    let closeButton = clonedDetail.querySelector('.js-seat-legend-close');
    if (!closeButton) {
      closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'js-seat-legend-close';

      const closeImg = document.createElement('img');
      closeImg.src = '/webcheckin/common/images/icon/close-circle.svg';
      closeImg.alt = '閉じる';
      closeImg.className = 'i_grey';
      closeButton.appendChild(closeImg);

      clonedDetail.appendChild(closeButton);
    }

    closeButton.addEventListener('click', () => {
      clonedAccordion.removeAttribute('open');
      clonedSummary.focus();
    });

    document.body.appendChild(clonedLegend);
    stickyLegend = clonedLegend;
    stickyAccordion = clonedAccordion;
    stickySummary = clonedSummary;
  };

  const destroyStickyLegend = () => {
    if (!stickyLegend) return;
    if (stickyLegend.parentNode) {
      stickyLegend.parentNode.removeChild(stickyLegend);
    }
    stickyLegend = null;
    stickyAccordion = null;
    stickySummary = null;
  };

  const hideStickyLegend = () => {
    if (!stickyLegend) return;
    stickyLegend.classList.remove('is-visible');
    if (stickyAccordion) {
      stickyAccordion.removeAttribute('open');
    }
  };

  const handleScroll = () => {
    if (!carouselMediaQuery.matches || !stickyLegend || !stickySummary) return;

    const stickyHeight = stickySummary.offsetHeight;
    const shouldShow = shouldShowStickyByMap(mapEl, stickyHeight);

    if (shouldShow) {
      stickyLegend.classList.add('is-visible');
    } else {
      hideStickyLegend();
    }
  };

  const checkState = () => {
    window.removeEventListener('scroll', handleScroll);

    if (carouselMediaQuery.matches) {
      legendAccordion.removeAttribute('open');
      createStickyLegend();
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    } else {
      hideStickyLegend();
      destroyStickyLegend();
      legendAccordion.setAttribute('open', '');
    }
  };

  checkState();
  carouselMediaQuery.addEventListener('change', checkState);
}

//-------------------------------------------------------
/**
 * 搭乗便情報・搭乗者リストの追従表示（SPのみ）
 */
function initStickyPaxList() {
  const mapEl = document.getElementById('js-map');
  const originalSlider = document.getElementById('js-slider_paxlist');
  const originalFlightInfo = document.getElementById('js-flight-info'); 
  const carouselMediaQuery = window.matchMedia('(max-width: 768px)');

  // 必須要素がない、またはPCサイズの場合は何もしない（初期判定）
  if (!mapEl || !originalSlider) return;

  let stickyContainer = null;
  let stickySwiper = null;
  let currentSlideIndex = 0; // 現在のスライド位置を保持

  // 元のスライダーのスライド位置を更新する関数
  const updateOriginalSliderPosition = (index) => {
    currentSlideIndex = index;
    
    // 元のスライダーのSwiperインスタンスを取得（動的に）
    const originalSwiper = seatSwipers.find(swiper => swiper.el === originalSlider);
    
    if (originalSwiper && originalSwiper.realIndex !== index) {
      originalSwiper.slideTo(index);
    }
  };

  // 元のスライダーの現在位置を取得する関数
  const getCurrentSlideIndex = () => {
    const originalSwiper = seatSwipers.find(swiper => swiper.el === originalSlider);
    if (originalSwiper) {
      return originalSwiper.realIndex;
    }
    return currentSlideIndex;
  };

  // 追従用リストを作成・初期化する関数
  const createStickyList = () => {
    // 既に作成済みの場合は何もしない
    if (document.getElementById('js-slider_paxlist2')) return;

    // 現在のスライド位置を取得
    const initialSlideIndex = getCurrentSlideIndex();

    // コンテナ作成
    stickyContainer = document.createElement('div');
    stickyContainer.classList.add('sticky-paxlist');

    // 搭乗便情報を複製して追加
    if (originalFlightInfo) {
      const clonedFlightInfo = originalFlightInfo.cloneNode(true);
      clonedFlightInfo.id = 'js-flight-info2';
      clonedFlightInfo.classList.add('sticky-flight-info');
      stickyContainer.appendChild(clonedFlightInfo);
    }

    // 搭乗者リストを複製
    const clonedSlider = originalSlider.cloneNode(true);
    clonedSlider.id = 'js-slider_paxlist2';
    clonedSlider.classList.remove('js-carousel');
    
    // cloneNode直後にスライド属性をクリア（アクセシビリティ属性のみリセット、data-pax-seatは残す）
    clonedSlider.querySelectorAll('.swiper-slide').forEach(slide => {
      // data-pax-seatは残す（disabled判定に必要）
      slide.removeAttribute('aria-disabled');  // Swiper自動設定
      slide.removeAttribute('tabindex');       // Swiper自動設定
      slide.removeAttribute('inert');          // controlSlideFocus()で再設定
      slide.removeAttribute('aria-hidden');    // controlSlideFocus()で再設定
    });
    
    stickyContainer.appendChild(clonedSlider);
    document.body.appendChild(stickyContainer);

    // 複製したリスト内のdisabledスライドをDOMから削除
    const clonedSlides = Array.from(clonedSlider.querySelectorAll('.swiper-slide'));
    let clonedVisibleSlides = [];
    let clonedStartIndex = 0;
    
    clonedSlides.forEach((slide, originalIndex) => {
      if (slide.getAttribute('data-paxSeat') === 'disabled') {
        slide.dataset.originalIndex = originalIndex; // 削除前に元のインデックスを保存
        slide.remove();
      } else {
        slide.dataset.originalIndex = originalIndex;
        clonedVisibleSlides.push({ slide, originalIndex });
      }
    });
    
    // 表示スライド内での正しいインデックスを計算
    if (initialSlideIndex !== undefined) {
      clonedStartIndex = clonedVisibleSlides.findIndex(item => item.originalIndex === initialSlideIndex);
      if (clonedStartIndex === -1) clonedStartIndex = 0;
    }

    // 複製したリストのSwiperを初期化
    stickySwiper = new Swiper(clonedSlider, {
      initialSlide: 0, // 仮に0から開始（init内で正しいスライドに移動）
      direction: 'horizontal',
      slidesPerView: 'auto',
      spaceBetween: 8,
      watchSlidesProgress: true,
      loop: false,
      threshold: 15,
      touchStartPreventDefault: false,
      edgeSwipeDetection: true,
      mousewheel: false,
      freeMode: false,
      navigation: {
        nextEl: clonedSlider.querySelector('.swiper-button-next'),
        prevEl: clonedSlider.querySelector('.swiper-button-prev'),
      },
      a11y: {
        prevSlideMessage: '前のスライドへ',
        nextSlideMessage: '次のスライドへ',
        slideLabelMessage: '{{index}}枚目',
      },
      on: {
        init: function() {
          // 正しいスライドに移動
          if (clonedStartIndex > 0) {
            this.slideTo(clonedStartIndex, 0, false);
          }
          controlSlideFocus(this);
        },
        slideChange: function() {
          // disabledスライド検出ロジックは不要（display: noneで隠されているため）
          // スティッキー側のスライド変更を元のスライダーに反映
          updateOriginalSliderPosition(this.realIndex);
          // フォーカス制御を実行
          controlSlideFocus(this);
        }
      }
    });

    // 元のスライダーのイベントリスナーを設定
    const setupOriginalSwiperSync = () => {
      const originalSwiper = seatSwipers.find(swiper => swiper.el === originalSlider);
      if (originalSwiper) {
        originalSwiper.on('slideChange', function() {
          currentSlideIndex = this.realIndex;
          if (stickySwiper && stickySwiper.realIndex !== this.realIndex) {
            stickySwiper.slideTo(this.realIndex);
          }
        });
      }
    };
    
    // 初回実行
    setupOriginalSwiperSync();
    
    // カルーセル再初期化を監視（MutationObserverで監視）
    const observer = new MutationObserver(() => {
      setupOriginalSwiperSync();
    });
    observer.observe(originalSlider, { attributes: true, attributeFilter: ['class'] });
  };

  // 追従用リストを破棄する関数
  const destroyStickyList = () => {
    if (stickySwiper) {
      stickySwiper.destroy(true, true);
      stickySwiper = null;
    }
    if (stickyContainer && stickyContainer.parentNode) {
      stickyContainer.parentNode.removeChild(stickyContainer);
      stickyContainer = null;
    }
  };

  // スクロールハンドラ
  const handleScroll = () => {
    if (!stickyContainer) return;
    const stickyHeight = stickyContainer.offsetHeight;

    if (shouldShowStickyByMap(mapEl, stickyHeight)) {
      stickyContainer.classList.add('is-visible');
    } else {
      stickyContainer.classList.remove('is-visible');
    }
  };

  // SPレイアウト時のみ有効化する処理
  const checkState = () => {
    if (carouselMediaQuery.matches) {
      createStickyList();
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    } else {
      window.removeEventListener('scroll', handleScroll);
      destroyStickyList();
    }
  };

  // 初期実行とリサイズ監視
  checkState();
  carouselMediaQuery.addEventListener('change', checkState);
}

//-------------------------------------------------------
/** 
 * カルーセル制御（搭乗券）
 */

let bpSwipers = [];

/**
 * .ticket-bodyの高さを揃える
 * @param {HTMLElement} carouselEl - カルーセルのコンテナ要素
 */
function alignTicketBodyHeights(carouselEl) {
  // 印刷中は処理しない
  if (document.body.classList.contains('is-printing')) return;

  const ticketBodies = carouselEl.querySelectorAll('.sky-ticket .js-height-adjust');
  if (ticketBodies.length === 0) return;

  // 高さを一旦リセット
  ticketBodies.forEach(el => el.style.height = 'auto');

  // 最大の高さを計算
  let maxHeight = 0;
  ticketBodies.forEach(el => {
    if (el.offsetHeight > maxHeight) {
      maxHeight = el.offsetHeight;
    }
  });

  // 高さを適用
  if (maxHeight > 0) {
    ticketBodies.forEach(el => el.style.height = `${maxHeight}px`);
  }
}


/**
 * 搭乗券カルーセル初期化
 * @param {Object} startIndices - { 'ID名': インデックス番号 } の形式のオブジェクト
 */
function initBpSwiper(startIndices = {}) {
  // 既存のSwiperインスタンスがあれば全て破棄
  bpSwipers.forEach(swiper => {
    if (swiper) {
      swiper.destroy(false, true);
    }
  });
  bpSwipers = [];
  
  // 全ての.js-bpCarousel要素を取得して初期化
  const carouselEls = document.querySelectorAll('.js-bpCarousel');
  carouselEls.forEach((carouselEl) => {
    // スライドの枚数を確認
    const slides = carouselEl.querySelectorAll('.swiper-slide');
    
    // スライドが1枚以下の場合はカルーセルを初期化しない
    if (slides.length <= 1) {
      carouselEl.classList.add('js-carousel-none');
      return;
    }
    
    // js-carousel-noneクラスを削除（カルーセル再初期化時）
    carouselEl.classList.remove('js-carousel-none');

    // このカルーセルのIDに対応する開始インデックスを取得（なければ0）
    const startIndex = startIndices[carouselEl.id] || 0;
    
    const swiperInstance = new Swiper(carouselEl, {
      initialSlide: startIndex,
      direction: 'horizontal',
      slidesPerView: 1,
      watchSlidesProgress: true, 
      centeredSlides: true, // アクティブなスライドを中央に配置
      spaceBetween: 16,
      loop: false,
      breakpoints: {
        768: {
          slidesPerGroup: 2,
          slidesPerView: 2,
          centeredSlides: false,
          spaceBetween: 32,
        }
      },
      threshold: 15,
      touchStartPreventDefault: false,
      edgeSwipeDetection: true,
      mousewheel: false,
      navigation: {
        nextEl: carouselEl.querySelector('.swiper-button-next'),
        prevEl: carouselEl.querySelector('.swiper-button-prev'),
      },
      pagination: {
        el: carouselEl.querySelector('.js-carousel-pagination'),
        bulletElement: 'button',
        clickable: true,
      },
      a11y: {
        prevSlideMessage: '前のスライドへ',
        nextSlideMessage: '次のスライドへ',
        slideLabelMessage: '{{index}}枚目',
        paginationBulletMessage: '{{index}}枚目のスライドを表示',
      },
      on: {
        init: function() {
          alignTicketBodyHeights(carouselEl);
          // フォーカス制御を実行
          controlSlideFocus(this);
        },
        resize: function() {
          alignTicketBodyHeights(carouselEl);
          // リサイズ時のフォーカス制御を実行
          controlSlideFocus(this);
        },
        // スライド変更時のフォーカス制御を実行
        slideChange: function() {
          controlSlideFocus(this);
        },
        // アニメーション完了後も念のため更新
        transitionEnd: function() {
          controlSlideFocus(this);
        }
      },
    });
    bpSwipers.push(swiperInstance);
  });
}

function destroyBpSwiper() {
  // 全てのSwiperインスタンスを破棄
  bpSwipers.forEach(swiper => {
    if (swiper) {
      swiper.destroy(false, true);
    }
  });
  bpSwipers = [];
  
  // 全ての.js-bpCarousel要素にclass="js-carousel-none"を付与
  const carouselEls = document.querySelectorAll('.js-bpCarousel');
  carouselEls.forEach((carouselEl) => {
    carouselEl.classList.add('js-carousel-none');
  });
}

/**
 * Swiperの表示中スライド以外のフォーカスを無効化
 * ※ Swiper設定で watchSlidesProgress: true が必要
 */
function controlSlideFocus(swiper) {
  swiper.slides.forEach(slide => {
    // swiper-slide-visible クラスが付いている（＝画面内に見えている）場合
    if (slide.classList.contains('swiper-slide-visible')) {
      slide.removeAttribute('inert');
      slide.removeAttribute('aria-hidden'); // スクリーンリーダー用にも表示
    } else {
      slide.setAttribute('inert', ''); // フォーカスもクリックも無効化
      slide.setAttribute('aria-hidden', 'true');
    }
  });
}

//-------------------------------------------------------



/**
 * DOMContentLoaded - すべての初期化処理をまとめて実行
 */
document.addEventListener('DOMContentLoaded', () => {
  initUniqueMailInputIds();
  initPrintButton();
  initTabs();
  initTooltips();
  initDialogClosedByAny();
  initMoreButton();
  initAnchorLinks();
  initCarouselToggle();
  initMapIndicator();
  initPopover();
  initStickySeatLegend();
  initStickyPaxList();
  initBpSwiper();
});




