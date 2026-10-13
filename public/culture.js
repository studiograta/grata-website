// Culture page: values rise into place as they scroll into
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
  page.querySelectorAll(".cu__values li").forEach(function (item) {
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

// Application form: "Send your portfolio" opens it. The files are read in
// the browser and sent with the details to the "Grata Partner Intake" Google
// script, which saves them to Drive and emails them to the studio.
var applyForm = document.querySelector(".cu__form");
if (applyForm) setUpApplication(applyForm);

function setUpApplication(form) {
  var statusLine = form.querySelector(".contact__status");
  var button = form.querySelector("button[type=submit]");
  var siteKey = form.dataset.turnstile;
  var token = "";
  var MB = 1024 * 1024;
  var TYPES = { pdf: "application/pdf", doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };

  var details = form.closest("details");

  // "Join the studio" at the top (and the Careers link on Connect, which
  // arrives with #join) scroll down and open the form in one go
  document.querySelectorAll('a[href="#join"]').forEach(function (link) {
    link.addEventListener("click", function () { details.open = true; });
  });
  if (location.hash === "#join") details.open = true;

  // Load the "verify you are human" check the first time the form opens
  details.addEventListener("toggle", function () {
    if (!details.open || !siteKey || window.onTurnstileLoad) return;
    window.onTurnstileLoad = function () {
      turnstile.render(form.querySelector(".partners__turnstile"), {
        sitekey: siteKey,
        theme: "light",
        callback: function (t) { token = t; },
        "expired-callback": function () { token = ""; }
      });
    };
    var script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    script.async = true;
    document.head.appendChild(script);
  });

  // Reads a chosen file as { name, type, data } (data without the prefix).
  // The type comes from the file name, because some computers leave it blank.
  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var ext = file.name.split(".").pop().toLowerCase();
        resolve({ name: file.name, type: TYPES[ext] || file.type, data: reader.result.split(",")[1] });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function problem(data, resume, portfolio) {
    if (!data.get("name").trim()) return "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.get("email").trim())) return "Please check your email address.";
    if (data.get("phone").replace(/\D/g, "").length < 8) return "Please check your phone number.";
    if (!resume) return "Please attach your resume.";
    if (!/\.(pdf|docx?)$/i.test(resume.name)) return "Please send your resume as a PDF or Word file.";
    if (resume.size > 5 * MB) return "Your resume is over 5 MB. Please send a smaller file.";
    if (portfolio && !/\.pdf$/i.test(portfolio.name)) return "Please send your portfolio as a PDF, or add a link instead.";
    if (portfolio && portfolio.size > 20 * MB) return "Your portfolio is over 20 MB. Please add a link to it instead.";
    if (!portfolio && !data.get("link").trim()) return "Please attach your portfolio or add a link to it.";
    if (siteKey && !token) return "Please complete the check above the button.";
    return "";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var resume = form.resume.files[0];
    var portfolio = form.portfolio.files[0];
    var issue = problem(data, resume, portfolio);
    if (issue) { statusLine.textContent = issue; return; }

    button.disabled = true;
    statusLine.textContent = portfolio && portfolio.size > 5 * MB
      ? "Sending... a large portfolio can take a minute."
      : "Sending...";

    Promise.all([readFile(resume), portfolio ? readFile(portfolio) : null])
      .then(function (files) {
        var application = {
          kind: "career",
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          link: data.get("link"),
          note: data.get("note"),
          resume: files[0],
          portfolio: files[1],
          company_site: data.get("company_site"),
          turnstileToken: token
        };
        // Sent as plain text so the browser does not need to ask Google for
        // permission first, which Google scripts cannot answer
        return fetch(form.dataset.endpoint, { method: "POST", body: JSON.stringify(application), headers: { "Content-Type": "text/plain;charset=utf-8" } });
      })
      .then(function (response) { return response.json(); })
      .then(function (result) {
        if (!result.ok) { statusLine.textContent = result.message; return; }
        form.hidden = true;
        details.insertAdjacentHTML("beforeend",
          '<p class="cu__sent">Thank you. We have your application and will be in touch if there is a good fit.</p>');
      })
      .catch(function () {
        statusLine.textContent = "Sorry, that did not go through. Please email shifaz@studiograta.in instead.";
      })
      .finally(function () {
        button.disabled = false;
        if (siteKey && window.turnstile) { turnstile.reset(); token = ""; }
      });
  });
}
