// Local production-build preview with SPA fallback; not a production hosting server.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist/front-end/browser');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/config.js') {
      response.setHeader('Content-Type', types['.js']);
      response.end(`window.JMS_CONFIG = ${JSON.stringify({ apiUrl: process.env.JMS_API_URL ?? 'http://localhost:8080' })};`);
      return;
    }
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) { response.writeHead(400); response.end(); return; }
    try { if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html'); }
    catch { if (extname(pathname)) { response.writeHead(404); response.end(); return; } file = resolve(root, 'index.html'); }
    response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
    response.end(await readFile(file));
  } catch { response.writeHead(500); response.end('Build the frontend before starting the preview.'); }
}).listen(4200, '127.0.0.1', () => console.log('JMS production-build preview: http://localhost:4200'));
