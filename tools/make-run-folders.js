/* ==========================================================================
   UTRC — scaffold the Google Drive run folders

     node tools/make-run-folders.js
     node tools/make-run-folders.js 2027-01-04 2027-04-30
     node tools/make-run-folders.js 2026-10-10 2026-12-31 --days mon,wed,sat

   Builds the folder tree you upload to the club Drive: one folder per run
   date, each holding an empty `highlights` subfolder and a note saying what
   it is for. Drag the "UTRC Run Photos" folder it produces straight onto
   drive.google.com.

   With no arguments it starts at the next Mon/Wed/Sat and runs to the end of
   that year.

   Output goes to _drive-upload/ , which is gitignored. Git cannot track empty
   directories, so the tree is not worth committing — this script is. Re-run
   it next term for the next batch.
   ========================================================================== */

const fs   = require('fs');
const path = require('path');

const DOW  = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const ABBR = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

const ROOT       = path.join(__dirname, '..');
const OUT_PARENT = path.join(ROOT, '_drive-upload');
const DRIVE_NAME = 'UTRC Run Photos';

/* ---- arguments --------------------------------------------------------- */
const args  = process.argv.slice(2);
const flag  = n => { const i = args.indexOf('--' + n); return i < 0 ? null : args[i + 1]; };
const dates = args.filter(a => /^\d{4}-\d{2}-\d{2}$/.test(a));

const days = (flag('days') || 'mon,wed,sat')
  .split(',').map(s => ABBR[s.trim().toLowerCase().slice(0, 3)])
  .filter(d => d !== undefined);

if (!days.length) {
  console.error('\n  --days needs something like  mon,wed,sat\n');
  process.exit(1);
}

/* Parse as local midnight. new Date("2026-10-10") is UTC and lands on the
   previous day in Toronto, which would shift every folder name by one. */
function parseLocal(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

let start;
if (dates[0]) {
  start = parseLocal(dates[0]);
} else {
  start = new Date(); start.setHours(0, 0, 0, 0);
  while (!days.includes(start.getDay())) start.setDate(start.getDate() + 1);
}

const end = dates[1] ? parseLocal(dates[1]) : new Date(start.getFullYear(), 11, 31);

if (end < start) {
  console.error('\n  The end date is before the start date.\n');
  process.exit(1);
}

/* ---- the notes that ship inside the tree ------------------------------- */
const ROOT_NOTE = `UTRC RUN PHOTOS
===============

Every run gets a folder. Drop that run's photos in and they appear on the
run log on the website within a few hours. There is nothing else to do.


POSTING A RUN
-------------
1. Open the folder for that date, e.g.  ${iso(start)}-${DOW[start.getDay()]}
2. Drag that run's photos and videos in.
3. Done.


HIGHLIGHTS
----------
Every run folder has a  highlights  subfolder. Move your best two or three
shots in there and they lead the post, with the first one getting the large
feature tile. They lead on the homepage too, which shows the two most recent
runs.

MOVE photos in rather than copying them. A photo sitting in both places
would otherwise show up twice.


A RUN THAT ISN'T MON / WED / SAT
--------------------------------
Make the folder yourself, date first:

    2026-10-31-halloween-night-run

That becomes "Halloween Night Run" on the site, tagged as a special run. The
date drives the sorting; the words after it become the title.


WORTH KNOWING
-------------
- An empty folder posts nothing. Folders for runs that did not happen can be
  left alone or deleted, it makes no difference either way.
- Deleting a photo from here takes it off the website on the next sync. That
  is how you pull something down.
- Anything you put in a run folder goes public. There is no review step.
- Photos are resized and stripped of location data automatically. You do not
  need to shrink anything before uploading.
- The date in the folder name is what counts. If a folder says "monday" but
  the date falls on a Tuesday, the date wins and the sync logs a warning.
`;

const HIGHLIGHT_NOTE = `HIGHLIGHTS
==========

Move the best two or three photos from this run in here. They lead the post
on the website, and the first one gets the large feature tile.

Move them, don't copy them - a photo in both folders shows up twice.

Leave this folder empty if there is nothing to feature. Nothing breaks.
`;

/* ---- build ------------------------------------------------------------- */
const outRoot = path.join(OUT_PARENT, DRIVE_NAME);

if (fs.existsSync(OUT_PARENT)) {
  fs.rmSync(OUT_PARENT, { recursive: true, force: true });
}
fs.mkdirSync(outRoot, { recursive: true });
fs.writeFileSync(path.join(outRoot, 'README.txt'), ROOT_NOTE);

const made = [];
for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  if (!days.includes(d.getDay())) continue;
  const name = `${iso(d)}-${DOW[d.getDay()]}`;
  const dir  = path.join(outRoot, name);
  fs.mkdirSync(path.join(dir, 'highlights'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'highlights', 'README.txt'), HIGHLIGHT_NOTE);
  made.push(name);
}

/* ---- report ------------------------------------------------------------ */
const byMonth = made.reduce((a, n) => {
  const k = n.slice(0, 7); (a[k] = a[k] || []).push(n); return a;
}, {});

console.log(`\n  ${DRIVE_NAME} — ${made.length} run folders`);
console.log(`  ${made[0]}  to  ${made[made.length - 1]}\n`);
for (const [m, list] of Object.entries(byMonth)) {
  console.log(`    ${m}   ${String(list.length).padStart(2)} runs`);
}
console.log(`\n  Written to  _drive-upload/${DRIVE_NAME}`);
console.log('  Drag that folder onto drive.google.com to upload the whole tree.\n');
