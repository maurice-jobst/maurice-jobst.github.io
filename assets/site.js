/* The one script on the site. Two jobs, both progressive: mark the section being
   read in whatever nav carries data-spy, and remember whether the reader turned
   animations off. Nothing here is needed to read the page. Same origin, no
   network, no storage beyond the one preference, and that only in the reader's
   own browser. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var toggle = document.getElementById('motion-toggle');
  var stored = null;
  try { stored = localStorage.getItem('mj-motion'); } catch (_) { /* storage is optional */ }
  var off = reduced.matches || stored === 'off';

  function setMotion(isOff) {
    off = isOff;
    root.classList.toggle('motion-off', off);
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(off));
      toggle.textContent = off ? toggle.dataset.off : toggle.dataset.on;
    }
  }
  setMotion(off);
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      // the OS preference always wins: the button cannot turn motion back on over it
      setMotion(reduced.matches || !off);
      try { localStorage.setItem('mj-motion', off ? 'off' : 'on'); } catch (_) { /* optional */ }
    });
  }
  reduced.addEventListener('change', function (e) { if (e.matches) setMotion(true); });

  var links = Array.prototype.slice.call(document.querySelectorAll('[data-spy] a[href^="#"]'));
  var heads = links.map(function (a) {
    return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
  });
  if (!links.length || heads.some(function (h) { return !h; })) return;
  var scheduled = false;
  function update() {
    scheduled = false;
    var line = window.innerHeight * 0.4;
    var current = -1;
    heads.forEach(function (h, i) { if (h.getBoundingClientRect().top <= line) current = i; });
    // at the very end of the page the last section is the one being read even if
    // its heading never reaches the 40% line
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = heads.length - 1;
    links.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle('is-reading', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
