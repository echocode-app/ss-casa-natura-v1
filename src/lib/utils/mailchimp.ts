import Mailchimp from '@mailchimp/mailchimp_marketing';

Mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY!,
  server: process.env.MAILCHIMP_SERVER_PREFIX!,
});

export const subscribeToNewsletter = async (
  email: string,
  firstName?: string,
  lastName?: string,
) => {
  try {
    const response = await Mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID!, {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName || '',
        LNAME: lastName || '',
      },
    });
    return response;
  } catch (error: any) {
    throw new Error(error.response?.body?.title || error.message || 'Mailchimp error');
  }
};
