// Partner registration form. Sends the details in the background to the
// "Grata Partner Intake" Google script and shows a short message.
var form = document.querySelector(".partners__form");
var statusLine = form.querySelector(".contact__status");
var button = form.querySelector("button");
var endpoint = form.dataset.endpoint;
var siteKey = form.dataset.turnstile;
var turnstileToken = "";

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

