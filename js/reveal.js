(() => {
  const items = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!items.length) return;
  items.forEach((el, i) => {
    const d = 70 + i * 35;             
    el.style.animationDelay = `${Math.min(d, 420)}ms`;
    el.classList.add("reveal");
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
})();