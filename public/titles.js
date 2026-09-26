// Opening titles, after the Birdman credits. Every element marked
// data-titles fills in together over up to six frames. Each frame shows
// every copy of a few letters at once (all the n's, all the s's...), with
// the vowels kept in different frames so each frame lights up across the
// lines. Each letter lands in Olive and settles to the text colour (styles.css).
// Skipped for people who turn off motion.
//
// A page can hand-pick the frames, e.g. on the Connect page:
//   <script src="/titles.js" data-frames="crh ev ngw as toy ipb."></script>
// Otherwise the letters are shared out automatically.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var elements = document.querySelectorAll("[data-titles]");
  if (!elements.length) return;
  var chosen = document.currentScript && document.currentScript.dataset.frames;

  // Gaps between frames in milliseconds: uneven, like a drum beat
  var beats = [450, 520, 380, 600, 430, 560];

  // Split each element into letters, keeping words together for line breaks
  var letters = [];
  elements.forEach(function (element) {
    var text = element.textContent;
    element.setAttribute("aria-label", text);
    element.textContent = "";
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
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

  var frames = chosen ? chosen.split(" ") : shareOut(letters);
  var groups = frames.map(function () { return []; });
  letters.forEach(function (letter) {
    var character = letter.textContent.toLowerCase();
    var frame = frames.findIndex(function (set) { return set.indexOf(character) > -1; });
    // Anything not listed arrives in the last frame
    groups[frame > -1 ? frame : frames.length - 1].push(letter);
  });

  var wait = 0;
  groups.forEach(function (group, index) {
    wait += beats[index % beats.length];
    setTimeout(function () {
      group.forEach(function (letter) { letter.classList.add("tl--in"); });
    }, wait);
  });

  // Share the letters out over up to six frames: vowels first, one per
  // frame where possible, then the rest to whichever frame has the fewest
  // letters so far. Full stops and other marks wait for the last frame.
  function shareOut(all) {
    var counts = {};
    all.forEach(function (letter) {
      var character = letter.textContent.toLowerCase();
      if (/[a-z]/.test(character)) counts[character] = (counts[character] || 0) + 1;
    });
    var unique = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    var size = Math.min(6, unique.length);
    var sets = [], load = [], vowels = [];
    for (var i = 0; i < size; i++) { sets.push(""); load.push(0); vowels.push(0); }
    var isVowel = function (c) { return "aeiou".indexOf(c) > -1; };
    unique.filter(isVowel).concat(unique.filter(function (c) { return !isVowel(c); }))
      .forEach(function (character) {
        var best = 0;
        for (var f = 1; f < size; f++) {
          var fewerVowels = isVowel(character) && vowels[f] < vowels[best];
          var sameVowels = !isVowel(character) || vowels[f] === vowels[best];
          if (fewerVowels || (sameVowels && load[f] < load[best])) best = f;
        }
        sets[best] += character;
        load[best] += counts[character];
        if (isVowel(character)) vowels[best]++;
      });
    return sets;
  }
})();
