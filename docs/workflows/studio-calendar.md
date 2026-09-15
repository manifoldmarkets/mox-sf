# Studio calendar connection

Members book at `/portal/studio`. Only Carolina's current staff session can
connect the shared Google account at `/portal/studio/connect`. Other members
never grant Google access. The backend inserts into the fixed studio calendar.

## One-time deployment setup

1. The owner's Connect button automatically creates the credential table if the
   existing Airtable token has schema read/write access. Otherwise, in the main
   Mox Airtable base, create `Studio Calendar Connection` with primary
   `Name` (single-line text) and `Credential` (long text). Leave it empty.
   The existing AIRTABLE_API_KEY must have record read/write access to that table.
2. Keep the existing `TASKS_GOOGLE_CLIENT_ID`, `TASKS_GOOGLE_CLIENT_SECRET`,
   `SESSION_SECRET`, `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, and canonical
   `NEXT_PUBLIC_BASE_URL` in Production. No service account key is needed.
3. Enable Google Calendar API in the existing OAuth client's Cloud project.
   Its existing registered callback `/tasks/auth/google/callback` is reused;
   studio state, PKCE and session are isolated from task-claimer login.
4. Deploy, sign into the member portal as `carolina@moxsf.com`, open
   `/portal/studio/connect`, and approve Calendar event access with that Google
   account. It must have permission to modify the studio calendar.
5. Verify a member can create a booking and it appears in the studio calendar.
   Verify more than three hours returns exactly `3h limit exceeded`.

Refresh credentials are sealed with SESSION_SECRET before storage and never
returned to members. Rotating SESSION_SECRET requires reconnecting. Revoking
Google access also requires reconnecting. External OAuth apps left in Testing
may get refresh tokens that expire after seven days; configure the OAuth app
appropriately for ongoing production use. Consent grants Calendar event scope,
which is broader than a single calendar; application code fixes the destination.

Do not expose Production credentials to fork previews. Local preview deliberately
cannot create events and no longer reports simulated bookings as successful.
The consent success page confirms credential storage, not an end-to-end booking;
the actual write must still be verified before declaring the system live.
