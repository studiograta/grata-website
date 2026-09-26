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

// Opening titles, after the Birdman credits: "connect" and the line below
// fill in together over six frames. Each frame shows every copy of a few
// letters at once (all the n's, all the s's...), with the vowels kept in
// different frames so each frame lights up across both lines. Each letter
// lands in Olive and settles to the text colour. Skipped when motion is off.
// Any letter not listed (if the words change) arrives in the last frame.
var frames = ["crh", "ev", "ngw", "as", "toy", "ipb."];
// Gaps between frames in milliseconds: uneven, like a drum beat
var beats = [450, 520, 380, 600, 430, 560];
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  var groups = frames.map(function () { return []; });
  document.querySelectorAll(".connect h1, .connect__lede").forEach(function (element) {
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
        var frame = frames.findIndex(function (set) { return set.indexOf(character.toLowerCase()) > -1; });
        groups[frame > -1 ? frame : frames.length - 1].push(letter);
      });
      element.appendChild(word);
    });
  });

  var wait = 0;
  groups.forEach(function (letters, index) {
    wait += beats[index];
    setTimeout(function () {
      letters.forEach(function (letter) { letter.classList.add("tl--in"); });
    }, wait);
  });
}
