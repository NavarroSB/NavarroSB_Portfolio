import Contact from '../models/Contact.js';
import { contactSchema } from '../validation/contactValidation.js';

const receipt = { message: 'Message received.' };

function hasPopulatedWebsite(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

export function createContactController({ ContactModel = Contact, emailService, logger = console }) {
  return async (req, res, next) => {
    if (hasPopulatedWebsite(req.body?.website)) {
      return res.status(201).json(receipt);
    }

    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid contact submission.' });
    }

    try {
      const { name, email, subject, message } = parsed.data;
      const contact = await ContactModel.create({
        name,
        email,
        subject,
        message,
        notificationStatus: 'pending',
      });

      try {
        await emailService.sendContactNotification(contact);
        contact.notificationStatus = 'sent';
      } catch {
        logger.error('Contact notification failed');
        contact.notificationStatus = 'failed';
      }

      try {
        await contact.save();
      } catch {
        logger.error('Contact notification status update failed');
      }
      return res.status(201).json(receipt);
    } catch (error) {
      return next(error);
    }
  };
}
