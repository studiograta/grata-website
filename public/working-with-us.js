// Approach page: reveal each step, sector and checklist item as it scrolls
// into view (the look is in styles.css under .pb--animate). Skipped for
// people who turn off motion, so they see the finished page straight away.
var page = document.querySelector(".pb");
var stillMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (page && !stillMotion && "IntersectionObserver" in window) {
  page.classList.add("pb--animate");
  // Items that arrive together play one after another: steps wait for the
  // Olive line to cross the step before (0.5s), the rest follow quickly.
  var watcher = new IntersectionObserver(function (entries) {
    var steps = 0, others = 0;
    entries.filter(function (entry) { return entry.isIntersecting; })
      .forEach(function (entry) {
        var item = entry.target;
        var isStep = item.parentNode.classList.contains("pb__steps");
        var wait = isStep ? 0.5 * steps++ : 0.12 * others++;
        item.style.setProperty("--d", wait + "s");
        item.classList.add("is-in");
        watcher.unobserve(item);
      });
  }, { rootMargin: "0px 0px -12% 0px" });
  page.querySelectorAll(".pb__steps li, .pb__band li, .pb__ready li").forEach(function (item) {
    watcher.observe(item);
  });
}
