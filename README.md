# SaudiSafe

Independent Saudi Arabia emergency news monitoring. **Not an official warning system. Missing reports do not mean an area is safe.**

## Run locally

Use Node.js **22 LTS**. The project pins Node 22 for consistent local, GitHub Actions, and Vercel execution. With nvm installed, run `nvm use`.

```sh
npm ci
cp .env.example .env
# Fill .env with your credentials; never commit it.
npm test
npm run build
npm run dev
# In another terminal, after configuring Telegram and Redis:
npm run telegram:test
npm run monitor
```

Open http://127.0.0.1:3000. Without credentials the dashboard shows a truthful unavailable state. The test command sends an explicitly labeled test, not an incident. The first successful monitor run baselines existing eligible reports without sending them. Later runs notify new eligible articles. A ten-minute Redis run lock prevents overlapping jobs; manual reruns inside that window fail safely.

## External setup

1. Create a free Upstash Redis database. Copy its HTTPS REST URL and token to `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
2. In Telegram, open the verified **@BotFather**, run `/newbot`, and save its token as `TELEGRAM_BOT_TOKEN`. Start a private chat with your bot and send it a message, or add it as a channel administrator with permission to post.
3. Use Telegram’s official `getUpdates` endpoint locally to find `message.chat.id` or `channel_post.chat.id`. Avoid sharing the token or placing it in screenshots, browser history, repository files, or logs. Set `TELEGRAM_CHAT_ID` to that numeric ID (including any minus sign); a public `@channelusername` also works. A bot with an existing webhook must have that webhook removed before polling getUpdates. See [Telegram’s bot tutorial](https://core.telegram.org/bots/tutorial) and [Bot API](https://core.telegram.org/bots/api).
4. Run `npm run telegram:test`; verify receipt in your intended chat.

## GitHub + Vercel deployment

1. Push this project to a GitHub repository. Add the four variables from `.env.example` as repository **Actions secrets**. Enable Actions and manually run **Monitor news** from the default branch.
2. Import the repository into Vercel, choose **Other**, Node.js 22, and keep the included build/output configuration. Set only the two Upstash variables in Vercel; preferably use Upstash's read-only REST token there. Telegram secrets are only needed by GitHub Actions.
3. Deploy. Visit `/api/reports` and the dashboard, inspect source connectivity, and verify the Actions run summary/log. No public write or scheduler endpoint exists.
4. Scheduling runs at minutes 7, 22, 37, and 52 independently of visitors. Keep Actions failure notifications enabled. Check quotas and source health periodically.

Use a public repository with standard GitHub-hosted runners to minimize cost. Private repository minutes can exceed free allowances at 96 runs/day. Scheduled jobs may be delayed or dropped and run only on the default branch; public-repository schedules may be disabled after inactivity. Vercel Hobby eligibility and Upstash/GitHub quotas still apply: ₱0 is a target, not a guarantee. No Vercel cron is used. Review [GitHub schedules](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [Actions limits](https://docs.github.com/en/actions/reference/limits), [Vercel Hobby](https://vercel.com/docs/plans/hobby), and [Upstash pricing](https://upstash.com/pricing/redis) before enabling.

## Architecture and accuracy

- `src/collector.js`: fixed GDELT DOC endpoint plus BBC Middle East, Al Jazeera English and Arabic RSS. Article hosts are allowlisted in `src/sources.js`. Only fixed source endpoints are fetched; article URLs are never fetched. Redirects are rejected, requests time out, response sizes are limited, and collection retries are bounded. RSS XML with DTD/entities is rejected.
- `src/normalize.js`: conservative bilingual headline filtering. Saudi location and emergency terms must both occur in the headline. Publication dates must be within seven days. This misses relevant reports and can still match commentary; it is not semantic verification.
- Each run searches GDELT over the past seven days (up to 250 discovery results) and accepts RSS reports published within the past seven days. This is a rolling window, not a calendar-day archive. Feed depth, discovery limits, and outages can leave gaps.
- GDELT `seendate` is discovery time, **not** publication time. GDELT-only results are **Unverified**, explicitly show unknown publication time, and never trigger Telegram. RSS publication metadata is required for **Developing Report**. Alerts are limited to reports published within two hours. No automatic **Confirmed Report** or **Official Alert** labels: source reputation and repeated syndication do not prove an event.
- `src/monitor.js`: preserves cached reports on source failure; snapshots expire after seven days, reports are pruned to seven days on each run and when served/displayed, up to 500 reports. Source success timestamps and notification counts/errors are persisted. Each run considers at most 20 eligible reports. Redis article IDs and identical-headline IDs are retained 30 days; initialization lasts one year.
- Deduplication is atomic and **at most once**: IDs are claimed before sending. Telegram does not offer an idempotency key. Timeouts, crashes after claiming, and uncertain deliveries can lose a notification; they are not automatically resent. Only explicit 429 rejections are retried (up to three attempts, waits capped at 30 seconds). Distinct headlines about the same event may still generate multiple notifications; cross-language/event-level deduplication is not reliable in this MVP.
- `api/reports.js`: read-only Redis snapshot; no news collection on page visits. CDN caches responses for 60 seconds with five-minute stale revalidation. UI refreshes every five minutes while visible and flags data older than 45 minutes or partial source failures. If storage fails, the open page retains its last successful load. No offline persistence across page reloads.
- Exact incident location is intentionally unset: headline mentions do not establish incident location. Region filters will require a trustworthy structured location source. No precise military locations, tracking, or maps are generated.

Source feeds and GDELT may fail or rate-limit. No credentials or sample news are shipped. Test fixtures are isolated in `tests/`. Production delivery, source availability, and hosted operation must be verified with your accounts. Source outages are visible; all-source failures and Telegram failures produce a failed workflow. GitHub logs record failures before storage becomes available; an unavailable Redis cannot persist a run status.

## Maintenance

Run `npm test` after changes. Review allowlists, feed URLs, GitHub Actions dependencies, security updates, and free-tier usage regularly. Never promote unverified reports automatically. Do not reset deduplication keys to retry an uncertain delivery without manually checking the Telegram chat.

## Implementation verification

Local checks on 11 October 2026: clean `npm ci`, static build, and 14 automated tests passed. The suite uses isolated mocked services for delivery, storage, outages, and retries; it does not send messages. Browser checks covered the unconfigured dashboard, theme switching, and filter selection. Live collection reached BBC, Al Jazeera English, and Al Jazeera Arabic after correcting the Arabic feed redirect. GDELT failed during the check; its failure is isolated and reported. Actual Redis persistence, Telegram delivery, GitHub scheduling, and Vercel deployment require your external account setup and remain unverified.

## Dashboard controls

Search headlines/publishers, filter by category or information status, select seven days / 24 hours / six hours / two hours, and sort newest or oldest first. Time windows use publication time where known and clearly labeled discovery time otherwise. The rolling seven-day feed is bounded at 500 saved reports; feeds may not supply a complete archive. Telegram eligibility remains limited to two-hour-old publisher reports.

Source health uses icons, explicit text, and color: Responding (check), Unavailable (exclamation), and Check overdue (clock after 45 minutes). No source check means Not checked. Collection status distinguishes first-run, partial coverage, delayed collection, and a page connection failure. Reload reports reads stored news; it does not run the collector. Animations respect reduced-motion preferences.

The monitor prints per-source progress so a slow feed is distinguishable from a stalled run. For a second local preview, use `PORT=3001 npm run dev`. Restart an already-running dev server after updating this version so it can serve the new dashboard module.

UI/history update verification: 21 automated checks passed, including saved seven-day retention, expiration, discovery-only time filtering, combined search/filter/sort, and overdue source checks. The build passed. Browser checks used the configured read-only snapshot and covered search, time filters, clear filters, desktop/mobile layouts, and both themes; no Telegram notification was sent during these UI checks.

## News source coverage

Eight publisher feeds supplement GDELT discovery:

| Feed | Coverage / language | Publisher feed |
| --- | --- | --- |
| BBC Middle East | Regional / English | https://feeds.bbci.co.uk/news/world/middle_east/rss.xml |
| Al Jazeera English | Regional / English | https://www.aljazeera.com/xml/rss/all.xml |
| Al Jazeera Arabic | Regional / Arabic | Configured publisher RSS URL in `src/sources.js` |
| Arab News | Saudi and international / English | https://www.arabnews.com/rss.xml |
| Asharq Al-Awsat English | Regional / English | https://english.aawsat.com/feed |
| Asharq Al-Awsat Gulf | Gulf / Arabic | https://aawsat.com/feed/gulf |
| Al Bilad | Saudi local reporting / Arabic | https://albiladdaily.com/feed/ |
| Middle East Eye | Regional / English | https://www.middleeasteye.net/rss |

All feed results still need a Saudi location and security/emergency keyword in the headline, a valid recent publication time, and a URL from that feed's exact approved publisher hosts. A local publisher may have no matching headlines; the source panel shows a zero match count separately from connectivity. Regional publishers may syndicate the same underlying reporting; their presence does not establish independent confirmation. No feed automatically receives an Official Alert or Confirmed Report label.

Run `npm run sources:check` to fetch and validate the feeds without credentials, Redis writes, or Telegram messages. Run `npm run monitor` to save reports and process eligible notifications normally. New source rows appear after that collection is saved. Sources are configured centrally in `src/sources.js`; additional feeds should be checked for validity, publication dates, host ownership, and editorial identity before being added. Do not add arbitrary feed URLs through the public dashboard.

The five added feeds passed direct retrieval and RSS parsing checks on 14 October 2026. Saudi Gazette's probed RSS endpoint returned non-feed content, and Al Riyadh had a certificate validation error, so neither was enabled. No certificate checks or access protections were bypassed. Source availability and feed depth can change; a seven-day retention window does not guarantee seven days of backfill from every feed.

