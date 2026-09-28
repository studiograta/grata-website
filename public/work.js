// Work page viewer: clicking a project opens its photos full screen. The
// arrows (or arrow keys, or a swipe on phones) step through every photo,
// running on from one project into the next. Each project has its own
// link, e.g. /work#beruru, which opens the viewer straight away.
var viewer = document.querySelector(".wk__viewer");
var image = viewer.querySelector("img");
var phoneSource = viewer.querySelector("source");
var captionName = viewer.querySelector(".wk__caption b");
var captionCount = viewer.querySelector(".wk__caption span");

// One list of every photo, each knowing its project
var photos = [];
document.querySelectorAll(".wk__tile").forEach(function (tile) {
  tile.dataset.first = photos.length;
  tile.dataset.photos.split(",").forEach(function (pair) {
    var files = pair.trim().split(/\s+/);
    photos.push({ wide: files[0], phone: files[1] || files[0], name: tile.querySelector("h2").textContent, hash: tile.hash });
  });
});

var current = 0;
function show(index) {
  current = (index + photos.length) % photos.length;
  var photo = photos[current];
  phoneSource.srcset = photo.phone;
  image.src = photo.wide;
  image.alt = photo.name;
  captionName.textContent = photo.name;
  captionCount.textContent = (current + 1) + " / " + photos.length;
  history.replaceState(null, "", photo.hash);
  if (!viewer.open) viewer.showModal();
}

document.querySelectorAll(".wk__tile").forEach(function (tile) {
  tile.addEventListener("click", function (event) {
    event.preventDefault();
    show(Number(tile.dataset.first));
  });
});
viewer.querySelector(".wk__prev").addEventListener("click", function () { show(current - 1); });
viewer.querySelector(".wk__next").addEventListener("click", function () { show(current + 1); });
viewer.querySelector(".wk__close").addEventListener("click", function () { viewer.close(); });
viewer.addEventListener("close", function () { history.replaceState(null, "", location.pathname); });
document.addEventListener("keydown", function (event) {
  if (!viewer.open) return;
  if (event.key === "ArrowLeft") show(current - 1);
  if (event.key === "ArrowRight") show(current + 1);
});

// Swipe left or right on phones
var startX = null;
viewer.addEventListener("touchstart", function (event) { startX = event.touches[0].clientX; }, { passive: true });
viewer.addEventListener("touchend", function (event) {
  if (startX === null) return;
  var moved = event.changedTouches[0].clientX - startX;
  if (Math.abs(moved) > 50) show(current + (moved < 0 ? 1 : -1));
  startX = null;
});

// Arriving on /work#beruru opens that project
var linked = document.querySelector('.wk__tile[href="' + location.hash + '"]');
if (location.hash && linked) show(Number(linked.dataset.first));
