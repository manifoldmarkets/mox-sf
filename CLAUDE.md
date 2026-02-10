This project uses Bun as its package manager. Use `bun install`

## Documentation

- **`docs/airtable-schema.md`** - Airtable table schemas and field definitions
- **`docs/api-endpoints.md`** - API route documentation
- **`docs/discord-integration.md`** - Discord bot setup and integration
- **`docs/deployment.md`** - Deployment process
- **`docs/workflows/`** - Detailed workflow docs

Please help keep these up to date.

## Key Configuration Files

- **`app/lib/env.ts`** - All environment variables (Airtable, Stripe, Discord, Verkada, etc.)
- **`app/lib/airtable.ts`** - Airtable client + table names
- **`app/lib/discord-constants.ts`** - Discord guild ID, role IDs (Friend/Member/Resident/Private Office/Program), channel IDs, tier-to-role mappings
- **`app/lib/stripe.ts`** - Stripe client initialization
- **`app/people/people.ts`** - People table field definitions and queries

## Testing

Use `bun run test` (not `bun test`) to run tests. This project uses vitest, and `bun test` invokes Bun's native test runner which has incompatible APIs.

## Shared Dev Server (codev)

When the user runs `bun run codev`, the dev server logs are piped to `/tmp/dev-server.log`. You should personally run `bun run dev`, though.

**To check logs:** `tail -100 /tmp/dev-server.log` (or `tail -f` to watch live) Use this proactively.

The user sees logs in their terminal in real-time; you can read the same logs from the file.

**Chrome dev tools**
In general, you should be checking your own work, especially for UI work, through the browser.

At any time, if you are reaching an mcp-tool-use error with chrome devtools, you have authority to `pkill` the previous devtools process.


## Git Workflow
I am a bit forgetful, and sometimes don't keep branches organized well myself, or may ask you to do things unrelated to the current branch. Thus, it is important that every time you start a new feature or task, you:

1. Check the current branch with `git branch --show-current`
2. If on `main` or `master`, create a new feature branch before making changes
3. If on a branch that has a nondescript name, or doesn't seem related to the current task (e.g., working on "discord-bot" branch but asked to build a payments feature), ask the user to confirm whether to:
   - Continue on the current branch
   - Create a new branch from main
   - Switch to an existing branch
