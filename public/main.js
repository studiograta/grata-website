// On phones, tapping "Studio" opens or closes its links.
// On desktop, hovering does the same job, so this only matters on touch screens.
// ("Work" is a plain link for now, so it has no menu to open.)
document.querySelectorAll("button.panel__toggle").forEach(function (button) {
  button.addEventListener("click", function () {
    var open = button.closest(".panel").classList.toggle("is-open");
    button.setAttribute("aria-expanded", open);
  });
});

// Both panels: fade to the next resting photo every 6 seconds.
// The second panel starts 3 seconds later, so the two never change together.
// Each photo is only downloaded just before it is needed.
function load(photo) {
  if (photo.dataset.src) {
    photo.src = photo.dataset.src;
    photo.removeAttribute("data-src");
  }
}

var stillMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll(".photos").forEach(function (photos, index) {
  var restPhotos = photos.querySelectorAll(".photo:not([data-for])");
  var caption = photos.parentNode.querySelector(".photo-caption");
  var current = 0;
  if (restPhotos.length < 2 || stillMotion) return;

  load(restPhotos[1]);
  setTimeout(function () {
    setInterval(function () {
      restPhotos[current].classList.remove("is-shown");
      current = (current + 1) % restPhotos.length;
      restPhotos[current].classList.add("is-shown");
      if (caption) caption.textContent = restPhotos[current].dataset.caption;
      load(restPhotos[(current + 1) % restPhotos.length]);
    }, 6000);
  }, index * 3000);
});
