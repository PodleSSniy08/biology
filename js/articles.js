(() => {
  const $ = (id) => document.getElementById(id);
  const searchEl = $("kbSearch");
  const levelEl = $("kbLevel");
  const listEl = $("kbList");
  const countEl = $("kbCount");
  const selectedEl = $("kbSelected");
  const clearBtn = $("kbClear");
  let ARTICLES = [];
  const norm = (s) => String(s ?? "").toLowerCase().trim();
  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function matches(article) {
    const q = norm(searchEl?.value);
    const lvl = levelEl?.value || "";
    if (lvl && (article.level || "") !== lvl) return false;
    if (!q) return true;
    const hay = [
      article.title,
      article.excerpt,
      article.level,
      article.category,
      (article.tags || []).join(" "),
      (article.synonyms || []).join(" ")
    ]
      .map(norm)
      .join(" ");
    return hay.includes(q);
  }
  function renderSelectedPreview(article) {
    if (!selectedEl) return;
    if (!article) {
      selectedEl.innerHTML = `<div class="note">Выбери уровень на схеме или воспользуйся поиском.</div>`;
      return;
    }
    const children = ARTICLES.filter((x) => (x.parentId || "") === article.id);
    selectedEl.innerHTML = `
      <div class="kb-preview">
        <div class="kb-preview-top">
          <div class="kb-badges">
            ${article.level ? `<span class="kb-badge">${escapeHtml(article.level)}</span>` : ""}
            ${article.readTime ? `<span class="kb-badge">⏱ ${escapeHtml(article.readTime)} мин</span>` : ""}
          </div>
          <a class="btn" href="article.html?id=${encodeURIComponent(article.id)}">Открыть статью</a>
        </div>
        <h3 class="kb-preview-title">${escapeHtml(article.title || "Статья")}</h3>
        <p class="kb-preview-text">${escapeHtml(article.excerpt || "")}</p>
        ${
          children.length
            ? `
          <div class="kb-next">
            <div class="kb-next-title">Дальше по цепочке:</div>
            <div class="kb-next-grid">
              ${children
                .map(
                  (ch) => `
                <a class="kb-next-card" href="article.html?id=${encodeURIComponent(ch.id)}">
                  <div class="kb-next-name">${escapeHtml(ch.title)}</div>
                  <div class="kb-next-meta">${escapeHtml(ch.level || "—")} · ⏱ ${escapeHtml(
                    ch.readTime || 1
                  )} мин</div>
                </a>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;
  }
  function renderList() {
    if (!listEl || !countEl) return;
    const items = ARTICLES.filter(matches);
    countEl.textContent = String(items.length);
    if (!items.length) {
      listEl.innerHTML = `<div class="note" style="text-align:center;">Ничего не найдено. Попробуй другой запрос или сбрось фильтр.</div>`;
      return;
    }
    listEl.innerHTML = items
      .map(
        (a) => `
      <a class="kb-item" href="article.html?id=${encodeURIComponent(a.id)}">
        <div class="kb-item-title">${escapeHtml(a.title)}</div>
        <div class="kb-item-excerpt">${escapeHtml(a.excerpt || "")}</div>
        <div class="kb-item-meta">
          <span class="kb-dot"></span>
          <span>${escapeHtml(a.level || "—")}</span>
          <span>·</span>
          <span>⏱ ${escapeHtml(a.readTime || 1)} мин</span>
        </div>
      </a>
    `
      )
      .join("");
  }
  function hookTimelineClicks() {
    document.querySelectorAll(".rank-item[data-node]").forEach((item) => {
      item.style.cursor = "pointer";
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-node");
        if (!id) return;
        location.href = `article.html?id=${encodeURIComponent(id)}`;
      });
    });
  }
  function hookInitialFromHashOrQuery() {
    const params = new URLSearchParams(location.search);
    const focus = params.get("focus");
    if (!focus) return;
    const a = ARTICLES.find((x) => x.id === focus);
    if (a) renderSelectedPreview(a);
  }
  function clearAll() {
    if (searchEl) searchEl.value = "";
    if (levelEl) levelEl.value = "";
    renderSelectedPreview(null);
    renderList();
  }
  async function init() {
    if (!searchEl || !levelEl || !listEl || !countEl || !clearBtn) return;
    const r = await fetch("data/articles.json", { cache: "no-store" });
    if (!r.ok) throw new Error(`articles.json: ${r.status}`);
    ARTICLES = await r.json();
    hookTimelineClicks();
    searchEl.addEventListener("input", renderList);
    levelEl.addEventListener("change", renderList);
    clearBtn.addEventListener("click", clearAll);
    renderSelectedPreview(null);
    renderList();
    hookInitialFromHashOrQuery();
  }
  init().catch(() => {
    if (listEl) {
      listEl.innerHTML = `<div class="note" style="text-align:center;">Не найден файл <b>data/articles.json</b> или он повреждён.</div>`;
    }
  });
})();
