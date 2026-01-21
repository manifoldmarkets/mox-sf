import { destroySession } from '@/app/lib/session'

export async function POST() {
  await destroySession()
  return Response.json({ success: true })
}
