/* Writes the two draft join pages from the built card data.

   Both drafts are byte-identical apart from the map backdrop, so they can be
   compared directly.  Neither touches join.html or style.css: the extra CSS
   rides inside each draft's own <style> block, and the leading underscore in
   the filename keeps both of them out of the deploy.

   Usage: node make-pages.js <cards.json> <01_main dir>  */
'use strict';
const fs = require('fs');
const path = require('path');

const cards = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const MAIN = process.argv[3];
const src = fs.readFileSync(path.join(MAIN, 'join.html'), 'utf8');

/* --- copy ---------------------------------------------------------------- */
const COPY = {
  U: {
    run: 'Monday 5K', letter: 'U', tone: 'red', end: 'Finish',
    text: 'South through Chinatown and down to Front Street, east past Union and the ' +
          'market, then north up Jarvis. The widest of the four letters, and the flattest run.',
    stats: [['5.3 km', 'Distance'], ['~35 min', 'Steady group'], ['Flat', 'Terrain']],
  },
  T: {
    run: 'Wednesday 5K', letter: 'T', tone: 'red', end: 'Finish',
    text: 'Down to Dundas and straight back up — the stem is an out-and-back — then the ' +
          'whole length of Bloor, Bathurst to Bay. The simplest route we run.',
    stats: [['5.4 km', 'Distance'], ['~35 min', 'Steady group'], ['Flat', 'Terrain']],
  },
  R: {
    run: 'Saturday 8K', letter: 'R', tone: 'blue', end: 'Finish',
    text: 'The long one, and the only letter with a leg. Down to Front and back, round the ' +
          'bowl through Queen, Bay and College, then the diagonal out to the water.',
    stats: [['8.6 km', 'Distance'], ['~50 min', 'Steady group'], ['Rolling', 'Terrain']],
  },
  C: {
    run: 'Saturday 5K', letter: 'C', tone: 'blue', end: 'Café',
    text: 'West along Harbord, down the full length of Bathurst, then east to whichever ' +
          'partner café is looking after us. The open side of the C faces campus.',
    stats: [['4.9 km', 'Distance'], ['~35 min', 'Steady group'], ['Coffee', 'Included']],
  },
};

const ALT = {
  U: 'Map of downtown Toronto with the Monday 5K route drawn on it, tracing the letter U from King’s College Circle south to Front Street, east, then north up Jarvis.',
  T: 'Map of downtown Toronto with the Wednesday 5K route drawn on it, tracing the letter T: a stem down to Dundas and back, and a crossbar along Bloor from Bathurst to Bay.',
  R: 'Map of downtown Toronto with the Saturday 8K route drawn on it, tracing the letter R from King’s College Circle, with a spine down to Front Street, a bowl through Queen and College, and a diagonal leg.',
  C: 'Map of downtown Toronto with the Saturday 5K café route drawn on it, tracing the letter C west along Harbord, south down Bathurst and east along Front Street.',
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r1 = n => Math.round(n * 10) / 10;

/* --- one card ------------------------------------------------------------ */
function card(c, mode, i) {
  const m = COPY[c.letter];
  const L = mode === 'grid' ? c.straightLayers : c.layers;
  const W = c.W, H = c.H;

  const layer = (cls, paths) =>
    paths.length ? `<g class="${cls}"><path d="${paths.join('')}"/></g>` : '';

  const names = c.labels.map(l =>
    `<text x="${r1(l.x)}" y="${r1(l.y)}" transform="rotate(${r1(l.ang)} ${r1(l.x)} ${r1(l.y)})">${esc(l.text)}</text>`
  ).join('');

  /* Endpoint captions sit away from the card edge and away from the line. */
  const cap = (p, text) => {
    const anchor = p[0] > W * 0.62 ? 'end' : 'start';
    const dx = anchor === 'end' ? -10 : 10;
    const dy = p[1] > H * 0.55 ? -11 : 17;
    return `<text class="lbl" text-anchor="${anchor}" x="${r1(p[0] + dx)}" y="${r1(p[1] + dy)}">${text}</text>`;
  };

  const barX = W - 24 - c.barPx, barY = H - 20;

  return `
      <article class="route route--art route--${m.tone}" data-reveal${i ? ` style="--d:${i * 90}ms"` : ''}>
        <svg class="route__map" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ALT[c.letter])}">
          <rect class="rm-paper" width="${W}" height="${H}"/>
          ${layer('rm-minor', L.minor || [])}
          ${layer('rm-mid', L.mid || [])}
          ${layer('rm-major', L.major || [])}
          <g class="rm-name">${names}</g>
          <path class="line" d="${c.routeD}" style="--len:${c.len}"/>
          <circle class="dot" cx="${r1(c.start[0])}" cy="${r1(c.start[1])}" r="5"/>
          <circle class="dot-r" cx="${r1(c.end[0])}" cy="${r1(c.end[1])}" r="5"/>
          ${cap(c.start, 'Start')}
          ${cap(c.end, m.end)}
          <g class="rm-furniture">
            <path d="M${r1(barX)} ${barY}v4M${r1(barX)} ${barY + 2}h${c.barPx}M${r1(barX + c.barPx)} ${barY}v4"/>
            <text x="${r1(barX + c.barPx / 2)}" y="${barY - 4}" text-anchor="middle">${c.barM} m</text>
            <g transform="translate(24 ${H - 26}) rotate(16.3)">
              <path d="M0 10V-6M0 -9l3.4 5H-3.4Z"/>
              <text x="0" y="20" text-anchor="middle">N</text>
            </g>
          </g>
          <text class="rm-glyph" x="${W - 16}" y="26" text-anchor="end">${m.letter}</text>
        </svg>
        <div class="route__body">
          <h3>${m.run}</h3>
          <p>${m.text}</p>
          <div class="route__stats">
            ${m.stats.map(([b, l]) => `<span><b>${b}</b>${l}</span>`).join('\n            ')}
          </div>
        </div>
      </article>`;
}

/* --- the replacement section --------------------------------------------- */
function section(mode) {
  return `<!-- ==================================================== ROUTES ========= -->
<section class="sec" id="routes">
  <div class="shell">
    <div class="sec__head">
      <div>
        <p class="eyebrow">The routes</p>
        <h2 class="display h-xl" data-reveal>Where<br>we go</h2>
      </div>
      <p class="lede" data-reveal style="--d:120ms;max-width:40ch">
        Four runs, four letters. Every one starts on King&rsquo;s College Circle, and run
        them all and you have spelled UTRC across the city. Real streets, measured
        distances &mdash; your run leader still calls the exact turns on the day.
      </p>
    </div>

    <div class="grid grid--routes">
${cards.map((c, i) => card(c, mode, i)).join('\n')}
    </div>

    <!-- Required by the ODbL: the street geometry under every one of these
         maps is OpenStreetMap data. This has to stay if the maps ship. -->
    <p class="routes__credit">
      Street data &copy; <a href="https://www.openstreetmap.org/copyright"
      target="_blank" rel="noopener">OpenStreetMap</a> contributors.
      Routes drawn along real pavement; distances measured along the route.
    </p>
  </div>
</section>
`;
}

/* --- styles, scoped to the draft ----------------------------------------- */
const CSS = `
<style>
/* ---- route-art drafts --------------------------------------------------
   Everything the new maps need, kept in the draft page so style.css and
   join.html stay untouched while this is being tried out. */
.grid--routes{display:grid;gap:var(--gap);grid-template-columns:repeat(2,minmax(0,1fr))}
@media (max-width:900px){.grid--routes{grid-template-columns:minmax(0,1fr)}}
/* the stats row is the widest thing in the card, so let it wrap on a phone */
@media (max-width:420px){.route--art .route__stats{gap:1rem;flex-wrap:wrap}}

.route--art .route__map{background:var(--surface-2);display:block;width:100%;height:auto}
.rm-paper{fill:var(--surface-2)}

/* The city, in three weights. */
.rm-minor path{fill:none;stroke:var(--line);stroke-width:.5}
.rm-mid   path{fill:none;stroke:var(--line);stroke-width:1}
.rm-major path{fill:none;stroke:var(--line-strong);stroke-width:1.4;opacity:.55}

.rm-name text{
  font-family:var(--f-mono);font-size:6px;letter-spacing:.14em;
  fill:var(--fg-mute);opacity:.72;
}
.rm-furniture path{fill:var(--fg-mute);stroke:var(--fg-mute);stroke-width:.8;opacity:.5}
.rm-furniture text{
  font-family:var(--f-mono);font-size:6px;letter-spacing:.14em;
  fill:var(--fg-mute);opacity:.6;stroke:none;
}
/* The letter this run draws, called out quietly in the corner. */
.rm-glyph{
  font-family:var(--f-display);font-size:26px;
  fill:var(--fg);opacity:.14;letter-spacing:.02em;
}

/* The run itself. */
.route--art .route__map .line{
  fill:none;stroke:var(--red);stroke-width:3.4;
  stroke-linecap:round;stroke-linejoin:round;
  stroke-dasharray:var(--len,1400);stroke-dashoffset:var(--len,1400);
}
.route--blue .route__map .line{stroke:var(--blue)}
.route--art .route__map.is-in .line{animation:draw 2.8s var(--ease) forwards}
.route--art .route__map .dot{fill:var(--fg);stroke:var(--surface-2);stroke-width:2}
.route--art .route__map .dot-r{fill:var(--red);stroke:var(--surface-2);stroke-width:2}
.route--blue .route__map .dot-r{fill:var(--blue)}
.route--art .route__map .lbl{
  font-family:var(--f-mono);font-size:7.5px;letter-spacing:.16em;
  fill:var(--fg);text-transform:uppercase;font-weight:700;
}
@media (prefers-reduced-motion:reduce){
  .route--art .route__map .line{stroke-dashoffset:0}
}

/* Which draft you are looking at. */
.draftbar{
  position:sticky;top:var(--nav-h);z-index:40;
  background:var(--ink);color:var(--paper);
  font-family:var(--f-mono);font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;
  padding:.6rem clamp(16px,4vw,40px);
  display:flex;gap:1.2rem;align-items:center;justify-content:space-between;flex-wrap:wrap;
}
.draftbar a{color:var(--red-lift);text-underline-offset:3px}

.routes__credit{
  margin:1.4rem 0 0;font-family:var(--f-mono);font-size:.62rem;
  letter-spacing:.1em;text-transform:uppercase;color:var(--fg-mute);
}
.routes__credit a{color:inherit;text-underline-offset:3px}
</style>
`;

/* --- assemble ------------------------------------------------------------ */
const START = '<!-- ==================================================== ROUTES ========= -->';
const END = '<!-- ================================================== WHAT TO BRING ==== -->';

function build(mode, name, title, other, otherName) {
  const a = src.indexOf(START), b = src.indexOf(END);
  if (a < 0 || b < 0) throw new Error('could not find the routes section in join.html');

  let html = src.slice(0, a) + section(mode) + '\n' + src.slice(b);

  html = html.replace('</head>', CSS + '</head>');
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title} — UTRC (draft)</title>`);
  html = html.replace('<body>', `<body>
<!-- Draft marker. This page is scratch work: the leading underscore keeps it
     out of the build, and nothing here is linked from the live site. -->`);
  html = html.replace('<header id="nav"></header>', `<header id="nav"></header>
<div class="draftbar">
  <span>Route art draft &mdash; ${title}</span>
  <span><a href="${otherName}">Compare: ${other} &rarr;</a> &nbsp;·&nbsp; <a href="join.html">Current join page</a></span>
</div>`);

  const outPath = path.join(MAIN, name);
  fs.writeFileSync(outPath, html);
  console.log(`${name}  ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB`);
}

build('osm', '_join-routes-osm.html', 'A · real OpenStreetMap streets',
      'B · schematic grid', '_join-routes-grid.html');
build('grid', '_join-routes-grid.html', 'B · schematic grid',
      'A · real streets', '_join-routes-osm.html');
