(function () {
  var dlg = document.getElementById("palette");
  if (!dlg || !dlg.showModal) return;
  var input = document.getElementById("pal-q"), list = document.getElementById("pal-list");
  var openBtn = document.getElementById("palette-open"), root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = [], shown = [], active = 0;

  function text(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }

  function build() {
    items = [];
    document.querySelectorAll("main section[id]").forEach(function (s) {
      var h = s.querySelector("h2");
      items.push({ title: s.id === "home" ? "Home" : (h ? text(h) : s.id), group: "Go to", el: s, block: "start", kw: "" });
    });
    [["#skills .app-card", "Skills"], ["#platforms .platform-row", "Platforms"], ["#work .case", "Work"], ["#lab .app-card", "AI"]].forEach(function (g) {
      document.querySelectorAll(g[0]).forEach(function (el) {
        var h = el.querySelector("h3");
        if (h) items.push({ title: text(h), group: g[1], el: el, block: "center", kw: text(el).toLowerCase().slice(0, 700) });
      });
    });
    document.querySelectorAll("#contact a[href]").forEach(function (a) {
      items.push({ title: text(a).replace(/\s*[↗⌁]\s*/g, " ").replace(/^in\s/, "").trim(), group: "Links", href: a.href, kw: a.href.toLowerCase() });
    });
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    if (!q) {
      shown = items.filter(function (i) { return i.group === "Go to"; });
    } else {
      shown = items.map(function (i) {
        var t = i.title.toLowerCase(), s = t.indexOf(q) === 0 ? 3 : t.indexOf(q) > -1 ? 2 : (i.group.toLowerCase().indexOf(q) > -1 || (i.kw && i.kw.indexOf(q) > -1)) ? 1 : 0;
        return { i: i, s: s };
      }).filter(function (x) { return x.s; }).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.i; });
    }
    shown = shown.slice(0, 8); active = 0; list.innerHTML = "";
    if (!shown.length) { list.innerHTML = '<li class="pal-empty" role="presentation">No matches. Try “veeam”, “zabbix” or “cisco”.</li>'; return; }
    shown.forEach(function (it, n) {
      var li = document.createElement("li");
      li.id = "pal-" + n; li.setAttribute("role", "option");
      li.innerHTML = "<span></span><small></small>";
      li.firstChild.textContent = it.title; li.lastChild.textContent = it.group;
      li.addEventListener("mousemove", function () { setActive(n); });
      li.addEventListener("click", function () { go(it); });
      list.appendChild(li);
    });
    setActive(0);
  }

  function setActive(n) {
    active = n;
    [].forEach.call(list.children, function (li, k) { li.setAttribute("aria-selected", k === n); });
    if (shown.length) { input.setAttribute("aria-activedescendant", "pal-" + n); var li = list.children[n]; if (li && li.scrollIntoView) li.scrollIntoView({ block: "nearest" }); }
  }

  function go(it) {
    dlg.close();
    if (it.href) { if (it.href.indexOf("mailto:") === 0) location.href = it.href; else window.open(it.href, "_blank", "noopener"); return; }
    it.el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: it.block });
    it.el.classList.remove("flash"); void it.el.offsetWidth; it.el.classList.add("flash");
    setTimeout(function () { it.el.classList.remove("flash"); }, 1500);
  }

  function open() {
    if (root.classList.contains("boot-pending") || dlg.open) return;
    build(); input.value = ""; render(); dlg.showModal(); input.focus();
  }

  input.addEventListener("input", render);
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (shown.length) setActive((active + 1) % shown.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (shown.length) setActive((active - 1 + shown.length) % shown.length); }
    else if (e.key === "Enter" && shown[active]) { e.preventDefault(); go(shown[active]); }
  });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  if (openBtn) openBtn.addEventListener("click", open);
  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase(), typing = tag === "input" || tag === "textarea";
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); }
    else if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey) { e.preventDefault(); open(); }
  });
})();
