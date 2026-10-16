---
version: 1
slug: "web-index-html"
primary_target: "web/index.html"
related_targets: []
---

# News desk (home page)

Scope: the single dashboard page at `/`. Mode: Operate.

Audience and task: residents of Saudi Arabia and family abroad, mostly on phones, checking within seconds whether anything has been reported recently, by whom, and how fresh the data is. Constraints: same-origin CSP (no CDN, fonts or remote images), English UI, Arabic headlines RTL, free hosting, never implies official status.

## Direction contract

THESIS: Freshness is the headline. The page opens on a board that answers "how recent is this?" before any headline; it refuses the stat-tile row over a card feed.

OWN-WORLD: Deep Saudi green board band (#0d3b2a ground, #14503a slots), bone ground (#f3f1ea) for the desk, one lit amber slot (#f2c46b), large tabular digits, tight weight-and-case type scale, flat fields with no shadows or gradients.

STORY: The visitor sees when news was last collected and how many reports fall in each time window, taps a window to narrow the feed, scans day-grouped rows with publisher and time, and opens the source.

FIRST VIEWPORT: Plain nav (logo, Reports, Sources, How it works, theme). Green board band: last-collection clock with status line left; four slot cells (2h, 6h, 24h, 7 days) with counts right, the active one amber. Below: toolbar (search, category, order), day-grouped rows with large times, source health aside.

FORM: Time-slot board, position 4 of the grounded list; seed:36b70ef89392d752. Signature move: the slot cells are the time-window filter, lit like the current slot on a time board.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Raises kept from declined challengers: fixed row columns where state never breaks the grid (Split-flap Concourse); the green board as a flat field owning its band (Garden Guide Map); rank by weight and case on a tight scale (Timetable Slide Rack); nothing labelled twice (Catalog Sleeve).
