# Route art — the UTRC letters

Draws each of the four runs as a letter on a real map of downtown Toronto.
Monday draws **U**, Wednesday **T**, Saturday 8K **R**, Saturday 5K **C**.
All four start on King's College Circle.

This folder is scratch work. The leading underscore keeps it out of
`make-deploy.js`, and nothing in `01_main` links to the pages it writes.

## Why the maps look straight

Toronto's downtown survey grid runs about **16.3° north of east**, so on a
north-up map every "straight" street is a diagonal and every letter comes out
italic. The projection is rotated by that angle (`GRID_BEARING` in `geo.js`),
which stands the letters upright and squares the backdrop. The north arrow on
each card is tilted by the same amount, so the map stays honest about it.

## The pipeline

```
node fetch.js                      # street geometry from Overpass -> ./data
node preview.js ./data [id]        # ASCII preview + per-leg distances
node build.js   ./data cards.json  # route + backdrop -> SVG geometry
node make-pages.js cards.json ../../01_main
```

`make-pages.js` writes two drafts into `01_main`, identical apart from the
backdrop:

| file | backdrop |
| --- | --- |
| `_join-routes-osm.html` | every street, real OSM geometry, three weights (~139 KB) |
| `_join-routes-grid.html` | named arterials only, each straightened to one line (~34 KB) |

Both read `join.html` at build time and replace only the routes section, so
rerunning after someone else edits that page picks their changes up. Neither
page touches `join.html` or `assets/css/style.css` — the extra CSS rides
inside each draft's own `<style>` block.

To screenshot a draft without the rest of the page:

```
node shot.js ../../01_main/_join-routes-osm.html ../../01_main out.html [dark]
chrome --headless=new --screenshot=shot.png --window-size=1260,1500 file:///…/out.html
```

## Changing a route

Routes live in `letters.js` as lists of real intersections; the router walks
actual pavement between them and reports the real distance. Add a variant with
a new id, look at it with `preview.js`, then point `PICK` in `build.js` at it.

Helpers: `probe.js` prints the coordinates of named intersections, and
`at.js <data> <lat> <lon> [radius]` lists the street names meeting near a
point — useful when a crossing fails to resolve because the name changes
there (Queen West becomes Queen East at Yonge, St. George becomes Beverley at
College, and so on).

## Caveats

- Distances are measured along the routed path, so they land near the run's
  name rather than exactly on it (the 8K measures 8.6 km).
- T and R cannot be drawn in one stroke, so part of each is run twice. The
  retraced stretch is counted twice in the distance and draws over itself on
  the card.
- Data is © OpenStreetMap contributors, ODbL. **If either backdrop ships, the
  live page needs that attribution.** Neither draft carries it yet.
