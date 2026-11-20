// The menu on every page except home, top right, level with the logo.
// Desktop (wide window and a mouse): the main pages sit in a row as plain
// words; pointing at work or studio drops a short list of its pages
// underneath. No burger. Phones and small windows: an Olive burger that a
// tap opens into the list of every page. The look is in styles.css under
// "Menu".
(function () {
  // The row on desktop: each section, then the pages pointing at it shows
  var sections = [
    ["/work", "work", [
      ["/hotels-resorts", "hotels & resorts"],
      ["/restaurants-bars", "restaurants & bars"],
      ["/wellness", "wellness"],
      ["/workplaces", "workplaces"],
    ]],
    ["/studio", "studio", [
      ["/culture", "culture"],
      ["/makers", "makers"],
    ]],
    ["/journal/", "journal"],
    ["/connect", "connect"],
  ];
  // The burger's list on phones
  var pages = [
    ["/", "home"],
    ["/work", "work"],
    ["/studio", "studio"],
    ["/journal/", "journal"],
    ["/makers", "makers"],
    ["/culture", "culture"],
    ["/connect", "connect"],
  ];
  var here = location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  function link(p) {
    var path = p[0].replace(/\/$/, "") || "/";
    return '<a href="' + p[0] + '"' + (path === here ? ' aria-current="page"' : "") + ">" + p[1] + "</a>";
  }

  var menu = document.createElement("div");
  menu.className = "site-menu";
  menu.innerHTML =
    // Desktop: the row
    '<nav class="site-nav" aria-label="Main">' +
    sections.map(function (s) {
      if (!s[2]) return '<div class="site-nav__item">' + link(s) + "</div>";
      return '<div class="site-nav__item site-nav__item--more">' + link(s) +
        '<div class="site-nav__drop">' + s[2].map(link).join("") + "</div></div>";
    }).join("") +
    "</nav>" +
    // Phones and small windows: the burger and its list
    '<button class="site-menu__burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="site-menu-list">' +
    "<i></i><i></i><i></i></button>" +
    '<nav class="site-menu__list" id="site-menu-list" aria-label="Pages">' +
    pages.map(link).join("") +
    "</nav>";
  document.body.appendChild(menu);

  // The row's lists open on pointing, in CSS. Esc closes one opened from
  // the keyboard.
  menu.querySelector(".site-nav").addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.activeElement) document.activeElement.blur();
  });

  // The burger: a tap opens and closes it; a tap elsewhere or Esc closes it
  var burger = menu.querySelector(".site-menu__burger");
  function setOpen(open) {
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  }
  burger.addEventListener("click", function () {
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
