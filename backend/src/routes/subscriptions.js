const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

// Get current subscription
router.get('/current', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aktif abonelik bulunamadı' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

// Get plans
router.get('/plans', (req, res) => {
  res.json([
    { plan: 'free', name: 'Ücretsiz', listing_limit: 1, featured_listings: 0, price: 0, description: 'Kayıt ile 1 ilan hakkı', badge: false },
    { plan: 'basic', name: 'Temel Paket', listing_limit: 1, featured_listings: 0, price: 99.99, description: '1 ilan hakkı', badge: false },
    { plan: 'premium', name: 'Premium Paket', listing_limit: 5, featured_listings: 1, price: 349.99, description: '5 ilan hakkı + Premium çerçeve', badge: true },
    { plan: 'business', name: 'İşletme Paketi', listing_limit: 20, featured_listings: 5, price: 799.99, description: '20 ilan hakkı + Premium çerçeve', badge: true },
  ]);
});

// Purchase package
router.post('/upgrade', authenticateToken, async (req, res, next) => {
  try {
    const { plan } = req.body;
    const planConfig = {
      basic: { listing_limit: 1, featured: 0, price: 99.99 },
      premium: { listing_limit: 5, featured: 1, price: 349.99 },
      business: { listing_limit: 20, featured: 5, price: 799.99 }
    };

    if (!planConfig[plan]) return res.status(400).json({ error: 'Geçersiz paket' });

    // Expire old subscription
    await db.query("UPDATE subscriptions SET status = 'expired' WHERE user_id = $1 AND status = 'active'", [req.user.id]);

    // Get current listings used
    const usedResult = await db.query(
      "SELECT COUNT(*) FROM listings WHERE user_id = $1 AND status = 'active'",
      [req.user.id]
    );

    // No expiry — one-time package purchase
    const result = await db.query(
      `INSERT INTO subscriptions (user_id, plan, status, listing_limit, listings_used, featured_listings, price)
       VALUES ($1, $2, 'active', $3, $4, $5, $6) RETURNING *`,
      [req.user.id, plan, planConfig[plan].listing_limit, parseInt(usedResult.rows[0].count), planConfig[plan].featured, planConfig[plan].price]
    );

    res.json({ message: 'Paket satın alındı!', subscription: result.rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
