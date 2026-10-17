/* Lists the street names meeting at the graph nodes nearest a point.
   Usage: node at.js <data-dir> <lat> <lon> [radiusMetres] */
'use strict';
const g = require('./geo.js');
const dir = process.argv[2];
const lat = +process.argv[3], lon = +process.argv[4];
const rad = +(process.argv[5] || 120);
const nodes = g.buildGraph(g.loadWays([dir + '/roads.json', dir + '/campus.json']));

const hits = [];
for (const n of nodes.values()) {
  const d = g.haversine([lat, lon], [n.lat, n.lon]);
  if (d > rad) continue;
  const names = [...new Set(n.adj.map(e => e.name).filter(Boolean))];
  if (names.length < 2) continue;
  hits.push([d, n, names]);
}
hits.sort((a, b) => a[0] - b[0]);
for (const [d, n, names] of hits.slice(0, 12)) {
  console.log(d.toFixed(0).padStart(4) + 'm  ' + n.lat.toFixed(5) + ', ' + n.lon.toFixed(5) + '   ' + names.join(' | '));
}
