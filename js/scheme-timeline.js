(() => {
  const items = Array.from(document.querySelectorAll(".rank-item"));
  if (!items.length) return;
  items.forEach((it, i) => {
    it.style.animationDelay = `${Math.min(90, 60 + i * 12)}ms`;
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    });
  }, { threshold: 0.15 });
  items.forEach(it => io.observe(it));
  const activate = () => {
    const mid = window.innerHeight * 0.42;
    let best = null;
    let bestDist = Infinity;
    items.forEach(it => {
      const r = it.getBoundingClientRect();
      const center = (r.top + r.bottom) / 2;
      const d = Math.abs(center - mid);
      if (d < bestDist) { bestDist = d; best = it; }
    });
    items.forEach(it => it.classList.toggle("is-active", it === best));
  };
  window.addEventListener("scroll", activate, { passive: true });
  window.addEventListener("resize", activate);
  activate();
})();