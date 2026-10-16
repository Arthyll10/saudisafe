import { useCallback, useEffect, useRef, useState } from 'react';

const zone = 'Asia/Riyadh';
const full = new Intl.DateTimeFormat('en-GB', { timeZone: zone, dateStyle: 'medium', timeStyle: 'short' });
const clockFormat = new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const dayKeyFormat = new Intl.DateTimeFormat('en-CA', { timeZone: zone });
const dayNameFormat = new Intl.DateTimeFormat('en-GB', { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long' });

const valid = value => Number.isFinite(Date.parse(value));
export const fullDate = value => valid(value) ? `${full.format(new Date(value))} AST` : 'Not available';
export const clock = value => clockFormat.format(new Date(value));
export const dayKey = value => dayKeyFormat.format(new Date(value));

export function dayLabel(value, now = Date.now()) {
  const key = dayKey(value), name = dayNameFormat.format(new Date(value));
  if (key === dayKey(now)) return `Today · ${name}`;
  if (key === dayKey(now - 86400000)) return `Yesterday · ${name}`;
  return name;
}

export function ago(value, now = Date.now()) {
  if (!valid(value)) return 'Not available';
  const minutes = Math.max(0, Math.floor((now - Date.parse(value)) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  const days = Math.floor(minutes / 1440);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export function safeLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

// Loads the saved snapshot, reloading every five minutes while the page is visible.
// A failed reload keeps the last good data and reports the failure.
export function useReports() {
  const [state, setState] = useState({ data: null, failed: false, loading: true, loadedAt: null });
  const busy = useRef(false);
  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true; setState(s => ({ ...s, loading: true }));
    try {
      const response = await fetch('/api/reports', { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Unavailable');
      const next = await response.json();
      if (!Array.isArray(next.reports) || !Array.isArray(next.sources)) throw new Error('Invalid response');
      setState({ data: next, failed: false, loading: false, loadedAt: Date.now() });
    } catch {
      setState(s => ({ ...s, failed: true, loading: false }));
    } finally { busy.current = false; }
  }, []);
  useEffect(() => {
    load();
    const id = setInterval(() => { if (!document.hidden) load(); }, 5 * 60000);
    return () => clearInterval(id);
  }, [load]);
  return { ...state, reload: load };
}

// Re-renders once a minute so relative times stay current.
export function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => { if (!document.hidden) setNow(Date.now()); }, 60000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    let saved; try { saved = localStorage.getItem('saudisafe-theme'); } catch {}
    return ['dark', 'light'].includes(saved) ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const toggle = () => setTheme(current => {
    const next = current === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('saudisafe-theme', next); } catch {}
    return next;
  });
  return [theme, toggle];
}
