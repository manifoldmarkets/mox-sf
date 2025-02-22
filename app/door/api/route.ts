export async function POST(request: Request) {
  const res = await request.json()
  const pin = res.pin as String

  if (pin === process.env.MASTER_PIN) {
    console.log('success')
    return Response.json({ success: true })
  }

  return Response.json({ success: false })
}
