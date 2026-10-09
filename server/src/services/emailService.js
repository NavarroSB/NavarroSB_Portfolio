import escapeHtml from 'escape-html';
import { Resend } from 'resend';

export function createEmailService(config, { ResendClient = Resend } = {}) {
  const client = new ResendClient(config.resendApiKey);

  return {
    async sendContactNotification(contact) {
      const html = `
        <h1>New portfolio contact</h1>
        <p><strong>Name:</strong> ${escapeHtml(contact.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(contact.subject)}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap">${escapeHtml(contact.message)}</p>
      `;

      const { data, error } = await client.emails.send({
        from: config.emailFrom,
        to: config.contactToEmail,
        replyTo: contact.email,
        subject: 'New portfolio contact',
        html,
      });

      if (error) throw new Error(error.message || 'Email notification failed');
      return data;
    },
  };
}
