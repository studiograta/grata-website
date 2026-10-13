// The menu on every page except home: an Olive burger at the top right,
// level with the logo. Pointing at it drops down a list of the pages, with
// the one you are on highlighted. On phones (no pointing) a tap opens and
// closes it. Keyboard users get it when the burger has focus. The look is
// in styles.css under "Menu".
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

  var menu = document.createElement("div");
  menu.className = "site-menu";
  menu.innerHTML =
    '<button class="site-menu__burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="site-menu-list">' +
    "<i></i><i></i><i></i></button>" +
    '<nav class="site-menu__list" id="site-menu-list" aria-label="Pages">' +
    pages.map(function (p) {
      return '<a href="' + p[0] + '"' + (p[0] === here ? ' aria-current="page"' : "") + ">" + p[1] + "</a>";
    }).join("") +
    "</nav>";
  document.body.appendChild(menu);

  var burger = menu.querySelector(".site-menu__burger");
  function setOpen(open) {
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  }

  // Pointing opens it; leaving closes it after a moment, so the pointer
  // can travel from the burger down to the list without it snapping shut
  var leaving;
  menu.addEventListener("pointerenter", function (e) {
    if (e.pointerType !== "mouse") return;
    clearTimeout(leaving);
    setOpen(true);
  });
  menu.addEventListener("pointerleave", function (e) {
    if (e.pointerType !== "mouse") return;
    leaving = setTimeout(function () { setOpen(false); }, 250);
  });

  // Tap (phones) or keyboard toggles it; a mouse click keeps it open,
  // since pointing has already opened it
  burger.addEventListener("click", function (e) {
    if (e.pointerType === "mouse") { setOpen(true); return; }
    setOpen(!menu.classList.contains("is-open"));
  });
  document.addEventListener("click", function (e) {
    if (!menu.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { setOpen(false); burger.focus(); }
  });
  menu.addEventListener("focusout", function (e) {
    if (!menu.contains(e.relatedTarget)) setOpen(false);
  });
})();
