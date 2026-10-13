// The menu on every page except home: a round button at the top right
// opens a full-screen Walnut panel with a link to each page. The page you
// are on is marked. Esc, the button again, or any link closes it.
// The look is in styles.css under "Menu".
(function () {
  var pages = [
    ["/", "home"],
    ["/work", "work"],
    ["/working-with-us", "approach"],
    ["/culture", "culture"],
    ["/partners", "partners"],
    ["/contact", "connect"],
  ];
  var here = location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";

  var button = document.createElement("button");
  button.className = "menu-btn";
  button.type = "button";
  button.setAttribute("aria-label", "Menu");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "site-menu");
  button.innerHTML = "<span></span><span></span><span></span>";

  var panel = document.createElement("div");
  panel.className = "menu";
  panel.id = "site-menu";
  panel.hidden = true;
  panel.innerHTML =
    '<nav class="menu__links" aria-label="Pages">' +
    pages.map(function (p, i) {
      var current = p[0] === here ? ' aria-current="page"' : "";
      return '<a href="' + p[0] + '" style="--i:' + i + '"' + current + ">" + p[1] + "</a>";
    }).join("") +
    "</nav>" +
    '<p class="menu__foot"><a href="mailto:reach@studiograta.in">reach@studiograta.in</a>' +
    '<span>Indiranagar, Bengaluru</span></p>';

  document.body.appendChild(panel);
  document.body.appendChild(button);

  function setOpen(open) {
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close menu" : "Menu");
    document.documentElement.classList.toggle("menu-open", open);
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add("is-open"); });
      panel.querySelector("a").focus({ preventScroll: true });
    } else {
      panel.classList.remove("is-open");
      panel.hidden = true;
    }
  }

  button.addEventListener("click", function () {
    setOpen(button.getAttribute("aria-expanded") !== "true");
  });
  panel.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { setOpen(false); button.focus(); }
  });
})();
