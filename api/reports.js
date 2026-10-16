import { Store } from '../src/store.js';
import { recentReports } from '../src/dashboard.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
  try {
    const snapshot = await new Store().get('snapshot');
    if (!snapshot) return res.status(200).json({ reports: [], sources: [], lastSuccessAt: null, stale: true, notice: 'No monitoring run has completed yet.' });
    const { notifications, ...publicData } = snapshot;
    return res.status(200).json({ ...publicData, reports: recentReports(snapshot.reports), stale: !snapshot.lastSuccessAt || Date.now() - Date.parse(snapshot.lastSuccessAt) > 45 * 60000 || snapshot.sources.some(s => !s.ok) });
  } catch { res.setHeader('Cache-Control', 'no-store'); return res.status(503).json({ error: 'Report storage unavailable. Monitoring may not be configured.' }); }
}
