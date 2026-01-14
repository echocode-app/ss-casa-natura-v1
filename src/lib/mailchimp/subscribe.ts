import mailchimp from '@mailchimp/mailchimp_marketing';

function getMd5Hash(email: string): string {
  // Mailchimp API requires member id = md5(lowercase_email)
  // Using require here keeps this file simple in CJS/ESM interop.

  const crypto = require('crypto');
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
}

export async function subscribeToMailchimp(email: string, source: string) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const listId = process.env.MAILCHIMP_LIST_ID;

  if (!apiKey || !serverPrefix || !listId) return;

  mailchimp.setConfig({ apiKey, server: serverPrefix });

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return;

  await mailchimp.lists.setListMember(listId, getMd5Hash(normalizedEmail), {
    email_address: normalizedEmail,
    status_if_new: 'subscribed',
    status: 'subscribed',
    merge_fields: {
      SOURCE: source,
    },
  });
}
