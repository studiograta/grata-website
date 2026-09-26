// Sends the enquiry form in the background, so the visitor stays on the page
// and sees a short message instead of being taken to another site.
var form = document.querySelector(".contact__form");
var statusLine = form.querySelector(".contact__status");
var button = form.querySelector("button");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  button.disabled = true;
  statusLine.textContent = "Sending...";

  fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
    .then(function (response) { return response.json(); })
    .then(function (result) {
      if (!result.success) throw new Error(result.message);
      form.reset();
      statusLine.textContent = "Thank you, your enquiry has been sent.";
    })
    .catch(function () {
      statusLine.textContent = "Sorry, that did not go through. Please email reach@studiograta.in instead.";
    })
    .finally(function () {
      button.disabled = false;
    });
});

// "Begin" opens the form: put the cursor straight in the Name box
var begin = document.querySelector(".connect__begin");
if (begin) {
  begin.addEventListener("toggle", function () {
    if (begin.open) form.querySelector("input[name=name]").focus();
  });
}

// Arriving from "Begin a project" on another page (/contact#begin) opens the form straight away
if (begin && location.hash === "#begin") begin.open = true;

// Opening titles, after the Birdman credits: in three steps (the heading,
// the opening line, then the column titles) the letters pop in one by one
// in a random order, to an uneven drum-like beat. Each letter lands in
// Olive and settles to the text colour. Skipped when motion is turned off.
var titles = [".connect h1", ".connect__lede", ".connect__cols h2"];
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  var steps = titles.map(function (selector) {
    var letters = [];
    document.querySelectorAll(selector).forEach(function (element) {
      var text = element.textContent;
      element.setAttribute("aria-label", text);
      element.textContent = "";
      // Each word stays together so lines still break between words
      text.split(/(\s+)/).forEach(function (part) {
        if (/^\s+$/.test(part)) { element.appendChild(document.createTextNode(part)); return; }
        var word = document.createElement("span");
        word.className = "tl__word";
        word.setAttribute("aria-hidden", "true");
        part.split("").forEach(function (character) {
          var letter = document.createElement("span");
          letter.className = "tl";
          letter.textContent = character;
          word.appendChild(letter);
          letters.push(letter);
        });
        element.appendChild(word);
      });
    });
    // Shuffle so the letters arrive out of order
    for (var i = letters.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = letters[i]; letters[i] = letters[j]; letters[j] = swap;
    }
    return letters;
  });

  // Longer steps get a quicker beat so each one takes about the same time
  var playStep = function (index) {
    var letters = steps[index];
    if (!letters) return;
    var beat = Math.max(14, 520 / letters.length);
    var play = function () {
      // Sometimes two or three letters land together, like a drum fill
      var hits = Math.random() < 0.3 ? 2 + Math.floor(Math.random() * 2) : 1;
      for (var h = 0; h < hits && letters.length; h++) letters.pop().classList.add("tl--in");
      if (letters.length) setTimeout(play, beat * (0.4 + Math.random() * 1.6));
      else setTimeout(function () { playStep(index + 1); }, 260);
    };
    play();
  };
  setTimeout(function () { playStep(0); }, 200);
}
