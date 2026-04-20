const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get user profile
router.get('/:id/profile', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.avatar_url, u.city, u.district, u.created_at,
              COUNT(l.id) FILTER (WHERE l.status = 'active') AS active_listings
       FROM users u
       LEFT JOIN listings l ON u.id = l.user_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { first_name, last_name, city, district, avatar_url } = req.body;
    const result = await db.query(
      `UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name),
       city = COALESCE($3, city), district = COALESCE($4, district), avatar_url = COALESCE($5, avatar_url)
       WHERE id = $6 RETURNING id, first_name, last_name, city, district, avatar_url`,
      [first_name, last_name, city, district, avatar_url, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// Change password
router.put('/password', authenticateToken, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalıdır' });
    }
    const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Mevcut şifre hatalı' });

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(new_password, salt);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (err) { next(err); }
});

module.exports = router;
