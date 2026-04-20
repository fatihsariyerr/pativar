const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Sadece JPEG, PNG, WebP ve GIF formatları desteklenir'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 10 } });

router.post('/', authenticateToken, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'En az bir fotoğraf yüklenmelidir' });
  }

  const images = req.files.map((file, i) => ({
    url: `/uploads/${file.filename}`,
    thumbnail_url: `/uploads/${file.filename}`,
    original_name: file.originalname,
    size: file.size
  }));

  res.json({ images });
});

module.exports = router;
