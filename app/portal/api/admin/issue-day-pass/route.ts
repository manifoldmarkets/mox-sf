import { getSession, isCurrentlyStaff } from '@/app/lib/session';
import { Resend } from 'resend';
import { env } from '@/app/lib/env';
import {
  Tables,
  createRecord,
  findRecord,
  escapeAirtableString,
} from '@/app/lib/airtable';
import { createMagicLink } from '@/app/lib/magic-link';
import { getDayPassActivationEmail } from '@/app/lib/emails/day-pass-activation';
import { PASS_TYPES, type PassTypeId } from '@/app/lib/day-pass-pricing';

const resend = new Resend(env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isCurrentlyStaff(session.userId))) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { recipientName, recipientEmail, passTypeId } = body;

    if (!recipientName?.trim() || !recipientEmail?.trim() || !passTypeId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const passType = PASS_TYPES[passTypeId as PassTypeId];
    if (!passType) {
      return Response.json({ error: 'Invalid pass type' }, { status: 400 });
    }

    // Find or create the recipient's People record
    const existing = await findRecord(
      Tables.People,
      `{Email}="${escapeAirtableString(recipientEmail.trim().toLowerCase())}"`
    );

    let personId: string;
    if (existing) {
      personId = existing.id;
    } else {
      const created = await createRecord(Tables.People, {
        Name: recipientName.trim(),
        Email: recipientEmail.trim().toLowerCase(),
      });
      personId = created.id;
    }

    // Create the DayPass record with Issued By set to the staff member
    const fields: Record<string, unknown> = {
      Name: `staff-issued-${Date.now()}`,
      'Pass Type': passType.label,
      Status: 'Unused',
      User: [personId],
      'Issued By': [session.userId],
    };

    await createRecord(Tables.DayPasses, fields);

    // Mint magic link and email the recipient
    const baseUrl = env.NEXT_PUBLIC_BASE_URL;
    const activationLink = await createMagicLink(personId, baseUrl);

    const { subject, text } = getDayPassActivationEmail({
      customerName: recipientName.trim(),
      passType: passType.label,
      passDescription: passType.description,
      activationLink,
    });

    await resend.emails.send({
      from: 'Mox SF <noreply@account.moxsf.com>',
      to: recipientEmail.trim(),
      subject,
      text,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('[Admin issue-day-pass] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
