/* ==========================================================================
   UTRC — session intro overlay.  STANDALONE.

   Builds its own markup, so a page needs no extra <body> content. Drop two
   tags into <head> and it works:

     <link rel="stylesheet" href="assets/css/_intro.css">
     <script src="assets/js/_intro.js"></script>

   Plain <script>, not defer — it has to run while <head> is parsing so the
   ink shield is painted before the page is. It costs one attribute write at
   that point; the overlay itself is built once the body exists.

   Options go on the script tag:

     data-logo="assets/img/_utrc-logo.svg"   where the mark lives
     data-once="session"                    session | always | ever
     data-skip="true"                       show the skip affordance
     data-key="utrc-intro-seen"             storage key
     data-auto="true"                       false = don't self-start, call
                                            UTRCIntro.play() yourself

   All timing lives in _intro.css. This file reads the custom properties back
   rather than keeping a second copy of the numbers.
   ========================================================================== */

window.UTRCIntro = (function () {
  'use strict';

  var doc  = document;
  var root = doc.documentElement;
  var me   = doc.currentScript;

  /* --- Options ----------------------------------------------------------- */
  function opt (name, fallback) {
    var v = me && me.getAttribute('data-' + name);
    return (v === null || v === undefined || v === '') ? fallback : v;
  }

  var CFG = {
    logo: opt('logo', 'assets/img/_utrc-logo.svg'),
    once: opt('once', 'session'),          /* session | always | ever */
    skip: opt('skip', 'true') !== 'false',
    key:  opt('key',  'utrc-intro-seen'),
    auto: opt('auto', 'true') !== 'false'
  };

  /* --- The swoosh --------------------------------------------------------
     Not drawn by hand and not an image file: this is the official mark,
     traced off the reference bitmap in reference/ and fitted to curves, so
     it takes its colour from CSS and there is nothing extra to load.

     The trace walked the 5000px bitmap's boundary, simplified it with
     Douglas-Peucker at 0.22 viewBox units (about 0.1% of the width, which
     also irons out the single-pixel staircase), then fitted Catmull-Rom
     cubics between the anchors. Two anchors turn more than 48 degrees --
     the tip and the point of the tail -- and those keep hard tangents so
     they stay sharp. Filled over the reference at 55% it covers it with no
     white showing through and no spill, so this IS the mark, not a likeness.

     35 anchors, ratio 2.854:1. Re-trace with scratch tooling if the
     reference is ever replaced; do not nudge these numbers by hand.      */
  var SWOOSH_VIEWBOX = '-0.16 -0.15 200.31 70.39';
  var SWOOSH_PATH =
    'M28.4,0C28.4,0 25.31,5.48 24.17,8.17C23.09,10.74 22.14,13.96 21.59,16.14' +
    'C21.16,17.81 20.95,19.76 20.84,21.25C20.74,22.51 20.79,23.87 20.91,25.06' +
    'C21.01,26.19 21.27,27.43 21.52,28.4C21.74,29.24 22.03,30.06 22.4,30.85' +
    'C22.81,31.71 23.3,32.77 23.97,33.57C24.9,34.7 26.95,36.7 27.99,37.59' +
    'C28.63,38.14 29.4,38.53 30.17,38.88C31.02,39.28 32.08,39.76 33.09,39.97' +
    'C34.7,40.31 37.52,40.84 39.77,40.93C42.08,41.02 44.6,40.83 46.99,40.52' +
    'C49.57,40.18 52.56,39.6 55.29,38.88C80.8,32.23 200,0.61 200,0.61' +
    'C200,0.61 75.52,53.17 49.1,64.22C46.61,65.25 43.9,66.12 41.47,66.87' +
    'C39.18,67.58 36.78,68.22 34.53,68.71C32.34,69.18 30.02,69.57 27.92,69.8' +
    'C25.93,70.01 23.92,70.15 21.93,70.07C19.93,69.99 17.63,69.67 15.93,69.32' +
    'C14.51,69.03 13.07,68.53 11.78,67.96C10.51,67.41 9.29,66.73 8.17,65.92' +
    'C7.04,65.1 5.93,64.12 4.97,63.06C4.01,61.98 3.06,60.64 2.38,59.45' +
    'C1.75,58.34 1.24,57.14 0.89,55.91C0.5,54.56 0.19,52.88 0.07,51.34' +
    'C-0.06,49.8 -0.02,48.21 0.14,46.65C0.3,45.01 0.61,43.22 1.02,41.54' +
    'C1.45,39.78 2.08,37.84 2.72,36.09C3.36,34.37 4.09,32.69 4.9,31.05' +
    'C5.78,29.28 6.87,27.28 7.97,25.47C9.08,23.63 10.31,21.79 11.58,20.02' +
    'C12.98,18.06 14.7,15.72 16.41,13.69C19.2,10.36 26.33,2.35 28.33,0.07' +
    'C28.35,0.04 28.4,0 28.4,0' + 'Z';

  /* --- Small helpers ------------------------------------------------------ */

  /* Read a CSS time token off :root and return it in ms. Keeps _intro.css
     the single source of truth for the timeline. */
  function ms (prop, fallback) {
    var raw = getComputedStyle(root).getPropertyValue(prop).trim();
    if (!raw) return fallback;
    var n = parseFloat(raw);
    if (isNaN(n)) return fallback;
    return /ms\s*$/.test(raw) ? n : n * 1000;   /* bare "0.6s" counts too */
  }

  function seen () {
    try {
      if (CFG.once === 'ever')    return localStorage.getItem(CFG.key) === '1';
      if (CFG.once === 'session') return sessionStorage.getItem(CFG.key) === '1';
    } catch (_) { /* private mode — just show it */ }
    return false;                                /* "always" never remembers */
  }

  function remember () {
    try {
      if (CFG.once === 'ever')    localStorage.setItem(CFG.key, '1');
      if (CFG.once === 'session') sessionStorage.setItem(CFG.key, '1');
    } catch (_) { /* nothing to do */ }
  }

  /* --- State ------------------------------------------------------------- */
  var overlay = null;
  var done    = false;
  var timers  = [];
  var api;

  function later (fn, delay) { timers.push(setTimeout(fn, delay)); }
  function clearTimers () { timers.forEach(clearTimeout); timers = []; }

  /* --- Build ------------------------------------------------------------- */
  function build () {
    var el = doc.createElement('div');
    el.className = 'uintro';

    /* The mark and the credit are real content — a screen reader should get
       "UTRC. Powered by Nike" and nothing else. The swoosh is decoration on
       top of a word that is already being read out, so it is hidden. */
    el.innerHTML =
      '<div class="uintro__stage">' +
        '<img class="uintro__logo" src="' + CFG.logo + '" alt="UTRC" ' +
             'width="1985" height="1997" decoding="sync">' +
        '<svg class="uintro__swoosh" viewBox="' + SWOOSH_VIEWBOX + '" ' +
             'role="presentation" aria-hidden="true" focusable="false">' +
          '<path d="' + SWOOSH_PATH + '"/>' +
        '</svg>' +
        '<p class="uintro__credit">Powered by <b>Nike</b></p>' +
      '</div>' +
      (CFG.skip ? '<button class="uintro__skip" type="button">Skip</button>' : '');

    return el;
  }

  /* --- Run --------------------------------------------------------------- */
  function start () {
    if (done || overlay) return;

    overlay = build();
    doc.body.insertBefore(overlay, doc.body.firstChild);

    /* The overlay now covers the page itself, so the shield can go. One
       frame before the animations are attached, so the browser has the
       start values on record and the first keyframe is honoured. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.setAttribute('data-utrc-intro', 'running');
        overlay.classList.add('uintro--go');
        scheduleExit();
      });
    });

    /* Anything the visitor does means "get on with it". */
    overlay.addEventListener('click', exit);
    doc.addEventListener('keydown', onKey, true);
    window.addEventListener('wheel', exit, { passive: true });
    window.addEventListener('touchmove', exit, { passive: true });
  }

  function onKey (e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') exit();
  }

  /* The credit is the last thing to land, so its animationend is the real
     signal. The timer beside it is a backstop for the cases where the event
     never arrives — a background tab, a dropped frame on an inert element. */
  function scheduleExit () {
    var hold  = ms('--uintro-hold', 620);
    var start = ms('--uintro-t-credit', 1180) + ms('--uintro-d-credit', 560);
    var credit = overlay.querySelector('.uintro__credit');

    var fired = false;
    var once = function () {
      if (fired) return;
      fired = true;
      /* Nothing is being clipped any more, so stop clipping — see the note
         in section 6a of the stylesheet. */
      if (overlay) overlay.classList.add('uintro--settled');
      later(exit, hold);
    };

    if (credit) credit.addEventListener('animationend', once, { once: true });
    later(once, start + 150);
  }

  function exit () {
    if (done || !overlay) return;
    done = true;
    clearTimers();

    doc.removeEventListener('keydown', onKey, true);
    window.removeEventListener('wheel', exit);
    window.removeEventListener('touchmove', exit);

    remember();
    root.setAttribute('data-utrc-intro', 'exiting');

    var fired = false;
    var finish = function () {
      if (fired) return;
      fired = true;
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
      root.removeAttribute('data-utrc-intro');     /* releases the scroll lock */
      doc.dispatchEvent(new CustomEvent('utrc:intro-done'));
    };

    overlay.addEventListener('animationend', function (e) {
      if (e.target === overlay) finish();
    });
    setTimeout(finish, ms('--uintro-d-exit', 780) + 250);
  }

  /* --- Boot --------------------------------------------------------------
     The attribute goes on immediately, from inside <head>. That is the whole
     point of loading this file synchronously: it is what stops the page
     showing for a frame before the overlay arrives.                      */
  function arm () {
    root.setAttribute('data-utrc-intro', 'arming');
    if (doc.body) {
      guarded();
    } else {
      doc.addEventListener('DOMContentLoaded', guarded, { once: true });
    }
  }

  /* The shield and the scroll lock both hang off that attribute, so if the
     overlay ever fails to build, the visitor is left looking at a black
     screen they cannot scroll. Cheap insurance: drop the attribute and let
     them have the site. */
  function guarded () {
    whenFontReady(function () {
      try {
        start();
      } catch (err) {
        root.removeAttribute('data-utrc-intro');
        if (window.console) console.error('[utrc-intro]', err);
      }
    });
  }

  /* The credit is set in Space Mono, which arrives over the network. The
     intro is only on screen for three seconds, so if it starts painting
     before the font lands the visitor reads the whole thing in fallback
     Consolas and never sees the real face — which is what made the first
     cut look smudged rather than typeset.

     The ink shield is already covering the page by this point, so waiting
     costs nothing visible. The timeout is there so a slow or blocked font
     delays the intro by a beat instead of holding the site hostage. */
  var FONT = '700 1rem "Space Mono"';
  var FONT_WAIT = 700;

  function whenFontReady (next) {
    var went = false;
    var once = function () { if (!went) { went = true; next(); } };

    setTimeout(once, FONT_WAIT);

    if (!doc.fonts || typeof doc.fonts.load !== 'function') { once(); return; }
    try {
      /* Resolves immediately on a page that has no such face declared, so
         this costs nothing when the intro is dropped somewhere without it. */
      doc.fonts.load(FONT).then(once, once);
    } catch (_) {
      once();
    }
  }

  api = {
    /* Play it now, whatever the storage says. Used by the test page. */
    play: function () {
      done = false;
      arm();
    },
    skip: exit,
    /* Forget the visit, so the next load shows it again. */
    reset: function () {
      try { sessionStorage.removeItem(CFG.key); } catch (_) {}
      try { localStorage.removeItem(CFG.key); }   catch (_) {}
    },
    config: CFG
  };

  if (CFG.auto && !seen()) arm();

  return api;
}());
