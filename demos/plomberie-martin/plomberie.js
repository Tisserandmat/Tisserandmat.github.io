(function () {
  var form = document.getElementById("devis-form");
  var recap = document.getElementById("devis-recap");
  if (!form || !recap) return;

  var back = document.getElementById("devis-reset");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    var data = new FormData(form);
    document.getElementById("recap-nom").textContent = String(data.get("nom") || "").trim();
    document.getElementById("recap-tel").textContent = String(data.get("tel") || "").trim();
    document.getElementById("recap-commune").textContent = String(data.get("commune") || "").trim();
    document.getElementById("recap-message").textContent = String(data.get("message") || "").trim();

    form.hidden = true;
    recap.hidden = false;
    var title = document.getElementById("recap-title");
    if (title) title.focus();
  });

  if (back) {
    back.addEventListener("click", function () {
      recap.hidden = true;
      form.hidden = false;
      form.reset();
      var first = form.querySelector("input");
      if (first) first.focus();
    });
  }
})();
