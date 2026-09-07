import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
const root = fileURLToPath(new URL('../dist-pages/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    );
    const file = path.resolve(
      root,
      '.' + (pathname === '/' ? '/index.html' : pathname),
    );
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (!(await stat(file)).isFile()) throw new Error('missing');
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('找不到這個頁面，請回到首頁。');
  }
});
server.on('error', (e) => {
  console.error(
    e.code === 'EADDRINUSE'
      ? `連接埠 ${port} 已在使用中，若網站已啟動，請直接開啟 http://localhost:${port}/`
      : '無法啟動：' + e.message,
  );
  process.exitCode = 1;
});
server.listen(port, '0.0.0.0', () => {
  console.log(`\n韻文時空館已啟動\n本機：http://localhost:${port}/`);
  for (const group of Object.values(os.networkInterfaces()))
    for (const address of group ?? [])
      if (address.family === 'IPv4' && !address.internal)
        console.log(`同網路平板：http://${address.address}:${port}/`);
  console.log('\n請保持這個視窗開啟；按 Control+C 停止。\n');
});
