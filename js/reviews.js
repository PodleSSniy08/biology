(() => {
  const form = document.getElementById("reviewForm");
  const list = document.getElementById("reviewList");
  const msg  = document.getElementById("msg");
  const snippetBox = document.getElementById("snippet");
  async function loadApproved(){
    try{
      const r = await fetch("data/reviews.json");
      if (!r.ok) throw new Error("reviews.json not found");
      return await r.json();
    }catch(e){
      return [];
    }
  }
  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
  function render(items){
    list.innerHTML = "";
    if(!items.length){
      list.innerHTML = `<div class="note" style="text-align:center; opacity:.9">Пока нет опубликованных отзывов.</div>`;
      return;
    }
    for(const it of items){
      const el = document.createElement("div");
      el.className = "review";
      el.innerHTML = `
        <div class="meta">${escapeHtml(it.name || "Аноним")} · ${escapeHtml(it.grade || "")} · ${escapeHtml(it.date || "")}</div>
        <div>${escapeHtml(it.text || "")}</div>
      `;
      list.appendChild(el);
    }
  }
  loadApproved().then(render);
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    const name  = document.getElementById("name").value.trim();
    const grade = document.getElementById("grade").value.trim();
    const text  = document.getElementById("text").value.trim();
    if(!text){
      msg.textContent = "Напишите текст отзыва 🙂";
      return;
    }
    const item = {
      name: name || "Аноним",
      grade: grade || "",
      text,
      date: new Date().toISOString().slice(0,10)
    };
    const snippet = JSON.stringify(item, null, 2);
    try{
      await navigator.clipboard.writeText(snippet);
      msg.textContent = "Готово! Отзыв скопирован. Отправьте его модератору для публикации.";
      snippetBox.style.display = "none";
      snippetBox.value = "";
    }catch(err){
      msg.textContent = "Не удалось автоматически скопировать. Скопируйте текст ниже и отправьте модератору.";
      snippetBox.style.display = "block";
      snippetBox.value = snippet;
    }
    form.reset();
  });
})();