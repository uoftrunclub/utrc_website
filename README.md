# UTRC — University of Toronto Run Club website

The live site is **`01_main/`**. Everything else here is history or tooling.

```
01_main/            the website
00_early_drafts/    the five directions we did not take
_deploy/            generated — what you upload
reference/          source material (logo, partnership deck, style refs)
serve.js            local preview
make-deploy.js      builds _deploy from 01_main
prompts.txt         the original brief
```

## Preview it locally

```
node serve.js
```

Then open <http://localhost:8080/>. That serves `01_main` as the root, exactly
the way the live host will — the domain lands straight on the homepage, with no
picker in front of it.

To look at an old draft:

```
node serve.js 8080 00_early_drafts
```

## Publish it

```
node make-deploy.js
```

That rebuilds `_deploy/` from `01_main`, leaving out the things that should not
sit on a web host — `new-run.ps1`, the READMEs, `.gitignore`. **`_deploy` is the
site root**: drag the folder itself onto <https://app.netlify.com/drop> and the
domain serves the homepage directly.

Re-run it after any change, then re-deploy. On Netlify you can drag onto an
existing site's Deploys tab to update the same URL.

For a team-only preview that search engines will ignore:

```
node make-deploy.js --private
```

## Posting run photos

Drop a dated folder into `01_main/gallery/`:

```
01_main\gallery\2026-10-05-monday-5k\
```

then run `01_main\new-run.ps1`. It rebuilds `gallery/runs.js`, which is what the
run log reads. Folder names are `YYYY-MM-DD-some-title`; the title becomes the
post heading and the date drives the sort. Re-run `make-deploy.js` afterwards.

## Before the domain goes live

These are still placeholders or unverified — all flagged in `01_main/README.md`
and in `VERIFY` comments in the HTML:

- **Club email and Instagram URL** — `hello@utrc.ca` and `instagram.com/utrc`,
  in the `SITE` block at the top of `01_main/assets/js/main.js`. They are live
  links on every page.
- **Exec roster** — transcribed from the 2025/26 partnership package.
- **FAQ answers** — drafted from the deck and Instagram. Confirm the fee,
  eligibility and cancellation lines.
- **Gallery photos** — samples pulled from the partnership deck and dated to
  recent Mon/Wed/Sat slots. Those photos were not taken on those dates.

`races.html` and `merch.html` are finished pages that are currently hidden from
the nav. They still deploy, so they are reachable by direct URL. To bring them
back, un-comment the two entries in the `nav` array in
`01_main/assets/js/main.js`.

## The archive

`00_early_drafts/` holds the five directions that were not chosen, plus the
picker page that used to compare them. Open `00_early_drafts/index.html` to see
them side by side; its links still work. Nothing in there is published.

| Folder | Direction |
|---|---|
| `01_main_draft/` | Street-poster red — black ground, brand red, oversized skewed caps |
| `02_night_run_neon/` | Night-run neon — near-black, cinematic, everything glows |
| `03_editorial_white/` | Clean editorial white — the original one-page style study |
| `04_retro_race_bib/` | Retro race-bib — aged paper, slab type, bib maker, pace chart |
| `06_editorial_full/` | Clean editorial — the full build of draft 03 |
