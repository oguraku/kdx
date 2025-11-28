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
 * Modal Dialog
 */
const modalButtons = document.querySelectorAll("button[data-modal]");

modalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // data-modal の値を取得 (例: "seat" "mail")
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
 * カルーセル制御
 */

const useCarousel = () => {
  // カルーセルのクラス名を定義
  const carouselClassName = '.js-carousel';
  // カルーセルインスタンスを管理するMapオブジェクト
  const carouselInstances = new Map();

  /**
   * カルーセルインスタンスを作成する関数
   * @param {HTMLElement} element - カルーセルのDOM要素
   * @returns {Object} カルーセルインスタンスオブジェクト
   */
  const createCarouselInstance = (element) => {
    // スクリーンリーダー用のライブリージョンを作成
    const liveRegion = document.createElement('div');

    // 各種ボタンとコンテナ要素を取得
    const autoplayButton = element.querySelector(
      '.js-carousel-autoplay-button'
    );
    const paginationContainer = element.querySelector(
      '.js-carousel-pagination'
    );
    const previousButton = element.querySelector('.js-carousel-previous');
    const nextButton = element.querySelector('.js-carousel-next');

    // Swiperインスタンスを作成・設定
    const swiper = new Swiper(element, {
      direction: 'horizontal', // 水平方向のスライド
      slidesPerView: 'auto', // スライドの表示数を自動調整
      spaceBetween: 8, // スライド間の余白（デフォルト）
      loop: true, // 無限ループを有効化

      // ナビゲーションボタンの設定
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      // ページネーションの設定
      pagination: {
        el: paginationContainer,
        bulletElement: 'button', // ページネーションをボタン要素で作成
        clickable: true, // クリック可能にする
      },

      // アクセシビリティ設定
      a11y: {
        prevSlideMessage: '前のスライドへ',
        nextSlideMessage: '次のスライドへ',
        slideLabelMessage: '{{index}}枚目',
        paginationBulletMessage: '{{index}}枚目のスライドを表示',
      },
    });

    swiper.on('slideChangeTransitionEnd', () => {
      const link = document.querySelector(
        '.swiper-slide.swiper-slide-active button'
      );
      link.focus();
    });

    return {
      swiper,
      liveRegion,
      autoplayButton,
      paginationContainer,
      previousButton,
      nextButton,
    };
  };

  /**
   * カルーセルを初期化する関数
   * ページ内の全てのカルーセル要素を検索し、それぞれにインスタンスを作成
   */
  const initCarousel = () => {
    const carouselElements = document.querySelectorAll(carouselClassName);

    carouselElements.forEach((element, index) => {
      // カルーセルのIDを取得（なければ自動生成）
      const carouselId = element.id || `carousel-${index}`;

      // カルーセルインスタンスを作成
      const instance = createCarouselInstance(element);

      // インスタンスをMapに保存（後で参照できるように）
      carouselInstances.set(carouselId, instance);

      // 各種機能を初期化
      initAutoplayButton(instance); // 自動再生ボタンの初期化
      initLiveRegion(instance, element); // ライブリージョンの初期化
      initAnnouncePagination(instance); // ページネーション音声案内の初期化
      removeCarouselAttributes(element); // 不要な属性の削除
      initAnnouncePreviousButton(instance); // 前へボタンの音声案内初期化
      initAnnounceNextButton(instance); // 次へボタンの音声案内初期化
    });
  };

  /**
   * カルーセル要素から不要な属性を削除する関数
   * @param {HTMLElement} element - カルーセル要素
   */
  const removeCarouselAttributes = (element) => {
    const wrapper = element.querySelector('.js-carousel-wrapper');
    if (wrapper === null) return;

    // Swiperが独自のaria-liveを管理するため、既存のものを削除
    wrapper.removeAttribute('aria-live');
  };

  /**
   * ライブリージョンを初期化する関数
   * スクリーンリーダー用の音声案内領域を設定
   * @param {Object} instance - カルーセルインスタンス
   * @param {HTMLElement} slideElement - スライド要素
   */
  const initLiveRegion = (instance, slideElement) => {
    instance.liveRegion.className = 'sky-carousel__live-region';
    instance.liveRegion.setAttribute('aria-live', 'polite'); // 丁寧な音声案内
    instance.liveRegion.setAttribute('aria-atomic', 'true'); // 内容全体を読み上げ

    // スライド要素の直後にライブリージョンを挿入
    slideElement.insertAdjacentElement('afterend', instance.liveRegion);
  };

  /**
   * ライブリージョンにメッセージを表示し、一定時間後にクリアする関数
   * @param {string} message - 案内メッセージ
   * @param {HTMLElement} liveRegion - ライブリージョン要素
   */
  const announceMessage = (message, liveRegion) => {
    liveRegion.textContent = message;

    // 1秒後にメッセージをクリア（連続した案内を防ぐため）
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1e3);
  };

  /**
   * ページネーションボタンクリック時の音声案内を初期化する関数
   * @param {Object} instance - カルーセルインスタンス
   */
  const initAnnouncePagination = (instance) => {
    const paginationContainer = instance.paginationContainer;
    if (paginationContainer) {
      paginationContainer.addEventListener('click', (event) => {
        const button = event.target;

        // クリックされた要素がボタンの場合のみ処理
        if (button.tagName === 'BUTTON') {
          // ボタンのインデックスを取得
          const buttons = Array.from(
            paginationContainer.querySelectorAll('button')
          );
          const index = buttons.indexOf(button);

          // スライド番号を音声案内
          announceMessage(
            `${index + 1}枚目のスライドを表示`,
            instance.liveRegion
          );
        }
      });
    }
  };

  /**
   * 前へボタンクリック時の音声案内を初期化する関数
   * @param {Object} instance - カルーセルインスタンス
   */
  const initAnnouncePreviousButton = (instance) => {
    const previousButton = instance.previousButton;
    if (previousButton === null) return;

    previousButton.addEventListener('click', () => {
      announceMessage('前のスライドへ', instance.liveRegion);
    });
  };

  /**
   * 次へボタンクリック時の音声案内を初期化する関数
   * @param {Object} instance - カルーセルインスタンス
   */
  const initAnnounceNextButton = (instance) => {
    const nextButton = instance.nextButton;
    if (nextButton === null) return;

    nextButton.addEventListener('click', () => {
      announceMessage('次のスライドへ', instance.liveRegion);
    });
  };

  return {
    initCarousel,
  };
};

// --- カルーセル初期化を1024px以下のみ実行 ---
let carouselInitialized = false;
const carouselMediaQuery = window.matchMedia('(max-width: 1024px)');
const carouselController = useCarousel();

function handleCarouselBreakpoint(e) {
  if (e.matches) {
    if (!carouselInitialized) {
      carouselController.initCarousel();
      carouselInitialized = true;
    }
  } else {
    // 1024px超えたらカルーセルを破棄（再描画時はページリロード推奨）
    carouselInitialized = false;
    // 破棄処理が必要ならここで実装（例：DOM操作で位置リセットなど）
  }
}
carouselMediaQuery.addEventListener ?
  carouselMediaQuery.addEventListener('change', handleCarouselBreakpoint) :
  carouselMediaQuery.addListener(handleCarouselBreakpoint);
handleCarouselBreakpoint(carouselMediaQuery);
