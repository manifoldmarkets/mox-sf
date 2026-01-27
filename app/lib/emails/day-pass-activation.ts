// Day Pass Activation Email
// Edit the text below to customize the email content

export function getDayPassActivationEmail({
  customerName,
  passType,
  passDescription,
  activationLinks,
}: {
  customerName: string;
  passType: string;
  passDescription: string;
  activationLinks: string[];
}) {
  const quantity = activationLinks.length;
  const subject =
    quantity === 1
      ? `Your Mox ${passType} is Ready!`
      : `Your ${quantity} Mox ${passType}es are Ready!`;

  // Format activation links section
  const linksSection =
    quantity === 1
      ? `On the day you're planning to visit, click here to get your door code:
${activationLinks[0]}`
      : `On the day you're planning to visit, click the links below to get door codes for each pass:
${activationLinks.map((link, i) => `Pass ${i + 1}: ${link}`).join('\n')}`;

  // Plain text version - this is what gets sent
  const text = `
Hi ${customerName},

Thanks for getting ${quantity === 1 ? `a ${passType}` : `${quantity} ${passType}es`}!

${passDescription}

${linksSection}

ADDRESS
1680 Mission St, San Francisco, CA 94103

ENTRY
Use the door code on the keypad to enter. The code will be displayed after you click the activation link${quantity > 1 ? 's' : ''} above.

Questions? Just reply to this email or reach us at team@moxsf.com

See you soon!
- The Mox crew
`.trim();

  return { subject, text };
}
