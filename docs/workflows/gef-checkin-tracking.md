# GEF Fellow Check-in Tracking

Tracks Global Expert Fellowship (GEF) fellows' physical attendance at Mox and
staff 1:1 conversation notes, with a staff dashboard and a Monday digest email.

## Who counts as a fellow

People linked (via the `Program` field) to any Programs record whose name
contains **"GEF"** or **"Global Expert"** (case-insensitive). A
"Global Expert Fellowship (GEF)" program record exists; link fellows to it as
they join. Cohort programs like "GEF Fall 2026" also match.

## Components

### 1. Attendance sync — `/api/cron/sync-checkins` (daily, 9:00 UTC)

Pulls the previous Pacific day's door-access events from the Verkada API
(`/events/v1/access`), matches event users to People records **by email**, and
upserts one `Attendance` record per person per day with first/last seen
timestamps. This runs for *all* people, not just fellows, so attendance data
is available for future features.

Manual run options (from the automations dashboard, with the cron secret):

- `?date=YYYY-MM-DD` — sync a specific Pacific day (backfill)
- `?dry=1` — parse and match without writing; returns a sample of raw
  Verkada events. **Use this on first deploy** to confirm the event payload
  shape — the parser probes several known field locations for the user email
  and event type, and logs unmatched users.

Notes:

- Denied/failed access events are ignored.
- Verkada users with no matching People email are reported in the response
  (`unmatchedEmails`) and logged.
- Day-pass activations are not yet folded in (future enhancement).

### 2. Staff dashboard — `/portal/admin/gef`

Staff-only. Shows each fellow: last seen, days in this week, days in the last
4 weeks, and a 28-day presence strip. Fellows not seen in 7+ days
(`GEF_ABSENCE_FLAG_DAYS` in `app/lib/gef.ts`) are flagged.

Below the table: recent 1:1 notes for fellows and a form to add one. Notes are
stored in the pre-existing **Check-ins** table (the staff conversation
tracker) with `People` linked, `Notes`, and `Logged by` set — so notes made in
Airtable directly show up too.

### 3. Weekly digest — `/api/cron/gef-weekly-digest` (Mondays, 16:00 UTC)

Emails carolina@moxsf.com a table of last week's attendance (Mon–Sun) per
fellow with flags, and a link to the dashboard. `?to=<x>@moxsf.com` overrides
the recipient for testing. Skips sending when no fellows exist.

### 4. GEF interest form — `/gef`

Submissions now also create a **GEF Applications** record (Status "New") in
addition to the notification email. An Airtable failure is logged but doesn't
block the submission or email.

## Airtable tables

See [airtable-schema.md](../airtable-schema.md): `Attendance` (new),
`Check-ins` (pre-existing, + new `Logged by` field), `GEF Applications` (new).

## Key files

- `app/lib/checkins.ts` — Pacific-day helpers + attendance aggregation (unit
  tested in `checkins.test.ts`)
- `app/lib/gef.ts` — fellow lookup + attendance report
- `app/api/cron/sync-checkins/route.ts`
- `app/api/cron/gef-weekly-digest/route.ts`
- `app/portal/admin/gef/page.tsx` + `GefNoteForm.tsx`
- `app/portal/api/admin/gef-note/route.ts`
