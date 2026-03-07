# Automation Dashboard

Admin tooling for visibility into all Mox automations.

## For Admin Staff

**Dashboard:** `/portal/admin/automations` (staff login required)

Shows every automation with:
- What it does (summary)
- How it's triggered (cron schedule, webhook, manual)
- Where the source file lives

Filter by type: cron, webhook, integration, portal action, event action.

Click any automation to expand and see its route, HTTP method, schedule, and source file path.

## For Developers

### Adding a New Automation

1. Create your `route.ts` as usual
2. If it's a cron job, add the schedule to `vercel.json`
3. If it's not in `api/cron/`, `api/webhooks/`, or `api/forkable-sync/`, add the route path to the appropriate list in `scripts/scan-automations.ts`
4. Run `bun scan-automations` to regenerate the manifest
5. Edit the `summary` field in `app/lib/automations-manifest.ts`

### Scanner

```bash
bun scan-automations
```

Auto-discovers automations by:
- Walking `app/api/cron/`, `app/api/webhooks/`, known integration routes
- Cross-referencing `vercel.json` for cron schedules

Output: `app/lib/automations-manifest.ts`

Re-runs preserve hand-edited summaries. New routes get `TODO:` placeholders.

### Key Files

- `app/lib/automations-manifest.ts` - Generated manifest (summaries are editable)
- `scripts/scan-automations.ts` - Scanner script
- `app/portal/admin/automations/` - Dashboard UI
