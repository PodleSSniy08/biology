(() => {
  const keywords = [
    "вид","рода","род","семейство","семейства","класс","отряд",
    "тип","царство","подцарство","надцарство","империя", "отдел"
  ];
  const re = new RegExp(`(?<![А-Яа-яЁё])(${keywords.join("|")})(?![А-Яа-яЁё])`, "gi");
  const targets = document.querySelectorAll(".textbox, .rank-pill, .question");
  targets.forEach(el => {
    if (el.querySelector(".kw")) return;
    el.innerHTML = el.innerHTML.replace(re, '<span class="kw">$1</span>');
  });
})();