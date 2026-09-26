// Partner registration form. Sends the details in the background to the
// "Grata Partner Intake" Google script and shows a short message.
var form = document.querySelector(".partners__form");
var statusLine = form.querySelector(".contact__status");
var button = form.querySelector("button");
var endpoint = form.dataset.endpoint;
var siteKey = form.dataset.turnstile;
var turnstileToken = "";
var cardToken = "", cardWidget = null;

// Fill "What best describes your work" from the studio's category list.
// If it cannot load, the menu is simply hidden; it is optional anyway.
fetch(endpoint)
  .then(function (response) { return response.json(); })
  .then(function (result) {
    var select = form.querySelector("select[name=subCategory]");
    result.categories.forEach(function (group) {
      var optgroup = document.createElement("optgroup");
      optgroup.label = group.category;
      group.subs.forEach(function (sub) {
        var option = document.createElement("option");
        option.value = sub;
        option.textContent = sub.charAt(0).toUpperCase() + sub.slice(1);
        optgroup.appendChild(option);
      });
      select.appendChild(optgroup);
    });
  })
  .catch(function () {
    form.querySelector(".partners__sub").hidden = true;
  });

// Cloudflare's "verify you are human" check, only when a site key is set.
if (siteKey) {
  window.onTurnstileLoad = function () {
    turnstile.render(form.querySelector(".partners__turnstile"), {
      sitekey: siteKey,
      theme: "light",
      callback: function (token) { turnstileToken = token; },
      "expired-callback": function () { turnstileToken = ""; }
    });
    // A second check for the visiting card panel
    var cardCheck = document.querySelector(".pp__cardform .partners__turnstile");
    if (cardCheck) {
      cardWidget = turnstile.render(cardCheck, {
        sitekey: siteKey,
        theme: "light",
        callback: function (token) { cardToken = token; },
        "expired-callback": function () { cardToken = ""; }
      });
    }
  };
  var script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
  script.async = true;
  document.head.appendChild(script);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (siteKey && !turnstileToken) {
    statusLine.textContent = "Please complete the check above the button.";
    return;
  }

  var data = new FormData(form);
  var details = {
    firm: data.get("firm"),
    description: data.get("description"),
    subCategory: data.get("subCategory"),
    capabilities: data.getAll("capabilities"),
    brands: data.get("brands"),
    website: data.get("website"),
    portfolio: data.get("portfolio"),
    city: data.get("city"),
    address: data.get("address"),
    contact: data.get("contact"),
    phone: data.get("phone"),
    email: data.get("email"),
    contact2: data.get("contact2"),
    phone2: data.get("phone2"),
    consent: data.get("consent") === "on",
    company_site: data.get("company_site"),
    turnstileToken: turnstileToken
  };

  button.disabled = true;
  statusLine.textContent = "Sending...";

  // Sent as plain text so the browser does not need to ask Google for
  // permission first, which Google scripts cannot answer.
  fetch(endpoint, { method: "POST", body: JSON.stringify(details), headers: { "Content-Type": "text/plain;charset=utf-8" } })
    .then(function (response) { return response.json(); })
    .then(function (result) {
      if (!result.ok) {
        statusLine.textContent = result.message;
        return;
      }
      form.reset();
      statusLine.textContent = "Thank you. We have your details and will be in touch when a project is a good fit.";
    })
    .catch(function () {
      statusLine.textContent = "Sorry, that did not go through. Please email reach@studiograta.in instead.";
    })
    .finally(function () {
      button.disabled = false;
      if (siteKey && window.turnstile) { turnstile.reset(); turnstileToken = ""; }
    });
});

// Phones: show the pinned "Join the directory" bar only while the top button
// and the form are both off screen
var sticky = document.querySelector(".pp__sticky");
var topButton = document.querySelector(".pp__actions .button");
var joinSection = document.querySelector("#join");
if (sticky && topButton && joinSection && "IntersectionObserver" in window) {
  var inView = new Map();
  var watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { inView.set(entry.target, entry.isIntersecting); });
    sticky.hidden = inView.get(topButton) || inView.get(joinSection) || false;
  });
  watcher.observe(topButton);
  watcher.observe(joinSection);
}

// Visiting card: pick or take a photo, shrink it on the phone to a small JPEG,
// show it, then send it with a WhatsApp number to the same intake script.
var cardPanel = document.querySelector(".pp__card");
if (cardPanel) {
  var picker = cardPanel.querySelector("input[type=file]");
  var snap = cardPanel.querySelector(".pp__snap");
  var cardForm = cardPanel.querySelector(".pp__cardform");
  var preview = cardForm.querySelector(".pp__preview img");
  var cardStatus = cardForm.querySelector(".contact__status");
  var cardButton = cardForm.querySelector("button[type=submit]");
  var cardPhoto = "";

  picker.addEventListener("change", function () {
    var file = picker.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, 1400 / Math.max(img.width, img.height));
        var canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        cardPhoto = canvas.toDataURL("image/jpeg", 0.8);
        preview.src = cardPhoto;
        snap.hidden = true;
        cardForm.hidden = false;
        cardForm.querySelector("input[name=phone]").focus();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    picker.value = "";
  });

  cardForm.querySelector(".pp__retake").addEventListener("click", function () { picker.click(); });

  cardForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (siteKey && !cardToken) {
      cardStatus.textContent = "Please complete the check above the button.";
      return;
    }
    var data = new FormData(cardForm);
    var details = {
      kind: "card",
      photo: cardPhoto,
      phone: data.get("phone"),
      email: data.get("email"),
      note: data.get("note"),
      consent: data.get("consent") === "on",
      turnstileToken: cardToken
    };
    cardButton.disabled = true;
    cardStatus.textContent = "Sending your card... this can take up to 20 seconds.";
    fetch(endpoint, { method: "POST", body: JSON.stringify(details), headers: { "Content-Type": "text/plain;charset=utf-8" } })
      .then(function (response) { return response.json(); })
      .then(function (result) {
        if (!result.ok) { cardStatus.textContent = result.message; return; }
        // Replace the whole panel with a clear thank-you
        cardPanel.classList.add("is-sent");
        cardPanel.innerHTML = "<h2>thank you</h2><p>We have your card and will add you to our directory. " +
          "We will be in touch when a project is a good fit." +
          (details.email ? " A confirmation is on its way to your inbox." : "") + "</p>";
        var divider = document.querySelector(".pp__or");
        if (divider) divider.hidden = true;
        cardPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function () {
        cardStatus.textContent = "Sorry, that did not go through. Please email your card to reach@studiograta.in instead.";
      })
      .finally(function () {
        if (cardPanel.classList.contains("is-sent")) return;
        cardButton.disabled = false;
        if (siteKey && window.turnstile && cardWidget !== null) { turnstile.reset(cardWidget); cardToken = ""; }
      });
  });
}
