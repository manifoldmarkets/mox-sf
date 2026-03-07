import { NextRequest } from 'next/server'
import { sendChannelMessage, DISCORD_CHANNELS } from './discord'

// ============================================================================
// Types
// ============================================================================

interface StepResult {
  name: string
  status: 'success' | 'error' | 'skipped'
  durationMs: number
  error?: string
}

interface AutomationResult {
  automationId: string
  status: 'success' | 'error'
  startedAt: string
  durationMs: number
  steps: StepResult[]
  error?: string
  data?: Record<string, unknown>
}

interface AutomationRun {
  /** Execute a named step. Errors propagate and stop the automation. */
  step: <T>(name: string, fn: () => T | Promise<T>) => Promise<T>
  /** Log a step as skipped (e.g., conditional logic that didn't apply). */
  skip: (name: string) => void
}

type AutomationHandler = (
  run: AutomationRun,
  req: NextRequest
) => Promise<Record<string, unknown> | void>

interface AutomationOptions {
  /** 'cron' validates CRON_SECRET from Authorization header. 'webhook' and 'manual' skip that. */
  type: 'cron' | 'webhook' | 'manual'
}

// ============================================================================
// Core wrapper
// ============================================================================

/**
 * Wrap a Next.js route handler with automation tracking.
 *
 * - Auto-derives automation ID from the route file path
 * - Tracks each step with timing and pass/fail
 * - Returns structured JSON (captured by Vercel logs)
 * - Posts to Discord #notifications on failure
 */
export function withAutomation(
  options: AutomationOptions,
  handler: AutomationHandler
) {
  return async (req: NextRequest) => {
    const automationId = deriveAutomationId(req.nextUrl.pathname)
    const startedAt = new Date()
    const steps: StepResult[] = []

    // Cron auth check
    if (options.type === 'cron') {
      const authHeader = req.headers.get('authorization')
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const run: AutomationRun = {
      async step<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
        const stepStart = Date.now()
        try {
          const result = await fn()
          steps.push({
            name,
            status: 'success',
            durationMs: Date.now() - stepStart,
          })
          return result
        } catch (err) {
          steps.push({
            name,
            status: 'error',
            durationMs: Date.now() - stepStart,
            error: err instanceof Error ? err.message : String(err),
          })
          throw err
        }
      },
      skip(name: string) {
        steps.push({ name, status: 'skipped', durationMs: 0 })
      },
    }

    try {
      const data = await handler(run, req)

      const result: AutomationResult = {
        automationId,
        status: 'success',
        startedAt: startedAt.toISOString(),
        durationMs: Date.now() - startedAt.getTime(),
        steps,
        data: data ?? undefined,
      }

      console.log(`[Automation] ${automationId} completed`, JSON.stringify(result))
      return Response.json(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)

      const result: AutomationResult = {
        automationId,
        status: 'error',
        startedAt: startedAt.toISOString(),
        durationMs: Date.now() - startedAt.getTime(),
        steps,
        error: errorMessage,
      }

      console.error(`[Automation] ${automationId} failed`, JSON.stringify(result))

      // Fire-and-forget Discord alert
      alertFailure(automationId, errorMessage, steps).catch(() => {})

      return Response.json(result, { status: 500 })
    }
  }
}

// ============================================================================
// Helpers
// ============================================================================

/** Derive a human-readable automation ID from the request pathname. */
function deriveAutomationId(pathname: string): string {
  // "/api/cron/rotate-door-code" -> "cron/rotate-door-code"
  // "/api/webhooks/stripe" -> "webhooks/stripe"
  // "/api/forkable-sync" -> "forkable-sync"
  // "/portal/api/sync-discord-role" -> "portal/sync-discord-role"
  // "/eag26/api/register" -> "eag26/register"
  return pathname
    .replace(/^\//, '')
    .replace(/\/api\//, '/')
    .replace(/^api\//, '')
}

/** Post a failure alert to Discord #notifications. */
async function alertFailure(
  automationId: string,
  error: string,
  steps: StepResult[]
) {
  const channelId = DISCORD_CHANNELS.NOTIFICATIONS
  if (!channelId || !process.env.DISCORD_BOT_TOKEN) return

  const completedSteps = steps
    .map((s) => {
      const icon = s.status === 'success' ? '✓' : s.status === 'error' ? '✗' : '○'
      return `  ${icon} ${s.name}`
    })
    .join('\n')

  const message =
    `⚠️ **Automation failed:** \`${automationId}\`\n` +
    `**Error:** ${error}\n` +
    (completedSteps ? `**Steps:**\n\`\`\`\n${completedSteps}\n\`\`\`` : '')

  await sendChannelMessage(channelId, message)
}
