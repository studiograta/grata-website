// Culture page: values and growth steps rise into place as they scroll into
// view (the look is in styles.css under .cu--animate), and the "who we look
// for" words turn slowly on a 3D sphere. Both are skipped for people who
// turn off motion, who see the finished page and a flat word cloud.
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
  page.querySelectorAll(".cu__values li, .cu__band li").forEach(function (item) {
    watcher.observe(item);
  });

  var cloud = document.querySelector(".cu__cloud");
  if (cloud) spinCloud(cloud);
}

// The 3D word sphere
function spinCloud(cloud) {
  var words = Array.prototype.slice.call(cloud.children);
  cloud.classList.add("cu__cloud--3d");

  // Spread the words evenly over a sphere (a golden-angle spiral), then
  // tilt it a little so it is seen slightly from above
  var points = words.map(function (word, i) {
    var y = 1 - (2 * i + 1) / words.length;
    var ring = Math.sqrt(1 - y * y);
    var angle = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(angle) * ring, y: y, z: Math.sin(angle) * ring };
  });
  turn(0, 0.35);

  // Speeds in turns of the sphere per second: it drifts one full turn
  // every 40 seconds, stops while the pointer rests on it, and a drag or
  // swipe flings it, after which it eases back to the drift
  var drift = (2 * Math.PI) / 40;
  var speedX = 0, speedY = drift;
  var hovering = false, dragging = false, lastX = 0, lastY = 0, lastMove = 0;
  var running = false, lastFrame = 0;

  function turn(aroundY, aroundX) {
    var cy = Math.cos(aroundY), sy = Math.sin(aroundY);
    var cx = Math.cos(aroundX), sx = Math.sin(aroundX);
    points.forEach(function (p) {
      var x = p.x * cy + p.z * sy;
      var z = p.z * cy - p.x * sy;
      var y = p.y * cx - z * sx;
      p.z = z * cx + p.y * sx;
      p.x = x;
      p.y = y;
      // Correct tiny drift so the words stay on the sphere
      var length = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
      p.x /= length; p.y /= length; p.z /= length;
    });
  }

  function draw() {
    // The sphere is stretched wide to fill the space, and each word is
    // nudged in where needed so it never runs past the edge
    var width = cloud.clientWidth;
    var radiusY = cloud.clientHeight * 0.38;
    var radiusX = Math.min(width * 0.36, radiusY * 1.8);
    words.forEach(function (word, i) {
      var p = points[i];
      var nearness = (p.z + 1) / 2; // 0 at the back, 1 at the front
      var scale = 0.72 + 0.28 * nearness;
      var room = Math.max(0, (width - word.offsetWidth * scale) / 2 - 4);
      var x = Math.max(-room, Math.min(room, p.x * radiusX));
      word.style.transform = "translate(-50%, -50%) translate(" +
        x.toFixed(1) + "px, " + (p.y * radiusY).toFixed(1) + "px) scale(" +
        scale.toFixed(3) + ")";
      word.style.opacity = (0.3 + 0.7 * nearness).toFixed(3);
      word.style.zIndex = Math.round(nearness * 100);
    });
  }

  function frame(time) {
    if (!running) return;
    var seconds = Math.min((time - (lastFrame || time)) / 1000, 0.05);
    lastFrame = time;
    // Holding the sphere still stops it
    if (dragging && performance.now() - lastMove > 80) { speedX = 0; speedY = 0; }
    if (!dragging) {
      var target = hovering ? 0 : drift;
      speedY += (target - speedY) * Math.min(1, seconds * 1.5);
      speedX += (0 - speedX) * Math.min(1, seconds * 1.5);
    }
    turn(speedY * seconds, speedX * seconds);
    draw();
    requestAnimationFrame(frame);
  }

  // Only spin while the cloud is on screen
  new IntersectionObserver(function (entries) {
    var visible = entries[0].isIntersecting;
    if (visible && !running) { running = true; lastFrame = 0; requestAnimationFrame(frame); }
    if (!visible) running = false;
  }).observe(cloud);
  draw();

  cloud.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hovering = true; });
  cloud.addEventListener("pointerleave", function () { hovering = false; });
  cloud.addEventListener("pointerdown", function (e) {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY; lastMove = e.timeStamp;
    cloud.setPointerCapture(e.pointerId);
    cloud.classList.add("is-dragging");
  });
  cloud.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var seconds = Math.max((e.timeStamp - lastMove) / 1000, 0.008);
    // Moving the pointer across the whole cloud turns it about half a turn
    var perPixel = Math.PI / cloud.clientWidth;
    speedY = (e.clientX - lastX) * perPixel / seconds;
    speedX = (e.clientY - lastY) * perPixel / seconds;
    lastX = e.clientX; lastY = e.clientY; lastMove = e.timeStamp;
  });
  function release() {
    dragging = false;
    cloud.classList.remove("is-dragging");
  }
  cloud.addEventListener("pointerup", release);
  cloud.addEventListener("pointercancel", release);
}
