import { Resend } from 'resend';
import logger from '../logger';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'no-reply@plynk.in';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Plynk <${fromEmail}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      logger.error({ error }, 'Resend Error');
      throw new Error('Failed to send email');
    }

    return data;
  } catch (error) {
    logger.error({ error }, 'Email util error');
    throw error;
  }
};
