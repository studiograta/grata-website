// On phones, tapping "Studio" opens or closes its links.
// On desktop, hovering does the same job, so this only matters on touch screens.
// ("Work" is a plain link for now, so it has no menu to open.)
var studioButton = document.querySelector(".panel--studio button.panel__toggle");

function setStudioOpen(open) {
  studioButton.closest(".panel").classList.toggle("is-open", open);
  studioButton.setAttribute("aria-expanded", open);
}

studioButton.addEventListener("click", function () {
  setStudioOpen(studioButton.getAttribute("aria-expanded") !== "true");
});

// Phones: swipe up to bring Studio forward, swipe down to go back to Work.
// Short touches (under 40px) are ignored so taps still work normally.
var landing = document.querySelector(".landing");
var touchStartY = null;

landing.addEventListener("touchstart", function (event) {
  touchStartY = event.touches[0].clientY;
}, { passive: true });

landing.addEventListener("touchend", function (event) {
  if (touchStartY === null || !window.matchMedia("(max-width: 760px)").matches) return;
  var distance = event.changedTouches[0].clientY - touchStartY;
  touchStartY = null;
  if (Math.abs(distance) >= 40) setStudioOpen(distance < 0);
}, { passive: true });

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
