(function () {
  var form = document.getElementById("booking-form");
  var daysBox = document.getElementById("days");
  var timesBox = document.getElementById("times");
  var timesHint = document.getElementById("times-hint");
  var errorEl = document.getElementById("booking-error");
  var confirmBox = document.getElementById("confirmation");
  if (!form || !daysBox || !timesBox) return;

  function isoLocal(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function parseISO(value) {
    var parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatDay(date) {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short"
    }).format(date);
  }

  function formatLong(date) {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function formatTime(minutes) {
    var h = Math.floor(minutes / 60);
    var m = String(minutes % 60).padStart(2, "0");
    return h + "\u00a0h\u00a0" + m;
  }

  function openingFor(date) {
    var day = date.getDay();
    if (day === 0 || day === 1) return null;
    if (day === 6) return { start: 9 * 60, end: 17 * 60 };
    return { start: 9 * 60, end: 19 * 60 };
  }

  function selectedService() {
    return form.querySelector('input[name="service"]:checked');
  }

  function renderDays() {
    daysBox.innerHTML = "";
    var start = new Date();
    start.setHours(12, 0, 0, 0);
    var firstEnabled = null;
    for (var i = 0; i < 14; i += 1) {
      var date = new Date(start);
      date.setDate(start.getDate() + i);
      var closed = openingFor(date) === null;
      var label = document.createElement("label");
      label.className = "choice" + (closed ? " is-disabled" : "");
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "day";
      input.value = isoLocal(date);
      input.disabled = closed;
      if (!closed && !firstEnabled) firstEnabled = input;
      var name = document.createElement("strong");
      name.textContent = formatDay(date);
      var small = document.createElement("small");
      small.textContent = closed ? "Fermé" : "Ouvert";
      label.append(input, name, small);
      daysBox.append(label);
    }
    if (firstEnabled) firstEnabled.required = true;
  }

  function renderTimes() {
    var previous = form.querySelector('input[name="time"]:checked');
    var previousValue = previous ? previous.value : "";
    timesBox.innerHTML = "";
    var dayInput = form.querySelector('input[name="day"]:checked');
    var service = selectedService();
    if (!dayInput || !service) {
      timesHint.hidden = false;
      timesHint.textContent = "Choisissez d’abord une prestation et un jour.";
      return;
    }
    var minutes = Number(service.dataset.minutes);
    var date = parseISO(dayInput.value);
    var hours = openingFor(date);
    timesHint.hidden = true;
    if (!hours) {
      timesHint.hidden = false;
      timesHint.textContent = "Le salon est fermé ce jour-là.";
      return;
    }
    var count = 0;
    for (var t = hours.start; t + minutes <= hours.end; t += 30) {
      var label = document.createElement("label");
      label.className = "choice";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "time";
      input.value = String(t);
      if (count === 0) input.required = true;
      if (String(t) === previousValue) input.checked = true;
      var strong = document.createElement("strong");
      strong.textContent = formatTime(t);
      label.append(input, strong);
      timesBox.append(label);
      count += 1;
    }
    if (count === 0) {
      timesHint.hidden = false;
      timesHint.textContent = "Aucun créneau ne couvre la durée de cette prestation ce jour-là.";
    }
  }

  form.addEventListener("change", function (event) {
    if (event.target.name === "service" || event.target.name === "day") {
      renderTimes();
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorEl.hidden = true;
    if (!form.reportValidity()) return;

    var service = selectedService();
    var dayInput = form.querySelector('input[name="day"]:checked');
    var timeInput = form.querySelector('input[name="time"]:checked');
    var nom = String(new FormData(form).get("nom") || "").trim();
    var tel = String(new FormData(form).get("tel") || "").trim();
    var digits = tel.replace(/\D/g, "");

    if (!service || !dayInput || !timeInput) {
      errorEl.hidden = false;
      errorEl.textContent = "Choisissez une prestation, un jour et un horaire.";
      return;
    }
    if (nom.length < 2) {
      errorEl.hidden = false;
      errorEl.textContent = "Indiquez un nom d’au moins deux caractères.";
      return;
    }
    if (digits.length < 8) {
      errorEl.hidden = false;
      errorEl.textContent = "Indiquez un numéro de téléphone d’au moins 8 chiffres.";
      return;
    }

    var date = parseISO(dayInput.value);
    document.getElementById("conf-service").textContent = service.dataset.name;
    document.getElementById("conf-when").textContent =
      formatLong(date) + " à " + formatTime(Number(timeInput.value));
    document.getElementById("conf-duration").textContent = service.dataset.minutes + " minutes";
    document.getElementById("conf-price").textContent =
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
      }).format(Number(service.dataset.price));
    document.getElementById("conf-nom").textContent = nom;
    document.getElementById("conf-tel").textContent = tel;

    form.hidden = true;
    confirmBox.hidden = false;
    document.getElementById("conf-title").focus();
  });

  document.getElementById("booking-reset").addEventListener("click", function () {
    form.reset();
    confirmBox.hidden = true;
    form.hidden = false;
    renderTimes();
    var first = form.querySelector('input[name="service"]');
    if (first) first.focus();
  });

  renderDays();
  renderTimes();
})();
