This project uses Bun as its package manager. Use `bun install`

## Git Workflow

When starting a new feature or task:
1. Check the current branch with `git branch --show-current`
2. If on `main` or `master`, create a new feature branch before making changes
3. If on a branch that doesn't seem related to the current task (e.g., working on "discord-bot" branch but asked to build a payments feature), ask the user to confirm whether to:
   - Continue on the current branch
   - Create a new branch from main
   - Switch to an existing branch