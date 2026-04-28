document.addEventListener("DOMContentLoaded", function () {
  const footerContent = `
    <footer class="sky-footer">
      <div class="sky-footerLink">
        <ul class="textlinks">
          <li><a href="#" target="_blank" title="新しいウィンドウでページを開きます"><span class="icon-blank">運送約款</span></a></li>
          <li><a href="#" target="_blank" title="新しいウィンドウでページを開きます"><span class="icon-blank">プライバシーポリシー</span></a></li>
          <li><a href="#" target="_blank" title="新しいウィンドウでページを開きます"><span class="icon-blank">ウェブサイトにおけるプライバシーポリシー</span></a></li>
          <li><a href="#" target="_blank" title="新しいウィンドウでページを開きます"><span class="icon-blank">オンラインチェックイン利用規約</span></a></li>
        </ul>
      </div>
      <div class="sky-footerCopy">
        <small>Copyright &copy; Skymark Airlines Inc.</small>
      </div>
    </footer>
  `;
  document.getElementById("sky-footer").innerHTML = footerContent;
});