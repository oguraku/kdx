//-------------------------------------------------------
/**
 * 印刷ボタンのクリックと印刷後の処理
 */
function initPrintButton() {
  const printButtons = document.querySelectorAll('[data-print="printOn"]');
  let sectionToReset = null;
  // カルーセルのIDごとにスライド番号を保持するオブジェクト
  let activeIndices = {}; 

  const handlePrintClick = (event) => {
    const targetSection = event.currentTarget.closest('.sky-ticket');

    if (targetSection) {
      // 印刷前に「すべての」現在のスライド番号をIDごとに保存
      if (isCarouselActive && mySwipers.length > 0) {
        mySwipers.forEach(swiper => {
          if (swiper.el.id) {
            activeIndices[swiper.el.id] = swiper.realIndex;
          }
        });
      }

      if (isCarouselActive) {
        destroySwiper();
      }

      targetSection.classList.remove('print_off');
      targetSection.classList.add('print_on');
      sectionToReset = targetSection;
      
      setTimeout(() => {
        window.print();
      }, 200);
    }
  };

  const handleAfterPrint = () => {
    if (sectionToReset) {
      sectionToReset.classList.remove('print_on');
      sectionToReset.classList.add('print_off');
      sectionToReset = null;
    }
    
    // 再初期化時に、保存していたIDごとのインデックスを渡す
    if (carouselMediaQuery.matches && !isCarouselActive) {
      initSwiper(activeIndices); // オブジェクトを渡す
      
      const carouselTrigger = document.getElementById('sky-carousel__trigger');
      if (carouselTrigger) {
        carouselTrigger.setAttribute('aria-pressed', 'true');
      }
    }
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
    .forEach(p => p.setAttribute("hidden", true));

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
    
    const viewportWidth = window.innerWidth;
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    const gap = 10; 

    // 縦位置 (トリガーの上)
    const top = triggerRect.top + scrollY - contentRect.height - gap;

    // 横位置 (中央合わせ)
    let left = triggerRect.left + scrollX + (triggerRect.width / 2) - (contentRect.width / 2);

    // 画面端の補正
    if (left < 10) {
      left = 10;
    } else if (left + contentRect.width > viewportWidth - 10) {
      left = viewportWidth - contentRect.width - 10;
    }

    // 矢印位置の調整
    const triggerCenterAbs = triggerRect.left + scrollX + (triggerRect.width / 2);
    const arrowRelPos = triggerCenterAbs - left;
    
    content.style.setProperty('--arrow-left', `${arrowRelPos}px`);
    content.style.top = `${top}px`;
    content.style.left = `${left}px`;
  }

  // 次の要素へフォーカスを移動するヘルパー
  function moveFocusToNextElement(currentElement) {
    const allFocusables = Array.from(document.querySelectorAll(SELECTOR.FOCUSABLE));
    const index = allFocusables.indexOf(currentElement);
    
    if (index > -1 && index < allFocusables.length - 1) {
      allFocusables[index + 1].focus();
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
        
        // SP表示時の処理
        if (spMediaQuery.matches) {
          const targetPos = targetElement.getBoundingClientRect().top + window.pageYOffset;
          let scrollToPos;

          if (targetId === 'seat-back') {
            const marginBottom = parseFloat(getComputedStyle(document.documentElement).fontSize) * 5;
            scrollToPos = targetPos - window.innerHeight + targetElement.offsetHeight + marginBottom;
          } else { // #seat-frontなど
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
 * カルーセル制御（768px以下）
 */

let mySwipers = [];
const carouselMediaQuery = window.matchMedia('(max-width: 768px)');
let isCarouselActive = false; // カルーセルの状態を管理

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

function carouselNavFraction(swiper, carouselEl) {
  const nav = carouselEl.querySelector('.js-carousel-fraction');
  if (!nav) return;
  const current = nav.querySelector('.current-slide');
  const total = nav.querySelector('.total-slide');
  if (current && total) {
    current.textContent = swiper.realIndex + 1;
    if (swiper.params.loop) {
      // loop時はダミー分を除外
      total.textContent = swiper.slides.length - swiper.loopedSlides * 2;
    } else {
      // loopなしはそのまま
      total.textContent = swiper.slides.length;
    }
  }
}

/**
 * カルーセル初期化
 * @param {Object} startIndices - { 'ID名': インデックス番号 } の形式のオブジェクト
 */
function initSwiper(startIndices = {}) {
  // 既存のSwiperインスタンスがあれば全て破棄
  mySwipers.forEach(swiper => {
    if (swiper) {
      swiper.destroy(false, true);
    }
  });
  mySwipers = [];
  
  // 全ての.js-carousel要素を取得して初期化
  const carouselEls = document.querySelectorAll('.js-carousel');
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
      slidesPerView: 'auto',
      spaceBetween: 8,
      loop: false,
      threshold: 15,
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
          carouselNavFraction(this, carouselEl);
        },
        slideChange: function() {
          carouselNavFraction(this, carouselEl);
        }
      },
    });
    mySwipers.push(swiperInstance);
    carouselNavFraction(swiperInstance, carouselEl);
  });
  
  // Swiperインスタンスが作成されなかった場合（スライドが0〜1枚）
  const carouselTrigger = document.getElementById('sky-carousel__trigger');
  if (mySwipers.length === 0) {
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

function destroySwiper() {
  // 全てのSwiperインスタンスを破棄
  mySwipers.forEach(swiper => {
    if (swiper) {
      swiper.destroy(false, true);
    }
  });
  mySwipers = [];
  
  // 全ての.js-carousel要素にclass="js-carousel-none"を付与
  const carouselEls = document.querySelectorAll('.js-carousel');
  carouselEls.forEach((carouselEl) => {
    carouselEl.classList.add('js-carousel-none');
  });
  
  isCarouselActive = false; // カルーセルが非アクティブ状態
}

function checkBreakpoint(e) {
  if (e.matches) {
    initSwiper();
    
    // カルーセルトグルボタンのテキストとaria-pressedを更新
    const carouselTrigger = document.getElementById('sky-carousel__trigger');
    if (carouselTrigger) {
      // Swiperインスタンスが作成された場合のみボタンを表示
      if (mySwipers.length > 0) {
        const toggleText = carouselTrigger.querySelector('.js-toggle-text');
        const texts = getCarouselButtonTexts();
        
        carouselTrigger.setAttribute('aria-pressed', 'true');
        if (toggleText) toggleText.textContent = texts.active;
        carouselTrigger.style.display = '';
      } else {
        carouselTrigger.style.display = 'none';
      }
    }
  } else if (mySwipers.length > 0) {
    destroySwiper();
    
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
          destroySwiper();
          carouselTrigger.setAttribute('aria-pressed', 'false');
          if (toggleText) toggleText.textContent = texts.inactive;
          // スライドが2枚以上ある場合は「閉じる」ボタンとして表示したまま
        } else {
          // カルーセルが非アクティブな場合は初期化
          initSwiper();
          // initSwiper内でmySwipers.lengthに基づいて表示/非表示が制御される
          if (mySwipers.length > 0) {
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
    if (carouselMediaQuery.matches && isCarouselActive && mySwipers.length > 0) {
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
  if (popoverElm) {
    // ページ読み込み時にpopoverを表示
    popoverElm.showPopover();
    
    // フェードアウトして非表示にする関数
    const fadeOutAndHide = () => {
      popoverElm.classList.add('fade-out');
      setTimeout(() => {
        popoverElm.hidePopover();
        popoverElm.style.display = 'none';
        popoverElm.classList.add('hidden');
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
    const originalSwiper = mySwipers.find(swiper => swiper.el === originalSlider);
    
    if (originalSwiper && originalSwiper.realIndex !== index) {
      originalSwiper.slideTo(index);
    }
  };

  // 元のスライダーの現在位置を取得する関数
  const getCurrentSlideIndex = () => {
    const originalSwiper = mySwipers.find(swiper => swiper.el === originalSlider);
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
    
    stickyContainer.appendChild(clonedSlider);
    document.body.appendChild(stickyContainer);

    // 複製したリストのSwiperを初期化
    stickySwiper = new Swiper(clonedSlider, {
      initialSlide: initialSlideIndex,
      direction: 'horizontal',
      slidesPerView: 'auto',
      spaceBetween: 8,
      loop: false,
      observer: true,
      observeParents: true,
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
        slideChange: function() {
          // スティッキー側のスライド変更を元のスライダーに反映
          updateOriginalSliderPosition(this.realIndex);
        }
      }
    });

    // 元のスライダーのイベントリスナーを設定
    const setupOriginalSwiperSync = () => {
      const originalSwiper = mySwipers.find(swiper => swiper.el === originalSlider);
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

    const mapRect = mapEl.getBoundingClientRect();
    const stickyHeight = stickyContainer.offsetHeight;

    const isMapTopHit = mapRect.top <= 0;
    const isMapRemaining = mapRect.bottom > stickyHeight;

    if (isMapTopHit && isMapRemaining) {
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
 * DOMContentLoaded - すべての初期化処理をまとめて実行
 */
document.addEventListener('DOMContentLoaded', () => {
  initPrintButton();
  initTabs();
  initTooltips();
  initDialogClosedByAny();
  initMoreButton();
  initAnchorLinks();
  initCarouselToggle();
  initMapIndicator();
  initPopover();
  initStickyPaxList();
});




