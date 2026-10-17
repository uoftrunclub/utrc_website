/* Routes each letter and draws it in the terminal, so the letterforms can be
   judged before any SVG gets written.  Terminal cells are about twice as tall
   as they are wide, so x is doubled to keep the proportions honest.
   Usage: node preview.js <data-dir> [letterId] */
'use strict';
const g = require('./geo.js');
const letters = require('./letters.js');

const dir = process.argv[2];
const only = process.argv[3];
const nodes = g.buildGraph(g.loadWays([dir + '/roads.json', dir + '/campus.json']));
const KCC = g.nearest(nodes, 43.66155, -79.39560, /^King's College Circle$/).node;

const R = s => new RegExp('^' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');

function resolve(wp) {
  if (wp === 'KCC') return KCC;
  const [a, b, hint] = wp;
  const n = g.crossing(nodes, R(a), R(b), hint || [43.661, -79.396]);
  if (!n) throw new Error('no crossing: ' + a + ' x ' + b);
  return n;
}

function ascii(pts, cols, rows) {
  // rotated to the Toronto grid; x is doubled for the terminal cell shape
  const proj = g.projectorFor(pts, cols / 2, rows, 1);
  const grid = Array.from({ length: rows }, () => Array(cols).fill(' '));
  const plot = (x, y, ch) => {
    const xi = Math.round(x * 2), yi = Math.round(y);
    if (xi >= 0 && xi < cols && yi >= 0 && yi < rows) grid[yi][xi] = ch;
  };
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = proj(...pts[i - 1]), [x1, y1] = proj(...pts[i]);
    const n = Math.max(2, Math.ceil(Math.hypot((x1 - x0) * 2, y1 - y0) * 2));
    for (let t = 0; t <= n; t++) plot(x0 + (x1 - x0) * t / n, y0 + (y1 - y0) * t / n, '#');
  }
  const s = proj(...pts[0]), e = proj(...pts[pts.length - 1]);
  plot(...s, 'S'); plot(...e, 'E');
  return grid.map(r => '  |' + r.join('') + '|').join('\n');
}

for (const L of letters) {
  if (only && L.id !== only) continue;
  const wps = L.wp.map(resolve);
  const r = g.runRoute(nodes, wps);
  const lats = r.pts.map(p => p[0]), lons = r.pts.map(p => p[1]);
  const kh = (Math.max(...lats) - Math.min(...lats)) * 111.3;
  const kw = (Math.max(...lons) - Math.min(...lons)) * 80.5;
  console.log('\n' + '='.repeat(74));
  console.log(`  ${L.letter}  —  ${L.run}   ${(r.metres / 1000).toFixed(2)} km` +
              `   footprint ${kw.toFixed(2)} W x ${kh.toFixed(2)} H km`);
  console.log('='.repeat(74));
  console.log(ascii(r.pts, 72, 26));
  // per-leg breakdown, so it is obvious where to add or trim distance
  for (let i = 1; i < wps.length; i++) {
    const leg = g.route(nodes, wps[i - 1], wps[i]);
    const label = w => (w === 'KCC' ? 'KCC' : w[0] + ' x ' + w[1]);
    console.log(`    ${(leg.metres / 1000).toFixed(2)} km  ` +
                `${label(L.wp[i - 1])}  ->  ${label(L.wp[i])}`);
  }
  console.log('  via: ' + [...new Set(r.streets)].filter(Boolean).join(' · '));
}
