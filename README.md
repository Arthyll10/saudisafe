# SaudiSafe

**Live site: https://saudisafe.vercel.app**

SaudiSafe is an independent news monitor. It collects security and emergency reporting about Saudi Arabia from established news publishers and shows it in one place, always linking to the original article.

> **SaudiSafe is not an official warning system.** It does not verify events, and a missing report does not mean an area is safe. Always follow official authorities for emergency instructions.

## What you see on the site

- **Latest reports:** headlines from the past seven days that mention a place in Saudi Arabia together with a security or emergency term. Each card shows the publisher, the publication time in Saudi time (AST, UTC+3), a category and a link to the source.
- **Collection status:** when news was last collected and whether that is recent. If the last collection is more than 45 minutes old, the site says *Updates delayed*, because recent reporting may be missing.
- **Source health:** whether each news source responded on the last check and how many matching reports it provided. A source responding does not mean its reports are verified.
- **Filters:** search headlines or publishers, filter by category, choose a time window (7 days, 24 hours, 6 hours or 2 hours), and sort newest or oldest first.
- **Light and dark themes.** The page reloads saved reports every five minutes while it is open.

## How it works

1. **Collection.** About every 15 minutes, an automated job reads the news feeds listed below. Visiting the website never triggers a collection; the site only displays what the job last saved.
2. **Filtering.** A headline is kept only if it names a Saudi location (such as Saudi Arabia, Riyadh, Jeddah, Dammam or Mecca, in English or Arabic) *and* a security or emergency term (such as missile, drone, explosion, fire, evacuation or attack). Opinion columns, analysis, anniversaries, drills and some known false matches (such as motorsport "time attack" events and overseas relief flights) are excluded. Reports must have been published within the past seven days.
3. **Labelling.** Each report gets a category and is labelled a *Developing Report* (below). Nothing is labelled confirmed or official automatically.
4. **Storage and display.** Reports are saved for seven days and served to the website. If a source is down, earlier reports are kept and the outage is shown in Source health.
5. **Telegram alerts.** New publisher reports published within the last two hours can be sent to the operator's Telegram channel. Each article and each identical headline is sent at most once.

### Categories

| Category | Matches headlines about |
| --- | --- |
| Missile & drone | Missiles, drones, interceptions |
| Explosion & fire | Explosions, blasts, fires |
| Emergency | Evacuations, civil defence, floods, warnings |
| Security | Attacks, terrorism, security incidents |

### Information label

| Label | Meaning |
| --- | --- |
| **Developing Report** | Reported by a publisher with a known publication time. Not independently corroborated. |

*Confirmed* or *Official* labels would need authenticated safety announcements or strong corroboration, so SaudiSafe never assigns them automatically. The same story appearing at several outlets is not treated as confirmation, since outlets often share the same underlying reporting.

## News sources

| Source | Coverage | Language |
| --- | --- | --- |
| BBC Middle East | Regional | English |
| Al Jazeera English | Regional | English |
| Al Jazeera Arabic | Regional | Arabic |
| Arab News | Saudi and international | English |
| Asharq Al-Awsat | Regional | English |
| Asharq Al-Awsat Gulf | Gulf | Arabic |
| Al Bilad | Saudi local | Arabic |
| Middle East Eye | Regional | English |
| Saudi Gazette | Saudi local | English |
| The Guardian (Saudi Arabia) | International | English |
| The National | Gulf and regional | English |

Article links are accepted only from each publisher's own website.

## Limitations

- Matching is based on headline keywords, not on understanding the article. Relevant reports can be missed, and some commentary can still appear.
- Exact incident locations are not shown. A city named in a headline does not prove where an event happened. No maps, tracking or military locations are produced.
- Collection runs on a best-effort schedule and can be delayed. News feeds can fail or rate-limit, and feeds may not reach back a full seven days.
- Distinct headlines about the same event can appear as separate reports.

## Privacy and security

The website has no accounts, no tracking and no third-party scripts or fonts. It loads only its own files and reads a stored snapshot of reports. There is no public way to add sources or trigger collection. Article pages are never fetched; only the fixed news feeds are read.

## Running your own copy

Requires Node.js 22. The website is built with React, Tailwind CSS and Vite from `web/`; `npm run build` writes the static site to `dist/`.

```sh
npm ci
cp .env.example .env   # add your Upstash Redis and Telegram credentials; never commit this file
npm test
npm run dev            # opens the dashboard at http://127.0.0.1:3000 (Vite + React)
REPORTS_ORIGIN=https://saudisafe.vercel.app npm run dev  # preview with live data, no credentials
npm run sources:check  # checks the news feeds without saving anything or sending alerts
npm run monitor        # collects news, saves it and sends eligible alerts
```

To deploy:

- Host the site on Vercel with the two Upstash variables (a read-only token is recommended).
- Add all four variables from `.env.example` as GitHub Actions secrets so the **Monitor news** workflow can run.

GitHub's scheduler can skip runs, so for reliable 15-minute updates, have an external cron service call the workflow-dispatch API (`POST /repos/<owner>/<repo>/actions/workflows/monitor.yml/dispatches` with body `{"ref":"main"}`). It needs a fine-grained token limited to this repository with **Actions: Read and write** only.

Never reset the stored deduplication keys to resend an alert without first checking the Telegram channel manually.
