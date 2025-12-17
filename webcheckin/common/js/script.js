//-------------------------------------------------------
/**
 * 印刷ボタンのクリックと印刷後の処理
 */
document.addEventListener('DOMContentLoaded', () => {
  // data-print="printOn" 属性を持つすべてのボタン要素を取得
  const printButtons = document.querySelectorAll('[data-print="printOn"]');
  // 印刷後にクラスを元に戻す対象のセクションを一時的に保存する変数
  let sectionToReset = null;

  // 印刷ボタンがクリックされたときの処理
  const handlePrintClick = (event) => {
    // クリックされたボタン（event.currentTarget）から一番近い<section>を取得
    const targetSection = event.currentTarget.closest('section');

    // <section>が見つかった場合のみ処理を実行
    if (targetSection) {
      // classを'print_off' から 'print_on'に切り替え
      targetSection.classList.remove('print_off');
      targetSection.classList.add('print_on');
      // 印刷後に元に戻すため、対象セクションを記憶
      sectionToReset = targetSection;
      // ブラウザの印刷ダイアログ（プレビュー）を展開
      window.print();
    }
  };

  // 印刷ダイアログが閉じた後（印刷・キャンセル後）の処理
  const handleAfterPrint = () => {
    // 印刷前に 'print_on' に変更したセクションがある場合
    if (sectionToReset) {
      // クラスを 'print_on' から 'print_off' に戻す
      sectionToReset.classList.remove('print_on');
      sectionToReset.classList.add('print_off');

      // 次回のためにリセット
      sectionToReset = null;
    }
  };

  // 取得した各ボタンに'click'イベントリスナーを設定
  printButtons.forEach(button => {
    button.addEventListener('click', handlePrintClick);
  });

  // window オブジェクトに'afterprint'イベントリスナーを設定
  window.addEventListener('afterprint', handleAfterPrint);
});

//-------------------------------------------------------
/**
 * タブ切り替え
 */
window.addEventListener("DOMContentLoaded", () => {
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
});

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


const modalButtons = document.querySelectorAll("button[data-modal]");

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
 * モーダルダイアログの制御
 */

// data-modal属性を持つすべてのボタンを取得
const seatModalButtons = document.querySelectorAll('[data-seatModal]');

seatModalButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    // イベントの伝播を停止
    event.stopPropagation();
    
    const modalType = button.getAttribute('data-seatModal');
    const targetDialog = document.querySelector(`dialog[data-seatModal="${modalType}"]`);

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
document.addEventListener('DOMContentLoaded', initializeTooltips);

//-------------------------------------------------------
/**
 * more button
 */
window.addEventListener("DOMContentLoaded", () => {
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
});

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
 * カルーセル制御（768px以下）
 */

let mySwipers = [];
const carouselMediaQuery = window.matchMedia('(max-width: 768px)');
let isCarouselActive = false; // カルーセルの状態を管理

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

function initSwiper() {
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
    // js-carousel-noneクラスを削除（カルーセル再初期化時）
    carouselEl.classList.remove('js-carousel-none');
    
    const swiperInstance = new Swiper(carouselEl, {
      direction: 'horizontal',
      slidesPerView: 'auto',
      spaceBetween: 8,
      loop: false,
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
  
  isCarouselActive = true; // カルーセルがアクティブ状態
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
      const toggleText = carouselTrigger.querySelector('.js-toggle-text');
      const currentLang = document.documentElement.lang || 'ja';
      const buttonTexts = {
        'ja': { active: '搭乗者すべて表示', inactive: '閉じる' },
        'en': { active: 'Show all passengers', inactive: 'Close' },
        'zh': { active: '顯示所有乘客', inactive: '關閉' },
        'ko': { active: '탑승자 모두 보기', inactive: '닫다' }
      };
      const texts = buttonTexts[currentLang] || buttonTexts['ja'];
      
      carouselTrigger.setAttribute('aria-pressed', 'true');
      if (toggleText) toggleText.textContent = texts.active;
    }
  } else if (mySwipers.length > 0) {
    destroySwiper();
  }
}

carouselMediaQuery.addEventListener('change', checkBreakpoint);
checkBreakpoint(carouselMediaQuery);

//-------------------------------------------------------
/**
 * カルーセルトグルボタン
 */
document.addEventListener('DOMContentLoaded', () => {
  const carouselTrigger = document.getElementById('sky-carousel__trigger');
  
  if (carouselTrigger) {
    const toggleText = carouselTrigger.querySelector('.js-toggle-text');
    
    // 言語を取得（html要素のlang属性）
    const currentLang = document.documentElement.lang || 'ja';
    
    // 言語別のテキスト定義
    const buttonTexts = {
      'ja': {
        active: '搭乗者すべて表示',
        inactive: '閉じる'
      },
      'en': {
        active: 'Show all passengers',
        inactive: 'Close'
      },
      'zh': {
        active: '顯示所有乘客',
        inactive: '關閉'
      },
      'ko': {
        active: '탑승자 모두 보기',
        inactive: '닫다'
      }
    };
    
    // 現在の言語のテキストを取得（デフォルトは日本語）
    const texts = buttonTexts[currentLang] || buttonTexts['ja'];
    
    carouselTrigger.addEventListener('click', () => {
      // 768px以下の場合のみトグル機能を有効化
      if (carouselMediaQuery.matches) {
        if (isCarouselActive) {
          // カルーセルがアクティブな場合は破棄
          destroySwiper();
          carouselTrigger.setAttribute('aria-pressed', 'false');
          if (toggleText) toggleText.textContent = texts.inactive;
        } else {
          // カルーセルが非アクティブな場合は初期化
          initSwiper();
          carouselTrigger.setAttribute('aria-pressed', 'true');
          if (toggleText) toggleText.textContent = texts.active;
        }
      }
    });
    
    // 初期状態のaria-pressed属性とテキストを設定
    if (carouselMediaQuery.matches && isCarouselActive) {
      carouselTrigger.setAttribute('aria-pressed', 'true');
      if (toggleText) toggleText.textContent = texts.active;
    } else {
      carouselTrigger.setAttribute('aria-pressed', 'false');
      if (toggleText) toggleText.textContent = texts.inactive;
    }
  }
});


//-------------------------------------------------------
/**
 * カルーセルトグルボタン
 */
// 要素の取得
const content = document.getElementById('js-map');
const minimap = document.getElementById('js-minimap');
const indicator = document.getElementById('js-indicator');

function updateIndicator() {
  // 1. 比率の計算
  // コンテンツ全体の高さと、ミニマップの高さの比率を求めます
  // scrollHeight: コンテンツの総高さ
  // clientHeight: コンテンツの表示されている高さ
  const totalHeight = content.scrollHeight;
  const visibleHeight = content.clientHeight;
  const minimapHeight = minimap.clientHeight;

  // 比率 = ミニマップの高さ / コンテンツの総高さ
  const ratio = minimapHeight / totalHeight;

  // 2. インジケーターの高さ設定
  // 表示領域の高さに比率を掛けて、インジケーターの高さを決定します
  const indicatorHeight = visibleHeight * ratio;
  indicator.style.height = `${indicatorHeight}px`;

  // 3. インジケーターの位置（top）設定
  // 現在のスクロール位置に比率を掛けて、インジケーターの位置を決定します
  const scrollTop = content.scrollTop;
  const indicatorTop = scrollTop * ratio;
  indicator.style.top = `${indicatorTop}px`;
}

// スクロール時に実行
content.addEventListener('scroll', updateIndicator);

// 初期化時とウィンドウサイズ変更時にも実行して調整
window.addEventListener('resize', updateIndicator);
// 画像読み込み後などを考慮して少し待ってから初期実行、または即時実行
updateIndicator();


//-------------------------------------------------------
/**
 * popover
 */
document.addEventListener("DOMContentLoaded", function() {
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
});


