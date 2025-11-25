const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const password_hash = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, password_hash],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(201).json({ message: 'User created successfully', userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ access_token: token, user: { id: user.id, name: user.name, email: user.email } });
  });
};

module.exports = { register, login };
