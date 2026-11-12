// 안전비서 — 로컬 미리보기용 정적 서버 (외부 패키지 없음)
// 사용: node tools/serve.cjs [포트]   → http://127.0.0.1:4180
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2] || process.env.PORT || 4180);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
http.createServer((req, res) => {
  /* 검수용: 브라우저에서 만든 장면 시트(PNG data URL)를 tools/.sheets/에 저장 — 로컬 전용 */
  if (req.method === 'POST' && req.url.startsWith('/__sheet/')) {
    const name = req.url.slice(9).replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'sheet';
    let body = ''; req.on('data', d => { body += d; if (body.length > 3e7) req.destroy(); });
    req.on('end', () => { const m = body.match(/^data:image\/(png|jpeg);base64,(.+)$/); if (!m) { res.writeHead(400); return res.end('bad'); }
      const dir = path.join(root, 'tools', '.sheets'); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, name + '.' + (m[1] === 'png' ? 'png' : 'jpg')), Buffer.from(m[2], 'base64')); res.writeHead(200); res.end('ok'); });
    return;
  }
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root) || /[\\/](tools|node_modules|\.git)[\\/]/.test(file)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}).listen(port, '127.0.0.1', () => console.log('안전비서 미리보기: http://127.0.0.1:' + port));
