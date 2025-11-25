require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authenticateToken = require('./middleware/auth');
const validate = require('./middleware/validate');
const { register, login } = require('./controllers/authController');
const { getTickets, getTicketById, updateTicket, deleteTicket } = require('./controllers/ticketController');
const { getNotes, createNote } = require('./controllers/noteController');
const { getStats } = require('./controllers/statsController');
const { 
  registerSchema, 
  loginSchema, 
  updateTicketSchema, 
  createNoteSchema 
} = require('./schemas/validation');

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
app.post('/auth/register', validate(registerSchema), register);
app.post('/auth/login', validate(loginSchema), login);

// Ticket routes
app.get('/tickets', authenticateToken, getTickets);
app.get('/tickets/:id', authenticateToken, getTicketById);
app.patch('/tickets/:id', authenticateToken, validate(updateTicketSchema), updateTicket);
app.delete('/tickets/:id', authenticateToken, deleteTicket);

// Note routes
app.get('/tickets/:ticketId/notes', authenticateToken, getNotes);
app.post('/tickets/:ticketId/notes', authenticateToken, validate(createNoteSchema), createNote);

// Stats route
app.get('/stats', authenticateToken, getStats);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
