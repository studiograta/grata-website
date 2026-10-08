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

// The photos behind each panel fade to the next one: every 6 seconds on
// desktop, every 9 seconds on phones, where each photo also glides sideways
// while it is shown (the look is in styles.css under .is-panning). The
// second panel runs half a step behind, so the two never change together.
// Each photo is only downloaded just before it is needed.
var onPhoneScreen = window.matchMedia("(max-width: 760px)").matches;
var stillMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var step = onPhoneScreen ? 9000 : 6000;

function load(photo) {
  if (photo.dataset.src) {
    photo.src = photo.dataset.src;
    photo.removeAttribute("data-src");
  }
}

// Run "then" once the photo has downloaded. A photo still downloading has
// no width yet, so a glide started then would have nowhere to go.
function whenLoaded(photo, then) {
  if (photo.complete && photo.naturalWidth) then();
  else photo.addEventListener("load", then, { once: true });
}

function startPanning(photo) {
  whenLoaded(photo, function () {
    if (photo.classList.contains("is-shown")) photo.classList.add("is-panning");
  });
}

document.querySelectorAll(".photos").forEach(function (photos, index) {
  var list = photos.querySelectorAll(".photo");
  var current = 0;
  load(list[0]);
  if (stillMotion) return;
  // The first photo gets its full turn: the clock starts once it has loaded
  whenLoaded(list[0], function () {
    startPanning(list[0]);
    if (list.length < 2) return;
    load(list[1]);
    setTimeout(function () {
      setInterval(function () {
        var previous = list[current];
        previous.classList.remove("is-shown");
        // Keep gliding while it fades out, then reset for its next turn
        setTimeout(function () { previous.classList.remove("is-panning"); }, 1300);
        current = (current + 1) % list.length;
        list[current].classList.add("is-shown");
        startPanning(list[current]);
        load(list[(current + 1) % list.length]);
      }, step);
    }, index * step / 2);
  });
});
