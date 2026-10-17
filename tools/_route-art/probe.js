/* Prints the real coordinates of named intersections, so routes can be
   designed against the actual grid instead of from memory.
   Usage: node probe.js <data-dir> */
'use strict';
const g = require('./geo.js');
const dir = process.argv[2];
const nodes = g.buildGraph(g.loadWays([dir + '/roads.json', dir + '/campus.json']));

const R = s => new RegExp('^' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');

const pairs = [
  ['College Street', 'St. George Street', [43.6585, -79.3990]],
  ['College Street', 'Beverley Street', [43.6578, -79.3932]],
  ['College Street', "King's College Road", [43.6584, -79.3947]],
  ['College Street', 'Bay Street', [43.6608, -79.3855]],
  ['Dundas Street West', 'Beverley Street', [43.6545, -79.3927]],
  ['Queen Street West', 'Beverley Street', [43.6494, -79.3930]],
  ['Bloor Street West', 'St. George Street', [43.6672, -79.3993]],
  ['Bloor Street West', "Queen's Park", [43.6672, -79.3925]],
  ['Bloor Street West', 'Bathurst Street', [43.6650, -79.4103]],
  ['Bloor Street West', 'Spadina Avenue', [43.6665, -79.4035]],
  ['Bloor Street West', 'Avenue Road', [43.6700, -79.3955]],
  ['Bloor Street West', 'Yonge Street', [43.6700, -79.3860]],
  ['Bloor Street East', 'Yonge Street', [43.6705, -79.3860]],
  ['Hoskin Avenue', "Queen's Park", [43.6640, -79.3930]],
  ['Harbord Street', 'Spadina Avenue', [43.6625, -79.4028]],
  ['Harbord Street', 'Bathurst Street', [43.6615, -79.4103]],
  ['Harbord Street', 'Ossington Avenue', [43.6600, -79.4195]],
  ['Queen Street West', 'Bathurst Street', [43.6467, -79.4028]],
  ['Queen Street West', 'Ossington Avenue', [43.6435, -79.4195]],
  ['Queen Street West', 'Spadina Avenue', [43.6485, -79.3958]],
  ['Queen Street West', 'University Avenue', [43.6505, -79.3875]],
  ['Queen Street West', 'John Street', [43.6490, -79.3907]],
  ['Front Street West', 'John Street', [43.6440, -79.3905]],
  ['Front Street West', 'Bay Street', [43.6455, -79.3790]],
  ['Front Street East', 'Jarvis Street', [43.6487, -79.3718]],
  ['Carlton Street', 'Jarvis Street', [43.6625, -79.3738]],
  ['Carlton Street', 'Yonge Street', [43.6615, -79.3832]],
  ['Davenport Road', 'Bedford Road', [43.6755, -79.3990]],
  ['Dupont Street', 'Bedford Road', [43.6745, -79.3992]],
  ['Dupont Street', 'Christie Street', [43.6730, -79.4190]],
  ['Davenport Road', 'Yonge Street', [43.6790, -79.3885]],
  ['Davenport Road', 'Avenue Road', [43.6760, -79.3960]],
];

for (const [a, b, h] of pairs) {
  const n = g.crossing(nodes, R(a), R(b), h);
  const txt = n
    ? n.lat.toFixed(5) + ', ' + n.lon.toFixed(5) + '  off=' + g.haversine(h, [n.lat, n.lon]).toFixed(0) + 'm'
    : '-- NOT FOUND --';
  console.log(txt.padEnd(42), a + ' x ' + b);
}

const kcc = g.nearest(nodes, 43.66155, -79.39560, /^King's College Circle$/);
console.log('\nKCC start node:', kcc.node.lat.toFixed(5), kcc.node.lon.toFixed(5));
