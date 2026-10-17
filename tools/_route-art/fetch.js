/* Downloads the street geometry the route art is built from.

   Two queries go to the public Overpass API: the road network that the
   letters are routed along, and the campus paths and service roads that
   connect King's College Circle to it (the circle itself is pedestrian-only
   since the Landmark Project, so without these the start is an island).

   The results land in ./data, which is gitignored — they are about 4 MB and
   regenerating them takes under a minute.

   Usage: node fetch.js [outDir]        default ./data  */
'use strict';
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, 'data');
const UA = 'utrc-site-routeart/1.0 (UTRC website build script)';

const QUERIES = {
  'roads.json': `[out:json][timeout:180];
(
  way(43.6400,-79.4260,43.6830,-79.3680)["highway"~"^(trunk|primary|secondary|tertiary|residential|unclassified|living_street|pedestrian|trunk_link|primary_link|secondary_link|tertiary_link)$"];
);
out geom;`,
  'campus.json': `[out:json][timeout:120];
(
  way(43.6560,-79.4050,43.6700,-79.3880)["highway"~"^(footway|path|service|steps|cycleway|track)$"];
);
out geom;`,
};

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, q] of Object.entries(QUERIES)) {
    process.stdout.write(`fetching ${name} ... `);
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: q }),
    });
    if (!res.ok) throw new Error(`Overpass returned ${res.status} for ${name}`);
    const text = await res.text();
    const n = JSON.parse(text).elements.length;      // fail loudly on a truncated body
    fs.writeFileSync(path.join(OUT, name), text);
    console.log(`${n} ways, ${(text.length / 1024 / 1024).toFixed(1)} MB`);
  }
  console.log('\ndata in ' + OUT);
}

run().catch(e => { console.error('\n' + e.message); process.exit(1); });
