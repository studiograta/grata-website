// The menu on every page except home. The Olive line above the page title
// is the way in: hovering splits it into three lines and shows "menu", it
// does the same once by itself after the title lands, and on phones "menu"
// is always shown beside it. Clicking opens a full-screen Walnut panel with
// a link to each page; the page you are on is marked. The ✕, Esc or any
// link closes it. The look is in styles.css under "Menu".
(function () {
  var title = document.querySelector("main h1");
  if (!title) return;

  var pages = [
    ["/", "home"],
    ["/work", "work"],
    ["/working-with-us", "approach"],
    ["/culture", "culture"],
    ["/partners", "partners"],
    ["/contact", "connect"],
  ];
  var here = location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";

  // The line: a button in place of the title's drawn line, keeping its spacing
  var gap = getComputedStyle(title, "::before").marginBottom;
  var line = document.createElement("button");
  line.className = "menu-line";
  line.type = "button";
  line.setAttribute("aria-label", "Menu");
  line.setAttribute("aria-expanded", "false");
  line.setAttribute("aria-controls", "site-menu");
  line.style.marginBottom = gap;
  line.innerHTML = '<span class="menu-line__word" aria-hidden="true">menu</span><i></i><i></i><i></i>';
  if (getComputedStyle(title).textAlign === "right") line.classList.add("menu-line--right");
  title.classList.add("has-menu-line");
  title.insertBefore(line, title.firstChild);

  var panel = document.createElement("div");
  panel.className = "menu";
  panel.id = "site-menu";
  panel.hidden = true;
  panel.innerHTML =
    '<button class="menu__close" type="button" aria-label="Close menu"><i></i><i></i></button>' +
    '<nav class="menu__links" aria-label="Pages">' +
    pages.map(function (p, i) {
      var current = p[0] === here ? ' aria-current="page"' : "";
      return '<a href="' + p[0] + '" style="--i:' + i + '"' + current + ">" + p[1] + "</a>";
    }).join("") +
    "</nav>" +
    '<p class="menu__foot"><a href="mailto:reach@studiograta.in">reach@studiograta.in</a>' +
    "<span>Indiranagar, Bengaluru</span></p>";
  document.body.appendChild(panel);
  var close = panel.querySelector(".menu__close");

  function setOpen(open) {
    line.setAttribute("aria-expanded", String(open));
    document.documentElement.classList.toggle("menu-open", open);
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add("is-open"); });
      panel.querySelector(".menu__links a").focus({ preventScroll: true });
    } else {
      panel.classList.remove("is-open");
      panel.hidden = true;
      line.focus({ preventScroll: true });
    }
  }

  line.addEventListener("click", function () { setOpen(true); });
  close.addEventListener("click", function () { setOpen(false); });
  panel.addEventListener("click", function (e) {
    if (e.target.closest(".menu__links a, .menu__foot a")) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) setOpen(false);
  });

  // A one-time hint once the title has landed: the line splits and closes
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setTimeout(function () {
      line.classList.add("is-hinting");
      setTimeout(function () { line.classList.remove("is-hinting"); }, 1600);
    }, 3000);
  }
})();
