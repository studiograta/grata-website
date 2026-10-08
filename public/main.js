// On phones, tapping "Work" or "Studio" opens or closes its links, and
// only one panel's links are open at a time.
// On desktop, hovering does the same job, so this only matters on touch screens.
var panels = document.querySelectorAll(".panel");
var studio = document.querySelector(".panel--studio");

// Opens the links of one panel and closes the other (null closes both)
function setOpen(openPanel) {
  panels.forEach(function (panel) {
    var open = panel === openPanel;
    panel.classList.toggle("is-open", open);
    panel.querySelector("button.panel__toggle").setAttribute("aria-expanded", open);
  });
}

panels.forEach(function (panel) {
  panel.querySelector("button.panel__toggle").addEventListener("click", function () {
    setOpen(panel.classList.contains("is-open") ? null : panel);
  });
});

// Phones: tapping anywhere on a panel (other than a link) brings it forward.
var onPhone = window.matchMedia("(max-width: 760px)");

panels.forEach(function (panel) {
  panel.addEventListener("click", function (event) {
    if (!onPhone.matches || event.target.closest("a, button")) return;
    setOpen(panel);
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
  if (Math.abs(distance) >= 40) setOpen(distance < 0 ? studio : null);
}, { passive: true });
