# Airtable Schema

This document describes the Airtable tables and fields used by the Mox SF application.

> **Auto-generated from Airtable API** - Last updated: 2026-01-20

## Configuration

- **Base ID**: Set via `AIRTABLE_BASE_ID` environment variable
- **API Key**: Set via `AIRTABLE_API_KEY` environment variable
- **Client**: Uses official `airtable` npm package with lazy initialization

---

## Tables

### People

Primary table for user/member management.

| Field | Type | Description | Used by App |
|-------|------|-------------|-------------|
| `Name` | singleLineText | User's full name | ✅ Profile, directory |
| `Email` | email | Email address (used for login) | ✅ Auth, notifications |
| `Tier` | singleSelect | Membership level | ✅ Discord sync, access control |
| `Status` | singleSelect | Member status | ✅ Auth, Discord sync |
| `Org` | multipleRecordLinks | Links to Orgs table | ✅ Portal display |
| `Program` | multipleRecordLinks | Program affiliations | ✅ Portal display |
| `Website` | url | Personal/professional website | ✅ Profile editing |
| `Photo` | multipleAttachments | Profile photo | ✅ Profile, directory |
| `Show in directory` | checkbox | Display in public directory | ✅ Directory visibility |
| `Discord Username` | singleLineText | Discord handle for role syncing | ✅ Discord integration |
| `magic_link_token` | singleLineText | Auth token (32-byte hex) | ✅ Magic link auth |
| `token_expires` | dateTime | Token expiration timestamp | ✅ Magic link auth |
| `Stripe Customer ID` | multilineText | Link to Stripe customer | ✅ Billing, subscriptions |
| `First Name` | formula | Extracts the first name from the 'Name' field | |
| `Last Name` | formula | Extracts the last name from the 'Name' field | |
| `Stripe Dashboard Link` | formula | Creates a direct URL to the Stripe customer dashboard | |
| `In Verkada` | checkbox | Verkada access provisioned | |
| `In Forkable` | checkbox | Forkable meal club status | |
| `Internal Notes` | multilineText | Staff notes | |
| `Priority` | singleSelect | Application priority | |
| `Tags` | multipleSelects | Various tags | |
| `Room` | multipleRecordLinks | Assigned room/desk | |
| `Events` | multipleRecordLinks | Events attended/hosted | |
| `Day Passes` | multipleRecordLinks | Purchased day passes | |
| `Created` | createdTime | Record creation date | |

**Tier options:** Staff, Volunteer, Private Office, Program, Resident, Member, Friend, Courtesy, Guest Program, Paused

**Status options:** Applied, Evaluating, Backburner, To Invite, Invited, Guest Program, Joined, Cancelled, Rejected, Payment Issue, Waitlisted, Declined, Visited, Event Host, Paused

---

### Events

Manages events and activities.

| Field | Type | Description | Used by App |
|-------|------|-------------|-------------|
| `Name` | singleLineText | Event name | ✅ Calendar, portal |
| `Start Date` | dateTime | Event start (America/Los_Angeles timezone) | ✅ Calendar |
| `End Date` | dateTime | Event end (America/Los_Angeles timezone) | ✅ Calendar |
| `Event Description` | multilineText | Detailed description | ✅ Calendar, portal |
| `Event Poster` | multipleAttachments | Event image for website | ✅ Event display |
| `Featured` | checkbox | Featured event flag | ✅ Homepage |
| `Priority` | singleSelect | P1, P2, P3 | |
| `Status` | singleSelect | Event status | ✅ Calendar filtering |
| `Type` | singleSelect | Public, Members, Private | ✅ Calendar |
| `URL` | url | Event link (Partiful, Luma, etc.) | ✅ Calendar |
| `Hosted by` | multipleRecordLinks | Host people | ✅ Portal hosted events |
| `Host org` | multipleRecordLinks | Host organization | |
| `Host Name` | formula | Returns Host org if present, otherwise Hosted by | ✅ Calendar display |
| `Assigned Rooms` | multipleRecordLinks | Booked rooms | |
| `Name (from Assigned Rooms)` | lookup | Room names | ✅ Portal display |
| `Notes` | multilineText | Additional notes | ✅ Calendar |
| `Event Retro` | multilineText | Post-event retrospective | |
| `Revenue` | currency | Event revenue | |
| `Invoice Status` | singleSelect | Payment status | |

**Status options:** Idea, Maybe, Confirmed, To invoice, Invoiced, Paid, Cancelled, Recurring, Declined

**Type options:** Public, Members, Private

---

### Orgs

Organization/company management.

| Field | Type | Description | Used by App |
|-------|------|-------------|-------------|
| `Name` | singleLineText | Organization name | ✅ Portal display |
| `Status` | singleSelect | Organization status | |
| `Stealth` | checkbox | Hide from directory | ✅ Directory filtering |
| `People` | multipleRecordLinks | Organization members | |
| `Rooms` | multipleRecordLinks | Assigned offices | |
| `Notes` | multilineText | Internal notes | |

**Status options:** Tried once, To reach out, Normal membership, Guest program, Joined, Declined, Tried twice, In contact, Short-term, Left

---

### Day Passes

Guest day pass and week pass management.

| Field | Type | Description | Used by App |
|-------|------|-------------|-------------|
| `Name` | singleLineText | Stripe session ID (unique identifier) | ✅ Activation lookup |
| `User` | multipleRecordLinks | Link to People record | ✅ User association |
| `Username` | lookup | Guest's name (from User) | ✅ Display |
| `Email` | lookup | Guest's email (from User) | ✅ Notifications |
| `Pass Type` | singleSelect | Type of pass | ✅ Activation |
| `Status` | singleSelect | Pass status | ✅ Activation flow |
| `Date Purchased` | createdTime | Purchase timestamp | |
| `Date Activated` | date | When pass was activated | ✅ Activation |

**Pass Type options:** Day Pass, Happy Hour Pass, Week Pass

**Status options:** Unused, Activated, Expired

---

### Programs

Short-term programs and residencies.

| Field | Type | Description | Used by App |
|-------|------|-------------|-------------|
| `Name` | singleLineText | Program name | |
| `Organization` | multipleRecordLinks | Associated org | |
| `Members` | multipleRecordLinks | Program participants | ✅ Portal (Program field) |
| `Start Date` | date | Program start | |
| `End Date` | date | Program end | |
| `Pipeline Status` | singleSelect | Maybe, Confirmed, Cancelled | |

---

### Rooms

Physical room/desk management.

| Field | Type | Description |
|-------|------|-------------|
| `Name` | singleLineText | Room name |
| `Floor` | singleSelect | 1, 2, 3, 4 |
| `Room #` | singleLineText | Room number |
| `Room Size` | number | Capacity |
| `Status` | singleSelect | Private Office, Hotdesks, Lounge, Staff, Public Space, Booth |
| `Tenants` | multipleRecordLinks | Current tenants (Orgs) |
| `Resident Desks` | multipleRecordLinks | Assigned residents (People) |
| `Events` | multipleRecordLinks | Scheduled events |

---

### Other Tables (not used by app)

- **Investments** - Investment tracking
- **Feedback** - Member survey responses
- **Speaker Reachouts** - Event speaker outreach
- **Frame Fellowship Apps** - Fellowship applications
- **GP Reachouts** - Guest program outreach

---

## Common Query Patterns

### Status-based filters
```
{Status} = "Joined"
OR(Status="Invited",Status="To Invite")
```

### Email lookups
```
{Email} = "user@example.com"
```

### Directory queries
```
AND({Show in directory}=TRUE(), {Status}="Joined")
```

### Events by host
```
AND(SEARCH("user_name", ARRAYJOIN({Hosted by}, ", ")), IS_AFTER({Start Date}, "2024-01-20"))
```

### Exclude staff from searches
```
{Tier} != 'Staff'
```

---

## Security

All user inputs are escaped using `escapeAirtableString()` before use in Airtable formulas to prevent formula injection attacks.

See [airtable-helpers.ts](../app/lib/airtable-helpers.ts) for validation utilities.
