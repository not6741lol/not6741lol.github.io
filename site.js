/* not6741.lol — shared behaviour
   ------------------------------------------------------------------
   Loaded (with defer) by every page. Exposes a tiny global:
     Site.$(sel)  Site.$$(sel)  Site.escapeHtml(str)
     Site.toast(msg)  Site.setTheme(t)  Site.currentTheme()
     Site.reveal()            re-run scroll reveal after adding nodes
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------------- theme ---------------- */

  var themeToggle = $("#themeToggle");

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function syncThemeUi(theme) {
    var icon = themeToggle && themeToggle.querySelector("i");
    if (icon) icon.className = theme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun";
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
      );
    }
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f6f6f8" : "#0e0e10");
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) {}
    syncThemeUi(theme);
  }

  syncThemeUi(currentTheme());
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(currentTheme() === "light" ? "dark" : "light");
    });
  }

  /* ---------------- toast ---------------- */

  var toast = $("#toast");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2400);
  }

  /* ---------------- nav: active state + scroll spy ---------------- */

  function pageKey() {
    var p = location.pathname.replace(/\\/g, "/");
    if (/(^|\/)notes\/(index\.html)?$/.test(p)) return "notes";
    if (/(^|\/)colophon\/(index\.html)?$/.test(p)) return "colophon";
    return "home";
  }

  function initNav() {
    var links = $$(".nav-links a");
    if (!links.length) return;

    var key = pageKey();

    // On a subpage, simply mark that page's link. There is nothing to spy on.
    if (key !== "home") {
      links.forEach(function (link) {
        var isCurrent = link.getAttribute("data-page") === key;
        link.classList.toggle("active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "page");
      });
      return;
    }

    var sections = links.map(function (link) {
      var href = link.getAttribute("href") || "";
      return href.charAt(0) === "#" ? $(href) : null;
    }).filter(Boolean);

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        links.forEach(function (other) { other.classList.toggle("active", other === link); });
      });
    });

    if ("IntersectionObserver" in window && sections.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var hash = "#" + entry.target.id;
          links.forEach(function (link) {
            var href = link.getAttribute("href") || "";
            var at = href.indexOf("#");
            // Match on the fragment only, so "/#about" and "#about" both work.
            link.classList.toggle("active", at >= 0 && href.slice(at) === hash);
          });
        });
      }, { rootMargin: "-45% 0px -55% 0px" });
      sections.forEach(function (section) { spy.observe(section); });
    }
  }

  /* ---------------- back to top ---------------- */

  var toTop = $("#toTop");
  if (toTop) {
    toTop.addEventListener("click", function () { window.scrollTo({ top: 0 }); });
  }

  var scrollQueued = false;
  window.addEventListener("scroll", function () {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      if (toTop) toTop.classList.toggle("show", window.scrollY > 480);
      scrollQueued = false;
    });
  }, { passive: true });

  /* ---------------- scroll reveal ---------------- */

  function setupReveal() {
    var targets = $$(".reveal:not(.in)");
    if (!targets.length) return;

    var reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!("IntersectionObserver" in window) || reduce) {
      targets.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- analytics ---------------- */

  // GoatCounter: free, cookieless, no consent banner needed.
  //   1. sign up at https://www.goatcounter.com/
  //   2. put the site code you picked in the string below
  // Leave it empty and not a single byte is requested.
  var ANALYTICS_CODE = "";

  function initAnalytics() {
    if (!ANALYTICS_CODE) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + ANALYTICS_CODE + ".goatcounter.com/count");
    document.head.appendChild(s);
  }

  /* ---------------- init ---------------- */

  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  initNav();
  setupReveal();
  initAnalytics();

  window.Site = {
    $: $,
    $$: $$,
    escapeHtml: escapeHtml,
    toast: showToast,
    setTheme: setTheme,
    currentTheme: currentTheme,
    reveal: setupReveal
  };
})();
