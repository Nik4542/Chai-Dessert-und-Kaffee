/* CHAI Dessert und Kaffee - Interaktion
   Kein Scroll-Listener: Sticky-Zustand und Einblendungen laufen über IntersectionObserver. */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Mobiles Menü ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("hauptmenue");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Schließen" : "Menü";
    });

    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && links.classList.contains("is-open")) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menü";
      }
    });
  }

  /* ---- Kopfzeile ueber dem Vollbild ----
     Nur die Startseite hat einen Vollbild-Hero. Solange wir ganz oben
     stehen, wird die Leiste transparent. Faellt der Observer aus, bleibt
     der helle, immer lesbare Grundzustand stehen. */
  var header = document.querySelector(".site-header");
  var hero = document.querySelector(".hero");

  if (header && hero && "IntersectionObserver" in window) {
    if (window.scrollY < 8) header.classList.add("is-over-hero");

    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.prepend(sentinel);

    new IntersectionObserver(function (entries) {
      header.classList.toggle("is-over-hero", entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---- Karte filtern ---- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-filter]"));
  var grid = document.getElementById("karten-liste");

  function markFirstHead() {
    var heads = grid.querySelectorAll(".cat-head");
    var found = false;
    Array.prototype.forEach.call(heads, function (h) {
      var visible = h.style.display !== "none";
      h.classList.toggle("is-first", visible && !found);
      if (visible) found = true;
    });
  }

  function apply(filter) {
    Array.prototype.forEach.call(grid.children, function (el) {
      var cat = el.getAttribute("data-cat");
      el.style.display = (filter === "alle" || cat === filter) ? "" : "none";
    });
    markFirstHead();
  }

  if (chips.length && grid) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        apply(chip.getAttribute("data-filter"));
      });
    });
    markFirstHead();
  }

  /* ---- Abschnitte beim Scrollen einblenden ----
     Der versteckte Zustand wird erst hier aktiviert. Sollte der Observer
     nicht auslösen, macht ein Timeout nach 2,5 Sekunden alles sichtbar. */
  var targets = document.querySelectorAll(".reveal");

  function showAll() {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add("is-in"); });
  }

  if (reduced || !("IntersectionObserver" in window) || !targets.length) {
    showAll();
    return;
  }

  document.documentElement.classList.add("js-reveal");

  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });

  Array.prototype.forEach.call(targets, function (el, i) {
    el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
    io.observe(el);
  });

  window.setTimeout(showAll, 2500);
})();
