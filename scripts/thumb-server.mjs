// 썸네일 받기 서버 (개발용)
// 1) node scripts/thumb-server.mjs  2) 브라우저에서 http://localhost:5173/?live&save#/ 열기
// 갤러리가 3D로 새로 그린 완성 그림을 thumbs/작품.webp 로 저장한다.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const out = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'thumbs');
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.end();
  const name = decodeURIComponent(req.url.slice(1)).replace(/[^\w.-]/g, '');
  if (!/^[\w-]+\.webp$/.test(name)) { res.statusCode = 400; return res.end('bad name'); }
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    fs.writeFileSync(path.join(out, name), Buffer.from(body.replace(/^data:image\/\w+;base64,/, ''), 'base64'));
    console.log('저장:', name);
    res.end('ok');
  });
}).listen(5199, () => console.log('썸네일 받기 서버: http://localhost:5199'));
