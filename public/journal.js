// Journal. On a post: the Olive reading line at the top grows as you
// scroll, and "copy link" copies the page address. On the journal page:
// the topic filter, and a photo of each post that follows the pointer
// over the list. The look is in styles.css under "Journal".
(function () {
  var bar = document.querySelector(".jp-progress");
  if (bar) {
    var update = function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ")";
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }

  var share = document.querySelector("[data-copy]");
  if (share && navigator.clipboard) {
    share.addEventListener("click", function () {
      navigator.clipboard.writeText(location.href).then(function () {
        share.textContent = "copied";
        setTimeout(function () { share.textContent = "copy link"; }, 2000);
      });
    });
  } else if (share) {
    share.hidden = true;
  }

  // The journal page: show one topic at a time (the address keeps it,
  // e.g. /journal/#materials, so it can be shared)
  var filterLinks = document.querySelectorAll(".jl__filter a");
  if (filterLinks.length) {
    var posts = document.querySelectorAll(".jl [data-topic]");
    var empty = document.querySelector(".jl__empty");
    var show = function (topic) {
      var shown = 0;
      posts.forEach(function (post) {
        post.hidden = topic !== "all" && post.dataset.topic !== topic;
        if (!post.hidden) shown++;
      });
      empty.hidden = shown > 0;
      filterLinks.forEach(function (link) {
        if (link.dataset.filter === topic) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };
    filterLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var topic = link.dataset.filter;
        history.replaceState(null, "", topic === "all" ? location.pathname : "#" + topic);
        show(topic);
      });
    });
    var start = location.hash.slice(1);
    show(document.querySelector('.jl__filter [data-filter="' + start + '"]') ? start : "all");
  }

  // The photo beside the pointer, only with a mouse and when motion is welcome
  var peek = document.querySelector(".jl__peek");
  if (peek && matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    document.querySelectorAll(".jl__list a").forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        peek.src = row.dataset.img;
        peek.classList.add("is-shown");
      });
      row.addEventListener("mouseleave", function () { peek.classList.remove("is-shown"); });
      // It keeps clear of the title, so the words stay readable
      row.addEventListener("mousemove", function (e) {
        var titleEnd = row.querySelector("b").getBoundingClientRect().right;
        var x = Math.min(Math.max(e.clientX, titleEnd) + 32, innerWidth - peek.offsetWidth - 16);
        peek.style.transform = "translate(" + x + "px, " + (e.clientY - peek.offsetHeight / 2) + "px)";
      });
    });
    // A row that scrolls away or is filtered out never says the pointer left
    var hide = function () { peek.classList.remove("is-shown"); };
    addEventListener("scroll", hide, { passive: true });
    filterLinks.forEach(function (link) { link.addEventListener("click", hide); });
  }
})();
