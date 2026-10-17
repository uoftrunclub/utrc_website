/* Renders the route cards out of a draft page into a standalone harness, so a
   headless Chrome screenshot shows exactly the artwork and nothing else.
   Usage: node shot.js <draft.html> <01_main dir> <out.html> [theme] */
'use strict';
const fs = require('fs');
const path = require('path');

const draft = fs.readFileSync(process.argv[2], 'utf8');
const MAIN = process.argv[3];
const out = process.argv[4];
const theme = process.argv[5] || 'light';

const css = fs.readFileSync(path.join(MAIN, 'assets/css/style.css'), 'utf8');

const styleBlock = draft.match(/<style>[\s\S]*?<\/style>/);
const sec = draft.match(/<div class="grid grid--routes">[\s\S]*?\n    <\/div>/);
if (!styleBlock || !sec) throw new Error('could not pull the cards out of the draft');

/* The page JS is not loaded here, so the reveal and draw states are forced on. */
const harness = `<!doctype html>
<html lang="en" data-theme="${theme}" class="js">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${css}</style>
${styleBlock[0]}
<style>
  body{background:var(--bg);margin:0;padding:28px}
  [data-reveal]{opacity:1 !important;transform:none !important;animation:none !important}
  .route__map .line{stroke-dashoffset:0 !important;animation:none !important}
  .grid--routes{max-width:1180px;margin:0 auto}
</style>
</head>
<body>
${sec[0]}
</body>
</html>`;

fs.writeFileSync(out, harness);
console.log('wrote ' + out);
