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
