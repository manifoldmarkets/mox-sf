import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user in Airtable by email
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      // For security, don't reveal if user exists or not
      return Response.json({
        success: true,
        message: 'If an account exists with that email, you will receive a login link.'
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user record with token
    await updateUserToken(user.id, token, expiresAt);

    // Send email with magic link
    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/portal/verify?token=${token}`;

    console.log('Sending email to:', normalizedEmail);
    const emailResult = await resend.emails.send({
      from: 'Mox SF <noreply@account.moxsf.com>',
      to: normalizedEmail,
      subject: 'Your Mox SF Member Portal Login Link',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to the Mox SF Member Portal</h2>
          <p>Hi ${user.name || 'there'},</p>
          <p>Click the link below to access your member portal:</p>
          <p style="margin: 30px 0;">
            <a href="${magicLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Your Portal
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this URL: ${magicLink}
          </p>
        </div>
      `,
    });

    console.log('Resend API response:', emailResult);

    return Response.json({
      success: true,
      message: 'Login link sent! Check your email.'
    });
  } catch (error) {
    console.error('Error sending magic link:', error);
    return Response.json({
      error: 'Failed to send login link. Please try again.'
    }, { status: 500 });
  }
}

async function findUserByEmail(email: string) {
  // Try without LOWER() first to debug
  const formula = `{Email} = '${email.replace(/'/g, "\\'")}'`;

  console.log('Looking for user with email:', email);
  console.log('Airtable formula:', formula);

  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People?filterByFormula=${encodeURIComponent(formula)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    }
  );

  const data = await response.json();

  console.log('Airtable search result:', JSON.stringify(data, null, 2));

  if (data.records && data.records.length > 0) {
    const record = data.records[0];
    return {
      id: record.id,
      name: record.fields.Name,
      email: record.fields.Email,
    };
  }

  return null;
}

async function updateUserToken(recordId: string, token: string, expiresAt: Date) {
  const response = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/People/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_WRITE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          magic_link_token: token,
          token_expires: expiresAt.toISOString(),
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Airtable update error:', errorData);
    throw new Error(`Failed to update user token: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}
