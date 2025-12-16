(() => {
  const root = document.documentElement;
  const bg = document.querySelector(".bg");
  const earth = document.querySelector(".hero-earth");
  if (!bg && !earth) return;
  let mx = 0.5, my = 0.5, scrollY = 0;
  const BG_STRENGTH = 18;      
  const EARTH_STRENGTH = 34;   
  function apply() {
    const bx = (mx - 0.5) * BG_STRENGTH;
    const by = (my - 0.5) * BG_STRENGTH - scrollY * 0.02;
    const ex = (mx - 0.5) * EARTH_STRENGTH;
    const ey = (my - 0.5) * EARTH_STRENGTH - scrollY * 0.01;
    root.style.setProperty("--bg-x", `${bx}px`);
    root.style.setProperty("--bg-y", `${by}px`);
    root.style.setProperty("--earth-x", `${ex}px`);
    root.style.setProperty("--earth-y", `${ey}px`);
  }
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX / window.innerWidth;
    my = e.clientY / window.innerHeight;
    apply();
  });
  window.addEventListener("scroll", () => {
    scrollY = window.scrollY || 0;
    apply();
  });
  apply();
})();