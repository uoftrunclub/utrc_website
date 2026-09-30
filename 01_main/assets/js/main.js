/* ==========================================================================
   UTRC — site engine
   Single config block below drives the nav, footer, schedule and countdown
   on every page. Change it once, it changes everywhere.
   ========================================================================== */

const SITE = {
  /* ---- CONFIRM THESE THREE BEFORE YOU GO LIVE -------------------------- */
  email:     'hello@utrc.ca',              // ← club inbox (placeholder)
  instagram: 'https://instagram.com/utrc', // ← real @handle URL (placeholder)
  strava:    '',                           // ← optional club Strava URL
  /* ---------------------------------------------------------------------- */

  tz: 'America/Toronto',
  year: '2026 / 27',

  nav: [
    { href: 'index.html',    label: 'Home'  },
    { href: 'runs.html',     label: 'Runs'  },
    { href: 'join.html',     label: 'Join'  },
    /* Parked — put these two back to restore Races and Kit in the nav.
    { href: 'races.html',    label: 'Races' },
    { href: 'merch.html',    label: 'Kit'   }, */
    { href: 'partners.html', label: 'Partner' }
  ],

  /* Weekly schedule. dow: 0=Sun … 6=Sat. mins = how long the run lasts,
     used so the countdown says "RUNNING NOW" instead of jumping ahead.   */
  schedule: [
    { dow: 1, hour: 19, min: 0, mins: 75, day: 'Monday',
      label: 'Monday 5K',  dist: '5K',
      where: 'Front Campus · King’s College Circle',
      note:  'Run your own pace. Sweeper at the back — nobody runs alone.' },
    { dow: 3, hour: 19, min: 0, mins: 75, day: 'Wednesday',
      label: 'Wednesday 5K', dist: '5K',
      where: 'Front Campus · King’s College Circle',
      note:  'Same route, faster crowd. Stick around for the group photo.' },
    { dow: 6, hour: 10, min: 0, mins: 120, day: 'Saturday',
      label: 'Saturday Café Run', dist: '5K & 8K',
      where: 'UC Steps · University College',
      note:  'Choose your distance, then coffee at a partner café.' }
  ],

  /* ---- 2026/27 roster --------------------------------------------------
     Transcribed from the club's "Introducing UTRC's 26-27 Team" Instagram
     post. To update next year, edit this block — the team section on the
     home page is rendered from it.

     photo: a file in assets/img/leaders/. Leave it out and the card falls
     back to the person's initials.
     pos:   optional object-position, for when a face sits off-centre in the
            crop, e.g. '50% 20%'.                                          */
  team: {
    exec: [
      { name: 'Sarasa Najima', role: 'President',
        photo: 'sarasa-najima.jpg',
        study: 'MHSc, Medical Physiology',
        route: 'Rosedale', food: 'Fika' },
      { name: 'Andrea Batac', role: 'Marketing Director',
        photo: 'andrea-batac.jpg',
        study: '4th year, Global Affairs & Psychology',
        route: 'Straight up Yonge', food: 'Heytea mango' },
      { name: 'Alec Chen', role: 'Partnership Director',
        photo: 'alec-chen.jpg',
        study: 'PEY year, Mechanical Engineering',
        route: 'High Park', food: 'Chipotle' },
      { name: 'Nicholas Carlsen Purba', role: 'Partnership Director',
        photo: 'nicholas-carlsen-purba.jpg',
        study: '2nd year, Mechanical Engineering',
        route: 'Riverdale East', food: 'Juicy Dumpling' },
      { name: 'Esther Meade', role: 'Internal Operations Director',
        photo: 'esther-meade.jpg',
        study: '3rd year, Chemistry & Global Health',
        route: 'Tommy Thompson Park', food: 'Chipotle' },
      { name: 'Linda Gao', role: 'Outreach Director',
        photo: 'linda-gao.jpg',
        study: '3rd year, Electrical Engineering',
        route: 'Harbourfront', food: 'Five Guys' },
      { name: 'Jonathan Liu', role: 'Events Director',
        photo: 'jonathan-liu.jpg',
        study: '2nd year, Cell Biology & Applied Genetics',
        route: 'Spadina Ave towards Casa Loma', food: 'McDonald’s' }
    ],
    leaders: [
      { name: 'Nikita Khesin', photo: 'nikita-khesin.jpg',
        study: 'Mechanical Engineering 2A',
        route: 'Wherever, so long as it’s raining', food: 'My protein tub' },
      { name: 'Savannah Byrne', photo: 'savannah-byrne.jpg',
        study: '1st year MASc, Materials Science & Engineering',
        route: 'Evergreen Brick Works', food: 'Le Gourmand' },
      { name: 'Tony Chen', photo: 'tony-chen.jpg',
        study: '3rd year, Economics & Public Policy',
        route: 'Harbourfront', food: 'Fiftylan' },
      { name: 'Alyssa Yih', photo: 'alyssa-yih.jpg',
        study: '3rd year, Global Health',
        route: 'Rosedale Valley and the Beaches', food: 'Dark Horse Espresso Bar' },
      { name: 'Silje Jensen', photo: 'silje-jensen.jpg',
        study: '3rd year, Physiology & Nutritional Science, Philosophy minor',
        route: 'Ramsden Park down to the Don Valley', food: 'A big sandwich' },
      { name: 'Ayaan Faruqui', photo: 'ayaan-faruqui.jpg',
        study: 'Physiology & Molecular Genetics',
        route: 'No route — getting lost in the city', food: 'Shawarma, Shelby’s or Osmow’s' },
      { name: 'Claudia Tome', photo: 'claudia-tome.jpg',
        study: '4th year, Political Science and Book & Media Studies',
        route: 'Old Mill Humber Trail', food: 'Nutbar' },
      { name: 'Juliette Bhogal', photo: 'juliette-bhogal.jpg',
        study: '2nd year, Bachelor of Music',
        route: 'The Harbourfront', food: 'Milkshakes at Cafe Landwer' },
      { name: 'John Heraghty', photo: 'john-heraghty.jpg',
        study: '1st year, PhD Chemistry',
        route: 'Don Valley Rail Trail', food: 'Dairy Queen' },
      { name: 'Bella Galbraith', photo: 'bella-galbraith.jpg',
        study: '1st year, Social Science',
        route: 'Lakeshore to Trillium Park', food: 'Moretti Cafe and Neo Coffee Bar' }
    ]
  }
};

/* ==========================================================================
   1. Small helpers
   ========================================================================== */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ==========================================================================
   1b. Theme
   The theme is CHOSEN by the small script in each page's <head> — it has to
   run before anything paints, or a returning dark-mode visitor gets a white
   flash first. That script is also where the PREFERS flag lives.

   Everything here just reads the result and keeps the button in step.
   ========================================================================== */
const THEME_KEY = 'utrc-theme';

function readTheme() {
  const t = document.documentElement.dataset.theme;
  return t === 'dark' ? 'dark' : 'light';
}

function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = t === 'dark' ? '#0B0B0C' : '#F7F5F0';
  $$('.tog').forEach(b => {
    b.setAttribute('aria-pressed', String(t === 'dark'));
    b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* nothing to do */ }
  applyTheme(next);
}

/* ==========================================================================
   2. Header + footer  (injected so there is one source of truth)
   ========================================================================== */
/* Sun and moon are one circle plus a mask that slides across it. */
const ICON_THEME = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <mask id="togmask">
      <rect width="24" height="24" fill="#fff"/>
      <circle class="tog__bite" cx="12" cy="9" r="6"/>
    </mask>
    <circle class="tog__orb" cx="12" cy="12" r="5.2" mask="url(#togmask)"/>
    <g class="tog__rays" fill="none">
      <path d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.4 5.4l1.4 1.4M17.2 17.2l1.4 1.4M18.6 5.4l-1.4 1.4M6.8 17.2l-1.4 1.4"/>
    </g>
  </svg>`;

const ICON = {
  ig: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
  mail: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>',
  strava: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.6 2 4 13.2h3.3L9.6 8.6l2.3 4.6h3.3zm4.9 11.2-1.7 3.4-1.7-3.4H8.6L12.8 22l4.2-8.8z"/></svg>'
};

function buildHeader() {
  const host = $('#nav');
  if (!host) return;
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  host.className = 'nav';
  host.innerHTML = `
    <div class="nav__in">
      <a class="nav__brand" href="index.html" aria-label="UTRC home">
        <img src="assets/img/utrc-logo.png" alt="" width="34" height="34">
        <b>UTRC</b>
      </a>
      <button class="tog" type="button" aria-pressed="false" aria-label="Switch to dark mode">${ICON_THEME}</button>
      <button class="nav__burger" aria-expanded="false" aria-controls="navlinks" aria-label="Menu"><span></span></button>
      <nav id="navlinks" class="nav__links" aria-label="Main">
        ${SITE.nav.map(l => `<a href="${l.href}"${l.href.toLowerCase() === here ? ' aria-current="page"' : ''}>${l.label}</a>`).join('')}
        <a class="btn" href="join.html">Run with us <span class="arrow">&rarr;</span></a>
      </nav>
      <a class="btn" href="join.html">Run with us <span class="arrow">&rarr;</span></a>
    </div>
    <div class="nav__bar" aria-hidden="true"></div>`;

  const burger = $('.nav__burger', host);
  const links  = $('.nav__links', host);
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    links.classList.toggle('is-open', !open);
    document.body.style.overflow = !open ? 'hidden' : '';
  });
  links.addEventListener('click', e => {
    if (e.target.closest('a') && links.classList.contains('is-open')) burger.click();
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('is-open')) burger.click();
  });

  $('.tog', host).addEventListener('click', toggleTheme);

  /* The bar wears dark dress while it sits over the dark hero, then changes
     into the page's own colours the moment you scroll past it. */
  const dark = $('.hero, .phead');
  const bar = $('.nav__bar', host);
  const onScroll = () => {
    const y = scrollY;
    const edge = dark ? dark.offsetTop + dark.offsetHeight - parseInt(getComputedStyle(host).height, 10) : 40;
    host.classList.toggle('is-scrolled', y > 40);
    host.classList.toggle('is-stuck', y > Math.max(40, edge));
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();
}

function buildFooter() {
  const host = $('#foot');
  if (!host) return;
  host.className = 'foot on-dark';
  const social = [
    ['Instagram', SITE.instagram, ICON.ig],
    ['Email', 'mailto:' + SITE.email, ICON.mail],
    SITE.strava ? ['Strava', SITE.strava, ICON.strava] : null
  ].filter(Boolean);

  host.innerHTML = `
    <div class="shell">
      <div class="foot__top">
        <div class="foot__brand">
          <img src="assets/img/utrc-logo.png" alt="UTRC" width="58" height="58">
          <p>University of Toronto Run Club. Social, drop&#8209;in, student&#8209;led. Founded January 2018.</p>
          <div class="socials">
            ${social.map(([n, h, i]) => `<a href="${h}" aria-label="${n}"${h.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${i}</a>`).join('')}
          </div>
        </div>
        <div>
          <h4>The Club</h4>
          <ul>
            <li><a href="index.html#about">About us</a></li>
            <li><a href="index.html#schedule">Run schedule</a></li>
            <li><a href="index.html#team">Meet the team</a></li>
            <li><a href="runs.html">Run log</a></li>
          </ul>
        </div>
        <div>
          <h4>Get Involved</h4>
          <ul>
            <li><a href="join.html">New runner guide</a></li>
            <li><a href="join.html#faq">FAQ</a></li>
            <!-- Parked: Race board / Kit &amp; merch -->
          </ul>
        </div>
        <div>
          <h4>Work With Us</h4>
          <ul>
            <li><a href="partners.html">Partner with UTRC</a></li>
            <li><a href="partners.html#opportunities">Sponsorship options</a></li>
            <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
            <li><a href="index.html#contact">Contact the exec</a></li>
          </ul>
        </div>
      </div>
      <div class="foot__base">
        <span>&copy; ${new Date().getFullYear()} University of Toronto Run Club</span>
        <span>No one left behind</span>
        <span class="right">Toronto, ON &middot; ${SITE.year}</span>
      </div>
    </div>`;
}

/* ==========================================================================
   3. Toronto-time countdown to the next run
   ========================================================================== */
function tzParts(ts) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: SITE.tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short'
  });
  const p = {};
  for (const { type, value } of f.formatToParts(new Date(ts))) p[type] = value;
  return {
    y: +p.year, m: +p.month, d: +p.day,
    hh: p.hour === '24' ? 0 : +p.hour, mm: +p.minute, ss: +p.second,
    dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday)
  };
}

/* Wall-clock in Toronto -> absolute timestamp (two passes handles DST). */
function fromTz(y, m, d, hh, mm) {
  const naive = Date.UTC(y, m - 1, d, hh, mm, 0);
  let ts = naive;
  for (let i = 0; i < 2; i++) {
    const p = tzParts(ts);
    const seen = Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm, p.ss);
    ts = naive - (seen - ts);
  }
  return ts;
}

function nextRun(nowTs = Date.now()) {
  let best = null;
  for (const s of SITE.schedule) {
    for (let k = 0; k < 8; k++) {
      const probe = tzParts(nowTs + k * 864e5);
      if (probe.dow !== s.dow) continue;
      const at = fromTz(probe.y, probe.m, probe.d, s.hour, s.min);
      if (nowTs < at + s.mins * 6e4) {
        if (!best || at < best.at) best = { ...s, at };
        break;
      }
    }
  }
  return best;
}

function mountCountdown(el) {
  if (!el) return;
  const pad = n => String(n).padStart(2, '0');
  const units = [['days', 'Days'], ['hours', 'Hrs'], ['mins', 'Min'], ['secs', 'Sec']];

  el.innerHTML = `
    <div>
      <div class="next__label" data-k="label">Next run</div>
      <div class="next__what" data-k="what">&mdash;</div>
    </div>
    <div>
      <div class="next__where" data-k="where"></div>
      <div class="next__where mono" data-k="when" style="margin-top:.3rem"></div>
    </div>
    <div class="next__clock">
      ${units.map(([k, l]) => `<div class="next__unit" data-u="${k}"><b>00</b><i>${l}</i></div>`).join('')}
    </div>`;

  const out = Object.fromEntries(units.map(([k]) => [k, $(`[data-u="${k}"] b`, el)]));
  const prev = {};
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: SITE.tz, weekday: 'long', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });

  function tick() {
    const run = nextRun();
    if (!run) return;
    const now = Date.now();
    const live = now >= run.at;

    el.classList.toggle('next--live', live);
    $('[data-k="label"]', el).textContent = live ? 'Happening now' : 'Next run';
    $('[data-k="what"]', el).textContent  = run.label;
    $('[data-k="where"]', el).textContent = run.where;
    $('[data-k="when"]', el).textContent  = fmt.format(new Date(run.at)) + ' ET';

    let s = Math.max(0, Math.floor((run.at - now) / 1000));
    const v = {
      days: Math.floor(s / 86400),
      hours: Math.floor(s / 3600) % 24,
      mins: Math.floor(s / 60) % 60,
      secs: s % 60
    };
    for (const k in v) {
      const txt = pad(v[k]);
      if (prev[k] === txt) continue;
      prev[k] = txt;
      out[k].textContent = txt;
      if (!REDUCED) {
        const u = out[k].parentElement;
        u.classList.remove('tick'); void u.offsetWidth; u.classList.add('tick');
      }
    }
  }
  tick();
  setInterval(tick, 1000);
}

/* ==========================================================================
   4. Schedule table
   ========================================================================== */
function mountSchedule(el) {
  if (!el) return;
  const up = nextRun();
  el.className = 'sched';
  el.innerHTML = SITE.schedule.map((s, i) => `
    <div class="run" data-reveal style="--d:${i * 70}ms">
      <div class="run__day">${s.day}</div>
      <div class="run__body">
        <div class="run__where">${esc(s.where)}</div>
        <div class="run__meta">${esc(s.note)}</div>
      </div>
      <div class="run__time">${s.hour % 12 || 12}:${String(s.min).padStart(2, '0')} ${s.hour < 12 ? 'AM' : 'PM'}</div>
      <div class="run__dist">${esc(s.dist)}${up && up.dow === s.dow ? ' &middot; NEXT' : ''}</div>
    </div>`).join('');
}

/* ==========================================================================
   5. Gallery — reads window.UTRC_RUNS (generated by new-run.ps1)
   ========================================================================== */
const TAGS = { monday: 'Monday', wednesday: 'Wednesday', saturday: 'Saturday', special: 'Special' };

function parseDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function dateLabel(iso) {
  const d = parseDay(iso);
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
  return `${wd} &middot; ${mo} ${d.getDate()} ${d.getFullYear()}`;
}
function plainDate(iso) {
  return parseDay(iso).toLocaleDateString('en-CA',
    { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function monthKey(iso) { return iso.slice(0, 7); }
function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July',
          'August', 'September', 'October', 'November', 'December'][m - 1] + ' ' + y;
}

function tileClass(mi, idx, total) {
  const r = (mi.w && mi.h) ? mi.w / mi.h : 1;
  if (idx === 0 && total >= 5 && r > .8 && r < 1.3) return 'tile--big';
  if (r >= 1.45) return 'tile--wide';
  if (r <= 0.74) return 'tile--tall';
  return '';
}

function renderPost(p, flat) {
  const n = p.media.length;
  const base = flat.length;
  p.media.forEach(mi => flat.push({ ...mi, post: p }));

  const html = p.media.map((mi, k) => {
    const i = base + k;
    const cls = tileClass(mi, k, n);
    const alt = esc(mi.alt || `${p.title} — ${plainDate(p.date)}`);
    const inner = mi.type === 'video'
      ? `<video src="${esc(mi.src)}" muted loop playsinline preload="metadata"${mi.poster ? ` poster="${esc(mi.poster)}"` : ''}></video>
         <span class="tile__play"><svg width="11" height="13" viewBox="0 0 11 13" fill="currentColor" aria-hidden="true"><path d="M0 0v13l11-6.5z"/></svg></span>`
      : `<img src="${esc(mi.src)}" alt="${alt}" loading="lazy" decoding="async"${mi.w ? ` width="${mi.w}" height="${mi.h}"` : ''}>`;
    return `<button class="tile ${cls}" data-i="${i}" aria-label="Open ${alt}">${inner}</button>`;
  }).join('');

  return `
    <article class="post" data-type="${esc(p.type)}" data-month="${monthKey(p.date)}" id="${esc(p.id)}">
      <header class="post__head">
        <h3 class="post__date">${dateLabel(p.date)}</h3>
        <span class="post__tag post__tag--${esc(p.type)}">${esc(TAGS[p.type] || p.type)}</span>
        ${p.where ? `<span class="post__where">${esc(p.where)}</span>` : ''}
      </header>
      <div class="gal">${html}</div>
    </article>`;
}

function mountGallery(el, opts = {}) {
  if (!el) return;
  const data = (window.UTRC_RUNS && window.UTRC_RUNS.posts) || [];
  const posts = [...data].sort((a, b) => b.date.localeCompare(a.date))
                         .slice(0, opts.limit || Infinity);

  if (!posts.length) {
    el.innerHTML = `
      <div class="empty">
        <p class="display h-md" style="margin-bottom:.7rem">No runs posted yet</p>
        <p class="muted" style="max-width:52ch;margin:0 auto">
          Drop photos into a dated folder such as
          <code>gallery/2026-09-14-monday-5k/</code>, run <code>new-run.ps1</code>,
          and this page fills itself in.
        </p>
      </div>`;
    return;
  }

  const flat = [];
  el.innerHTML = posts.map(p => renderPost(p, flat)).join('');

  /* filters */
  const chips = $$('[data-filter]');
  if (chips.length) {
    const kinds = new Set(posts.map(p => p.type));
    chips.forEach(c => {
      const f = c.dataset.filter;
      if (f !== 'all' && !kinds.has(f)) c.style.display = 'none';
      c.addEventListener('click', () => {
        chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
        $$('.post', el).forEach(p => {
          p.hidden = !(f === 'all' || p.dataset.type === f);
        });
      });
    });
  }

  /* month jump */
  const mNav = $('#monthNav');
  if (mNav) {
    const first = new Map();                       // month -> id of its newest post
    posts.forEach(p => { if (!first.has(monthKey(p.date))) first.set(monthKey(p.date), p.id); });
    mNav.innerHTML = [...first].map(([m, id]) =>
      `<a class="chip" href="#${esc(id)}">${monthLabel(m)}</a>`).join('');
  }

  mountLightbox(el, flat);
  observeReveal(el);
}

/* ==========================================================================
   6. Lightbox
   ========================================================================== */
function mountLightbox(scope, flat) {
  let box = $('.lb');
  if (!box) {
    box = document.createElement('div');
    box.className = 'lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML = `
      <div class="lb__stage"></div>
      <button class="lb__btn lb__close" aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 5 19 19M19 5 5 19"/></svg></button>
      <button class="lb__btn lb__prev" aria-label="Previous">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 4 7 12l8 8"/></svg></button>
      <button class="lb__btn lb__next" aria-label="Next">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m9 4 8 8-8 8"/></svg></button>
      <div class="lb__bar"><b></b><span></span><span class="lb__count"></span></div>`;
    document.body.appendChild(box);
  }

  const stage = $('.lb__stage', box);
  const bTitle = $('.lb__bar b', box);
  const bMeta = $('.lb__bar span', box);
  const bCount = $('.lb__count', box);
  let i = 0, opener = null;

  function show(n) {
    const list = flat;
    i = (n + list.length) % list.length;
    const it = list[i];
    stage.innerHTML = it.type === 'video'
      ? `<video src="${esc(it.src)}" controls autoplay loop playsinline></video>`
      : `<img src="${esc(it.src)}" alt="${esc(it.alt || it.post.title)}">`;
    bTitle.innerHTML = dateLabel(it.post.date);
    bMeta.textContent = [it.post.title, it.post.where].filter(Boolean).join(' · ');
    bCount.textContent = `${i + 1} / ${list.length}`;
  }
  function open(n, from) {
    opener = from;
    show(n);
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    $('.lb__close', box).focus();
  }
  function close() {
    box.classList.remove('is-open');
    stage.innerHTML = '';
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }

  scope.addEventListener('click', e => {
    const t = e.target.closest('.tile');
    if (t) open(+t.dataset.i, t);
  });
  $('.lb__close', box).onclick = close;
  $('.lb__prev', box).onclick = () => show(i - 1);
  $('.lb__next', box).onclick = () => show(i + 1);
  box.addEventListener('click', e => { if (e.target === box) close(); });
  addEventListener('keydown', e => {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });

  /* swipe */
  let x0 = null;
  box.addEventListener('touchstart', e => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 55) show(i + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });
}

/* ==========================================================================
   7. Motion: reveals, counters, marquees, cursor, footprint trail
   ========================================================================== */
function observeReveal(root = document) {
  const items = $$('[data-reveal]', root).filter(n => !n.dataset.seen);
  if (!items.length) return;
  if (REDUCED || !('IntersectionObserver' in window)) {
    items.forEach(n => { n.dataset.seen = 1; n.classList.add('is-in'); });
    return;
  }
  const io = new IntersectionObserver((es, o) => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      o.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0 });
  items.forEach(n => { n.dataset.seen = 1; io.observe(n); });
}

function mountCounters() {
  const nodes = $$('[data-count]');
  if (!nodes.length) return;
  const run = el => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (REDUCED) { el.textContent = target.toLocaleString() + suffix; return; }
    const dur = 1500, t0 = performance.now();
    const step = t => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * e).toLocaleString() + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
  const io = new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { run(e.target); o.unobserve(e.target); }
  }), { threshold: .4 });
  nodes.forEach(n => io.observe(n));
}

function mountMarquees() {
  $$('.marquee').forEach(m => {
    const track = $('.marquee__track', m);
    if (!track) return;
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    m.appendChild(clone);
  });
}

function mountCardGlow() {
  $$('.card').forEach(c => {
    if (!$('.card__glow', c)) {
      const g = document.createElement('span');
      g.className = 'card__glow';
      g.setAttribute('aria-hidden', 'true');
      c.prepend(g);
    }
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
}

function mountCursor() {
  if (REDUCED || matchMedia('(pointer:coarse)').matches) return;
  const dot = document.createElement('div');
  dot.className = 'cursor';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY;
    dot.classList.add('is-on');
    dot.classList.toggle('is-big', !!e.target.closest('a,button,.tile,.run,.card,.person'));
  }, { passive: true });
  addEventListener('pointerleave', () => dot.classList.remove('is-on'));
  (function loop() {
    cx += (x - cx) * .18; cy += (y - cy) * .18;
    dot.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    requestAnimationFrame(loop);
  })();
}

/* Footprints tracking across the hero as you move. */
function mountTrail() {
  const cv = $('#trail');
  if (!cv || REDUCED || matchMedia('(pointer:coarse)').matches) return;
  const ctx = cv.getContext('2d');
  const hero = cv.parentElement;
  let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);
  const steps = [];
  let last = null, side = 1;

  const size = () => {
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener('resize', size);

  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (!last) { last = p; return; }
    const dx = p.x - last.x, dy = p.y - last.y;
    const d = Math.hypot(dx, dy);
    if (d < 46) return;
    const a = Math.atan2(dy, dx);
    const off = 11 * side;
    steps.push({
      x: p.x - Math.sin(a) * off,
      y: p.y + Math.cos(a) * off,
      a, t: performance.now(), side
    });
    side *= -1;
    last = p;
    if (steps.length > 26) steps.shift();
  }, { passive: true });

  const foot = (s, alpha) => {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.a + Math.PI / 2);
    ctx.scale(1, s.side);
    ctx.fillStyle = `rgba(220,50,32,${alpha})`;
    ctx.beginPath(); ctx.ellipse(0, -4, 4.6, 7.4, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(.6, 6.4, 3.4, 4.2, 0, 0, 7); ctx.fill();
    ctx.restore();
  };

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    const now = performance.now();
    for (let i = steps.length - 1; i >= 0; i--) {
      const age = (now - steps[i].t) / 2600;
      if (age > 1) { steps.splice(i, 1); continue; }
      foot(steps[i], (1 - age) * .5);
    }
    requestAnimationFrame(draw);
  })();
}

/* Hero headline: lines rise out of their masks. */
function mountHeroTitle() {
  const t = $('.hero__title');
  if (!t) return;
  const lines = $$('.line > span', t);
  lines.forEach((l, i) => {
    if (REDUCED) return;
    l.style.transform = 'translateY(105%)';
    l.style.transition = `transform 1s cubic-bezier(.22,1,.36,1) ${120 + i * 110}ms`;
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    lines.forEach(l => { l.style.transform = 'translateY(0)'; });
  }));
}

/* Subtle parallax on anything with data-para="0.15" */
function mountParallax() {
  const nodes = $$('[data-para]');
  if (!nodes.length || REDUCED) return;
  let ticking = false;
  const upd = () => {
    const vh = innerHeight;
    nodes.forEach(n => {
      const r = n.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const k = (r.top + r.height / 2 - vh / 2) / vh;
      n.style.transform = `translate3d(0,${(k * +n.dataset.para * 100).toFixed(2)}px,0)`;
    });
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(upd); }
  }, { passive: true });
  upd();
}

function mountMagnetic() {
  if (REDUCED || matchMedia('(pointer:coarse)').matches) return;
  $$('[data-magnetic]').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * .22;
      const dy = (e.clientY - r.top - r.height / 2) * .3;
      b.style.transform = `translate(${dx}px,${dy}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ==========================================================================
   8. Accordion + route maps
   ========================================================================== */
function mountAccordion() {
  $$('.acc__btn').forEach(btn => {
    const panel = btn.nextElementSibling;
    btn.setAttribute('aria-expanded', 'false');
    panel.dataset.open = 'false';
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.dataset.open = String(!open);
    });
  });
}

function mountRoutes() {
  $$('.route__map').forEach(svg => {
    const line = $('.line', svg);
    if (line && line.getTotalLength) line.style.setProperty('--len', Math.ceil(line.getTotalLength()));
    if (REDUCED || !('IntersectionObserver' in window)) { svg.classList.add('is-in'); return; }
    new IntersectionObserver((es, o) => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); o.unobserve(e.target); }
    }), { threshold: .3 }).observe(svg);
  });
}

/* ==========================================================================
   9. Boot
   ========================================================================== */
/* Team cards, rendered from SITE.team so next year's roster is a data edit. */
function personCard(p, i) {
  const initials = p.name.split(/\s+/).map(w => w[0]).slice(0, 2).join('');
  const shot = p.photo
    ? `<img src="assets/img/leaders/${esc(p.photo)}" alt="${esc(p.name)}"
            loading="lazy" decoding="async"
            ${p.pos ? `style="object-position:${esc(p.pos)}"` : ''}>`
    : `<span class="person__initials" aria-hidden="true">${esc(initials)}</span>`;

  return `
    <article class="person" data-reveal style="--d:${(i % 4) * 70}ms">
      <div class="person__photo${p.photo ? '' : ' person__photo--none'}">${shot}</div>
      ${p.role ? `<div class="person__role">${esc(p.role)}</div>` : ''}
      <div class="person__name">${esc(p.name)}</div>
      <p class="person__note">${esc(p.study)}</p>
      <dl class="person__meta">
        <div><dt>Favourite route</dt><dd>${esc(p.route)}</dd></div>
        <div><dt>Ideal post-run meal</dt><dd>${esc(p.food)}</dd></div>
      </dl>
    </article>`;
}

function mountTeam() {
  const ex = $('#team-exec'), ld = $('#team-leaders');
  if (ex) ex.innerHTML = SITE.team.exec.map(personCard).join('');
  if (ld) ld.innerHTML = SITE.team.leaders.map(personCard).join('');
}

function boot() {
  buildHeader();
  applyTheme(readTheme());
  buildFooter();
  mountTeam();
  mountMarquees();
  mountSchedule($('#schedule-list'));
  mountCountdown($('#next-run'));
  const gal = $('#gallery');
  mountGallery(gal, { limit: gal ? +gal.dataset.limit || Infinity : Infinity });
  mountCounters();
  mountCardGlow();
  mountAccordion();
  mountRoutes();
  mountHeroTitle();
  mountParallax();
  mountMagnetic();
  /* mountCursor(); — trailing cursor ring removed by request. The function and
     its .cursor styles are left in place so it can be switched back on here. */
  mountTrail();
  observeReveal();

  /* email + social links marked with data-mail / data-ig */
  $$('[data-mail]').forEach(a => { a.href = 'mailto:' + SITE.email; if (!a.textContent.trim()) a.textContent = SITE.email; });
  $$('[data-ig]').forEach(a => { a.href = SITE.instagram; });
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', boot)
  : boot();
