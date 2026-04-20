const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Geçersiz JSON formatı' });
  }

  if (err.code === '23505') {
    // Unique constraint violation
    if (err.constraint?.includes('phone')) {
      return res.status(409).json({ error: 'Bu telefon numarası zaten kayıtlı' });
    }
    if (err.constraint?.includes('email')) {
      return res.status(409).json({ error: 'Bu e-posta adresi zaten kayıtlı' });
    }
    return res.status(409).json({ error: 'Bu kayıt zaten mevcut' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'İlişkili kayıt bulunamadı' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Sunucu hatası oluştu',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
