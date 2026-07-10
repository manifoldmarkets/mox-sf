# Task board (`app/tasks`, served at tasks.moxsf.com)

A public board of small, well-scoped tasks. Anyone can browse; **claiming
requires Google sign-in**. A claim means "I'm doing this today": a nudge email
after `TASKS_NUDGE_HOURS` (8h) and auto-release after `TASKS_RELEASE_HOURS`
(24h). Completing with a photo closes the task instantly; without a photo it
waits for organizer review, which happens by reacting ✅ on Discord.

## Auth (deliberately isolated)

Google sign-in is scoped to `/tasks` **only** and never touches member auth:

- **Claimers** (outside volunteers/contractors) sign in with Google. The flow
  (`app/tasks/auth/google/*`) mints a separate `mox-tasks` iron-session cookie
  via `app/lib/tasks-auth.ts`. It does not read or write `mox-session`.
- **Organizers** (add/approve) are recognized via the existing **email-based**
  member session (`requireStaff`) or the `TASKS_ORGANIZER_EMAILS` allowlist —
  never Google alone. See `isOrganizer()` in `tasks-auth.ts`.
- The member portal's email/magic-link auth is unchanged.

## Data (`app/lib/tasks.ts`)

Two tables in the Mox base, read/written through the shared `app/lib/airtable.ts`:

- **Tasks** — one row per task; `Status = Open` shows publicly. Fields: Name,
  Summary, Brief, Done criteria, Context links, Skills, Effort, Status, Floor,
  Map point, Claimant name/email, Claimed/Nudged/Completed at, Completion note,
  Proof photo, Reference photos, Discord message id.
- **Task Claims** — append-only activity log (Claimed / Completed / Released /
  Auto-released / Approved).

Attachments follow the repo convention: upload to ImgBB (`IMGBB_API_KEY`), store
the URL (`uploadTaskImage`).

## Map

`app/lib/tasks-floorplans.ts` is a bundled snapshot of the 1680 Mission room
plans (real room polygons, floor-frame inches) used to render the pin picker
(`app/tasks/FloorMap.tsx`). The repo's own `Floors` table only has static SVG
images with no room coordinates, so it can't drive clickable pins — hence the
dedicated snapshot. `Floor` (1st–4th) maps to a plan story via `storyForFloor`;
Rooftop has no plan.

## Discord + email + crons

- Completions post to `DISCORD_CHANNELS.TASKS` via `sendChannelMessage`. **The
  Mox bot must have View Channel + Read Message History there** for approvals.
- Nudge/auto-release/digest emails go out via `sendEmail` (Resend).
- `app/api/cron/tasks-sweep` (every 15m) — nudges, auto-releases, and closes
  "In review" tasks that got a ✅ reaction. `app/api/cron/tasks-digest`
  (daily 16:00 UTC) — organizer summary. Both guarded by `CRON_SECRET`.

## Routing

`tasks.moxsf.com` is served by a host rewrite in `next.config.js` (only the
bare `/` → `/tasks`, so `_next`/`api`/assets are untouched). Deep links stay
under `/tasks/*`.

## Env vars

| Var                                                     | Purpose                                                                                                                      |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `TASKS_GOOGLE_CLIENT_ID` / `TASKS_GOOGLE_CLIENT_SECRET` | Google OAuth for claimers. Redirect URI: `https://moxsf.com/tasks/auth/google/callback` (and the tasks.moxsf.com equivalent) |
| `TASKS_ORGANIZER_EMAILS`                                | Comma-separated fallback organizers (staff are auto-recognized)                                                              |
| `TASKS_NUDGE_HOURS` / `TASKS_RELEASE_HOURS`             | Clock, default 8 / 24                                                                                                        |
| `TASKS_BASE_URL`                                        | Public base for email/Discord links, default `https://tasks.moxsf.com`                                                       |

Reuses existing `AIRTABLE_*`, `RESEND_API_KEY`, `DISCORD_BOT_TOKEN`,
`IMGBB_API_KEY`, `CRON_SECRET`, `SESSION_SECRET`.
