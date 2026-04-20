const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../utils/db');

router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Ad en az 2 karakter olmalıdır'),
  body('email').trim().isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('subject').trim().isLength({ min: 3, max: 200 }).withMessage('Konu 3-200 karakter arası olmalıdır'),
  body('message').trim().isLength({ min: 10, max: 5000 }).withMessage('Mesaj 10-5000 karakter arası olmalıdır'),
  body('captcha_answer').notEmpty().withMessage('Doğrulama cevabı giriniz'),
  body('captcha_expected').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message, captcha_answer, captcha_expected } = req.body;

    if (String(captcha_answer).trim() !== String(captcha_expected).trim()) {
      return res.status(400).json({ error: 'Doğrulama cevabı yanlış. Lütfen tekrar deneyin.' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

    const result = await db.query(
      `INSERT INTO contact_messages (name, email, subject, message, ip_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [name, email, subject, message, ip]
    );

    res.status(201).json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapılacaktır.',
      id: result.rows[0].id,
      created_at: result.rows[0].created_at
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
