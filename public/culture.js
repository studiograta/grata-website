// Culture page: values, growth steps and the "who we look for" lines rise
// into place as they scroll into view (the look is in styles.css under
// .cu--animate). Skipped for people who turn off motion.
var page = document.querySelector(".cu");
var stillMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (page && !stillMotion && "IntersectionObserver" in window) {
  page.classList.add("cu--animate");
  // Items that arrive together play one after another
  var watcher = new IntersectionObserver(function (entries) {
    var count = 0;
    entries.filter(function (entry) { return entry.isIntersecting; })
      .forEach(function (entry) {
        entry.target.style.setProperty("--d", 0.12 * count++ + "s");
        entry.target.classList.add("is-in");
        watcher.unobserve(entry.target);
      });
  }, { rootMargin: "0px 0px -10% 0px" });
  page.querySelectorAll(".cu__values li, .cu__band li, .cu__look li").forEach(function (item) {
    watcher.observe(item);
  });
}
