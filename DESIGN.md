---
name: SaudiSafe
description: Source-linked security and emergency news for Saudi Arabia, led by how fresh the data is.
colors:
  ground: "#f3f1ea"
  surface: "#ffffff"
  surface-2: "#e9e7de"
  ink: "#14201a"
  ink-2: "#4d5a52"
  line: "#dcdad0"
  board: "#0d3b2a"
  board-2: "#14503a"
  board-hover: "#1a5c43"
  board-ink: "#f3f1ea"
  board-ink-2: "#b9cfc2"
  lamp: "#f2c46b"
  lamp-ink: "#1b1607"
  brand: "#0b6e3d"
  ok: "#156b40"
  ok-bg: "#e0efe5"
  warn: "#8a5300"
  warn-bg: "#f8ebd2"
  bad: "#ad2a1f"
  bad-bg: "#f9e2de"
  board-ok: "#8fe0b0"
  board-warn: "#f2c46b"
  board-bad: "#ffab9f"
  ground-dark: "#0e1411"
  surface-dark: "#161e1a"
  surface-2-dark: "#1f2a24"
  ink-dark: "#e7ece8"
  ink-2-dark: "#a5b2aa"
  line-dark: "#2a3530"
  board-dark: "#0a2e21"
  board-2-dark: "#11432f"
  board-hover-dark: "#165339"
  brand-dark: "#4cc489"
  brand-ink-dark: "#06130b"
  ok-dark: "#6fd39f"
  ok-bg-dark: "#16301f"
  warn-dark: "#f0b75c"
  warn-bg-dark: "#33260f"
  bad-dark: "#ff9486"
  bad-bg-dark: "#3a1713"
typography:
  display:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans\", \"Noto Sans Arabic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "60px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontFeature: "\"tnum\""
  count:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans\", \"Noto Sans Arabic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1.25
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans\", \"Noto Sans Arabic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  title:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans\", \"Noto Sans Arabic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.375
  row-time:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans\", \"Noto Sans Arabic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.4
    fontFeature: "\"tnum\""
  body:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans\", \"Noto Sans Arabic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans\", \"Noto Sans Arabic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans\", \"Noto Sans Arabic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.43
    letterSpacing: "0.025em"
  caption:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Noto Sans\", \"Noto Sans Arabic\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  "1.5": "6px"
  "2": "8px"
  "2.5": "10px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-primary-dark:
    backgroundColor: "{colors.brand-dark}"
    textColor: "{colors.brand-ink-dark}"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.line}"
  icon-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    size: "40px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  slot:
    backgroundColor: "{colors.board-2}"
    textColor: "{colors.board-ink}"
    typography: "{typography.count}"
    rounded: "{rounded.md}"
    padding: "16px"
  slot-hover:
    backgroundColor: "{colors.board-hover}"
  slot-lit:
    backgroundColor: "{colors.lamp}"
    textColor: "{colors.lamp-ink}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  pill-unverified:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "1px 8px"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  nav-link-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
---

# Design System: SaudiSafe

## Overview

**Creative North Star: "The Freshness Board"**

SaudiSafe reads like a station time board set above a plain news desk. A deep Saudi-green band owns the top of the page and answers one question before any headline: how recent is this? Its slots are the time-window filter, and the current one is lit amber, the way the active slot glows on a departure board. Below it, the desk is bone paper: headlines in day-grouped rows, each led by a large tabular time, with the publisher always visible.

The system is flat, calm and dense. Rank comes from weight, case and tabular digits on a tight scale, not from colour, shadow or decoration. Everything is built for an anxious visitor on a phone who has to scan in seconds, so status never relies on colour alone, and nothing is labelled twice.

Light and dark themes share one structure. Dark mode deepens the ground and the green; the board text and the amber lamp stay the same.

**Key Characteristics:**
- A full-bleed green board band (and a matching green footer) bracketing a bone-paper desk.
- One lit amber slot; amber otherwise means only "stale or partial".
- Large tabular digits for the collection clock, slot counts and row times.
- Flat fields: no shadows, no gradients, depth from tone and 1-2px rules.
- Rows sit directly on the ground; panels are rare.

## Colors

A two-field palette: deep Saudi green and warm bone, with one amber lamp and a small set of semantic tones.

### Primary
- **Saudi Board Green** (board): the ground of the board band and the footer. The brand's green as a field, never as a tint. Also the `theme-color`.
- **Board Slot Green** (board-2, hover board-hover): unlit time-window slots, one step lighter than the band.
- **Desk Green** (brand; brand-dark in dark mode): the interactive green on the desk. Reload button, focus outline, caret, link underline and hover, "Clear filters", and "Safe" in the wordmark.

### Secondary
- **Lamp Amber** (lamp, with Lamp Ink as its text): the lit time-window slot. Board Warn uses the same amber for the board's status line when collection is delayed or coverage is partial.

### Neutral
- **Bone Ground** (ground; ground-dark): the page ground. Report rows and day headers sit directly on it.
- **Paper White** (surface; surface-dark): the sticky header, form controls and the two side panels.
- **Worn Bone** (surface-2; surface-2-dark): the Unverified pill, the "Show more" bar, nav hover and loading skeletons.
- **Desk Ink** (ink; ink-dark): headlines, times, publishers and day headers. Also the 2px rule under each day header.
- **Muted Ink** (ink-2; ink-2-dark): meta text, helper copy, icons and placeholders.
- **Hairline** (line; line-dark): 1px row dividers, control borders and panel row rules.
- **Board Bone / Board Sage** (board-ink, board-ink-2): primary and secondary text on the green band.

### Semantic
- **Ok / Warn / Bad** (ok, warn, bad, each with an -bg partner, plus dark variants): source-health status text on the desk and the tinted health notice above the feed. The warn notice shows only for delayed or partial coverage.
- **Board Ok / Board Warn / Board Bad**: the same three states, lightened for the green band's status line.

### Named Rules
**The One Lamp Rule.** Amber is used in only two places: the lit time-window slot, and the stale or partial-coverage state (the board status line and the warn notice). One slot is lit at a time. Amber never decorates, never marks a category and never highlights a headline.

**The Green Field Rule.** The board green is a flat field that owns its band from edge to edge. Never use it as a card tint, a gradient or a chip colour on the desk.

**The Never-Colour-Alone Rule.** Every status colour comes with an icon and a word ("Responding", "Updates delayed", "Partial coverage").

## Typography

**Body Font:** the system UI stack (system-ui, Segoe UI, Roboto, Noto Sans, Noto Sans Arabic, Helvetica Neue, Arial), so it can render Arabic.

**Character:** one family, ranked only by weight, case and tabular figures. Headlines use `dir="auto"` so Arabic titles run right to left in the same row grid.

### Hierarchy
- **Display** (700, 60px / 44px below sm, line-height 1, tight tracking, tabular): the "Last collection" clock on the board. Used once per page.
- **Count** (700, 44px / 28px below sm, tabular): report counts inside the slots.
- **Headline** (700, 20px, tight tracking): section titles such as "Latest reports". "How SaudiSafe works" goes up to 24px. Panel titles are 18px bold.
- **Title** (600, 18px / 17px below sm, snug 1.375): report headlines. Uses `text-wrap: pretty`.
- **Row Time** (700, 20px / 18px below sm, tabular): the HH:MM time that leads each row.
- **Body** (400, 15px): controls, notices and explanatory copy (relaxed leading in How it works, 46ch maximum in empty states).
- **Body Small** (400, 14px): meta lines, board sublines, panel copy.
- **Label** (700, 14px, uppercase, 0.025em tracking): day headers only.
- **Caption** (13px): pill text, source-health detail and the page footnote.

### Named Rules
**The Tabular Rule.** Every number that a visitor compares (clock, counts, row times) uses tabular figures, so columns stay still when values change.

**The Weight-and-Case Rule.** Hierarchy comes from weight (400/600/700), size steps on a tight scale, and the single uppercase role. No new colours or typefaces are added for emphasis.

## Layout

The page uses a centred container (1200px maximum) with 16px side gutters, or 24px from sm up. The board band and footer bleed full width, and their content sits on the same container.

- **Board:** stacked on phones. From lg it splits into a 380px column for the clock and status, plus the slot grid, aligned to the bottom. On every width the slots are one row of four, 6px apart (8px from sm). Phones use the short labels ("2 hours", "7 days"); wider screens use the full labels ("Past 2 hours").
- **Desk:** one column, then from lg a feed column plus a 340px aside (32px gap). Between sm and lg the two aside panels sit side by side under the feed.
- **Toolbar:** one row at xl and up (search, 190px category, 150px order, Reload). Below xl it takes two rows: search at full width, then category, order and Reload. Below sm, Reload shows only its icon.
- **Rows:** a fixed 64px time column (52px below sm) and a fluid content column, 16px apart, with 16px vertical padding and a 1px hairline between rows. State never breaks this grid.
- **Day headers:** stick 56px from the top, just under the header. They have 20px of space above and 8px below.
- **Rhythm:** 4px base. The common steps are 8, 10, 12, 16, 20, 24 and 32px. How it works opens with 64-80px of space above it.
- **Breakpoints:** sm 640px, lg 1024px, xl 1280px.

## Elevation & Depth

There are no shadows and no gradients. Depth comes from three things: tone (green band against bone ground, white panels against bone), 1px hairlines, and the 2px ink rule under day headers. The sticky header is separated from the page only by its white surface and a bottom hairline.

### Named Rules
**The Flat Field Rule.** Every surface is flat at rest and in every state. Hover changes a fill or a border colour, never elevation.

## Shapes

Corners are lightly softened. Controls, buttons, slots, notices and the logo tile use 6px. The two side panels use 8px. Pills are fully rounded. Skeleton bars and the focus outline use 4px. Borders are 1px hairlines, except the 2px ink rule under day headers. Rows have no outline; only their bottom hairline divides them.

## Components

### Buttons
Plain and solid, sized to tap.
- **Shape:** 6px corners, 40px tall.
- **Primary (Reload):** Desk Green fill with white text, 15px semibold, 12-16px side padding, refresh icon. In dark mode the fill turns to the light desk green with near-black ink. On hover the opacity drops to 90%. On press it moves down 1px. While loading, the icon spins and opacity drops to 60%.
- **Secondary (Show more):** full-width Worn Bone bar, 44px tall, semibold label with a muted "N not shown" count. On hover the fill becomes Hairline.
- **Icon (theme toggle):** 40px square, hairline border, Worn Bone fill on hover.
- **Text action (Clear filters):** Desk Green, semibold, underlined with a 3px offset.
- **Focus:** 2px Desk Green outline at a 2px offset. On the board it switches to the amber lamp.

### Time-window Slots (signature)
The board's slots are the time-window filter. Each slot is a toggle button with a label over a large tabular count, with 16px padding (10px below sm) and 6px corners.
- **Unlit:** Board Slot Green with sage label. On hover the fill steps to the hover green and the label turns to bone.
- **Lit:** Lamp Amber with Lamp Ink and a semibold label. It fades in from the slot green over 320ms when selected.

### Inputs / Fields
- **Style:** Paper White fill, 1px hairline border, 6px corners, 40px tall, 15px text. Search has a 16px inline icon on the left. The category and order selects use the same control style.
- **Hover / Focus:** the border darkens to Muted Ink on hover. Focus shows the global 2px Desk Green outline, and the caret is Desk Green.

### Report Row
A two-column row directly on the ground: large tabular time, then the headline with an up-right arrow icon for outbound links (hover turns it Desk Green and underlines it). Below the headline is the meta line.
- **Meta line:** it never wraps. The publisher (semibold ink) shrinks and truncates first, and the category always shows in full. "Developing" is hidden below sm. "Unverified" is a neutral Worn Bone pill.
- **Entry:** rows rise 6px and fade in over 260ms.

### Day Header
Uppercase, bold, wide-tracked 14px label on the ground colour, with the day's report count in muted medium weight on the right and a 2px ink rule beneath. Sticky under the header.

### Panels
Source health and Reading the labels are the only surface panels: Paper White, 8px corners, 20px padding, no border or shadow. Their rows are split by hairlines. Source health puts a status icon and word on the right of each row.

### Notices
Health notices above the feed use a 6px-cornered block in the state's -bg tint, with a state-coloured icon and ink text. A neutral notice uses Worn Bone. The page-wide "Not an official warning service" line is unboxed text with an info icon.

### Navigation
A sticky, 56px Paper White header with a bottom hairline. It holds the logo mark (32px tile on white) and the "Saudi**Safe**" wordmark (19px bold, "Safe" in Desk Green). Nav links are 15px medium Muted Ink, with a Worn Bone fill and ink text on hover. Below sm only "Reports" and the theme toggle remain.

### Footer
A full-bleed board-green band holding the wordmark ("Safe" in Board Ok), a sage disclaimer and an underlined "Back to top".

## Do's and Don'ts

### Do:
- **Do** keep amber to the lit slot and the stale or partial-coverage state (The One Lamp Rule).
- **Do** lead every number a visitor compares with tabular figures.
- **Do** set report rows directly on the bone ground, divided by 1px hairlines. Keep Paper White panels for side reference content.
- **Do** keep the row grid fixed: the time column (64px / 52px) never moves for state.
- **Do** pair every status colour with an icon and a word.
- **Do** keep the meta line on one line. Truncate the publisher before the category.
- **Do** honour reduced motion. Row rise, lamp fade and spinners switch off.

### Don't:
- **Don't** add shadows or gradients to any surface (The Flat Field Rule).
- **Don't** tint desk cards or chips with the board green. It stays a full-bleed field.
- **Don't** add colour or a second typeface for emphasis. Rank by weight, size and case.
- **Don't** label anything twice: the slots are the filter, so they get no separate "Filter" caption, and a count is not repeated beside its own heading.
- **Don't** use colours or wording that suggest official status, confirmation or safety.
