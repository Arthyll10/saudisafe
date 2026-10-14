import http from 'node:http';
import { readFile } from 'node:fs/promises';
import handler from '../api/reports.js';
const files = { '/': ['index.html','text/html'], '/styles.css': ['styles.css','text/css'], '/app.js': ['app.js','text/javascript'], '/dashboard.js': ['dashboard.js','text/javascript'] };
const port = Number(process.env.PORT || 3000);
const server = http.createServer(async (req,res) => {
  res.status = code => { res.statusCode = code; return res; };
  res.json = value => { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(value)); };
  if (req.url === '/api/reports') return handler(req,res);
  const file = files[req.url?.split('?')[0]]; if (!file) { res.statusCode = 404; return res.end('Not found'); }
  try { res.setHeader('Content-Type',file[1]); res.end(await readFile(new URL(`../public/${file[0]}`,import.meta.url))); } catch { res.statusCode=500; res.end('Unavailable'); }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Stop the earlier dev server, or use PORT=3001 npm run dev.` : 'Could not start the local server.');
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`SaudiSafe: http://127.0.0.1:${port}`));
