# The session intro — workshop notes

A full-screen intro that plays **once per browser session**: the UTRC mark
lands in the centre, the Nike swoosh draws itself in left to right, "Powered
by Nike" is uncovered underneath by the same gesture, then the whole panel
wipes off to the right and the site is there.

About **3.1 seconds** end to end. Click, scroll, Escape or the Skip button cut
it short at any point.

Right now it is **standalone** — nothing in `index.html`, `style.css` or
`main.js` has been touched, so it cannot collide with other work in progress.

---

## Look at it

```
node serve.js
```

Then <http://localhost:8080/_intro.html>.

That page is the intro running over a live `index.html` in an iframe, so the
hand-off you see is the real hand-off, not a mock-up of one. The bar at the
bottom-left replays it, slows it to ½ or ¼ speed for picking the timing
apart, and switches the size between 1× and 2.5×. It dims itself while the
intro runs so it stays out of the shot.

Both dials are kept in `localStorage`, because Replay reloads the page and
anything held only in the DOM would be lost with it — so a setting survives
Replay, and survives closing the tab and coming back to it. The restore has
to land *before* `_intro.js` starts, or the intro would play at one size and
snap to another; it does, because the dev script runs while the body is
parsing and the intro waits for `DOMContentLoaded` and then for the webfont.

The fallbacks for both come from the stylesheet rather than being written out
again in the page, so changing `--uintro-scale` in `_intro.css` still shows
through on a fresh visit.

> Opening `_intro.html` straight off disk shows the intro fine, but Chrome
> will not let a `file://` page frame another `file://` page, so the home page
> underneath comes up blank. Use the server.

---

## The files

| File | What it is |
|---|---|
| `_intro.html` | Test page. Scaffolding only — the iframe and the dev bar |
| `assets/css/_intro.css` | Every colour, size and duration. The whole look |
| `assets/js/_intro.js` | Builds the overlay, runs the sequence, holds the swoosh |
| `assets/img/_utrc-logo.svg` | The mark, as vector. See below |

The leading underscore is the repo's "not for the host" mark — `make-deploy.js`
skips anything starting with `_`, so none of these three reach `_deploy/` until
you want them to.

---

## Putting it on the real site

Two tags in a page's `<head>`. Nothing in the `<body>` — the script builds its
own markup:

```html
<link rel="stylesheet" href="assets/css/_intro.css">
<script src="assets/js/_intro.js"></script>
```

Plain `<script>`, **not** `defer`. It has to run while the `<head>` is still
parsing so it can paint an ink shield before the page does; otherwise a
returning visitor gets a frame of home page before the overlay arrives.

On `index.html` only, that is a 2-line change. If you ever want it on every
page, the same two lines go in each `<head>` — or add them to `buildHeader()`
in `main.js` and let the existing header machinery carry them.

To actually ship it, drop the underscores from the CSS and JS filenames (and
the references to them) so `make-deploy.js` stops skipping them. `_intro.html`
itself never ships — it is only a harness.

Options go on the script tag:

| Attribute | Default | What it does |
|---|---|---|
| `data-once` | `session` | `session` · `always` (every load, for testing) · `ever` (one play, forever) |
| `data-logo` | `assets/img/utrc-logo.png` | Where the mark lives |
| `data-skip` | `true` | `false` hides the Skip button |
| `data-auto` | `true` | `false` means it waits for `UTRCIntro.play()` |

It also fires `utrc:intro-done` on `document` when the overlay is gone, if you
ever want the hero to start its own animation off the back of it.

---

## The knobs

Everything lives in section 1 of `_intro.css`. Nothing is hard-coded anywhere
else — the JS reads the timing back out of these rather than keeping its own
copy, so this block is the only place the numbers exist.

**Colour.** The logo is drawn as the PNG, untouched, so it keeps its signature
orange. The rest was pulled off the site's dark ground to sit with it:

```css
--uintro-bg:#0B0B0C;              /* the hero's dark, exactly */
--uintro-swoosh:#F7F5F0;          /* --paper */
--uintro-credit:#D6D3CD;          /* --fg-soft on ink */
--uintro-credit-mark:#F7F5F0;     /* just the word "Nike" */
--uintro-glow:rgba(220,50,32,.30);   /* red bloom, top-right */
--uintro-glow-2:rgba(40,78,145,.20); /* club blue, bottom-left */
```

The two blooms are the same habit the hero, the closing panel and the footer
already have, which is most of why the panel reads as part of this site rather
than a splash screen bolted onto it.

**Size.** One knob:

```css
--uintro-scale:2;     /* 1 = the original drawing, 2 = double */
```

Everything else is proportional to it, so the stack keeps its shape at any
value. The mark's width carries the scale and the swoosh, both gaps and the
credit are all derived from that one length — change the number and the whole
composition resizes together. The dev bar on the test page has 1× / 1.5× /
2× / 2.5× buttons so you can compare without editing anything.

There is a height guard on the mark:

```css
--uintro-logo-w:min(calc(clamp(128px,18vw,224px) * var(--uintro-scale)), 52vh);
```

At 2× the stack is about 780px tall, which fits a 900px window but runs off a
short laptop one. Because every other size derives from this length, capping
it shrinks the whole composition evenly instead of cropping it. On a normal
desktop window the cap never bites and 2× is exactly 2×.

The credit takes the smaller of two terms — a rem-based one that governs
normally (so a visitor who has raised their browser font size still gets it)
and a mark-relative one that only takes over when the guard has shrunk the
mark, so the credit never sits at full size against a mark that is not.

**Timing.** `t-` is when a thing starts, `d-` is how long it runs, both
measured from the moment the overlay goes live:

```css
--uintro-t-logo:0ms;        --uintro-d-logo:560ms;
--uintro-t-swoosh:620ms;    --uintro-d-swoosh:700ms;
--uintro-t-credit:1180ms;   --uintro-d-credit:560ms;
--uintro-hold:620ms;        /* beat after the credit lands */
--uintro-d-exit:780ms;      /* the wipe off */
```

The 620ms before the swoosh starts is the "split second" after the logo —
it is the number to pull on first if the pacing feels wrong.

**The lean.** How far the wipe edge tilts off vertical. `0%` gives a straight
vertical wipe. There are two values because the lean is a percentage of the
element's *width* but shows up against its *height* — the swoosh box is wide
and tall, the credit line is wide and 19px short, so one number cannot serve
both:

```css
--uintro-skew:14%;          /* the swoosh, and the exit */
--uintro-skew-text:4%;      /* the credit line */
```

At these values both edges sit about 21° off vertical, which is square across
the swoosh's long arm — so the edge crosses the stroke rather than running
along it, and the low left tail is uncovered before the high right tip.

The exit leans the other way (its top edge leads rather than its foot). Flip
the sign in `@keyframes uintro-out` if you want all three leaning together.

---

## How the swoosh is drawn

It is an inline SVG path in `_intro.js`, not an image file — so it takes its
colour from CSS and there is nothing extra to load.

**It is not drawn by hand.** Two earlier attempts were, and both were wrong in
ways that are hard to see until you put them next to the real mark. The path
in the file now is the official swoosh, traced off the reference bitmap:

1. threshold the 5000px reference to a mask
2. walk the boundary (Moore neighbour) → a pixel-accurate contour
3. scale into a viewBox, then Douglas–Peucker at **0.22 units** — about 0.1%
   of the width, tight enough to stay faithful and coarse enough to iron out
   the single-pixel staircase
4. find the anchors that turn more than 48° — there are exactly two, the tip
   and the point of the tail — and keep those corners sharp
5. fit Catmull-Rom cubics between the rest

35 anchors, ratio 2.854:1, about 1.2KB of path data.

Step 5 has one trap worth knowing about. Catmull-Rom takes its tangent from
the neighbours either side, so where a long run meets a short one the tangent
dwarfs the short segment and the control point doubles back past its own
anchor — which puts a small loop in the outline. It showed up as a stray
sliver near the tail. Clamping each handle to a third of the span it actually
governs fixes it.

The `viewBox` covers the **curve**, not the anchors (`-0.16 -0.15 200.31
70.39`). Fitted curves bulge slightly past the points they run through and
`<svg>` clips to its viewBox, so the bounds are measured off the fitted
cubics, which is why the origin is slightly negative.

**To check a re-trace:** fill the path over the reference at ~55% opacity. If
any reference shows through, or any fill spills past it, the trace is off.
The current one covers it exactly.

The draw is a **fill wipe**, not a traced outline: an angled edge travels left
to right and uncovers a shape that is always solid. The swoosh and the credit
line share one `@keyframes uintro-wipe`, and the exit is the same idea at
full-screen scale, which is why the three read as one continuous gesture.

The clipped region is everything *behind* the leading edge, not a band around
it — the left side of the polygon is pinned off at `-40%` and only the right
side travels. That is what makes the shape stay once it has been drawn: a part
of the element the edge has passed is inside the region for good, and the
animation's `both` fill mode holds the last frame. Animating a narrow band
instead gives you a spotlight that sweeps across and takes the artwork with
it, which is exactly the bug this started as.

---

## The font wait

The credit is set in Space Mono, which arrives over the network. The intro is
only on screen for three seconds — so if it starts painting before the font
lands, the whole thing is read in fallback Consolas and the real face never
shows up. That is what made the first cut look smudged rather than typeset.

So `_intro.js` waits on `document.fonts.load()` before it starts. The ink
shield is already covering the page by then, so the wait costs nothing
visible. `FONT_WAIT` (700ms) caps it, so a slow or blocked font delays the
intro by a beat instead of holding the site hostage.

**If you move this to a page without the Space Mono link in its `<head>`**,
the wait resolves instantly and the credit falls back — so make sure whatever
page carries the intro also loads the font. Every page on the site already
does.

---

## The mark is vector now

`assets/img/_utrc-logo.svg`, built from `reference/00 UTRC Logo Orange.svg`.

The PNG was never low-resolution — 1234px is plenty. The problem was the
*ratio*: squeezed to 224px on screen, the thin diagonal tread stripes are
finer than the pixels left to draw them in, so they break up. No bitmap fixes
that at every size; a vector does.

**One real trap in the conversion.** The Inkscape export nests a group matrix
over a per-path `translate`, so pulling the raw `d` attributes out with a
regex gives you coordinates in the wrong space entirely — the first attempt
came out as a 208×147 smear around the origin instead of a 2000×2000 mark.
Rather than re-implement SVG's nesting rules, the flattening is done in the
browser: `getCTM()` hands back each path's full element-to-viewport matrix,
and an affine matrix maps a cubic's control points exactly, so the curves
survive being baked.

Relative commands are converted to absolute **before** anything is rounded.
Rounding a relative delta shifts everything after it and the error compounds
over hundreds of segments.

The result: 36KB of editor output down to 15.8KB (6.7KB gzipped), transforms
baked in, coordinates at whole units (0.05% of the box — about a tenth of a
pixel at display size), and the fifteen near-identical reds the auto-trace
left behind (`#DC3422`, `#DC3523`, `#DC3624` …) replaced by **one fill on the
root**. Change that single attribute to recolour the mark.

> Watch out for `--` inside the file's comment. SVG is XML, where a double
> hyphen inside a comment is illegal — it makes the whole document
> unparseable, and it fails as a *broken image*, not as an error anywhere you
> would think to look.

The underscore keeps it out of `_deploy` like everything else here. Dropping
it makes the mark available to the rest of the site, which would be worth
doing — the same crunch is on every page that draws the logo large.

---

## Why the animations hang off a class, not the state

Every element in the stack rests in a **hidden** base state — the mark at
`opacity:0; scale(.9)`, the swoosh and the credit fully clipped — and relies
on its animation's `both` fill mode to hold the finished frame once it has
played. That is the normal way to do this, and it has one sharp edge.

The animations are attached by `.uintro--go`, a class added to the overlay
once and never removed. They were originally attached by
`html[data-utrc-intro="running"]`, which looks equivalent and is not: the
moment the state turns to `exiting`, those selectors stop matching, the
animations are dropped, and **every element falls back to its hidden base
state**. The mark popped out of existence in a single frame instead of
leaving with the rest of the stack, and a skip during the wipes — before
`.uintro--settled` had pinned the swoosh and credit — took the whole
composition with it.

If you ever re-scope these rules, keep them on something that outlives the
state change.

---

## Why the credit is on its own layer

`.uintro__credit` carries `transform:translateZ(0)`, which looks like a stray
performance hack and is not one.

Light text on a dark ground is where Windows ClearType looks worst: it filters
across the LCD subpixels, so every stem picks up an orange edge on one side
and a blue one on the other. At 14px that stops reading as colour and starts
reading as a smudge. `-webkit-font-smoothing:antialiased` is a macOS-only
property and does nothing about it.

What does work on Windows is giving the text its own compositing layer — a
layer has no subpixel geometry to filter against, so the browser falls back to
plain greyscale antialiasing. `translateZ(0)` is the cheapest way to ask for
one. `will-change:transform`, `will-change:opacity` and `opacity:.999` all do
the same thing; this is just the least surprising of them.

Magnify the credit line 6× before and after if you ever want to see it: the
difference is obvious and it is entirely colour, not sharpness.

---

## Seeing it without a browser

`tools/` has no part in this, but worth recording: the animation can be shot
headlessly, which is how the swoosh and the font problem were actually found.

```
node serve.js 8099
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu ^
  --hide-scrollbars --virtual-time-budget=2000 ^
  --screenshot=shot.png --window-size=1440,900 ^
  http://localhost:8099/_intro.html
```

`--virtual-time-budget` fast-forwards the page clock and shoots when the
budget runs out, so changing that number walks you frame by frame through the
real animation — no freezing, no stubbing. Add `--user-data-dir=<folder>` and
run it twice to shoot with the webfont already cached, which is what a
returning visitor sees.

---

## Reduced motion

`prefers-reduced-motion: reduce` still shows the composition — a sponsor
credit nobody sees is worse than no animation — but it arrives whole and holds
for 1.5s instead of drawing. That is done purely by retiming the tokens, so
the sequencing logic is identical in both cases.

---

## Before this goes live

The swoosh and the words "Powered by Nike" are Nike trademarks. This is fine
as an internal mock-up, but putting it on the public site needs Nike's
sign-off, and they will almost certainly want their own asset and their own
clear-space rules rather than the path drawn here. Worth settling before the
design gets any more finished.
