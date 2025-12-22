declare module '@mailchimp/mailchimp_transactional' {
  interface Message {
    message: {
      from_email: string;
      subject: string;
      to: { email: string; type: 'to' }[];
      text?: string;
      html?: string;
    };
  }

  interface MailchimpClient {
    messages: {
      send(msg: Message): Promise<any>;
    };
  }

  function mailchimp(apiKey: string): MailchimpClient;
  export default mailchimp;
}
