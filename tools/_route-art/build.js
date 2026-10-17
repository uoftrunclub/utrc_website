/* Turns the four letter routes into finished SVG for the join page.
   Emits one JSON blob of card markup; make-pages.js drops it into the HTML.

   Two backdrop treatments come out of the same data:
     'osm'  — every street, real geometry, three weights
     'grid' — only the named arterials, each straightened to a single line

   Usage: node build.js <data-dir> <out.json>  */
'use strict';
const fs = require('fs');
const g = require('./geo.js');
const letters = require('./letters.js');

const dir = process.argv[2];
const out = process.argv[3];

const W = 400, H = 300, PAD = 38;
const CARD_MARGIN = 10;            // how far past the card edge streets are kept
const SIMPLIFY = 0.35;             // px tolerance — OSM carries far more detail than 400px needs

const ways = g.loadWays([dir + '/roads.json', dir + '/campus.json']);
const nodes = g.buildGraph(ways);
const KCC = g.nearest(nodes, 43.66155, -79.39560, /^King's College Circle$/).node;
const RE = s => new RegExp('^' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');

/* Which streets earn which weight, and which get a name on the card. */
const MAJOR = /^(trunk|primary)$/;
const MID = /^(secondary|tertiary)$/;
const NAMED = [
  'Bloor Street West', 'Bloor Street East', 'College Street', 'Carlton Street',
  'Dundas Street West', 'Dundas Street East', 'Queen Street West', 'Queen Street East',
  'King Street West', 'King Street East', 'Front Street West', 'Front Street East',
  'Harbord Street', 'Richmond Street West', 'Adelaide Street West', 'Wellington Street West',
  'Bathurst Street', 'Spadina Avenue', 'St. George Street', 'Beverley Street',
  'University Avenue', 'Bay Street', 'Yonge Street', 'Jarvis Street', 'Church Street',
  'Ossington Avenue', 'Dufferin Street', 'Avenue Road', "Queen's Park", 'John Street',
  'Simcoe Street', 'McCaul Street', 'Huron Street', 'Dupont Street', 'Davenport Road',
  'Parliament Street', 'Sherbourne Street', 'Lake Shore Boulevard West',
];
/* Short forms, so a label never crowds the card. */
const SHORT = s => s
  .replace(/\bStreet West$/, 'ST W').replace(/\bStreet East$/, 'ST E')
  .replace(/\bBoulevard West$/, 'BLVD W')
  .replace(/\bStreet$/, 'ST').replace(/\bAvenue$/, 'AVE')
  .replace(/\bRoad$/, 'RD').replace(/\bCrescent$/, 'CRES')
  .toUpperCase();

const r1 = n => Math.round(n * 10) / 10;

function resolve(wp) {
  if (wp === 'KCC') return KCC;
  const [a, b, hint] = wp;
  const n = g.crossing(nodes, RE(a), RE(b), hint || [43.661, -79.396]);
  if (!n) throw new Error('no crossing: ' + a + ' x ' + b);
  return n;
}

/* --- geometry helpers ---------------------------------------------------- */
const inCard = ([x, y]) =>
  x >= -CARD_MARGIN && x <= W + CARD_MARGIN && y >= -CARD_MARGIN && y <= H + CARD_MARGIN;

/* Splits a projected way into the runs that actually touch the card. */
function visibleRuns(xy) {
  const runs = []; let run = null;
  for (let i = 1; i < xy.length; i++) {
    if (inCard(xy[i - 1]) || inCard(xy[i])) {
      if (!run) runs.push(run = [xy[i - 1]]);
      run.push(xy[i]);
    } else run = null;
  }
  return runs;
}

/* Douglas-Peucker: OSM geometry is surveyed, the card is 400px wide. */
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [i0, i1] = stack.pop();
    const [x0, y0] = pts[i0], [x1, y1] = pts[i1];
    const dx = x1 - x0, dy = y1 - y0, nn = Math.hypot(dx, dy) || 1e-9;
    let far = -1, fd = tol;
    for (let i = i0 + 1; i < i1; i++) {
      const d = Math.abs((pts[i][0] - x0) * dy - (pts[i][1] - y0) * dx) / nn;
      if (d > fd) { fd = d; far = i; }
    }
    if (far > 0) { keep[far] = 1; stack.push([i0, far], [far, i1]); }
  }
  return pts.filter((_, i) => keep[i]);
}

const dOf = run => 'M' + simplify(run, SIMPLIFY).map(p => r1(p[0]) + ' ' + r1(p[1])).join('L');

function polyLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}

/* Straight-line fit through a run, used by the schematic backdrop: the two
   extreme points along the run's own direction. */
function straighten(run) {
  let best = [run[0], run[run.length - 1]], bd = -1;
  for (let i = 0; i < run.length; i++) for (let j = i + 1; j < run.length; j++) {
    const d = Math.hypot(run[j][0] - run[i][0], run[j][1] - run[i][1]);
    if (d > bd) { bd = d; best = [run[i], run[j]]; }
  }
  return best;
}

/* A named street arrives as dozens of separate OSM ways, so its visible
   extent is the span of all of them projected onto its own direction. */
function extentOf(runs) {
  let dir = null, bd = -1;
  for (const run of runs) {
    const [p, q] = straighten(run);
    const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (d > bd) { bd = d; dir = [(q[0] - p[0]) / (d || 1), (q[1] - p[1]) / (d || 1)]; }
  }
  if (!dir) return null;
  let lo = Infinity, hi = -Infinity, pa = null, pb = null;
  for (const run of runs) for (const p of run) {
    const t = p[0] * dir[0] + p[1] * dir[1];
    if (t < lo) { lo = t; pa = p; }
    if (t > hi) { hi = t; pb = p; }
  }
  return [pa, pb];
}

/* --- labels -------------------------------------------------------------- */
/* A street is labelled along its visible extent across the card. */
function labelFor(runs) {
  const ext = extentOf(runs);
  if (!ext) return null;
  const [a, b] = ext;
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 80) return null;
  // walk the stretch for a midpoint that sits comfortably inside the card
  const inset = (x, y) => x > 40 && x < W - 40 && y > 14 && y < H - 14;
  let pos = null;
  for (const t of [0.5, 0.38, 0.62, 0.28, 0.72, 0.2, 0.8]) {
    const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
    if (inset(x, y)) { pos = { x, y }; break; }
  }
  if (!pos) return null;
  let ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
  return { x: pos.x, y: pos.y, ang };
}

/* --- per-letter build ---------------------------------------------------- */
const PICK = { U: 'U1', T: 'T1', R: 'R13', C: 'C11' };
const chosen = Object.values(PICK).map(id => letters.find(l => l.id === id));

const cards = [];
for (const L of chosen) {
  const wps = L.wp.map(resolve);
  const r = g.runRoute(nodes, wps);
  const proj = g.projectorFor(r.pts, W, H, PAD);

  /* the route itself */
  const rxy = r.pts.map(p => proj(...p));
  const routeD = dOf(rxy);
  const len = Math.ceil(polyLength(rxy));

  /* backdrop, grouped by weight */
  const layers = { major: [], mid: [], minor: [] };
  const straightLayers = { major: [], mid: [] };
  const byName = new Map();

  for (const w of ways) {
    const hw = w.tags.highway;
    if (hw === 'footway' || hw === 'path' || hw === 'steps' || hw === 'service' ||
        hw === 'cycleway' || hw === 'track') continue;
    const xy = w.pts.map(p => proj(...p));
    const runs = visibleRuns(xy);
    if (!runs.length) continue;
    const tier = MAJOR.test(hw) ? 'major' : MID.test(hw) ? 'mid' : 'minor';
    for (const run of runs) {
      if (polyLength(run) < (tier === 'minor' ? 6 : 3)) continue;
      layers[tier].push(dOf(run));
    }
    const nm = w.tags.name;
    if (nm && NAMED.includes(nm)) {
      if (!byName.has(nm)) byName.set(nm, { tier, runs: [] });
      byName.get(nm).runs.push(...runs);
    }
  }
  /* the schematic backdrop keeps only the named arterials, one line each */
  for (const [, info] of byName) {
    const ext = extentOf(info.runs);
    if (!ext || Math.hypot(ext[1][0] - ext[0][0], ext[1][1] - ext[0][1]) < 30) continue;
    straightLayers[info.tier === 'minor' ? 'mid' : info.tier].push(dOf(ext));
  }

  /* street labels, thinned so they never pile up — and never under the run */
  const nearRoute = (x, y, r) => rxy.some(p => Math.hypot(p[0] - x, p[1] - y) < r);
  const labels = [];
  for (const [nm, info] of byName) {
    const pos = labelFor(info.runs);
    if (!pos) continue;
    if (nearRoute(pos.x, pos.y, 13)) continue;
    if (Math.hypot(pos.x - rxy[0][0], pos.y - rxy[0][1]) < 46) continue;
    if (Math.hypot(pos.x - rxy[rxy.length - 1][0], pos.y - rxy[rxy.length - 1][1]) < 46) continue;
    if (labels.some(l => Math.hypot(l.x - pos.x, l.y - pos.y) < 62)) continue;
    labels.push({ ...pos, text: SHORT(nm), tier: info.tier });
  }
  labels.sort((a, b) => (a.tier === 'major' ? -1 : 1) - (b.tier === 'major' ? -1 : 1));

  /* scale bar: a round number of metres, drawn in card units */
  const mPerUnit = (() => {
    const a = proj(43.66, -79.40), b = proj(43.66, -79.39);
    return g.haversine([43.66, -79.40], [43.66, -79.39]) / Math.hypot(b[0] - a[0], b[1] - a[1]);
  })();
  const barM = 500;
  const barPx = barM / mPerUnit;

  cards.push({
    id: L.id, letter: L.letter, run: L.run,
    km: r.metres / 1000,
    start: rxy[0], end: rxy[rxy.length - 1],
    routeD, len, layers, straightLayers, labels,
    barPx: r1(barPx), barM,
    streets: [...new Set(r.streets)].filter(Boolean),
    W, H,
  });
  console.log(`${L.letter}  ${L.id}  ${(r.metres / 1000).toFixed(2)} km  ` +
              `${layers.major.length + layers.mid.length + layers.minor.length} street runs, ` +
              `${labels.length} labels, len ${len}`);
}

fs.writeFileSync(out, JSON.stringify(cards));
console.log('wrote ' + out + '  (' + (fs.statSync(out).size / 1024).toFixed(0) + ' KB)');
