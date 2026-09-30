/* ==========================================================================
   UTRC — local preview server
   Zero dependencies. Serves 01_main at http://localhost:8080, which is exactly
   how the live host will serve it: the site is the root, with no picker in
   front of it.

     node serve.js                            → 01_main on port 8080
     node serve.js 3000                       → 01_main on port 3000
     node serve.js 8080 00_early_drafts       → the old draft picker

   Ctrl+C to stop.
   ========================================================================== */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT = Number(process.argv[2]) || 8080;

/* The live site is 01_main. Pass a folder to preview something else. */
const SUB  = process.argv[3] || '01_main';
const ROOT = path.resolve(__dirname, SUB);

if (!fs.existsSync(ROOT)) {
  console.error('\n  No such folder: ' + SUB + '\n');
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/plain; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.pdf':  'application/pdf',
  '.woff': 'font/woff',
  '.woff2':'font/woff2'
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  /* Decode %20 etc. — this tree has folders with spaces in the name. */
  let pathname;
  try {
    pathname = decodeURIComponent(url.parse(req.url).pathname);
  } catch (_) {
    return send(res, 400, 'Bad request', TYPES['.txt']);
  }

  /* Resolve inside ROOT only, so a ../ in the URL cannot escape the folder. */
  const target = path.resolve(ROOT, '.' + pathname);
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
    return send(res, 403, 'Forbidden', TYPES['.txt']);
  }

  fs.stat(target, (err, stat) => {
    let file = target;

    if (!err && stat.isDirectory()) {
      file = path.join(target, 'index.html');   // /04_retro_race_bib/ → its index
    } else if (err) {
      const fallback = path.join(ROOT, '404.html');
      return fs.readFile(fallback, (e, buf) => e
        ? send(res, 404, 'Not found: ' + pathname, TYPES['.txt'])
        : send(res, 404, buf, TYPES['.html']));
    }

    fs.readFile(file, (e, buf) => {
      if (e) return send(res, 404, 'Not found: ' + pathname, TYPES['.txt']);
      const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
      send(res, 200, buf, type);
      console.log('  200  ' + pathname);
    });
  });
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error('\n  Port ' + PORT + ' is already in use.');
    console.error('  Try another one:  node serve.js ' + (PORT + 1) + '\n');
    process.exit(1);
  }
  throw e;
});

server.listen(PORT, () => {
  console.log('\n  UTRC  →  http://localhost:' + PORT + '/');
  console.log('  Serving: ' + SUB);
  console.log('  Ctrl+C to stop.\n');
});
