# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React with Tailwind CSS (user's choice, October 2026), built to static files in `dist/` and deployed on Vercel. The Vercel content security policy allows only same-origin scripts, styles, images and connections, so no CDN scripts, web fonts or remote images may be loaded at runtime. `api/reports.js` is a Vercel serverless function; `public/dashboard.js` holds pure filtering logic shared with the API and tested in `tests/`.

## Users

Two groups, equally important, mostly on phones:

- People living in Saudi Arabia, including expatriate workers, checking whether security or emergency events have been reported near them.
- Family members abroad checking on the situation where their relatives live.

Both are often anxious, scanning quickly, and need to know what has been reported, by whom and how recently.

## Product Purpose

SaudiSafe collects security and emergency headlines about Saudi Arabia from established publishers, shows them in one place with the publisher and publication time, and links each to the original article. Optional Telegram alerts send new reports from the last two hours. Success means a visitor can tell within seconds whether there is recent reporting and how fresh the data is, without being misled into thinking it is official or complete.

## Positioning

An independent, source-linked aggregator that is explicit about its limits: it never labels a report confirmed or official, shows exactly when news was last collected, and states that a missing report does not mean an area is safe.

## Operating Context

- A scheduled GitHub Actions job (which can also be triggered externally, e.g. by cron-job.org) collects eleven RSS feeds about every 15 minutes and saves a snapshot to Upstash Redis.
- The website only reads that snapshot via `/api/reports`; visiting never triggers collection. The page reloads it every five minutes while open.
- Feeds can fail and scheduling can be delayed; the UI must show staleness (over 45 minutes) and per-source health honestly.

## Capabilities and Constraints

- Search headlines and publishers; filter by category (Missile & drone, Explosion & fire, Emergency, Security) and time window (7 days, 24 hours, 6 hours, 2 hours); sort newest or oldest.
- Report label: "Developing Report" (publisher reporting with a known time, not corroborated). The "Unverified" status still exists in code but no current source produces it.
- All times shown in Saudi time (AST, UTC+3).
- Light and dark themes with a remembered preference.
- Exact incident locations are never inferred or shown; no maps or tracking.
- Interface language: English only. Arabic headlines must render right-to-left correctly.
- Free tiers only (Vercel Hobby, GitHub Actions on a public repo, Upstash free, cron-job.org free).

## Brand Commitments

- Name: SaudiSafe.
- Keep a Saudi-style green as the brand colour (user requirement).
- Voice: calm, factual, plain English; never alarmist; always cautious about verification.
- Logo: supplied by the owner (green shield with Riyadh skyline and signal arcs). The cropped mark ships as `web/public/logo-mark.png` and `favicon.png`.

## Evidence on Hand

Live report data from `/api/reports` (real publisher headlines). There are no testimonials, user counts, partners or press, and none may be invented.

## Product Principles

1. Freshness and source are always visible before the headline is trusted.
2. Never imply official status, confirmation or safety.
3. Fast to scan on a phone under stress.
4. Honest about failure: stale data and source outages are stated plainly.
5. Free to run and private by default: no tracking, no third-party scripts.

## Accessibility & Inclusion

Readable by anxious visitors on small screens: status must not rely on colour alone, text must meet WCAG AA contrast in both themes, controls must be keyboard-accessible, and reduced-motion preferences must be respected.
