# UTRC — the live site

A static website. No build step, no framework, no dependencies. Open `index.html`
in a browser and it works.

This is the build the club chose: street-poster type on warm off-white paper,
with the club blue from the Under Armour tee alongside the logo red. It started
as a daylight rework of the original black street-poster draft, which is now in
`../00_early_drafts/01_main_draft/`.

It is served as the domain root — see the README one level up for previewing
and publishing.

---

## What changed from the original black draft

**The ground.** `#F7F5F0`, a warm off-white rather than pure white, so photographs
and the red both sit on it without glaring. Cards are pure white on top of it, and
alternating sections take a slightly deeper tint (`#EFEBE3`) to keep the rhythm the
black-and-paper alternation used to give.

**Blue.** `#284E91`, sampled straight off the club tee in `IMG_4326` — 93% of the
print pixels are exactly that value. It carries the secondary structural work:
the countdown, distance badges, section numbers, text links, race bibs, footer
headings, the Saturday run, the scroll-progress bar and half the exec cards. Red
still leads; blue is roughly a third of the colour on the page.

**Dark anchors.** The hero, the closing red panel and the footer stay dark on
purpose. Poster type needs something to push against, and without them the page
loses its weight. Each carries a red glow top-right and a blue one bottom-left.

**Two red values, two blue values.** Pure `#DC3220` on paper only reaches 4.26:1,
which fails for small text. Small red text uses `#C42B1B` instead — visually the
same red, actually readable. The same trick runs the other way on the dark
sections (`#E24433`), and blue has a lifted `#6E9BE8` for use on ink.

**Paper grain.** A single inline SVG turbulence multiplied over the page at 5%
opacity. It is what stops the large flat areas reading as plastic. Off in dark mode.

---

## The light/dark switch

There is a sun/moon button in the nav. It turns the *whole* site dark — not back
into draft 01, but into this design's own dark dress — and remembers the choice in
`localStorage`, so it survives page changes and repeat visits.

Colour is handled with two layers of custom properties in
[`assets/css/style.css`](assets/css/style.css):

1. A fixed palette (`--paper`, `--ink`, `--red`, `--blue`) that never changes.
2. Contextual tokens (`--bg`, `--fg`, `--surface`, `--line`, `--accent-2`) that
   flip depending on what you are sitting on.

Everything is written against layer 2, which is why a dark section is one class
(`.on-dark`) and an entire dark theme is one attribute (`<html data-theme="dark">`).
Nothing else in the stylesheet has to know.

**The site defaults to light**, and only goes dark if the visitor asks.

The choice has to be made before anything paints, or a returning dark-mode
visitor sees a white flash first — so it is made by a five-line script in each
page's `<head>` rather than in `main.js`. To follow the visitor's operating
system setting instead of defaulting to light, flip one word in that script:

```js
var PREFERS = true;     // was false
```

It appears once per page, so that is seven identical edits — a find-and-replace
for `var PREFERS=false` across the `.html` files does it in one go.

**To remove the switch entirely**, delete the one line in `buildHeader()` that
prints the `.tog` button. Everything else keeps working.

---

## Before you go live — three things to change

All three live in one place: the `SITE` block at the top of
[`assets/js/main.js`](assets/js/main.js). Change them once and every page updates.

```js
email:     'hello@utrc.ca',              // ← the real club inbox
instagram: 'https://instagram.com/utrc', // ← the real @handle URL
strava:    '',                           // ← optional; leave '' to hide the icon
```

The current values are **placeholders** and will not reach anybody.

---

## Pages

| File | What it is |
|---|---|
| `index.html` | Hero, live countdown, schedule, about, stats, exec team, latest runs, partners, contact |
| `runs.html` | Full run log — filter by day, jump by month, lightbox |
| `join.html` | New runner guide — how a run works, pace groups, routes, kit list, FAQ |
| `races.html` | Races on the calendar + the club results board |
| `merch.html` | Kit line-up and how drops work |
| `partners.html` | Sponsor pitch built from the partnership deck |
| `404.html` | Wrong-turn page |

Header and footer are generated from the `SITE.nav` list in `main.js`, so adding
a page means adding one line there, not editing seven files.

---

## Posting a run to the gallery

1. Make a folder inside `gallery/`, named with the date:

   ```
   gallery/2026-09-14-monday-5k/
   ```

2. Drop that run's photos and clips straight in. Phone photos are fine —
   orientation is read from the EXIF data, so portrait shots stay portrait.

3. Right-click **`new-run.ps1`** → **Run with PowerShell**.

That rebuilds `gallery/runs.js`, which is the only file the website reads.
Refresh the page and the run is at the top of the log, dated and tagged.

### Folder naming

| Folder | Becomes |
|---|---|
| `2026-09-14` | "Monday 5K" — title guessed from the weekday |
| `2026-09-14-monday-5k` | "Monday 5K" |
| `2026-10-31-halloween-night-run` | "Halloween Night Run", tagged **special** |

Monday, Wednesday and Saturday folders are tagged automatically from the date.
Any other weekday is tagged **special**, which is its own filter on the run log.
Saturday posts get a blue tag, matching the Saturday row on the schedule.

### Adding detail to a run

Drop a plain text file called `info.txt` inside a run folder:

```
title = Halloween Night Run
where = Queen's Park
type  = special
```

### Shortcuts

```powershell
.\new-run.ps1              # rebuild the gallery from whatever folders exist
.\new-run.ps1 -New         # create + open a folder for the next run date
.\new-run.ps1 -New -Date 2026-10-31 -Title "Halloween Run" -Type special
.\new-run.ps1 -Open        # rebuild, then open the run log in a browser
```

### Photo sizing

Resize the long edge to about **1800px** before dropping photos in, or the page
will be slow. The four sample runs already in `gallery/` are sized that way.
Videos work too (`.mp4`, `.webm`, `.mov`) and get a play badge on the tile.

---

## The sample runs

`gallery/` holds **four sample posts** built from photos found in the 2025/26
partnership deck, dated to recent Mon/Wed/Sat slots so you can see the layout
working. **They are placeholders — those photos are not from those dates.**

To clear them: delete the four folders inside `gallery/`, then run `new-run.ps1`.

---

## Things worth checking before launch

Search the HTML for `VERIFY` — every block drafted from the deck rather than
confirmed with you is flagged with a comment. Specifically:

- **Meeting points.** `SITE.schedule` says *Front Campus, King's College Circle*
  for Mon/Wed and *UC Steps* for Saturday, taken from your Instagram. Confirm.
- **Exec roster** on `index.html` is transcribed from the 2025/26 deck. Update
  the names for this year.
- **Pace bands** on `join.html` are a sensible default, not your actual groups.
- **FAQ answers** on `join.html` — especially the fee, eligibility and
  cancellation answers.
- **Race months** on `races.html` — real annual races, but confirm each year's date.
- **Kit prices** on `merch.html` are all "Drop soon" — set them when a drop is live.
- **Partner logos** are set as text. Drop real logo files into `assets/img/` and
  swap the `<div class="logo">Name</div>` for an `<img>` if you'd rather.

---

## Adding a race result

Open `races.html`, scroll to the `RACES` list at the bottom, add a line:

```js
const RACES = [
  { name:'Jane Doe', race:'TCS Toronto Waterfront Marathon 2026',
    dist:'Half marathon', time:'1:38:22', pb:true },
];
```

`pb: true` adds a red **PB** flag; `first: true` adds **1ST EVER**. Newest first.

---

## Putting it online

Both of these are free and neither needs a build step.

**Netlify (easiest).** Go to [app.netlify.com/drop](https://app.netlify.com/drop)
and drag this whole folder onto the page. You get a live URL in about ten seconds.
To update it later, drag the folder again — or connect it to GitHub for automatic
updates.

**GitHub Pages.** Push this folder to a repository, then Settings → Pages → deploy
from `main` / root. Free, and it takes a custom domain if the club has one.

Either way, everything is relative-path, so it works from any subdirectory.

---

## Notes

- Fonts (Anton, Archivo, Space Mono) load from Google Fonts, so the first paint
  needs a connection. Everything else is local.
- Respects `prefers-reduced-motion` — all animation, the cursor and the footprint
  trail switch off for anyone who asks for that.
- Works without JavaScript: content is visible; the animation, the gallery and the
  theme switch are lost, and the site stays light.
- The theme is applied by a tiny script in each page's `<head>`, before anything
  paints, so a returning dark-mode visitor never sees a white flash first.
- Text contrast clears WCAG AA in **both** themes, on every page — checked rather
  than assumed.
- The countdown is computed in `America/Toronto`, so it reads correctly no matter
  where the visitor is.
