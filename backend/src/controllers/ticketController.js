const db = require('../config/db');

const getTickets = (req, res) => {
  const { page = 1, limit = 10, status, priority, search } = req.query;
  const offset = (page - 1) * limit;
  
  // filters query
  let query = 'SELECT * FROM tickets WHERE deleted_at IS NULL';
  let countQuery = 'SELECT COUNT(*) as total FROM tickets WHERE deleted_at IS NULL';
  
  const params = [];
  const countParams = []; // count query have seprate params
  
  if (status) {
    query += ' AND status = ?';
    countQuery += ' AND status = ?';
    params.push(status);
    countParams.push(status);
  }
  
  if (priority) {
    query += ' AND priority = ?';
    countQuery += ' AND priority = ?';
    params.push(priority);
    countParams.push(priority);
  }
  
  if (search) {
    query += ' AND (title LIKE ? OR customer_email LIKE ?)';
    countQuery += ' AND (title LIKE ? OR customer_email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  // Run count on query 
  db.get(countQuery, countParams, (err, countRow) => {
    if (err) {
      console.error('Count query error:', err);
      return res.status(500).json({ error: 'Failed to count tickets' });
    }
    
    const total = countRow?.total || 0;
    const totalPages = Math.ceil(total / parseInt(limit));
    
    // Run for data query
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Data query error:', err);
        return res.status(500).json({ error: 'ticket fetching failed' });
      }
      
      res.json({
        tickets: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: totalPages,
        },
      });
    });
  });
};

const getTicketById = (req, res) => {
  db.get(
    'SELECT * FROM tickets WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error('Get ticket error:', err);
        return res.status(500).json({ error: 'Ticket fetching failed' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Tickets are not found' });
      }
      res.json(row);
    }
  );
};

const updateTicket = (req, res) => {
  const { status, priority } = req.body;
  
  // Validate data if atleast one field is provided
  if (!status && !priority) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: [{ message: 'At least one field (status or priority) must be provided' }]
    });
  }
  
  db.run(
    `UPDATE tickets 
     SET status = ?, priority = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND deleted_at IS NULL`,
    [status, priority, req.params.id],
    function(err) {
      if (err) {
        console.error('Update ticket error:', err);
        return res.status(500).json({ error: 'Update ticket failed' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Ticket cant be found or deleted already ' });
      }
      
      // get tickets which are updated
      db.get(
        'SELECT * FROM tickets WHERE id = ?',
        [req.params.id],
        (err, row) => {
          if (err) {
            console.error('Fetch updated ticket error:', err);
            return res.status(500).json({ error: 'Tickets are updated but failed to retrieve' });
          }
          res.json(row);
        }
      );
    }
  );
};

const deleteTicket = (req, res) => {
  db.run(
    'UPDATE tickets SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL',
    [req.params.id],
    function(err) {
      if (err) {
        console.error('Delete ticket error:', err);
        return res.status(500).json({ error: 'Failed to delete ticket' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Ticket cant be found or deleted already' });
      }
      
      res.json({ 
        message: 'Tickets are deleted successfully',
        id: parseInt(req.params.id)
      });
    }
  );
};

module.exports = { getTickets, getTicketById, updateTicket, deleteTicket };
