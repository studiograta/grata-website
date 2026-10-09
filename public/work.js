// Work page: the filter shows one type of project, and the photos that are
// left get their sizes in a set rhythm (big, a pair side by side, medium,
// extra wide, small and set in), so the page looks composed under any filter.
// The filter follows the address: /work#fnb opens with f&b on, which is how
// the links on the home page work.
var photos = Array.prototype.slice.call(document.querySelectorAll(".wk__list figure"));
var filterLinks = document.querySelectorAll(".wk__filter a");
var emptyNote = document.querySelector(".wk__empty");
var rhythm = ["lg", "pair-a", "pair-b", "md", "xl", "sm"];

function show(type) {
  var known = Array.prototype.some.call(filterLinks, function (link) { return link.dataset.filter === type; });
  if (!known) type = "all";

  filterLinks.forEach(function (link) {
    if (link.dataset.filter === type) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });

  var count = 0;
  photos.forEach(function (photo) {
    var match = type === "all" || photo.dataset.type === type;
    photo.hidden = !match;
    photo.className = match ? "wk__" + rhythm[count++ % rhythm.length] : "";
  });
  emptyNote.hidden = count > 0;
}

function showFromAddress() {
  show(location.hash.slice(1) || "all");
}

filterLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    var type = link.dataset.filter;
    // Change the address without jumping or adding a step to the back button
    history.replaceState(null, "", type === "all" ? location.pathname : "#" + type);
    show(type);
  });
});

// "Back to top" glides up without touching the address (and so the filter)
document.querySelector(".wk__top").addEventListener("click", function (event) {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("hashchange", showFromAddress);
showFromAddress();
