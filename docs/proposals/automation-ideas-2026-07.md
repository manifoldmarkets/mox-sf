# Mox Automation Ideas — July 2026

Proposals for the next round of Mox automations, grounded in what already exists
in this codebase. Covers: GEF fellows check-in tracking (Carolina), the careers
DB / job-seeker + hiring signals (Austin), 1:1 matching, event suggestions,
embeddings infrastructure, and an SF/AI-safety roles board.

Everything below builds on infrastructure we already have:

- **People table** in Airtable is the identity spine — members, guests (via Day
  Passes → linked People records), program fellows (via `Program` links).
- **Portal** with magic-link auth and a profile edit page
  (`app/portal/profile/edit`) — the natural home for any new opt-in fields.
- **Verkada integration** (`app/lib/verkada.ts`) — PINs and door unlocks, which
  means physical presence data exists and just isn't being collected yet.
- **Cron automation pattern** (`app/api/cron/*` + `bun scan-automations` +
  the staff dashboard at `/portal/admin/automations`).
- **Discord bot** with role sync — a delivery channel for digests and intros.
- **Day Pass flow** — every guest already gets a People record with an email.

---

## 1. Presence / check-in data (foundation)

Both GEF tracking and "who's actually around" questions need the same thing:
a record of who was in the building on which days. Build it once, use it
everywhere.

**Proposal: a `Check-ins` Airtable table** with fields: `Person` (link),
`Date`, `First seen`, `Last seen`, `Source` (Verkada / Day Pass / Event /
Manual).

Data sources, in order of effort:

1. **Verkada access events (recommended).** A nightly cron route
   (`app/api/cron/sync-checkins`) pulls the previous day's door-unlock events
   from the Verkada API, matches them to People (we already store who has
   which PIN/credential), and upserts one Check-in row per person per day.
   Zero user friction — the data already exists, we're just not saving it.
2. **Day Pass activations.** `Date Activated` already exists; fold those into
   the same table so guests appear too.
3. **Lobby self check-in page.** We already have `app/lobby` — an optional
   tap-your-name screen for people whose credentials don't map cleanly, or for
   event guests.

Privacy note: this is staff-visible operational data. Worth a line in the
member agreement/FAQ that door access is logged (Verkada already logs it;
this just aggregates per-day).

### 1a. GEF fellows check-in tracking (Carolina)

On top of the Check-ins table:

- **Staff dashboard at `/portal/admin/gef`**: one row per fellow (People
  filtered by `Program` = GEF), showing days-in-space this week / last 4
  weeks, last-seen date, and a sparkline. Flag fellows not seen in N days.
- **Weekly digest**: Monday morning email to carolina@moxsf.com (reuse
  `sendEmail` from the GEF interest form) or a post in a staff Discord
  channel: attendance summary + "haven't seen X in 10 days" flags.
- **Structured check-in conversations**: optionally add a `Fellow Check-ins`
  table (Person, Date, Notes, Mood/Progress select, Next steps) so 1:1
  conversation notes live next to attendance data. A simple form in the admin
  portal writes to it. This turns "tracking" into an actual fellowship
  support tool: attendance + wellbeing + progress in one view.
- The GEF interest form (`app/gef/api/submit`) currently only emails; it
  should *also* write applicants into Airtable (People or a GEF Apps table)
  so the pipeline is queryable from day one.

---

## 2. Mox careers DB (Austin)

### 2a. Explicit signals first: portal checkboxes

The cheapest high-quality data is self-reported. Add to the People table:

- `Job status` (single select): `Looking now` / `Open to offers` /
  `Not looking` / (empty = unknown)
- `Hiring` (checkbox) — plus on **Orgs**: `Hiring` (checkbox) and
  `Careers URL`.
- `LinkedIn` (url), `Career notes` (long text, e.g. "looking for alignment
  research roles, prefer non-profit").
- `Job status visibility` (single select): `Staff only` / `Show in directory`.

Surface in the existing profile edit form (`ProfileEditForm.tsx`) as a small
"Career" section: "Are you looking for a job?" / "Are you hiring?" with a
visibility toggle. Members who opt in get a badge in the directory
(`open to work` / `hiring`) — that alone creates serendipity in a space full
of AI-safety orgs.

Capture moments beyond the profile page:

- **Day-pass activation success page**: one optional question for guests —
  "What brings you to SF? Looking for work / hiring / just visiting" — writes
  to their (already-created) People record.
- **Onboarding welcome flow** (`app/portal/welcome`): ask once at signup.
- **Quarterly nudge**: cron that emails members whose `Job status` is stale
  ("still accurate?") — one click updates it via magic link.

### 2b. Inferred signals, carefully

With embeddings/LLMs we *can* score "might be job-seeking" from profile text,
website changes, event attendance (e.g. attends every career fair). Recommend:
keep inference **staff-only, advisory, and clearly labeled** ("worth a
conversation"), never shown publicly or acted on automatically. Explicit
opt-in data should always outrank inference. The best use of inference is
prioritizing who staff *ask*, not labeling people.

### 2c. Staff view

`/portal/admin/careers`: filterable table — everyone `Looking now` /
`Open to offers`, everyone `Hiring`, guests from the last 90 days with career
signals, and (later) embedding-based "suggested matches" between the two
lists.

---

## 3. Embeddings infrastructure (powers 3 features)

One small module, three consumers (1:1 matching, event suggestions, job
matching).

- **What to embed per person**: `Work thing` + `Fun thing` + `Career notes` +
  org name + titles of events they attended/hosted. Optionally a one-line LLM
  summary of their website.
- **Where to store**: at Mox scale (hundreds of people, dozens of
  events/roles) vectors-as-JSON in a long-text Airtable field is fine, loaded
  into memory and compared with cosine similarity. No vector DB needed. If it
  grows, graduate to pgvector.
- **When**: nightly cron re-embeds records whose source fields changed
  (hash the input text, skip unchanged).
- **Model**: any hosted embedding API; text volumes are tiny so cost is
  negligible.

### 3a. 1:1 matching

- Opt-in via profile: "Match me for member 1:1s" + cadence (weekly /
  monthly).
- Cron pairs opted-in members. Scoring: embedding similarity for common
  ground, with a "stretch" option that deliberately pairs across clusters
  (researcher × founder). Exclude prior pairs via a `Matches` table
  (Person A, Person B, Date, Status, Feedback).
- Delivery: intro email to both, or better, the Discord bot opens a group DM
  with a suggested icebreaker generated from their profiles ("You both care
  about X; Alice is hiring, Bob is looking").
- One-click feedback link after ("met / didn't meet / good match?") writes
  back to `Matches` — this is the data that makes matching improve.

### 3b. Event suggestions

- Embed `Event Description` for upcoming Confirmed events (table + fields
  already exist).
- Weekly personalized digest (email or Discord DM, opt-in): top 3 upcoming
  events by similarity to your profile vector, with a sentence on *why*
  ("because you work on interpretability").
- Cold-start fallback: tier + program defaults (fellows get fellowship
  events, etc.).
- Later: if RSVP data lands in Airtable, add "3 people you've met are going".

### 3c. Job ↔ person matching

Once the Roles table (below) and person embeddings exist, matching is a
nightly cosine-similarity pass: for each `Looking now` person, top 5 roles;
for each open role at a member org, top 5 opted-in candidates. Weekly email
to job-seekers ("3 roles at Mox orgs that fit you") and a staff view for
warm intros.

---

## 4. Roles board: jobs in and around SF, esp. AI safety

**Proposal: a `Roles` Airtable table**: `Title`, `Org` (link, or free-text
company for non-member orgs), `URL`, `Location`, `Tags` (AI safety, eng,
research, ops...), `Status` (Open/Filled/Stale), `Source`, `Posted`,
`Last verified`.

Filling it, in order of effort:

1. **Member orgs' careers pages.** Orgs table gets `Careers URL`; a weekly
   cron fetches each page, has an LLM extract current openings, and diffs
   against the Roles table — new roles added, missing ones marked Stale.
   This is the highest-value scrape because these are exactly the orgs "in
   and around Mox".
2. **80,000 Hours job board** (has a public listing; filter to SF/remote and
   AI-safety tags) as an external feed.
3. **Member submissions**: "I'm hiring" checkbox in the portal links to a
   tiny "post a role" form that writes to Roles.
4. **Staff manual entry** for word-of-mouth roles.

Surfaces:

- **`/jobs` page** — public or members-only, grouped by org, filterable by
  tag. Good marketing for Mox either way ("the AI-safety jobs board that's
  also a building").
- **Dogfooding**: Mox's own openings are just Roles rows with Org = Mox,
  automatically at the top of the page. Any pipeline improvements (apply
  links, referral tracking) benefit us first.
- Weekly digest to job-seekers (see 3c).

---

## 5. Suggested build order

| Step | What | Why first |
|------|------|-----------|
| 1 | People/Orgs career fields + portal checkboxes + directory badges | Days of work, immediately starts accumulating the data everything else needs |
| 2 | Check-ins cron from Verkada + GEF admin dashboard + weekly digest | Unblocks Carolina's fellows tracking; presence data compounds |
| 3 | Roles table + org careers-page scraper + `/jobs` page | Standalone value, dogfoods on Mox openings |
| 4 | Embedding module + event-suggestion digest | First embeddings consumer, lowest social risk |
| 5 | 1:1 matching + job↔person matching | Best once profiles/roles data has accumulated from steps 1–4 |

Steps 1–3 are independent and could be parallel projects.

## Privacy defaults (applies throughout)

- Job-seeking status: staff-only unless the member explicitly opts into a
  directory badge.
- Presence data: staff-only, aggregated per day, never shown to other
  members.
- All matching/digest features: opt-in, with one-click opt-out in every
  email.
- LLM inference about people: advisory, staff-only, labeled as inferred.
