import { useState } from 'react';
import { CircleAlert, CircleCheck, Clock3, Info, Minus, Moon, Sun } from 'lucide-react';
import { sourceState } from '../../src/dashboard.js';
import { ago, fullDate } from './lib.js';

function Logo({ className = '' }) {
  // The mark ships at web/public/logo-mark.png; if it fails to load, only the wordmark shows.
  const [missing, setMissing] = useState(false);
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {!missing && <img src="/logo-mark.png" alt="" width="32" height="32" onError={() => setMissing(true)} className="size-8 rounded-md bg-white object-contain p-0.5" />}
      <span className="text-[19px] font-bold tracking-tight">Saudi<span className="text-brand">Safe</span></span>
    </span>
  );
}

export function Header({ theme, onTheme }) {
  const link = 'rounded-md px-3 py-2 text-[15px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink';
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6">
        <a href="/" aria-label="SaudiSafe home" className="rounded-md"><Logo /></a>
        <nav aria-label="Main" className="flex items-center gap-1">
          <a href="#reports" className={link}>Reports</a>
          <a href="#sources" className={`${link} hidden sm:inline-block`}>Sources</a>
          <a href="#how" className={`${link} hidden sm:inline-block`}>How it works</a>
          <button type="button" onClick={onTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="ml-1 inline-flex size-10 items-center justify-center rounded-md border border-line text-ink transition-colors hover:bg-surface-2">
            {theme === 'dark' ? <Sun aria-hidden="true" className="size-[18px]" /> : <Moon aria-hidden="true" className="size-[18px]" />}
          </button>
        </nav>
      </div>
    </header>
  );
}

const sourceIcon = { success: CircleCheck, warning: Clock3, danger: CircleAlert, neutral: Minus };
const sourceText = { success: 'text-ok', warning: 'text-warn', danger: 'text-bad', neutral: 'text-ink-2' };

export function SourceHealth({ sources, now }) {
  return (
    <section id="sources" aria-labelledby="sources-title" className="rounded-lg bg-surface p-5">
      <h2 id="sources-title" className="text-lg font-bold">Source health</h2>
      <p className="mt-1 text-sm text-ink-2">Result of the most recent check. A responding source does not verify its reports.</p>
      <ul className="mt-3">
        {sources.length ? sources.map(source => {
          const state = sourceState(source, now), Icon = sourceIcon[state.tone];
          return (
            <li key={source.name} title={`Checked ${fullDate(source.checkedAt)}. Last success ${fullDate(source.lastSuccessAt)}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 border-t border-line py-2.5 text-sm">
              <span className="truncate font-semibold">{source.name}</span>
              <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${sourceText[state.tone]}`}>
                <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.4} />{state.label}
              </span>
              <span className="col-span-2 text-[13px] text-ink-2">
                {source.ok
                  ? `${Number.isInteger(source.matchingCount) ? `${source.matchingCount} matching · ` : ''}checked ${ago(source.checkedAt, now).toLowerCase()}`
                  : `Last success: ${fullDate(source.lastSuccessAt)}`}
              </span>
            </li>
          );
        }) : <li className="border-t border-line py-3 text-sm text-ink-2">Source checks appear after the first collection.</li>}
      </ul>
    </section>
  );
}

export function Labels() {
  return (
    <section aria-labelledby="labels-title" className="rounded-lg bg-surface p-5">
      <h2 id="labels-title" className="text-lg font-bold">Reading the labels</h2>
      <p className="mt-3 text-sm font-semibold">Developing</p>
      <p className="mt-1 text-sm text-ink-2">Every report carries this label: reported by a publisher with a known publication time, not independently corroborated.</p>
      <details className="group mt-4 border-t border-line pt-3 text-sm">
        <summary className="cursor-pointer font-semibold marker:text-ink-2">Why no “confirmed” or “official” labels?</summary>
        <p className="mt-2 text-ink-2">Those need authenticated safety announcements or strong corroboration. SaudiSafe never assigns them automatically, and the same story at several outlets is not treated as confirmation.</p>
      </details>
    </section>
  );
}

export function Notice({ health }) {
  if (health.tone === 'success') return null;
  const style = { warning: 'bg-warn-bg text-warn', danger: 'bg-bad-bg text-bad', neutral: 'bg-surface-2 text-ink-2' }[health.tone];
  const Icon = health.tone === 'danger' ? CircleAlert : health.tone === 'warning' ? Clock3 : Info;
  return (
    <p role="status" className={`mt-4 flex gap-2.5 rounded-md px-3.5 py-3 text-[15px] ${style}`}>
      <Icon aria-hidden="true" className="mt-0.5 size-[18px] shrink-0" /><span className="text-ink">{health.detail}</span>
    </p>
  );
}

const HOW = [
  ['Collection', 'An automated job reads eleven publisher news feeds about every 15 minutes. Opening this page never starts a collection; it shows what was last saved.'],
  ['Filtering', 'A headline is kept only when it names a Saudi location and a security or emergency term, in English or Arabic. Opinion, analysis and anniversary pieces are left out. Matching is by keyword, so some reports are missed.'],
  ['Telegram alerts', 'New publisher reports from the last two hours can be sent to the operator’s Telegram channel, each at most once. Ask the operator for channel access.'],
  ['Locations', 'A city named in a headline does not prove where an event happened, so exact incident locations are never shown. No maps or tracking are produced.']
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="mx-auto max-w-[1200px] px-4 pb-6 pt-16 sm:px-6 sm:pt-20">
      <h2 id="how-title" className="text-2xl font-bold tracking-tight">How SaudiSafe works</h2>
      <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {HOW.map(([title, text]) => (
          <div key={title}><h3 className="text-base font-bold">{title}</h3><p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{text}</p></div>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mt-14 bg-board text-board-ink">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-8 sm:px-6">
        <p className="text-[19px] font-bold tracking-tight">Saudi<span className="text-board-ok">Safe</span></p>
        <p className="text-sm text-board-ink-2">Independent news monitoring. Not an official emergency service.</p>
        <a href="#top" className="text-sm font-medium underline underline-offset-[3px]">Back to top</a>
      </div>
    </footer>
  );
}
