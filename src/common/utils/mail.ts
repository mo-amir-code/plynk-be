import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import logger from "../logger";

export interface ContactEmailOptions {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactEmail = async (options: ContactEmailOptions) => {
  const { fullName, email, subject, message } = options;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    family: 4,
  } as SMTPTransport.Options);

  const mailOptions = {
    from: `"${fullName}" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL || "plynk2026@gmail.com",
    replyTo: email,
    subject: `Contact Form Submission: ${subject}`,
    text: `You have received a new message from your contact form:

Name: ${fullName}
Email: ${email}
Subject: ${subject}
Message: ${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          This message was sent from the Plynk contact form.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(error as Error, "Error sending email");
    throw error;
  }
};
