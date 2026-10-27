// Work page: the filter shows one type of project (the featured one too),
// and clicking a project opens its photos over the page, one at a time. The filter
// follows the address: /work#fnb opens with f&b on, as the home page links do.
(function () {
  var blocks = Array.prototype.slice.call(document.querySelectorAll(".fp, .card"));
  var filterLinks = document.querySelectorAll(".wk__filter a");
  // Add retail: "retail" back here (and its link in work.html) with the first retail project
  var typeNames = { hospitality: "hospitality", fnb: "f&b", wellness: "wellness" };
  var dialog = document.querySelector(".pv");
  var row = dialog.querySelector(".pv__row");
  var count = dialog.querySelector(".pv__count");
  var prev = dialog.querySelector(".pv__prev");
  var next = dialog.querySelector(".pv__next");

  // Open a project: every photo with its name
  document.querySelectorAll("[data-open]").forEach(function (button) {
    button.addEventListener("click", function () {
      var block = button.closest("[data-project]");
      var project = block.dataset.project;
      dialog.querySelector("h2").textContent = project;
      // Concepts (designed, not built) say so beside their type
      // (a project outside the four sectors, like education, shows its own type)
      dialog.querySelector(".pv__kicker").textContent = (typeNames[block.dataset.type] || block.dataset.type) +
        (block.dataset.status ? " · " + block.dataset.status : "");
      // Who it was done with, for work from the principals' earlier roles
      var credit = dialog.querySelector(".pv__credit");
      credit.textContent = block.dataset.credit || "";
      credit.hidden = !block.dataset.credit;
      row.innerHTML = "";
      document.querySelectorAll(".photos img").forEach(function (img) {
        if (img.dataset.project !== project) return;
        var copy = img.cloneNode();
        copy.removeAttribute("loading");
        // Wide photos pan slowly on phones, so the whole scene passes by
        if (+copy.getAttribute("width") > +copy.getAttribute("height")) copy.dataset.wide = "";
        row.appendChild(copy);
      });
      dialog.querySelector(".pv__nav").hidden = row.children.length < 2;
      // The page menu (menu.js) moves into the project while it is open,
      // since an open project covers the page
      var menu = document.querySelector(".site-menu");
      if (menu) dialog.appendChild(menu);
      dialog.showModal();
      dialog.scrollTop = 0;
      row.scrollLeft = 0;
      update();
      // A step in the browser history, so the phone's back button closes it
      history.pushState({ project: project }, "");
    });
  });

  // Which photo is on screen: the counter says so, and only that one pans
  function current() { return Math.round(row.scrollLeft / row.clientWidth) || 0; }
  function update() {
    var shown = current();
    Array.prototype.forEach.call(row.children, function (img, i) { img.classList.toggle("is-current", i === shown); });
    count.textContent = (shown + 1) + " / " + row.children.length;
    prev.disabled = shown === 0;
    next.disabled = shown === row.children.length - 1;
  }
  row.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });

  // Arrows under the photo, and the keyboard's left and right arrows
  // (a second press while it is still sliding counts on from where it is headed)
  var headed = null, settle;
  function go(step) {
    headed = Math.max(0, Math.min(row.children.length - 1, (headed === null ? current() : headed) + step));
    row.scrollTo({ left: headed * row.clientWidth, behavior: "smooth" });
    clearTimeout(settle);
    settle = setTimeout(function () { headed = null; }, 700);
  }
  prev.addEventListener("click", function () { go(-1); });
  next.addEventListener("click", function () { go(1); });
  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
  });

  // Back arrow, Esc and the browser's back button all close the project
  dialog.querySelector(".pv__back").addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("close", function () {
    var menu = dialog.querySelector(".site-menu");
    if (menu) document.body.appendChild(menu);
    if (history.state && history.state.project) history.back();
  });
  addEventListener("popstate", function () { if (dialog.open) dialog.close(); });

  // Filter: only the chosen type shows (the featured project too)
  function show(type) {
    if (!typeNames[type]) type = "all";
    filterLinks.forEach(function (link) {
      if (link.dataset.filter === type) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    var count = 0;
    blocks.forEach(function (b) {
      b.hidden = type !== "all" && b.dataset.type !== type;
      if (!b.hidden) count++;
    });
    document.querySelector(".wk__empty").hidden = count > 0;
  }
  filterLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var type = link.dataset.filter;
      history.replaceState(null, "", type === "all" ? location.pathname : "#" + type);
      show(type);
    });
  });
  window.addEventListener("hashchange", function () { show(location.hash.slice(1) || "all"); });
  show(location.hash.slice(1) || "all");
})();
