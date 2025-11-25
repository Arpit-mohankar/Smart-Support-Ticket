const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const updateTicketSchema = z.object({
  body: z.object({
    status: z.enum(['open', 'pending', 'resolved']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ticket ID'),
  }),
});

const createNoteSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Note text is required').max(1000, 'Note too long'),
  }),
  params: z.object({
    ticketId: z.string().regex(/^\d+$/, 'Invalid ticket ID'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateTicketSchema,
  createNoteSchema,
};
