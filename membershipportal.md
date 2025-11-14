Here's a simplified version focusing on Airtable-only backend:

---

## Goal

Build a simple portal for coworking members to edit their own website profiles, billing info, and events they host on the calendar.

## Motivation

Enable members to easily update their own profiles → Better member discovery → Stronger community → Growth and connections at Mox

## User Flow

1. Member enters email on our website
2. Gets secure email link (expires in 24 hours)
3. Clicks link → goes to pre-filled profile edit form (Airtable interface)
4. Updates info directly in Airtable
5. Done

## Features

- **Login page**: Email input + "Send Profile Link" button
- **Email system**: Automated secure links (via Resend/SendGrid/Zapier)
- **Profile edit**: Direct Airtable interface or form
- **Event management**: Airtable interface for events they own
- **Stripe access**: Separate Stripe customer portal link (existing)
- **Application portal**: Allow new people to apply

## Existing Resources

- Current site: https://github.com/manifoldmarkets/mox-sf
- Rachel's Airtable frontend MVP: https://github.com/wearsshoes/bay-local-ea-ops
- Design assets: Figma brandbook and website redesign

## Technical Approach

**Option 1: Airtable Interfaces (Simplest)**
- Use native Airtable interfaces for profile editing
- Magic link emails route to personalized Airtable interface links
- No custom backend needed

**Option 2: Lightweight Frontend + Airtable API**
- React frontend
- Airtable API for read/write
- Email service for magic links
- Token stored in Airtable (`temp_profile_token`, `token_expires` fields)

## Expected Usage
- 5-10 DAUs
- 80-200 unique MAUs
- 100-200 daily pageviews

## Timeline Estimate

**Option 1 (Airtable Interfaces)**: 3-5 days
- Set up Airtable interfaces (1 day)
- Email automation (1 day)
- Testing and refinement (1-3 days)

**Option 2 (Custom Frontend)**: 1-2 weeks
- Frontend forms (3-4 days)
- Airtable API integration (2-3 days)
- Email magic links (2 days)
- Testing (2-3 days)

## Next Steps

1. Decide between Airtable Interfaces vs. custom frontend
2. Set up secure link generation system
3. Create/configure profile editing interface
4. Test with small group of members
5. Roll out to full membership