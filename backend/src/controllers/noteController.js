const db = require('../config/db');

const getNotes = (req, res) => {
  db.all(
    `SELECT notes.*, users.name as user_name 
     FROM notes 
     JOIN users ON notes.user_id = users.id 
     WHERE ticket_id = ? 
     ORDER BY created_at DESC`,
    [req.params.ticketId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch notes' });
      }
      res.json(rows);
    }
  );
};

const createNote = (req, res) => {
  const { text } = req.body;
  const sanitizedText = text.replace(/<[^>]*>/g, ''); // Basic HTML stripping
  
  db.run(
    'INSERT INTO notes (ticket_id, user_id, text) VALUES (?, ?, ?)',
    [req.params.ticketId, req.user.id, sanitizedText],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create note' });
      }
      
      db.get(
        `SELECT notes.*, users.name as user_name 
         FROM notes 
         JOIN users ON notes.user_id = users.id 
         WHERE notes.id = ?`,
        [this.lastID],
        (err, row) => {
          res.status(201).json(row);
        }
      );
    }
  );
};

module.exports = { getNotes, createNote };
