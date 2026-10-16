import { useEffect, useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { filterReports, healthState, recentReports } from '../../src/dashboard.js';
import { plural, useNow, useReports, useTheme } from './lib.js';
import { Board, WINDOWS } from './Board.jsx';
import { Feed, Toolbar } from './Feed.jsx';
import { Footer, Header, HowItWorks, Labels, Notice, SourceHealth } from './Panels.jsx';

export default function App() {
  const { data, failed, loading, loadedAt, reload } = useReports();
  const now = useNow();
  const [theme, toggleTheme] = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [hours, setHours] = useState(168);
  const [limit, setLimit] = useState(30);

  const all = useMemo(() => recentReports(data?.reports || [], now), [data, now]);
  const counts = useMemo(() => Object.fromEntries(WINDOWS.map(w => [w.hours, filterReports(all, { hours: w.hours }, now).length])), [all, now]);
  const reports = useMemo(() => filterReports(all, { query, category, hours, sort }, now), [all, query, category, hours, sort, now]);
  // Start each new filter from the top 30 so the page stays short.
  useEffect(() => setLimit(30), [query, category, hours, sort]);
  const health = healthState(data, failed, now);
  const narrowed = !!(query.trim() || category);
  const filtered = narrowed || hours !== 168;
  const clear = () => { setQuery(''); setCategory(''); setHours(168); };
  const windowLabel = WINDOWS.find(w => w.hours === hours).label.toLowerCase();

  return (
    <div id="top">
      <a href="#reports" className="absolute -top-16 left-4 z-20 rounded-md bg-brand px-3 py-2 text-white focus:top-3">Skip to reports</a>
      <Header theme={theme} onTheme={toggleTheme} />
      <main>
        <Board data={data} health={health} counts={counts} hours={hours} onHours={setHours} now={now} />
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <p className="flex gap-2 py-3 text-sm text-ink sm:gap-2.5 sm:py-4 sm:text-[15px]">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-2 sm:size-[18px]" />
            <span><strong>Not an official warning service.</strong> Follow official authorities. A missing report does not mean an area is safe.</span>
          </p>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
            <section id="reports" aria-labelledby="reports-title" className="pt-1">
              <h2 id="reports-title" className="mb-3 text-xl font-bold tracking-tight">Latest reports</h2>
              <Toolbar query={query} setQuery={setQuery} category={category} setCategory={setCategory}
                sort={sort} setSort={setSort} onReload={reload} loading={loading} />
              {(!data || filtered) && (
                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-ink-2">
                  <p>{!data ? 'Loading reports…' : narrowed ? `${reports.length} of ${plural(counts[hours], 'report')} in the ${windowLabel} match` : ''}</p>
                  {filtered && <button type="button" onClick={clear} className="font-semibold text-brand underline underline-offset-[3px]">Clear filters</button>}
                </div>
              )}
              <p role="status" aria-live="polite" className="sr-only">{data ? `${plural(reports.length, 'report')} shown in the ${windowLabel}` : ''}</p>
              <Notice health={health} />
              <div aria-busy={loading} className="mt-1">
                <Feed reports={reports} total={all.length} data={data} failed={failed} loading={loading}
                  filtered={filtered} hours={hours} onClear={clear} now={now} limit={limit} onMore={() => setLimit(l => l + 30)} />
              </div>
              <p className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-line py-4 text-[13px] text-ink-2">
                <span>All times in Saudi Arabia (AST, UTC+3)</span>
                <span>{loadedAt ? `Page loaded at ${new Date(loadedAt).toLocaleTimeString('en-GB', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit' })} · reloads every 5 minutes` : 'Reloads every 5 minutes while open'}</span>
              </p>
            </section>
            <aside className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <SourceHealth sources={data?.sources || []} now={now} />
              <Labels />
            </aside>
          </div>
        </div>
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
