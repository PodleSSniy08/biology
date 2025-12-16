(() => {
  const $ = (id) => document.getElementById(id);

  const searchEl = $("kbSearch");
  const levelEl = $("kbLevel");
  const listEl = $("kbList");
  const countEl = $("kbCount");
  const selectedEl = $("kbSelected");
  const clearBtn = $("kbClear");

  let ARTICLES = [];
  let selectedNodeId = "";

  const norm = (s) => (s || "").toString().toLowerCase().trim();

  function escapeHtml(s) {
    return String(s || "")
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

    // поиск по title/excerpt/level/category/tags/synonyms (если есть)
    const hay = [
      article.title,
      article.excerpt,
      article.level,
      article.category,
      (article.tags || []).join(" "),
      (article.synonyms || []).join(" ")
    ].map(norm).join(" ");

    return hay.includes(q);
  }

  function renderSelectedPreview(article) {
    if (!selectedEl) return;

    if (!article) {
      selectedEl.innerHTML = `<div class="note">Выбери уровень на схеме или воспользуйся поиском.</div>`;
      return;
    }

    // “следующие шаги” (если в articles.json есть parentId)
    const children = ARTICLES.filter(x => (x.parentId || "") === article.id);

    selectedEl.innerHTML = `
      <div class="kb-preview">
        <div class="kb-preview-top">
          <div class="kb-badges">
            ${article.level ? `<span class="kb-badge">${escapeHtml(article.level)}</span>` : ""}
            ${article.category ? `<span class="kb-badge">${escapeHtml(article.category)}</span>` : ""}
            ${article.readTime ? `<span class="kb-badge">⏱ ${escapeHtml(article.readTime)} мин</span>` : ""}
          </div>
          <a class="btn" href="article.html?id=${encodeURIComponent(article.id)}">Открыть статью</a>
        </div>

        <h3 class="kb-preview-title">${escapeHtml(article.title)}</h3>
        <p class="kb-preview-text">${escapeHtml(article.excerpt || "")}</p>

        ${
          children.length
            ? `
          <div class="kb-next">
            <div class="kb-next-title">Дальше по дереву:</div>
            <div class="kb-next-grid">
              ${children.map(ch => `
                <a class="kb-next-card" href="article.html?id=${encodeURIComponent(ch.id)}">
                  <div class="kb-next-name">${escapeHtml(ch.title)}</div>
                  <div class="kb-next-meta">${escapeHtml(ch.level || "—")} · ⏱ ${escapeHtml(ch.readTime || 0)} мин</div>
                </a>
              `).join("")}
            </div>
          </div>
        `
            : `<div class="note" style="text-align:left">Для этого уровня пока нет “следующих шагов”.</div>`
        }
      </div>
    `;
  }

  function render() {
    if (!listEl || !countEl) return;

    const items = ARTICLES.filter(matches);
    countEl.textContent = String(items.length);

    // если есть выбранный узел — показываем превью
    if (selectedNodeId) {
      const selected = ARTICLES.find(a => a.id === selectedNodeId);
      renderSelectedPreview(selected || null);
    }

    if (!items.length) {
      listEl.innerHTML = `<div class="note" style="text-align:center;">Ничего не найдено. Попробуй другой запрос или сбрось фильтры.</div>`;
      return;
    }

    listEl.innerHTML = items.map(a => `
      <a class="kb-item" href="article.html?id=${encodeURIComponent(a.id)}">
        <div class="kb-item-title">${escapeHtml(a.title)}</div>
        ${a.excerpt ? `<div class="kb-item-excerpt">${escapeHtml(a.excerpt)}</div>` : ""}
        <div class="kb-item-meta">
          <span class="kb-dot"></span>
          <span>${escapeHtml(a.level || "—")}</span>
          ${a.category ? `<span>·</span><span>${escapeHtml(a.category)}</span>` : ""}
          <span>·</span>
          <span>⏱ ${escapeHtml(a.readTime || 0)} мин</span>
        </div>
      </a>
    `).join("");
  }

  function hookTimelineClicks() {
    document.querySelectorAll(".rank-item[data-node]").forEach(item => {
      item.style.cursor = "pointer";
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-node");
        if (!id) return;
        location.href = `article.html?id=${encodeURIComponent(id)}`;
      });
    });
  }

  function clearAll() {
    if (searchEl) searchEl.value = "";
    if (levelEl) levelEl.value = "";
    selectedNodeId = "";

    document.querySelectorAll(".rank-item").forEach(x => x.classList.remove("is-active"));
    renderSelectedPreview(null);
    render();
  }

  async function init() {
    const r = await fetch("data/articles.json", { cache: "no-store" });
    ARTICLES = await r.json();

    hookTimelineClicks();

    // live search
    if (searchEl) searchEl.addEventListener("input", render);
    if (levelEl) levelEl.addEventListener("change", render);
    if (clearBtn) clearBtn.addEventListener("click", clearAll);

    renderSelectedPreview(null);
    render();
  }

  init().catch(() => {
    if (listEl) {
      listEl.innerHTML = `<div class="note" style="text-align:center;">Не найден файл data/articles.json или ошибка загрузки</div>`;
    }
  });
})();
