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

// Desktop: the photos behind a panel fade to the next one every 6 seconds.
// Phones skip the photos entirely, so they are never downloaded there.
// Each photo is only downloaded just before it is needed.
var onDesktop = window.matchMedia("(min-width: 761px)").matches;
var stillMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function load(photo) {
  if (photo.dataset.src) {
    photo.src = photo.dataset.src;
    photo.removeAttribute("data-src");
  }
}

if (onDesktop) {
  // The second panel starts 3 seconds later, so the two never change together
  document.querySelectorAll(".photos").forEach(function (photos, index) {
    var list = photos.querySelectorAll(".photo");
    var current = 0;
    load(list[0]);
    if (list.length < 2 || stillMotion) return;
    load(list[1]);
    setTimeout(function () {
      setInterval(function () {
        list[current].classList.remove("is-shown");
        current = (current + 1) % list.length;
        list[current].classList.add("is-shown");
        load(list[(current + 1) % list.length]);
      }, 6000);
    }, index * 3000);
  });
}
