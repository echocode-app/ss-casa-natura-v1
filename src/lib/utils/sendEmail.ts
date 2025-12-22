import mailchimp from '@mailchimp/mailchimp_transactional';
import { log } from './logger';

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const client = mailchimp(process.env.MAILCHIMP_API_KEY!);

export const sendEmail = async ({ to, subject, text, html }: SendEmailParams) => {
  try {
    const message = {
      message: {
        from_email: process.env.MAILCHIMP_FROM_EMAIL!,
        subject,
        to: [{ email: to, type: 'to' as const }],
        text,
        html,
      },
    };

    await client.messages.send(message);

    log('success', `Email sent to ${to}`);
  } catch (err: any) {
    log('error', `Failed to send email to ${to}`, err);
    throw err;
  }
};
