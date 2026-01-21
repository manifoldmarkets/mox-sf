// Set up environment variables for testing before any modules are loaded
// These must be set before importing the env module since it validates on first access

// Required variables
process.env.AIRTABLE_API_KEY = 'test-api-key'
process.env.AIRTABLE_BASE_ID = 'test-base-id'
process.env.STRIPE_SECRET_KEY = 'test-stripe-key'
process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-secret'
process.env.RESEND_API_KEY = 'test-resend-key'
process.env.SESSION_SECRET = 'test-session-secret-must-be-32-chars!'

// Optional variables
// NODE_ENV is typically set by vitest automatically
