(() => {
  const INDEX_URL = "data/search-index.json";
  const MAX_RESULTS = 12;

  let index = [];
  let isOpen = false;
  let active = -1;

  const escapeHtml = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const norm = (s) => String(s ?? "").toLowerCase().trim();

  function scoreItem(item, q) {
    if (!q) return 0;

    const title = norm(item.title);
    const level = norm(item.level);
    const tags = norm((item.tags || []).join(" "));
    const syn = norm((item.synonyms || []).join(" "));

    if (title === q) return 100;
    if (title.startsWith(q)) return 80;
    if (syn.includes(q)) return 70;
    if (title.includes(q)) return 60;
    if (tags.includes(q)) return 45;
    if (level.includes(q)) return 30;

    return 0;
  }

  async function loadIndex() {
    if (index.length) return;
    const r = await fetch(INDEX_URL, { cache: "no-store" });
    index = await r.json();
  }

  function ensureUI() {
    // если модалка уже создана — UI уже есть
    if (document.getElementById("gsModal")) return;

    // ---- КНОПКА ЛУПЫ В НАВБАРЕ (по центру, если есть .nav-center) ----
    // ---- ПОИСКОВАЯ ПАНЕЛЬ ПО ЦЕНТРУ ----
    const center = document.querySelector(".navbar .nav-center");
    if (center && !document.getElementById("gsOpenBtn")) {
      const btn = document.createElement("button");
      btn.id = "gsOpenBtn";
      btn.type = "button";
      btn.className = "nav-search";
      btn.setAttribute("aria-label", "Поиск по сайту");
      btn.innerHTML = `
        <span class="nav-search__text">Найти вид / род / семейство…</span>
        <span style="display:flex; align-items:center; gap:10px;">
          <span class="nav-search__key">Ctrl K</span>
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10.5 18a7.5 7.5 0 1 1 5.3-12.8A7.5 7.5 0 0 1 10.5 18Zm0-2a5.5 5.5 0 1 0-3.9-9.4A5.5 5.5 0 0 0 10.5 16Zm7.9 5.1-4.2-4.2 1.4-1.4 4.2 4.2-1.4 1.4Z"></path>
          </svg>
        </span>
      `;
      btn.addEventListener("click", () => open(""));
      center.appendChild(btn);
    }


    // ---- МОДАЛКА ----
    const modal = document.createElement("div");
    modal.id = "gsModal";
    modal.className = "gs-modal";
    modal.innerHTML = `
      <div class="gs-backdrop" data-gs-close></div>
      <div class="gs-box" role="dialog" aria-modal="true" aria-label="Поиск по статьям">
        <div class="gs-top">
          <input id="gsInput" class="gs-input" placeholder="Найти вид / род / царство… (например: эукариоты, Cricetus)" autocomplete="off" />
          <button class="gs-x" type="button" data-gs-close aria-label="Закрыть">✕</button>
        </div>
        <div class="gs-hint">Enter — открыть • ↑↓ — выбрать • Esc — закрыть • Ctrl+K — поиск</div>
        <div id="gsResults" class="gs-results" role="listbox"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal
      .querySelectorAll("[data-gs-close]")
      .forEach((el) => el.addEventListener("click", close));

    const input = document.getElementById("gsInput");
    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", onKeyDown);
  }

  function open(prefill = "") {
    ensureUI();
    isOpen = true;
    active = -1;

    const modal = document.getElementById("gsModal");
    modal.classList.add("is-open");

    const input = document.getElementById("gsInput");
    input.value = prefill;
    render(prefill);

    setTimeout(() => input.focus(), 0);
  }

  function close() {
    isOpen = false;
    active = -1;
    const modal = document.getElementById("gsModal");
    if (modal) modal.classList.remove("is-open");
  }

  function highlight(text, q) {
    const t = escapeHtml(text);
    const qq = norm(q);
    if (!qq) return t;

    const i = norm(text).indexOf(qq);
    if (i < 0) return t;

    const a = escapeHtml(text.slice(0, i));
    const b = escapeHtml(text.slice(i, i + qq.length));
    const c = escapeHtml(text.slice(i + qq.length));
    return `${a}<mark class="gs-mark">${b}</mark>${c}`;
  }

  function render(qRaw) {
    const q = norm(qRaw);
    const box = document.getElementById("gsResults");
    if (!box) return;

    if (!q) {
      box.innerHTML = `<div class="gs-empty">Начни вводить запрос. Примеры: <b>клеточные</b>, <b>эукариоты</b>, <b>вид</b>, <b>Cricetus</b>.</div>`;
      return;
    }

    const scored = index
      .map((it) => ({ it, s: scoreItem(it, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, MAX_RESULTS);

    if (!scored.length) {
      box.innerHTML = `<div class="gs-empty">Ничего не найдено. Попробуй другое слово или латинское название.</div>`;
      return;
    }

    box.innerHTML = scored
      .map((x, idx) => {
        const it = x.it;
        return `
          <a class="gs-item ${idx === active ? "is-active" : ""}"
             role="option"
             data-idx="${idx}"
             href="${escapeHtml(it.url)}">
            <div class="gs-title">${highlight(it.title, q)}</div>
            <div class="gs-meta">${escapeHtml(it.type)} · ${escapeHtml(it.level || "—")}</div>
          </a>
        `;
      })
      .join("");

    box.querySelectorAll(".gs-item").forEach((a) => {
      a.addEventListener("mouseenter", () => {
        active = Number(a.getAttribute("data-idx"));
        syncActive();
      });
    });
  }

  function syncActive() {
    const box = document.getElementById("gsResults");
    if (!box) return;

    box.querySelectorAll(".gs-item").forEach((el, i) => {
      el.classList.toggle("is-active", i === active);
    });
  }

  function onKeyDown(e) {
    const box = document.getElementById("gsResults");
    if (!box) return;

    const items = Array.from(box.querySelectorAll(".gs-item"));

    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      active = Math.min(active + 1, items.length - 1);
      syncActive();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      active = Math.max(active - 1, 0);
      syncActive();
      return;
    }

    if (e.key === "Enter") {
      if (active >= 0 && items[active]) {
        e.preventDefault();
        location.href = items[active].getAttribute("href");
      }
    }
  }

  async function onGlobalKey(e) {
    const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
    const isSlash = !e.ctrlKey && !e.metaKey && e.key === "/";

    if (isCmdK || isSlash) {
      e.preventDefault();
      await loadIndex();
      open("");
    }

    if (isOpen && e.key === "Escape") close();
  }

  async function init() {
    ensureUI();
    await loadIndex();
    document.addEventListener("keydown", onGlobalKey);
  }

  init().catch(() => {});
})();
