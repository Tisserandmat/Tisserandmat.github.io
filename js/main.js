(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("form-status");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    var data = new FormData(form);
    var nom = String(data.get("nom") || "").trim();
    var email = String(data.get("email") || "").trim();
    var tel = String(data.get("tel") || "").trim();
    var besoin = String(data.get("besoin") || "").trim();
    var message = String(data.get("message") || "").trim();

    var subject = "Demande de devis — " + (besoin || "site web");
    var lines = [
      "Bonjour Mathias,",
      "",
      message,
      "",
      "Besoin : " + besoin,
      "Nom : " + nom,
      "E-mail : " + email
    ];
    if (tel) lines.push("Téléphone : " + tel);

    var href =
      "mailto:tisserandmathias.pro@gmail.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(lines.join("\n"));

    status.textContent =
      "Votre logiciel de messagerie va s’ouvrir avec ce message. S’il ne s’ouvre pas, utilisez le lien qui suit.";
    var link = document.createElement("a");
    link.href = href;
    link.textContent = "Ouvrir l’e-mail";
    status.append(" ");
    status.append(link);
    window.location.href = href;
  });
})();
