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
