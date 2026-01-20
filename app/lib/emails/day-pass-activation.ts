// Day Pass Activation Email
// Edit the text below to customize the email content

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
  const subject = `Your Mox ${passType} is Ready!`;

  // Plain text version - this is what gets sent
  const text = `
Hi ${customerName},

Thanks for getting a ${passType}!

${passDescription}

On the day you're planning to visit, click here to get your door code:
${activationLink}

ADDRESS
1680 Mission St, San Francisco, CA 94103

ENTRY
Use the door code on the keypad to enter. The code will be displayed after you click the activation link above.

Questions? Just reply to this email or reach us at team@moxsf.com

See you soon!
- The Mox crew
`.trim();

  return { subject, text };
}
