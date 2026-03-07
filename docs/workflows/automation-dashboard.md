# Automation Dashboard

Admin tooling for visibility into all Mox automations.

## For Admin Staff

**Dashboard:** `/portal/admin/automations` (staff login required)

Shows every automation with:
- What it does (summary)
- How it's triggered (cron schedule, webhook, manual)
- Whether it's instrumented with step tracking
- Where the source file lives

Filter by type: cron, webhook, integration, portal action, event action.

Click any automation to expand and see its route, HTTP method, schedule, and source file path.

### Failure Alerts

Instrumented automations post to Discord `#notifications` when they fail, including which step broke and the error message.

## For Developers

### Adding a New Automation

1. Create your `route.ts` as usual
2. Use the `withAutomation` wrapper:

```ts
import { withAutomation } from '@/app/lib/automation'

export const POST = withAutomation({ type: 'webhook' }, async (run, req) => {
  const data = await run.step('Parse request', () => req.json())
  await run.step('Do the thing', () => doThing(data))
  run.skip('Optional step (reason it was skipped)')
  return { someResult: true }
})
```

3. If it's a cron job, add the schedule to `vercel.json`
4. Run `bun scan-automations` to regenerate the manifest
5. Edit the `summary` field in `app/lib/automations-manifest.ts` if the TODO placeholder isn't replaced

### `withAutomation` Options

| Option | Values | Behavior |
|--------|--------|----------|
| `type` | `'cron'` | Validates `CRON_SECRET` from `Authorization: Bearer` header |
| `type` | `'webhook'` | No auth check (handler does its own, e.g. Stripe signature) |
| `type` | `'manual'` | No auth check (for portal actions with session auth) |

### Scanner

```bash
bun scan-automations
```

Auto-discovers automations by:
- Walking `app/api/cron/`, `app/api/webhooks/`, known integration routes
- Finding any `route.ts` that imports `withAutomation`
- Cross-referencing `vercel.json` for cron schedules

Output: `app/lib/automations-manifest.ts`

Re-runs preserve hand-edited summaries. New routes get `TODO:` placeholders.

The scanner also reports which automations aren't using the wrapper yet.

### Key Files

- `app/lib/automation.ts` - `withAutomation` wrapper
- `app/lib/automations-manifest.ts` - Generated manifest (summaries are editable)
- `scripts/scan-automations.ts` - Scanner script
- `app/portal/admin/automations/` - Dashboard UI
