(() => {
  const bar = document.querySelector(".progress__bar");
  if (!bar) return;
  function update() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${p}%`;
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();