const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tickets table
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    customer_email TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
  )`, () => {
    // Seed tickets ONLY if database is empty
    db.get('SELECT COUNT(*) as count FROM tickets WHERE deleted_at IS NULL', (err, row) => {
      if (err) {
        console.error('Error checking tickets:', err);
        return;
      }
      
      if (row.count === 0) {
        console.log('🌱 Seeding database with 50 realistic tickets...');
        
        const statuses = ['open', 'pending', 'resolved'];
        const priorities = ['low', 'medium', 'high'];
        
        // Realistic ticket titles for support system
        const ticketTitles = [
          'Cannot login to my account',
          'Payment failed but money deducted',
          'App crashes on startup',
          'How to reset my password?',
          'Slow loading on dashboard',
          'Feature request: Dark mode',
          'Email notifications not working',
          'Unable to upload profile picture',
          'Refund request for order #12345',
          'Account suspended without reason',
          'Mobile app not syncing data',
          'Missing invoice for last month',
          'Cannot update shipping address',
          'Product not delivered yet',
          'Wrong item received in order',
          'API documentation is outdated',
          'Integration with Slack broken',
          'Export to CSV not working',
          'Search results are inaccurate',
          'Two-factor authentication issue',
          'Question about billing cycle',
          'How to cancel my subscription?',
          'Data privacy concerns',
          'Profile information not saving',
          'Notification settings broken',
          'Unable to connect to database',
          'Performance issue on mobile app',
          'Contact form submission failed',
          'Forgot username - need help',
          'Want to merge two accounts',
          'Duplicate charges on card',
          'Order status not updating',
          'Promo code not applying',
          'Cannot delete old files',
          'How to export all my data?',
          'Widget not displaying correctly',
          'Time zone settings incorrect',
          'Language preference not saving',
          'Chat support not responding',
          'File upload limit too small',
          'Broken link on help page',
          'Video tutorial not loading',
          'Keyboard shortcuts not working',
          'Print layout is misaligned',
          'Calendar sync issues with Google',
          'Team member invitation failed',
          'Confused about permission settings',
          'Analytics data seems incorrect',
          'Custom field values not saving',
          'Bulk import showing errors'
        ];
        
        const customerNames = [
          'john.doe', 'jane.smith', 'mike.wilson', 'sarah.johnson', 'david.brown',
          'emily.davis', 'chris.miller', 'lisa.garcia', 'kevin.martinez', 'amanda.lee',
          'robert.taylor', 'maria.anderson', 'james.thomas', 'jennifer.jackson', 'william.white'
        ];
        
        for (let i = 0; i < 50; i++) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const priority = priorities[Math.floor(Math.random() * priorities.length)];
          const title = ticketTitles[i % ticketTitles.length];
          const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
          const randomNum = Math.floor(Math.random() * 100);
          
          db.run(
            `INSERT INTO tickets (title, description, customer_email, status, priority)
             VALUES (?, ?, ?, ?, ?)`,
            [
              title,
              `Customer reported: ${title}. This issue needs to be investigated and resolved as soon as possible.`,
              `${customerName}${randomNum}@example.com`,
              status,
              priority
            ]
          );
        }
        
        console.log('✅ Database seeded with 50 realistic tickets');
      } else {
        console.log(`📊 Database has ${row.count} active tickets (seeding skipped)`);
      }
    });
  });

  // Notes table
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
});

module.exports = db;
