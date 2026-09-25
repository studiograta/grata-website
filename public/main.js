// On phones, tapping "Work" or "Studio" opens that panel and closes the other.
// On desktop, hovering does the same job, so this only matters on touch screens.
document.querySelectorAll(".panel__toggle").forEach(function (button) {
  button.addEventListener("click", function () {
    var panel = button.closest(".panel");
    var opening = !panel.classList.contains("is-open");

    document.querySelectorAll(".panel").forEach(function (p) {
      p.classList.remove("is-open");
      p.querySelector(".panel__toggle").setAttribute("aria-expanded", "false");
    });

    if (opening) {
      panel.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

// Studio panel: fade to the next resting photo every 6 seconds.
// Each photo is only downloaded just before it is needed.
var restPhotos = document.querySelectorAll(".panel--studio .photo:not([data-for])");
var current = 0;

function load(photo) {
  if (photo.dataset.src) {
    photo.src = photo.dataset.src;
    photo.removeAttribute("data-src");
  }
}

if (restPhotos.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  load(restPhotos[1]);
  setInterval(function () {
    restPhotos[current].classList.remove("is-shown");
    current = (current + 1) % restPhotos.length;
    restPhotos[current].classList.add("is-shown");
    load(restPhotos[(current + 1) % restPhotos.length]);
  }, 6000);
}
