// zero-dependency dev server: serves the repo statically and (unless
// NO_WATCH=1) runs `rollup -c --watch` alongside, so `npm run dev` is the
// whole local loop — edit src/, the bundle rebuilds, the page reloads itself
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/') {
    res.writeHead(302, { Location: '/dev/' });
    return res.end();
  }
  if (path.endsWith('/')) path += 'index.html';

  const file = normalize(join(root, path));
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end(`Not found: ${path}`);
  }

  const stat = statSync(file);
  res.writeHead(200, {
    'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Last-Modified': stat.mtime.toUTCString(),
    'Cache-Control': 'no-store',
  });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`\n  Modern Weather Card preview → http://localhost:${port}/dev/\n`);
});

if (!process.env.NO_WATCH) {
  const watcher = spawn('npx', ['rollup', '-c', '--watch'], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  });
  const stop = () => {
    watcher.kill();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
