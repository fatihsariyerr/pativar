const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT f.id as fav_id, f.created_at as favorited_at, l.*,
        (SELECT image_url FROM listing_images li WHERE li.listing_id = l.id AND li.is_primary LIMIT 1) AS primary_image,
        COALESCE(cb.name_tr, db.name_tr) AS breed_name
      FROM favorites f
      JOIN listings l ON f.listing_id = l.id
      LEFT JOIN cat_details cd ON l.id = cd.listing_id AND l.pet_type = 'cat'
      LEFT JOIN cat_breeds cb ON cd.breed_id = cb.id
      LEFT JOIN dog_details dd ON l.id = dd.listing_id AND l.pet_type = 'dog'
      LEFT JOIN dog_breeds db ON dd.breed_id = db.id
      WHERE f.user_id = $1 ORDER BY f.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/:listingId', authenticateToken, async (req, res, next) => {
  try {
    await db.query('INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.listingId]);
    await db.query('UPDATE listings SET favorite_count = favorite_count + 1 WHERE id = $1', [req.params.listingId]);
    res.json({ message: 'Favorilere eklendi' });
  } catch (err) { next(err); }
});

router.delete('/:listingId', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2 RETURNING id',
      [req.user.id, req.params.listingId]);
    if (result.rows.length > 0) {
      await db.query('UPDATE listings SET favorite_count = GREATEST(favorite_count - 1, 0) WHERE id = $1', [req.params.listingId]);
    }
    res.json({ message: 'Favorilerden kaldırıldı' });
  } catch (err) { next(err); }
});

module.exports = router;
