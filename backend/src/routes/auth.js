const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../utils/db');
const { generateToken, authenticateToken } = require('../middleware/auth');

// Check phone availability (before sending SMS verification)
router.post('/check-phone', [
  body('phone').matches(/^(\+90|0)?[0-9]{10}$/).withMessage('Geçerli bir telefon numarası giriniz'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ available: false, error: errors.array()[0].msg });
    }

    let normalizedPhone = req.body.phone.replace(/\s/g, '');
    if (normalizedPhone.startsWith('0')) normalizedPhone = '+90' + normalizedPhone.slice(1);
    if (!normalizedPhone.startsWith('+')) normalizedPhone = '+90' + normalizedPhone;

    const result = await db.query('SELECT id FROM users WHERE phone = $1', [normalizedPhone]);
    if (result.rows.length > 0) {
      return res.status(409).json({ available: false, error: 'Bu telefon numarası ile zaten bir üyelik mevcut.' });
    }
    res.json({ available: true });
  } catch (err) { next(err); }
});

// Register
router.post('/register', [
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('phone').matches(/^(\+90|0)?[0-9]{10}$/).withMessage('Geçerli bir telefon numarası giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('first_name').trim().notEmpty().withMessage('Ad alanı zorunludur'),
  body('last_name').trim().notEmpty().withMessage('Soyad alanı zorunludur'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, phone, password, first_name, last_name, city, district } = req.body;

    // Normalize phone number
    let normalizedPhone = phone.replace(/\s/g, '');
    if (normalizedPhone.startsWith('0')) normalizedPhone = '+90' + normalizedPhone.slice(1);
    if (!normalizedPhone.startsWith('+')) normalizedPhone = '+90' + normalizedPhone;

    // Check if phone already exists
    const phoneCheck = await db.query('SELECT id FROM users WHERE phone = $1', [normalizedPhone]);
    if (phoneCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Bu telefon numarası ile zaten bir hesap kayıtlı. Aynı telefon numarası ile birden fazla hesap oluşturulamaz.' });
    }

    // Check if email already exists
    const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Bu e-posta adresi zaten kayıtlı' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, phone, password_hash, first_name, last_name, city, district) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, phone, first_name, last_name, city, district, created_at`,
      [email.toLowerCase(), normalizedPhone, password_hash, first_name, last_name, city || null, district || null]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    // Get subscription info
    const subResult = await db.query('SELECT * FROM subscriptions WHERE user_id = $1', [user.id]);
    const sub = subResult.rows[0];

    res.status(201).json({
      message: 'Hesabınız başarıyla oluşturuldu! İlk aboneliğinize özel 1 adet ücretsiz ilan hakkınız tanımlandı.',
      token,
      user: {
        ...user,
        plan: sub?.plan || 'free',
        listing_limit: sub?.listing_limit || 1,
        listings_used: sub?.listings_used || 0,
        featured_listings: sub?.featured_listings || 0
      }
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('password').notEmpty().withMessage('Şifre alanı zorunludur'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await db.query(
      'SELECT id, email, phone, password_hash, first_name, last_name, city, district, status FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Hesabınız askıya alınmış durumda' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const token = generateToken(user.id);
    delete user.password_hash;

    // Get subscription
    const subResult = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [user.id, 'active']
    );

    const sub = subResult.rows[0];
    res.json({
      token,
      user: {
        ...user,
        plan: sub?.plan || 'free',
        listing_limit: sub?.listing_limit || 1,
        listings_used: sub?.listings_used || 0,
        featured_listings: sub?.featured_listings || 0
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.avatar_url, u.city, u.district, u.created_at,
              s.plan, s.listing_limit, s.listings_used, s.featured_listings, s.status as sub_status
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
       WHERE u.id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
