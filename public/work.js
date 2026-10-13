// Work page pinboard. With a mouse the prints can be dragged about the
// board; a click without dragging opens the project. On phones a tap
// just opens it, so the page still scrolls normally.
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll(".pn__item"));
  var filterLinks = document.querySelectorAll(".wk__filter a");
  var typeNames = { hospitality: "hospitality", fnb: "f&b", wellness: "wellness", retail: "retail" };
  var top = 10;

  items.forEach(function (el) {
    var startX, startY, baseX, baseY, moved = 0, held = false;
    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      held = true; moved = 0;
      startX = e.clientX; startY = e.clientY;
      baseX = parseFloat(el.style.getPropertyValue("--dx")) || 0;
      baseY = parseFloat(el.style.getPropertyValue("--dy")) || 0;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", function (e) {
      if (!held) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      moved = Math.abs(dx) + Math.abs(dy);
      if (moved < 5) return;
      el.classList.add("is-moving");
      el.style.setProperty("--dx", baseX + dx + "px");
      el.style.setProperty("--dy", baseY + dy + "px");
    });
    el.addEventListener("pointerup", function () {
      held = false;
      if (el.classList.contains("is-moving")) {
        el.classList.remove("is-moving");
        el.style.zIndex = ++top;   // the one just moved sits on top
      }
    });
    el.addEventListener("click", function (e) {
      if (moved >= 5) { moved = 0; e.preventDefault(); return; }  // that was a drag
      openProject(el.dataset.project, el.dataset.type);
    });
  });

  // The project view: every photo with the same project name
  var dialog = document.querySelector(".pn__dialog");
  var row = dialog.querySelector(".pn__row");
  function openProject(project, type) {
    dialog.querySelector("h2").textContent = project;
    dialog.querySelector(".pn__kicker").textContent = typeNames[type];
    row.innerHTML = "";
    document.querySelectorAll(".pn__photos img").forEach(function (img) {
      if (img.dataset.project !== project) return;
      var copy = img.cloneNode();
      copy.removeAttribute("loading");
      row.appendChild(copy);
    });
    row.scrollLeft = 0;
    dialog.showModal();
  }
  dialog.querySelector(".pn__close").addEventListener("click", function () { dialog.close(); });

  // Filter: other projects fade back and cannot be clicked.
  // /work#fnb opens with f&b on, as on the current page.
  function show(type) {
    if (!typeNames[type]) type = "all";
    filterLinks.forEach(function (link) {
      if (link.dataset.filter === type) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    items.forEach(function (el) {
      var dim = type !== "all" && el.dataset.type !== type;
      el.classList.toggle("is-dim", dim);
      el.tabIndex = dim ? -1 : 0;
    });
  }
  filterLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var type = link.dataset.filter;
      history.replaceState(null, "", type === "all" ? location.pathname : "#" + type);
      show(type);
    });
  });
  show(location.hash.slice(1) || "all");
})();
