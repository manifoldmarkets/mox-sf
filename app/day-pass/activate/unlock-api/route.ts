import { adminUnlockDoor } from '@/app/lib/verkada'

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json()

    if (!paymentId) {
      return Response.json({ success: false, error: 'No payment ID provided' })
    }

    const result = await adminUnlockDoor()
    if (result.ok) {
      return Response.json({ success: true })
    }
    return Response.json({ success: false, error: result.error })
  } catch (error) {
    console.error('Error processing door unlock:', error)
    return Response.json({ success: false, error: 'Server error' })
  }
}
