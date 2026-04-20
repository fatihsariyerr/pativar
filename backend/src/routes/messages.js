const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

// Get conversations
router.get('/conversations', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT ON (other_user_id)
        m.id, m.content, m.created_at, m.is_read,
        CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AS other_user_id,
        u.first_name, u.last_name, u.avatar_url
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY other_user_id, m.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// Get messages with user
router.get('/with/:userId', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT m.*, u.first_name, u.last_name FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC LIMIT 100
    `, [req.user.id, req.params.userId]);

    // Mark as read
    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE',
      [req.user.id, req.params.userId]
    );

    res.json(result.rows);
  } catch (err) { next(err); }
});

// Send message
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { receiver_id, listing_id, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Mesaj boş olamaz' });

    const result = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, listing_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, receiver_id, listing_id || null, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

// Unread count
router.get('/unread-count', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = FALSE',
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) { next(err); }
});

module.exports = router;
