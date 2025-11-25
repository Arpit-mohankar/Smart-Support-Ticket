const db = require('../config/db');

const getStats = (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  db.get('SELECT COUNT(*) as total FROM tickets WHERE deleted_at IS NULL', (err, totalRow) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
    
    db.all(
      'SELECT status, COUNT(*) as count FROM tickets WHERE deleted_at IS NULL GROUP BY status',
      (err, statusRows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
        
        db.get(
          'SELECT COUNT(*) as count FROM tickets WHERE priority = ? AND deleted_at IS NULL',
          ['high'],
          (err, highPriorityRow) => {
            if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
            
            db.all(
              `SELECT DATE(created_at) as date, COUNT(*) as count 
               FROM tickets 
               WHERE created_at >= ? AND deleted_at IS NULL 
               GROUP BY DATE(created_at) 
               ORDER BY date`,
              [sevenDaysAgo.toISOString()],
              (err, chartData) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
                
                const statusCounts = statusRows.reduce((acc, row) => {
                  acc[row.status] = row.count;
                  return acc;
                }, {});
                
                res.json({
                  total: totalRow.total,
                  open: statusCounts.open || 0,
                  pending: statusCounts.pending || 0,
                  resolved: statusCounts.resolved || 0,
                  highPriority: highPriorityRow.count,
                  last7Days: chartData,
                });
              }
            );
          }
        );
      }
    );
  });
};

module.exports = { getStats };
