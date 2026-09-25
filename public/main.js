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
