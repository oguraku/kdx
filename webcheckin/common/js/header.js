document.addEventListener("DOMContentLoaded", function () {
  var header2 = document.getElementById("sky-header2");
  var header1 = document.getElementById("sky-header");
  if (header2) {
    header2.innerHTML = `
      <header class="sky-header">
        <div class="sky-header_logo"><a href="#"><img src="/webcheckin/common/images/logo.png" alt="SKYMARK AIRLINES"></a></div>
        <div class="sky-langSelect">
          <label for="langSelect" class="sr-only">言語選択</label>
          <img src="/webcheckin/common/images/icon/language.svg" alt="" aria-hidden="true" class="icon-lang i_blue fallback-icon">
          <select id="langSelect" class="langSelect">
          <button>
            <img src="/webcheckin/common/images/icon/language.svg" alt="" class="icon-lang i_blue">
            <selectedcontent></selectedcontent>
            <img src="/webcheckin/common/images/icon/arrow1-down.svg" alt="" class="icon-arrow">
          </button>
          <option value="ja" selected>日本語</option>
          <option value="en">English</option>
          <option value="zh_TW">中文(繁體)</option>
          <option value="ko">한국어</option>
          </select>
          <img src="/webcheckin/common/images/icon/arrow1-down.svg" alt="" aria-hidden="true" class="icon-arrow fallback-icon">
        </div>
      </header>
    `;
  }
  if (header1) {
    header1.innerHTML = `
      <header class="sky-header">
        <div class="sky-header_logo"><a href="#"><img src="/webcheckin/common/images/logo.png" alt="SKYMARK AIRLINES"></a></div>
      </header>
    `;
  }
});