import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import handler from './api/reports.js';

// Serves /api/reports during `npm run dev`. With REPORTS_ORIGIN set (for example
// https://saudisafe.vercel.app) it reads that deployment instead of local Redis.
const reportsApi = () => ({
  name: 'saudisafe-reports-api',
  configureServer(server) {
    server.middlewares.use('/api/reports', async (req, res) => {
      if (process.env.REPORTS_ORIGIN) {
        const upstream = await fetch(new URL('/api/reports', process.env.REPORTS_ORIGIN));
        res.statusCode = upstream.status; res.setHeader('Content-Type', 'application/json');
        return res.end(await upstream.text());
      }
      res.status = code => { res.statusCode = code; return res; };
      res.json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); };
      return handler(req, res);
    });
  }
});

export default defineConfig({
  root: 'web',
  plugins: [react(), tailwindcss(), reportsApi()],
  build: { outDir: '../dist', emptyOutDir: true },
  server: { host: '127.0.0.1', port: Number(process.env.PORT || 3000) }
});
