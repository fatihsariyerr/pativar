require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const userRoutes = require('./routes/users');
const breedRoutes = require('./routes/breeds');
const subscriptionRoutes = require('./routes/subscriptions');
const favoriteRoutes = require('./routes/favorites');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/uploads');
const contactRoutes = require('./routes/contact');
const sitemapRoutes = require('./routes/sitemap');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security & middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 1000,
  message: { error: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.' }
});
app.use('/api/', limiter);

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'pativar-api' });
});

// Readiness check
app.get('/ready', async (req, res) => {
  try {
    const db = require('./utils/db');
    await db.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/breeds', breedRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/', sitemapRoutes);

// Error handling
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐾 PatiVar API sunucusu ${PORT} portunda çalışıyor`);
});

module.exports = app;
