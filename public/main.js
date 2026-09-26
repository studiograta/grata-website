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

// Phones: tapping anywhere on a panel (other than a link) brings it forward.
var onPhone = window.matchMedia("(max-width: 760px)");

document.querySelectorAll(".panel").forEach(function (panel) {
  panel.addEventListener("click", function (event) {
    if (!onPhone.matches || event.target.closest("a, button")) return;
    setStudioOpen(panel.classList.contains("panel--studio"));
  });
});

// Phones: swipe up to bring Studio forward, swipe down to go back to Work.
// Short touches (under 40px) are ignored so taps still work normally.
var landing = document.querySelector(".landing");
var touchStartY = null;

landing.addEventListener("touchstart", function (event) {
  touchStartY = event.touches[0].clientY;
}, { passive: true });

landing.addEventListener("touchend", function (event) {
  if (touchStartY === null || !onPhone.matches) return;
  var distance = event.changedTouches[0].clientY - touchStartY;
  touchStartY = null;
  if (Math.abs(distance) >= 40) setStudioOpen(distance < 0);
}, { passive: true });

// Both panels: fade to the next resting photo every 6 seconds.
// The second panel starts 3 seconds later, so the two never change together.
// Each photo is only downloaded just before it is needed.
function load(photo) {
  var phoneVersion = photo.parentNode.querySelector("source[data-srcset]");
  if (phoneVersion) {
    phoneVersion.srcset = phoneVersion.dataset.srcset;
    phoneVersion.removeAttribute("data-srcset");
  }
  if (photo.dataset.src) {
    photo.src = photo.dataset.src;
    photo.removeAttribute("data-src");
  }
}

// Phones: if a photo's phone version (-mobile.jpg) is missing, show the desktop one instead.
function useDesktopVersion(photo) {
  var phoneVersion = photo.parentNode.querySelector("source");
  if (phoneVersion) phoneVersion.remove();
}

document.querySelectorAll("picture .photo").forEach(function (photo) {
  photo.addEventListener("error", function () { useDesktopVersion(photo); });
  // The first photo may have already failed before this script ran
  if (photo.complete && photo.currentSrc && photo.naturalWidth === 0) useDesktopVersion(photo);
});

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
