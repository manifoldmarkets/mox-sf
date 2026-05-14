// Day Pass Activation Email
// Sent to a day-pass recipient after Stripe checkout completes. The link
// is a one-time magic link into the member portal; the recipient activates
// the pass from there when they arrive at Mox.

export function getDayPassActivationEmail({
  customerName,
  passType,
  passDescription,
  activationLink,
}: {
  customerName: string;
  passType: string;
  passDescription: string;
  activationLink: string;
}) {
  const subject = `Your Mox ${passType} is ready`;

  const text = `
Hi ${customerName},

Thanks for getting a ${passType}!

${passDescription}

To get in: click the link below to access your member portal. If it's your
first time, we'll ask for a quick photo so staff can recognize you at the
door. Then on the day you visit, hit "activate" to reveal your door code.

${activationLink}

This link expires in 24 hours. If it expires before you visit, head to
moxsf.com/portal and sign in with this same email — your pass will be
waiting.

ADDRESS
1680 Mission St, San Francisco, CA 94103

Questions? Just reply to this email or reach us at team@moxsf.com

See you soon!
- The Mox crew
`.trim();

  return { subject, text };
}
