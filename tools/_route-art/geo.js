'use strict';
const fs = require('fs');

const R = 6371008.8;
const rad = d => d * Math.PI / 180;
function haversine(a, b) {
  const dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
  const la1 = rad(a[0]), la2 = rad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const key = (lat, lon) => lat.toFixed(7) + ',' + lon.toFixed(7);

/* ---- graph ------------------------------------------------------------- */
function loadWays(files) {
  const ways = [];
  for (const f of files) {
    for (const w of JSON.parse(fs.readFileSync(f, 'utf8')).elements) {
      if (!w.geometry || w.geometry.length < 2) continue;
      ways.push({ id: w.id, tags: w.tags || {}, pts: w.geometry.map(p => [p.lat, p.lon]) });
    }
  }
  return ways;
}

/* Running cost multipliers: the drawing should land on real streets, so
   footpaths and stairs are expensive even though they are perfectly runnable. */
const COST = { footway:2.6, path:2.6, steps:8, cycleway:2.0, track:3, service:1.35, pedestrian:1.15 };

function buildGraph(ways) {
  const nodes = new Map();          // key -> {lat,lon,adj:[{to,d,name}]}
  const get = (lat, lon) => {
    const k = key(lat, lon);
    let n = nodes.get(k);
    if (!n) nodes.set(k, n = { k, lat, lon, adj: [] });
    return n;
  };
  for (const w of ways) {
    const name = w.tags.name || '';
    const mul = COST[w.tags.highway] || 1;
    for (let i = 1; i < w.pts.length; i++) {
      const a = get(...w.pts[i - 1]), b = get(...w.pts[i]);
      if (a === b) continue;
      const d = haversine([a.lat, a.lon], [b.lat, b.lon]);
      a.adj.push({ to: b, d, c: d * mul, name }); b.adj.push({ to: a, d, c: d * mul, name });
    }
  }
  return nodes;
}

/* nearest graph node to a lat/lon, optionally restricted to a street name */
function nearest(nodes, lat, lon, nameRe) {
  let best = null, bd = Infinity;
  for (const n of nodes.values()) {
    if (nameRe && !n.adj.some(e => nameRe.test(e.name))) continue;
    const d = haversine([lat, lon], [n.lat, n.lon]);
    if (d < bd) { bd = d; best = n; }
  }
  return best ? { node: best, off: bd } : null;
}

/* The node where two named streets meet, nearest a hint point. */
function crossing(nodes, reA, reB, hint) {
  let best = null, bd = Infinity;
  for (const n of nodes.values()) {
    let a = false, b = false;
    for (const e of n.adj) { if (reA.test(e.name)) a = true; if (reB.test(e.name)) b = true; }
    if (!a || !b) continue;
    const d = hint ? haversine(hint, [n.lat, n.lon]) : 0;
    if (d < bd) { bd = d; best = n; }
  }
  return best;
}

/* Dijkstra with a binary heap */
function route(nodes, from, to) {
  const dist = new Map([[from.k, 0]]), real = new Map([[from.k, 0]]), prev = new Map();
  const heap = [[0, from]];
  const push = x => { heap.push(x); let i = heap.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop();
    if (heap.length) { heap[0] = last; let i = 0;
      for (;;) { const l = 2*i+1, r = l+1; let s = i;
        if (l < heap.length && heap[l][0] < heap[s][0]) s = l;
        if (r < heap.length && heap[r][0] < heap[s][0]) s = r;
        if (s === i) break; [heap[s], heap[i]] = [heap[i], heap[s]]; i = s; } }
    return top; };
  const done = new Set();
  while (heap.length) {
    const [d, n] = pop();
    if (done.has(n.k)) continue;
    done.add(n.k);
    if (n === to) break;
    for (const e of n.adj) {
      const nd = d + e.c;
      if (nd < (dist.get(e.to.k) ?? Infinity)) {
        dist.set(e.to.k, nd); real.set(e.to.k, real.get(n.k) + e.d);
        prev.set(e.to.k, [n, e.name]); push([nd, e.to]);
      }
    }
  }
  if (!done.has(to.k)) return null;
  const pts = [], streets = [];
  let cur = to;
  while (cur !== from) {
    pts.push([cur.lat, cur.lon]);
    const p = prev.get(cur.k);
    streets.push(p[1]); cur = p[0];
  }
  pts.push([from.lat, from.lon]);
  pts.reverse(); streets.reverse();
  return { pts, metres: real.get(to.k), streets };
}

/* ---- projection -------------------------------------------------------- */
function mercator(lat, lon) {
  return [lon, Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2)) * 180 / Math.PI];
}
/* Toronto's downtown survey grid runs about 16.3 degrees north of east, so
   every "straight" street is a diagonal on a north-up map.  Rotating the
   projection by that angle stands the letters upright and squares the grid. */
const GRID_BEARING = 16.3;

function rotator(deg) {
  const t = rad(deg), cos = Math.cos(t), sin = Math.sin(t);
  return (lat, lon) => {
    const [x, y] = mercator(lat, lon);
    return [x * cos + y * sin, -x * sin + y * cos];
  };
}

/* Fits an actual cloud of rotated points into w x h, preserving aspect. */
function fitTransform(xys, w, h, pad) {
  const xs = xys.map(p => p[0]), ys = xys.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.min((w - 2 * pad) / (x1 - x0 || 1e-9), (h - 2 * pad) / (y1 - y0 || 1e-9));
  const ox = pad + ((w - 2 * pad) - k * (x1 - x0)) / 2;
  const oy = pad + ((h - 2 * pad) - k * (y1 - y0)) / 2;
  return {
    k, x0, y0,
    xy: ([x, y]) => [ox + (x - x0) * k, h - oy - (y - y0) * k],
  };
}

/* Convenience: rotated projector fitted to a set of lat/lon points. */
function projectorFor(pts, w, h, pad, deg) {
  const rot = rotator(deg === undefined ? GRID_BEARING : deg);
  const fit = fitTransform(pts.map(p => rot(p[0], p[1])), w, h, pad);
  const f = (lat, lon) => fit.xy(rot(lat, lon));
  f.rot = rot; f.fit = fit;
  return f;
}

function projector(bbox, w, h, pad) {       // bbox = [south, west, north, east]
  const [s, we, n, e] = bbox;
  const p0 = mercator(s, we), p1 = mercator(n, e);
  const sx = (w - 2 * pad) / (p1[0] - p0[0]);
  const sy = (h - 2 * pad) / (p1[1] - p0[1]);
  const k = Math.min(sx, sy);
  const ox = pad + ((w - 2 * pad) - k * (p1[0] - p0[0])) / 2;
  const oy = pad + ((h - 2 * pad) - k * (p1[1] - p0[1])) / 2;
  return (lat, lon) => {
    const m = mercator(lat, lon);
    return [ox + (m[0] - p0[0]) * k, h - oy - (m[1] - p0[1]) * k];
  };
}

/* Chain a list of waypoint nodes into one continuous drawn path. */
function runRoute(nodes, waypoints) {
  const pts = [], streets = []; let metres = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const leg = route(nodes, waypoints[i - 1], waypoints[i]);
    if (!leg) throw new Error('no route for leg ' + i);
    metres += leg.metres;
    streets.push(...leg.streets);
    pts.push(...(i === 1 ? leg.pts : leg.pts.slice(1)));
  }
  return { pts, metres, streets };
}

module.exports = { haversine, loadWays, buildGraph, nearest, crossing, route, runRoute,
                   projector, projectorFor, rotator, fitTransform, mercator, GRID_BEARING };
