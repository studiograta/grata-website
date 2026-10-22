// Work page: the filter shows one type of project (the featured one too),
// and clicking a project opens all its photos over the page. The filter
// follows the address: /work#fnb opens with f&b on, as the home page links do.
(function () {
  var blocks = Array.prototype.slice.call(document.querySelectorAll(".fp, .card"));
  var filterLinks = document.querySelectorAll(".wk__filter a");
  // Add retail: "retail" back here (and its link in work.html) with the first retail project
  var typeNames = { hospitality: "hospitality", fnb: "f&b", wellness: "wellness" };
  var dialog = document.querySelector(".pv");
  var row = dialog.querySelector(".pv__row");

  // Open a project: every photo with its name
  document.querySelectorAll("[data-open]").forEach(function (button) {
    button.addEventListener("click", function () {
      var block = button.closest("[data-project]");
      var project = block.dataset.project;
      dialog.querySelector("h2").textContent = project;
      // Concepts (designed, not built) say so beside their type
      dialog.querySelector(".pv__kicker").textContent = typeNames[block.dataset.type] +
        (block.dataset.status ? " · " + block.dataset.status : "");
      row.innerHTML = "";
      document.querySelectorAll(".photos img").forEach(function (img) {
        if (img.dataset.project !== project) return;
        var copy = img.cloneNode();
        copy.removeAttribute("loading");
        row.appendChild(copy);
      });
      row.scrollLeft = 0;
      dialog.showModal();
    });
  });
  dialog.querySelector(".pv__close").addEventListener("click", function () { dialog.close(); });

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
