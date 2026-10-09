import mongoose from 'mongoose';
import { z } from 'zod';
import Contact from '../models/Contact.js';
import { contactSchema } from '../validation/contactValidation.js';

const adminContactSchema = contactSchema.omit({ website: true });
const adminContactUpdateSchema = adminContactSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one editable contact field is required.',
);
const paginationValue = z.string().regex(/^\d+$/);
const objectIdPattern = /^[a-f\d]{24}$/i;
const maxPage = 1_000_000;

function parsePaginationValue(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !paginationValue.safeParse(value).success) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function toContactDto(contact) {
  if (!contact) return null;
  const value = typeof contact.toObject === 'function' ? contact.toObject() : contact;
  return {
    id: String(value._id ?? value.id),
    name: value.name,
    email: value.email,
    subject: value.subject,
    message: value.message,
    notificationStatus: value.notificationStatus,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function invalidPayload(res) {
  return res.status(400).json({ message: 'Invalid contact data.' });
}

function invalidId(res) {
  return res.status(400).json({ message: 'Invalid contact ID.' });
}

export function createContactAdminController({ ContactModel = Contact } = {}) {
  return {
    async create(req, res, next) {
      const parsed = adminContactSchema.safeParse(req.body);
      if (!parsed.success) return invalidPayload(res);

      try {
        const contact = await ContactModel.create(parsed.data);
        return res.status(201).json({ contact: toContactDto(contact) });
      } catch (error) {
        return next(error);
      }
    },

    async list(req, res, next) {
      const page = parsePaginationValue(req.query.page, 1);
      const requestedLimit = parsePaginationValue(req.query.limit, 25);
      if (page === null || page > maxPage || requestedLimit === null) {
        return res.status(400).json({ message: 'Invalid pagination parameters.' });
      }
      const limit = Math.min(requestedLimit, 100);

      try {
        const [contacts, total] = await Promise.all([
          ContactModel.find({}).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
          ContactModel.countDocuments({}),
        ]);
        return res.json({
          contacts: contacts.map(toContactDto),
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
      } catch (error) {
        return next(error);
      }
    },

    async read(req, res, next) {
      if (!objectIdPattern.test(req.params.id) || !mongoose.isValidObjectId(req.params.id)) return invalidId(res);
      try {
        const contact = await ContactModel.findById(req.params.id).lean();
        if (!contact) return res.status(404).json({ message: 'Contact not found.' });
        return res.json({ contact: toContactDto(contact) });
      } catch (error) {
        return next(error);
      }
    },

    async update(req, res, next) {
      if (!objectIdPattern.test(req.params.id) || !mongoose.isValidObjectId(req.params.id)) return invalidId(res);
      const parsed = adminContactUpdateSchema.safeParse(req.body);
      if (!parsed.success) return invalidPayload(res);

      try {
        const contact = await ContactModel.findByIdAndUpdate(
          req.params.id,
          { $set: parsed.data },
          { new: true, runValidators: true },
        );
        if (!contact) return res.status(404).json({ message: 'Contact not found.' });
        return res.json({ contact: toContactDto(contact) });
      } catch (error) {
        return next(error);
      }
    },

    async remove(req, res, next) {
      if (!objectIdPattern.test(req.params.id) || !mongoose.isValidObjectId(req.params.id)) return invalidId(res);
      try {
        const contact = await ContactModel.findByIdAndDelete(req.params.id);
        if (!contact) return res.status(404).json({ message: 'Contact not found.' });
        return res.json({ message: 'Contact deleted.', id: String(contact._id) });
      } catch (error) {
        return next(error);
      }
    },
  };
}
