const jwt = require('jsonwebtoken');
const db = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'pativar-super-secret-key-change-in-production';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Yetkilendirme token\'ı gerekli' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await db.query('SELECT id, email, phone, first_name, last_name, status FROM users WHERE id = $1', [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (result.rows[0].status !== 'active') {
      return res.status(403).json({ error: 'Hesabınız askıya alınmış' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const result = await db.query('SELECT id, email, phone, first_name, last_name, status FROM users WHERE id = $1', [decoded.userId]);
      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    } catch (err) {
      // Token invalid, continue without user
    }
  }
  next();
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = { authenticateToken, optionalAuth, generateToken, JWT_SECRET };
