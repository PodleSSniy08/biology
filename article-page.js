(() => {
  const $ = (id) => document.getElementById(id);
  const titleEl = $("articleTitle");
  const metaEl = $("articleMeta");
  const contentEl = $("articleContent");
  const updatedEl = $("articleUpdated");
  const linksEl = $("articleLinks");
  const sourcesEl = $("articleSources");

  const norm = (s) => String(s ?? "").trim();
  const escapeHtml = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  function formatBody(body) {
    const parts = norm(body).split(/\n\s*\n/).filter(Boolean);
    if (!parts.length) return `<div class="note">Нет содержимого статьи.</div>`;
    return parts
      .map((block) => `<p>${escapeHtml(block).replaceAll("\n", "<br>")}</p>`)
      .join("");
  }

  function renderMeta(article) {
    if (!metaEl) return;
    const tags = (article.tags || []).map((t) => `<span class="kb-badge">${escapeHtml(t)}</span>`).join("");
    const level = article.level ? `<span class="kb-badge">${escapeHtml(article.level)}</span>` : "";
    const category = article.category ? `<span class="kb-badge">${escapeHtml(article.category)}</span>` : "";
    const read = article.readTime ? `<span class="kb-badge">⏱ ${escapeHtml(article.readTime)} мин</span>` : "";
    metaEl.innerHTML = [level, category, read, tags].filter(Boolean).join("");
  }

  function renderUpdated(article) {
    if (!updatedEl) return;
    if (!article.updated) {
      updatedEl.textContent = "";
      return;
    }
    const date = new Date(article.updated);
    updatedEl.textContent = `Обновлено: ${date.toLocaleDateString("ru-RU")}`;
  }

  function renderLinks(article, articles) {
    if (!linksEl) return;
    const children = articles.filter((x) => (x.parentId || "") === article.id);
    const parent = articles.find((x) => x.id === article.parentId);
    if (!children.length && !parent) {
      linksEl.style.display = "none";
      return;
    }
    const parts = [];
    if (parent) {
      parts.push(`
        <div class="kb-next">
          <div class="kb-next-title">Вышестоящий уровень</div>
          <div class="kb-next-grid">
            <a class="kb-next-card" href="article.html?id=${encodeURIComponent(parent.id)}">
              <div class="kb-next-name">${escapeHtml(parent.title)}</div>
              <div class="kb-next-meta">${escapeHtml(parent.level || "—")} · ⏱ ${escapeHtml(parent.readTime || 1)} мин</div>
            </a>
          </div>
        </div>
      `);
    }
    if (children.length) {
      parts.push(`
        <div class="kb-next" style="margin-top:12px;">
          <div class="kb-next-title">Дальше по цепочке</div>
          <div class="kb-next-grid">
            ${children
              .map(
                (ch) => `
              <a class="kb-next-card" href="article.html?id=${encodeURIComponent(ch.id)}">
                <div class="kb-next-name">${escapeHtml(ch.title)}</div>
                <div class="kb-next-meta">${escapeHtml(ch.level || "—")} · ⏱ ${escapeHtml(ch.readTime || 1)} мин</div>
              </a>
            `
              )
              .join("")}
          </div>
        </div>
      `);
    }
    linksEl.innerHTML = parts.join("");
    linksEl.style.display = "block";
  }

  function renderSources(article) {
    if (!sourcesEl) return;
    const list = article.sources || [];
    if (!list.length) {
      sourcesEl.style.display = "none";
      return;
    }
    sourcesEl.innerHTML = `
      <div class="kb-panel-head" style="margin-bottom:12px;">
        <h2 class="kb-h2">Источники</h2>
      </div>
      <ul class="kb-list" style="display:block;">
        ${list
          .map(
            (s) => `
          <li class="kb-item" style="display:block; padding:12px 16px;">
            <div class="kb-item-title" style="margin-bottom:6px;">${escapeHtml(s.title)}</div>
            ${s.url ? `<a class="kb-item-excerpt" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.url)}</a>` : ""}
          </li>
        `
          )
          .join("")}
      </ul>
    `;
    sourcesEl.style.display = "block";
  }

  function showError(message) {
    if (titleEl) titleEl.textContent = "Статья не найдена";
    if (metaEl) metaEl.innerHTML = "";
    if (contentEl) contentEl.innerHTML = `<div class="note" style="text-align:center;">${escapeHtml(message)}</div>`;
    if (linksEl) linksEl.style.display = "none";
    if (sourcesEl) sourcesEl.style.display = "none";
  }

  async function init() {
    if (!contentEl || !titleEl || !metaEl) return;
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (!id) {
      showError("Не указан идентификатор статьи. Вернись к списку и выбери нужную.");
      return;
    }

    const r = await fetch("data/articles.json", { cache: "no-store" });
    if (!r.ok) throw new Error(`articles.json: ${r.status}`);
    const articles = await r.json();

    const article = articles.find((x) => x.id === id);
    if (article.author) {
  const meta = document.getElementById("aMeta");

  let authorText = "";

  if (typeof article.author === "string") {
    authorText = `Автор: ${article.author}`;
  } else if (article.author.name) {
    authorText = `Автор: ${article.author.name}`;
  }

  if (authorText) {
    meta.textContent = authorText;
    meta.style.display = "";
  }
}
    if (!article) {
      showError("Такой статьи нет в базе. Возможно, она была удалена или переименована.");
      return;
    }
// автор статьи
if (article.author) {
  const meta = document.getElementById("aMeta");

  let authorText = "";

  if (typeof article.author === "string") {
    authorText = `Автор: ${article.author}`;
  } else if (article.author.name) {
    authorText = `Автор: ${article.author.name}`;
  }

  if (authorText) {
    meta.textContent = authorText;
    meta.style.display = "";
  }
}
if (article.author) {
  const el = document.getElementById("aAuthor");
  el.textContent = typeof article.author === "string"
    ? `Автор: ${article.author}`
    : `Автор: ${article.author.name}`;
  el.style.display = "";
}


    document.title = `${article.title} — Статья`;
    titleEl.textContent = article.title;
    renderMeta(article);
    renderUpdated(article);
    contentEl.innerHTML = formatBody(article.body);
    renderLinks(article, articles);
    renderSources(article);

    if (typeof window.applyHighlight === "function") {
      window.applyHighlight();
    }
  }

  init().catch(() => {
    showError("Не удалось загрузить файл data/articles.json.");
  });
})();
