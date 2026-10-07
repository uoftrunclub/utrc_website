/* ==========================================================================
   UTRC — build the publishable site

     node make-deploy.js              → public build (search engines welcome)
     node make-deploy.js --private    → adds noindex, for a team-only preview

   Rebuilds _deploy/ from 01_main. That folder IS the website root: its
   index.html is the homepage, so drag _deploy itself onto the host and the
   domain lands straight on the club site — no picker in front of it.

   It leaves behind everything that should not be on a web host: new-run.ps1,
   the READMEs, .gitignore, and the whole 00_early_drafts archive.

   Re-run it after any change to 01_main, then re-deploy.
   ========================================================================== */

const fs   = require('fs');
const path = require('path');

const ROOT    = __dirname;
const SRC     = path.join(ROOT, '01_main');
const OUT     = path.join(ROOT, '_deploy');
const PRIVATE = process.argv.includes('--private');

/* Files that never reach the host. A leading underscore marks scratch work --
   test harnesses and the like -- so it is excluded by convention. */
const DEV_FILE = n =>
  /\.(ps1|md)$/i.test(n) || n === '.gitignore' || n === 'README.txt' || n.startsWith('_');

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b);
    else if (!DEV_FILE(e.name)) fs.copyFileSync(a, b);
  }
}

function eachHtml(dir, fn) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) eachHtml(full, fn);
    else if (e.name.endsWith('.html')) fn(full);
  }
}

/* ---- build ------------------------------------------------------------- */
if (!fs.existsSync(SRC)) {
  console.error('\n  01_main not found. Run this from the project folder.\n');
  process.exit(1);
}

/* Empty the folder's contents rather than removing the folder itself: on
   Windows a directory cannot be deleted while any process has it open, and
   _deploy is exactly the folder you will have open in Explorer. */
fs.mkdirSync(OUT, { recursive: true });
for (const e of fs.readdirSync(OUT)) {
  fs.rmSync(path.join(OUT, e), { recursive: true, force: true });
}

copyDir(SRC, OUT);

/* ---- indexing ---------------------------------------------------------- */
let tagged = 0;
if (PRIVATE) {
  eachHtml(OUT, f => {
    let h = fs.readFileSync(f, 'utf8');
    if (h.includes('name="robots"')) return;
    h = h.replace('<meta name="viewport"',
                  '<meta name="robots" content="noindex,nofollow">\n<meta name="viewport"');
    fs.writeFileSync(f, h);
    tagged++;
  });
  fs.writeFileSync(path.join(OUT, 'robots.txt'),
    '# Team preview - not for indexing.\nUser-agent: *\nDisallow: /\n');
} else {
  fs.writeFileSync(path.join(OUT, 'robots.txt'),
    'User-agent: *\nAllow: /\n');
}

/* ---- report ------------------------------------------------------------ */
let files = 0, bytes = 0;
(function tally(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) tally(full);
    else { files++; bytes += fs.statSync(full).size; }
  }
})(OUT);

console.log('\n  _deploy rebuilt from 01_main');
console.log('  ' + files + ' files, ' + (bytes / 1048576).toFixed(1) + ' MB');
console.log(PRIVATE
  ? '  PRIVATE build - ' + tagged + ' pages marked noindex, robots.txt disallows all'
  : '  PUBLIC build - indexable. Check the club email and Instagram link are real.');
console.log('\n  Drag the _deploy folder onto https://app.netlify.com/drop\n');
