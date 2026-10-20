(function () {
  var form = document.getElementById("quote-form");
  var listEl = document.getElementById("quote-list");
  var paperEl = document.getElementById("paper");
  var letterEl = document.getElementById("letter");
  var timelineEl = document.getElementById("timeline");
  var actionsEl = document.getElementById("quote-actions");
  var live = document.getElementById("live");
  if (!form || !listEl) return;

  var seq = 105;
  var selectedId = "DEV-104";

  function atHour(date) {
    var copy = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0, 0);
    return copy;
  }

  function daysFromToday(offset) {
    var d = new Date();
    d.setDate(d.getDate() + offset);
    return atHour(d);
  }

  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n, 9, 0, 0, 0);
  }

  function formatDay(date) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function formatEuro(amount) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  var quotes = [
    {
      id: "DEV-104",
      client: "Camille Bernard",
      email: "camille.bernard@example.com",
      prestation: "Remplacement d’un chauffe-eau",
      montant: 1280,
      sent: daysFromToday(-3),
      stage: 3,
      closed: null
    },
    {
      id: "DEV-103",
      client: "Julien Petit",
      email: "julien.petit@example.com",
      prestation: "Débouchage d’une canalisation",
      montant: 160,
      sent: daysFromToday(-10),
      stage: 0,
      closed: "accepte"
    },
    {
      id: "DEV-102",
      client: "Nadia Leroy",
      email: "nadia.leroy@example.com",
      prestation: "Remplacement de robinetterie",
      montant: 340,
      sent: daysFromToday(-12),
      stage: 7,
      closed: "sans-reponse"
    },
    {
      id: "DEV-101",
      client: "Paul Moreau",
      email: "paul.moreau@example.com",
      prestation: "Recherche de fuite",
      montant: 220,
      sent: daysFromToday(0),
      stage: 0,
      closed: null
    }
  ];

  function statusOf(quote) {
    if (quote.closed === "accepte") return { key: "accepte", label: "Accepté" };
    if (quote.closed === "sans-reponse") return { key: "sans-reponse", label: "Sans réponse" };
    if (quote.stage === 7) return { key: "relance7", label: "Relance J+7" };
    if (quote.stage === 3) return { key: "relance3", label: "Relance J+3" };
    return { key: "envoye", label: "Envoyé" };
  }

  function findSelected() {
    return quotes.find(function (quote) { return quote.id === selectedId; }) || quotes[0];
  }

  function letterFor(quote) {
    var euro = formatEuro(quote.montant);
    var hello = "Bonjour " + quote.client + ",";
    if (quote.closed === "accepte") {
      return {
        subject: "Devis " + quote.id + " — accepté",
        body: "Le devis est marqué accepté. Les relances s’arrêtent. Dans la réalité, vous pourriez alors planifier l’intervention. Ici, aucun message n’est parti."
      };
    }
    if (quote.closed === "sans-reponse") {
      return {
        subject: "Devis " + quote.id + " — clos",
        body: "Aucune réponse après la relance de J+7. Le devis est classé « sans réponse ». Vous pourrez le rouvrir si la personne revient plus tard. Cette page ne fait que simuler ce classement."
      };
    }
    if (quote.stage === 0) {
      return {
        subject: "Votre devis " + quote.id + " — " + quote.prestation,
        body: hello + "\n\nVoici votre devis pour « " + quote.prestation + " », d’un montant de " + euro + ".\n\nDites-moi si vous souhaitez que l’on en parle.\n\nBien cordialement"
      };
    }
    if (quote.stage === 3) {
      return {
        subject: "Votre devis " + quote.id + " — petit rappel",
        body: hello + "\n\nJe me permets de revenir vers vous : le devis envoyé il y a 3 jours (« " + quote.prestation + " », " + euro + ") est-il toujours d’actualité ?\n\nBien cordialement"
      };
    }
    return {
      subject: "Votre devis " + quote.id + " — dernier message",
      body: hello + "\n\nSauf retour de votre part, je clôturerai le devis « " + quote.prestation + " » (" + euro + "). Je reste disponible si une question vous vient.\n\nBien cordialement"
    };
  }

  function timelineItem(title, detail, state) {
    var li = document.createElement("li");
    li.className = "is-" + state;
    var dot = document.createElement("span");
    dot.className = "dot";
    dot.setAttribute("aria-hidden", "true");
    var text = document.createElement("div");
    var strong = document.createElement("strong");
    strong.textContent = title;
    var p = document.createElement("p");
    p.className = "muted";
    p.style.margin = "0";
    p.textContent = detail;
    text.append(strong, p);
    li.append(dot, text);
    return li;
  }

  function nodeState(quote, step) {
    if (quote.closed === "accepte" && quote.stage < step) return "skipped";
    if (quote.stage >= step) return "done";
    if (quote.closed === "sans-reponse" && step === 7 && quote.stage >= 7) return "done";
    return "pending";
  }

  function detailFor(quote, step) {
    var when = formatDay(addDays(quote.sent, step));
    var state = nodeState(quote, step);
    if (state === "skipped") return "Non envoyée — le devis a été accepté avant. Prévue le " + when + ".";
    if (state === "done") return "Simulée comme envoyée le " + when + ".";
    return "Prévue le " + when + ", seulement s’il n’y a pas de réponse.";
  }

  function renderPaper(quote) {
    paperEl.replaceChildren();
    var top = document.createElement("div");
    top.className = "paper-top";
    var left = document.createElement("div");
    var kicker = document.createElement("p");
    kicker.className = "kicker";
    kicker.textContent = "Aperçu";
    var title = document.createElement("strong");
    title.textContent = "Devis " + quote.id;
    left.append(kicker, title);
    var right = document.createElement("p");
    right.className = "muted";
    right.style.margin = "0";
    right.textContent = "Artisan fictif · " + formatDay(quote.sent);
    top.append(left, right);

    var dl = document.createElement("dl");
    dl.className = "sheet";
    [
      ["Client", quote.client],
      ["E-mail", quote.email],
      ["Prestation", quote.prestation]
    ].forEach(function (row) {
      var dt = document.createElement("dt");
      dt.textContent = row[0];
      var dd = document.createElement("dd");
      dd.textContent = row[1];
      dl.append(dt, dd);
    });

    var amount = document.createElement("p");
    amount.className = "amount";
    amount.textContent = formatEuro(quote.montant);

    var note = document.createElement("p");
    note.className = "muted";
    note.textContent = "Document d’aperçu. Il n’a pas été envoyé.";

    paperEl.append(top, dl, amount, note);
  }

  function renderLetter(quote) {
    var letter = letterFor(quote);
    letterEl.replaceChildren();
    var subject = document.createElement("p");
    subject.style.margin = "0 0 .4rem";
    var label = document.createElement("strong");
    label.textContent = "Objet : ";
    subject.append(label, document.createTextNode(letter.subject));
    var body = document.createElement("p");
    body.style.margin = "0";
    body.textContent = letter.body;
    letterEl.append(subject, body);
  }

  function renderTimeline(quote) {
    timelineEl.replaceChildren();
    [
      [0, "J0 — Devis envoyé"],
      [3, "J+3 — Relance"],
      [7, "J+7 — Dernière relance"]
    ].forEach(function (step) {
      timelineEl.append(timelineItem(step[1], detailFor(quote, step[0]), nodeState(quote, step[0])));
    });
  }

  function addAction(label, onClick) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-ghost";
    button.textContent = label;
    button.addEventListener("click", onClick);
    actionsEl.append(button);
  }

  function renderActions(quote) {
    actionsEl.replaceChildren();
    if (!quote.closed && quote.stage === 0) {
      addAction("Simuler la relance J+3", function () {
        quote.stage = 3;
        announce("Relance J+3 simulée pour " + quote.id + ". Aucun e-mail envoyé.");
        render();
      });
    }
    if (!quote.closed && quote.stage === 3) {
      addAction("Simuler la relance J+7", function () {
        quote.stage = 7;
        announce("Relance J+7 simulée pour " + quote.id + ". Aucun e-mail envoyé.");
        render();
      });
    }
    if (!quote.closed && quote.stage === 7) {
      addAction("Clôturer sans réponse", function () {
        quote.closed = "sans-reponse";
        announce(quote.id + " est classé sans réponse.");
        render();
      });
    }
    if (!quote.closed) {
      addAction("Marquer comme accepté", function () {
        quote.closed = "accepte";
        announce(quote.id + " est marqué accepté. Les relances suivantes ne partent pas.");
        render();
      });
    }
    var printBtn = document.createElement("button");
    printBtn.type = "button";
    printBtn.className = "btn btn-ghost";
    printBtn.textContent = "Imprimer l’aperçu";
    printBtn.addEventListener("click", function () { window.print(); });
    actionsEl.append(printBtn);
  }

  function renderList() {
    listEl.replaceChildren();
    quotes.forEach(function (quote) {
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-pressed", quote.id === selectedId ? "true" : "false");
      var status = statusOf(quote);
      var id = document.createElement("strong");
      id.textContent = quote.id;
      var who = document.createElement("span");
      who.textContent = quote.client + " — " + quote.prestation;
      var money = document.createElement("span");
      money.textContent = formatEuro(quote.montant);
      var pill = document.createElement("span");
      pill.className = "status";
      pill.dataset.status = status.key;
      pill.textContent = status.label;
      button.append(id, who, money, pill);
      button.addEventListener("click", function () {
        selectedId = quote.id;
        render();
      });
      li.append(button);
      listEl.append(li);
    });
  }

  function announce(message) {
    live.textContent = message;
  }

  function render() {
    var quote = findSelected();
    renderPaper(quote);
    renderLetter(quote);
    renderTimeline(quote);
    renderActions(quote);
    renderList();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var data = new FormData(form);
    var quote = {
      id: "DEV-" + String(seq),
      client: String(data.get("client") || "").trim(),
      email: String(data.get("email") || "").trim(),
      prestation: String(data.get("prestation") || "").trim(),
      montant: Number(data.get("montant")),
      sent: daysFromToday(0),
      stage: 0,
      closed: null
    };
    seq += 1;
    quotes.unshift(quote);
    selectedId = quote.id;
    form.reset();
    announce("Devis " + quote.id + " ajouté au tableau, statut envoyé. Aucun e-mail n’a été envoyé.");
    render();
    var preview = document.getElementById("preview-title");
    if (preview) preview.focus();
  });

  document.getElementById("reset-demo").addEventListener("click", function () {
    window.location.reload();
  });

  render();
})();
