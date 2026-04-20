const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/cats', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM cat_breeds WHERE is_active = TRUE ORDER BY name_tr');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/dogs', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM dog_breeds WHERE is_active = TRUE ORDER BY name_tr');
    res.json(result.rows);
  } catch (err) { next(err); }
});

module.exports = router;
