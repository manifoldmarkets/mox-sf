# Mox SF Member Portal

## Status: ✅ Implemented and Live

A member portal that allows coworking members to edit their own profiles using passwordless email authentication.

## Current Features

### Authentication
- **Magic Link Login**: Members enter their email and receive a secure login link
- **24-hour expiry**: Links expire after 24 hours and are single-use only
- **Session management**: Cookie-based sessions using iron-session
- **Email service**: Resend (noreply@account.moxsf.com)

### Member Dashboard
- View profile overview (name, email, website, interests, photo)
- Quick actions:
  - Manage Billing (Stripe customer portal)
  - View Member Directory
  - View Events
- Logout functionality

### Profile Editing
Members can update:
- Name
- Website
- Interests (comma-separated)
- Profile photo (uploaded to Airtable as attachment)

Email is read-only (cannot be changed).

## Technical Implementation

**Stack:**
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Airtable REST API (People table)
- Resend (email delivery)
- iron-session (session management)

**Airtable Fields:**
- `Email`: User's email address
- `Name`: Full name
- `Website`: Personal website URL
- `Interests`: Array of interests
- `Photo`: Attachment field for profile photo
- `magic_link_token`: Temporary token for authentication
- `token_expires`: Token expiration timestamp

**Key Files:**
- `/app/portal/login/page.tsx` - Login page
- `/app/portal/api/send-magic-link/route.ts` - Sends magic link email
- `/app/portal/verify/route.ts` - Verifies token and creates session
- `/app/portal/dashboard/page.tsx` - Member dashboard
- `/app/portal/profile/edit/page.tsx` - Profile editing page
- `/app/portal/api/update-profile/route.ts` - Updates profile in Airtable
- `/app/lib/session.ts` - Session management utilities
- `/middleware.ts` - Route protection

**Environment Variables:**
- `RESEND_API_KEY` - Resend API key
- `SESSION_SECRET` - Secret for cookie encryption
- `AIRTABLE_API_KEY` - Read access to Airtable
- `AIRTABLE_WRITE_KEY` - Write access to Airtable
- `AIRTABLE_BASE_ID` - Base ID for Airtable
- `NEXT_PUBLIC_BASE_URL` - Base URL for magic links

## User Flow

1. Member clicks "Access your portal" on homepage
2. Enters email address
3. Receives magic link email
4. Clicks link → redirected to dashboard
5. Can view profile and click "Edit Profile"
6. Updates information → saved to Airtable
7. Changes reflected on member directory

## Access

- **Login**: https://moxsf.com/portal/login
- **Link on homepage**: "Already a member? Access your portal" in the membership section

## Future Improvements
- Event creation/management through portal
- Member directory visibility settings
- Custom profile fields beyond name/website/interests
- Change email address (with verification)
- Email notification preferences