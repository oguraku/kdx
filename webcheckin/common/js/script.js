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

  // 各タブに click イベントハンドラーを追加
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
const seatModalButtons = document.querySelectorAll('[data-modal="seat"],[data-modal="fwrd"],[data-modal="na-fwrd"]');

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
function initializeTooltips() {
  const triggers = document.querySelectorAll('[data-tooltip-trigger]');
  /**
   * ツールチップ表示
   * @param {Event} event - イベントオブジェクト
   */
  function showTooltip(event) {
    const trigger = event.currentTarget;
    const wrap = trigger.closest('.sky-tooltip-wrap');
    if (!wrap) return;
    const tooltip = wrap.querySelector('[data-tooltip-content]');
    if (!tooltip) return;

    tooltip.style.visibility = 'visible';
    tooltip.setAttribute('aria-hidden', 'false');
  }

  /**
   * ツールチップ非表示
   * @param {Event} event - イベントオブジェクト
   */
  function hiddenTooltip(event) {
    const trigger = event.currentTarget;
    const wrap = trigger.closest('.sky-tooltip-wrap');
    if (!wrap) return;
    const tooltip = wrap.querySelector('[data-tooltip-content]');
    if (!tooltip) return;

    tooltip.style.visibility = 'hidden';
    tooltip.setAttribute('aria-hidden', 'true');
  }

  // --- 各トリガーへのイベントリスナー設定 と IDの動的付与 ---
  triggers.forEach((trigger, index) => {
    // ユニークIDを生成 (例: 'sky-tooltip-generated-0', 'sky-tooltip-generated-1', ...)
    const uniqueId = `sky-tooltip-generated-${index}`;

    const wrap = trigger.closest('.sky-tooltip-wrap');
    if (!wrap) return;

    const tooltip = wrap.querySelector('[data-tooltip-content]');
    if (!tooltip) return;

    // ツールチップ([data-tooltip-content])にユニークIDを付与
    tooltip.setAttribute('id', uniqueId);
    
    // トリガー(data-tooltip-trigger)にaria-describedbyでユニークIDを紐付け
    trigger.setAttribute('aria-describedby', uniqueId);

    // イベントリスナー設定
    trigger.addEventListener('mouseover', showTooltip);
    trigger.addEventListener('mouseleave', hiddenTooltip);
    trigger.addEventListener('focus', showTooltip);
    trigger.addEventListener('blur', hiddenTooltip);
  });

  // --- グローバルなEscapeキー処理 ---
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const visibleTooltips = document.querySelectorAll('[data-tooltip-content][style*="visibility: visible"]');
      visibleTooltips.forEach(tooltip => {
        tooltip.style.visibility = 'hidden';
        tooltip.setAttribute('aria-hidden', 'true');
      });
    }
  });

  // --- 初期化処理 ---
  // ページ読み込み時にすべてのツールチップを非表示状態にする
  const allTooltips = document.querySelectorAll('[data-tooltip-content]');
  allTooltips.forEach(tooltip => {
    tooltip.style.visibility = 'hidden';
    tooltip.setAttribute('aria-hidden', 'true');
  });
}

// DOMの読み込みが完了したら初期化関数を実行
function initTooltips() {
  initializeTooltips();
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
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); // デフォルトの動作（URLに#を追加）を防ぐ
      
      const targetId = link.getAttribute('href').substring(1); // #を除いたIDを取得
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
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

  // 追従用リストを作成・初期化する関数
  const createStickyList = () => {
    // 既に作成済みの場合は何もしない
    if (document.getElementById('js-slider_paxlist2')) return;

    // コンテナ作成
    stickyContainer = document.createElement('div');
    stickyContainer.classList.add('sticky-paxlist');

    // 搭乗便情報を複製して追加
    if (originalFlightInfo) {
      const clonedFlightInfo = originalFlightInfo.cloneNode(true);
      clonedFlightInfo.id = 'js-flight-info2'; // IDを変更
      clonedFlightInfo.classList.add('sticky-flight-info'); // クラス追加
      stickyContainer.appendChild(clonedFlightInfo);
    }

    // 搭乗者リストを複製
    const clonedSlider = originalSlider.cloneNode(true);
    clonedSlider.id = 'js-slider_paxlist2'; // IDを変更
    clonedSlider.classList.remove('js-carousel'); // 既存の初期化対象から外すためクラス削除
    
    stickyContainer.appendChild(clonedSlider);
    document.body.appendChild(stickyContainer);

    // 元のスライダーのSwiperインスタンスを取得
    const originalSwiper = mySwipers.find(swiper => swiper.el === originalSlider);
    const initialSlideIndex = originalSwiper ? originalSwiper.realIndex : 0;

    // 複製したリストのSwiperを初期化（元のスライド位置と同期）
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
          // sticky側のスライド変更を元のスライダーに反映
          if (originalSwiper && originalSwiper.realIndex !== this.realIndex) {
            originalSwiper.slideTo(this.realIndex);
          }
        }
      }
    });

    // 元のスライダーのスライド変更をsticky側に反映
    if (originalSwiper) {
      originalSwiper.on('slideChange', function() {
        if (stickySwiper && stickySwiper.realIndex !== this.realIndex) {
          stickySwiper.slideTo(this.realIndex);
        }
      });
    }

    // Note: グローバルのmySwipers配列には追加しない（独立して管理）
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
      // SPレイアウト：追従リストを作成してスクロール監視を開始
      createStickyList();
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // 初回チェック
    } else {
      // PCレイアウト：スクロール監視を解除し、追従リストを破棄
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




