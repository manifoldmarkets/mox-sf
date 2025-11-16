// DEPRECATED: This endpoint has been disabled for security reasons.
// Door access is now managed through Verkada's native interface.
// If you need programmatic door access, please contact the admin team.

export async function POST(request: Request) {
  return Response.json({
    success: false,
    error: 'This endpoint has been deprecated. Please use the Verkada mobile app or contact admin for access.',
    deprecated: true
  }, { status: 410 }) // 410 Gone
}
