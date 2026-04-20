const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const db = require('../utils/db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Get all active listings with filters
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      pet_type, breed_id, city, purpose, gender,
      min_price, max_price, size, is_vaccinated, is_featured,
      sort_by = 'created_at', sort_order = 'DESC',
      page = 1, limit = 20, search
    } = req.query;

    let whereConditions = ["l.status = 'active'"];
    let params = [];
    let paramIndex = 1;

    if (pet_type) { whereConditions.push(`l.pet_type = $${paramIndex++}`); params.push(pet_type); }
    if (city) { whereConditions.push(`l.city ILIKE $${paramIndex++}`); params.push(`%${city}%`); }
    if (purpose) { whereConditions.push(`l.purpose = $${paramIndex++}`); params.push(purpose); }
    if (min_price) { whereConditions.push(`l.price >= $${paramIndex++}`); params.push(min_price); }
    if (max_price) { whereConditions.push(`l.price <= $${paramIndex++}`); params.push(max_price); }
    if (search) { whereConditions.push(`(l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex} OR l.city ILIKE $${paramIndex} OR COALESCE(cb.name_tr, '') ILIKE $${paramIndex} OR COALESCE(cb.name, '') ILIKE $${paramIndex} OR COALESCE(db.name_tr, '') ILIKE $${paramIndex} OR COALESCE(db.name, '') ILIKE $${paramIndex})`); params.push(`%${search}%`); paramIndex++; }

    if (pet_type === 'cat') {
      if (breed_id) { whereConditions.push(`cd.breed_id = $${paramIndex++}`); params.push(breed_id); }
      if (gender) { whereConditions.push(`cd.gender = $${paramIndex++}`); params.push(gender); }
      if (is_vaccinated === 'true') { whereConditions.push(`cd.is_vaccinated = TRUE`); }
    } else if (pet_type === 'dog') {
      if (breed_id) { whereConditions.push(`dd.breed_id = $${paramIndex++}`); params.push(breed_id); }
      if (gender) { whereConditions.push(`dd.gender = $${paramIndex++}`); params.push(gender); }
      if (size) { whereConditions.push(`dd.size = $${paramIndex++}`); params.push(size); }
      if (is_vaccinated === 'true') { whereConditions.push(`dd.is_vaccinated = TRUE`); }
    }

    if (is_featured === 'true') {
      whereConditions.push(`l.is_featured = TRUE`);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const allowedSorts = ['created_at', 'price', 'view_count'];
    const sortField = allowedSorts.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = sort_order === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = `
      SELECT COUNT(*) FROM listings l
      LEFT JOIN cat_details cd ON l.id = cd.listing_id AND l.pet_type = 'cat'
      LEFT JOIN cat_breeds cb ON cd.breed_id = cb.id
      LEFT JOIN dog_details dd ON l.id = dd.listing_id AND l.pet_type = 'dog'
      LEFT JOIN dog_breeds db ON dd.breed_id = db.id
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const listingsQuery = `
      SELECT 
        l.*,
        u.first_name, u.last_name, u.avatar_url,
        COALESCE(cb.name_tr, db.name_tr) AS breed_name,
        COALESCE(cd.gender, dd.gender) AS gender,
        COALESCE(cd.age_months, dd.age_months) AS age_months,
        COALESCE(cd.age_years, dd.age_years) AS age_years,
        COALESCE(cd.is_vaccinated, dd.is_vaccinated) AS is_vaccinated,
        dd.size AS dog_size,
        (SELECT image_url FROM listing_images li WHERE li.listing_id = l.id AND li.is_primary = TRUE LIMIT 1) AS primary_image,
        (SELECT COUNT(*) FROM listing_images li WHERE li.listing_id = l.id) AS image_count,
        (SELECT s.plan FROM subscriptions s WHERE s.user_id = l.user_id AND s.status = 'active' ORDER BY s.created_at DESC LIMIT 1) AS owner_plan
        ${req.user ? `, EXISTS(SELECT 1 FROM favorites f WHERE f.listing_id = l.id AND f.user_id = '${req.user.id}') AS is_favorited` : ''}
      FROM listings l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN cat_details cd ON l.id = cd.listing_id AND l.pet_type = 'cat'
      LEFT JOIN cat_breeds cb ON cd.breed_id = cb.id
      LEFT JOIN dog_details dd ON l.id = dd.listing_id AND l.pet_type = 'dog'
      LEFT JOIN dog_breeds db ON dd.breed_id = db.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY l.is_featured DESC, l.${sortField} ${sortDir}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(parseInt(limit), offset);

    const result = await db.query(listingsQuery, params);

    res.json({
      listings: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get single listing
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Increment view count
    await db.query('UPDATE listings SET view_count = view_count + 1 WHERE id = $1', [id]);

    const listingResult = await db.query(`
      SELECT l.*, u.first_name, u.last_name, u.avatar_url, u.city as user_city, u.phone as user_phone,
             u.created_at as user_since
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `, [id]);

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }

    const listing = listingResult.rows[0];

    // Get pet details
    let petDetails = null;
    if (listing.pet_type === 'cat') {
      const detailResult = await db.query(`
        SELECT cd.*, cb.name as breed_name, cb.name_tr as breed_name_tr
        FROM cat_details cd
        LEFT JOIN cat_breeds cb ON cd.breed_id = cb.id
        WHERE cd.listing_id = $1
      `, [id]);
      petDetails = detailResult.rows[0] || null;
    } else if (listing.pet_type === 'dog') {
      const detailResult = await db.query(`
        SELECT dd.*, db.name as breed_name, db.name_tr as breed_name_tr
        FROM dog_details dd
        LEFT JOIN dog_breeds db ON dd.breed_id = db.id
        WHERE dd.listing_id = $1
      `, [id]);
      petDetails = detailResult.rows[0] || null;
    }

    // Get images
    const imagesResult = await db.query(
      'SELECT * FROM listing_images WHERE listing_id = $1 ORDER BY sort_order',
      [id]
    );

    // Check favorite
    let isFavorited = false;
    if (req.user) {
      const favResult = await db.query(
        'SELECT id FROM favorites WHERE user_id = $1 AND listing_id = $2',
        [req.user.id, id]
      );
      isFavorited = favResult.rows.length > 0;
    }

    res.json({
      ...listing,
      pet_details: petDetails,
      images: imagesResult.rows,
      is_favorited: isFavorited
    });
  } catch (err) {
    next(err);
  }
});

// Create listing
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Başlık 5-200 karakter arası olmalıdır'),
  body('pet_type').isIn(['cat', 'dog']).withMessage('Hayvan türü seçiniz'),
  body('purpose').optional().isIn(['adoption', 'mating']).withMessage('İlan amacı geçersiz'),
  body('city').trim().notEmpty().withMessage('Şehir seçiniz'),
], async (req, res, next) => {
  const client = await db.getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check subscription limit
    const subResult = await client.query(
      "SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );

    if (subResult.rows.length === 0) {
      return res.status(403).json({ error: 'Aktif aboneliğiniz bulunmuyor' });
    }

    const subscription = subResult.rows[0];
    if (subscription.listings_used >= subscription.listing_limit) {
      return res.status(403).json({
        error: `İlan limitinize ulaştınız (${subscription.listing_limit}/${subscription.listing_limit}). Daha fazla ilan vermek için aboneliğinizi yükseltin.`,
        listing_limit: subscription.listing_limit,
        listings_used: subscription.listings_used
      });
    }

    await client.query('BEGIN');

    const { title, description, pet_type, purpose, city, district,
            contact_phone, contact_whatsapp, pet_details, images, is_featured } = req.body;

    // Check featured credit if requested
    let useFeatured = false;
    if (is_featured) {
      if (subscription.featured_listings <= 0) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Öne çıkarma hakkınız bulunmuyor. Premium veya İşletme paketi satın alarak öne çıkarma hakkı kazanabilirsiniz.' });
      }
      useFeatured = true;
    }

    // Create listing
    const listingResult = await client.query(`
      INSERT INTO listings (user_id, title, description, pet_type, purpose,
                           city, district, contact_phone, contact_whatsapp, status, published_at,
                           expires_at, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', NOW(), NOW() + INTERVAL '30 days', $10)
      RETURNING *
    `, [req.user.id, title, description, pet_type, purpose || 'adoption',
        city, district || null, contact_phone || req.user.phone, contact_whatsapp || false, useFeatured]);

    const listing = listingResult.rows[0];

    // Create pet details
    if (pet_type === 'cat' && pet_details) {
      const d = pet_details;
      await client.query(`
        INSERT INTO cat_details (listing_id, breed_id, gender, age_months, age_years, color, coat_length,
          eye_color, weight_kg, is_neutered, is_vaccinated, is_microchipped, is_dewormed,
          is_fiv_felv_tested, fiv_felv_result, is_litter_trained, is_indoor, is_good_with_kids,
          is_good_with_dogs, is_good_with_cats, health_status, health_notes, has_pedigree,
          pedigree_number, personality, special_needs, dietary_notes)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
      `, [listing.id, d.breed_id, d.gender, d.age_months, d.age_years, d.color, d.coat_length,
          d.eye_color, d.weight_kg, d.is_neutered, d.is_vaccinated, d.is_microchipped, d.is_dewormed,
          d.is_fiv_felv_tested, d.fiv_felv_result, d.is_litter_trained, d.is_indoor, d.is_good_with_kids,
          d.is_good_with_dogs, d.is_good_with_cats, d.health_status, d.health_notes, d.has_pedigree,
          d.pedigree_number, d.personality, d.special_needs, d.dietary_notes]);
    } else if (pet_type === 'dog' && pet_details) {
      const d = pet_details;
      await client.query(`
        INSERT INTO dog_details (listing_id, breed_id, gender, age_months, age_years, color, coat_length,
          size, weight_kg, height_cm, is_neutered, is_vaccinated, is_microchipped, is_dewormed,
          is_rabies_vaccinated, is_house_trained, is_leash_trained, is_crate_trained,
          is_good_with_kids, is_good_with_dogs, is_good_with_cats, energy_level, barking_level,
          training_level, health_status, health_notes, has_pedigree, pedigree_number,
          personality, special_needs, dietary_notes, exercise_needs)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)
      `, [listing.id, d.breed_id, d.gender, d.age_months, d.age_years, d.color, d.coat_length,
          d.size, d.weight_kg, d.height_cm, d.is_neutered, d.is_vaccinated, d.is_microchipped,
          d.is_dewormed, d.is_rabies_vaccinated, d.is_house_trained, d.is_leash_trained,
          d.is_crate_trained, d.is_good_with_kids, d.is_good_with_dogs, d.is_good_with_cats,
          d.energy_level, d.barking_level, d.training_level, d.health_status, d.health_notes,
          d.has_pedigree, d.pedigree_number, d.personality, d.special_needs, d.dietary_notes,
          d.exercise_needs]);
    }

    // Create images
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        await client.query(
          `INSERT INTO listing_images (listing_id, image_url, thumbnail_url, sort_order, is_primary)
           VALUES ($1, $2, $3, $4, $5)`,
          [listing.id, images[i].url, images[i].thumbnail_url, i, i === 0]
        );
      }
    }

    // Decrement featured credit if used
    if (useFeatured) {
      await client.query(
        "UPDATE subscriptions SET featured_listings = featured_listings - 1 WHERE user_id = $1 AND status = 'active'",
        [req.user.id]
      );
    }

    // Log
    await client.query(
      `INSERT INTO audit_log (user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, 'listing_created', 'listing', $2, $3)`,
      [req.user.id, listing.id, req.ip]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'İlanınız başarıyla oluşturuldu!',
      listing
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Update listing
router.put('/:id', authenticateToken, async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { id } = req.params;
    const listingCheck = await client.query('SELECT * FROM listings WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (listingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'İlan bulunamadı veya bu ilana erişim yetkiniz yok' });
    }

    const existingListing = listingCheck.rows[0];
    const { title, description, purpose, city, district, contact_phone, contact_whatsapp, pet_details, is_featured } = req.body;

    await client.query('BEGIN');

    // Handle featured toggle
    let newFeatured = existingListing.is_featured;
    if (is_featured === true && !existingListing.is_featured) {
      // Wants to make it featured - check credit
      const subResult = await client.query(
        "SELECT featured_listings FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
        [req.user.id]
      );
      if (subResult.rows.length === 0 || subResult.rows[0].featured_listings <= 0) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Öne çıkarma hakkınız bulunmuyor.' });
      }
      await client.query(
        "UPDATE subscriptions SET featured_listings = featured_listings - 1 WHERE user_id = $1 AND status = 'active'",
        [req.user.id]
      );
      newFeatured = true;
    }

    const result = await client.query(`
      UPDATE listings SET title = COALESCE($1, title), description = COALESCE($2, description),
        purpose = COALESCE($3, purpose),
        city = COALESCE($4, city), district = COALESCE($5, district),
        contact_phone = COALESCE($6, contact_phone), contact_whatsapp = COALESCE($7, contact_whatsapp),
        is_featured = $8
      WHERE id = $9 RETURNING *
    `, [title, description, purpose, city, district, contact_phone, contact_whatsapp, newFeatured, id]);

    // Update pet details
    if (pet_details && existingListing.pet_type === 'cat') {
      const d = pet_details;
      await client.query(`
        UPDATE cat_details SET
          breed_id = COALESCE($1, breed_id), gender = COALESCE($2, gender),
          age_months = $3, age_years = $4, color = $5, coat_length = $6,
          eye_color = $7, weight_kg = $8, is_neutered = $9, is_vaccinated = $10,
          is_microchipped = $11, is_dewormed = $12, is_fiv_felv_tested = $13,
          fiv_felv_result = $14, is_litter_trained = $15, is_indoor = $16,
          is_good_with_kids = $17, is_good_with_dogs = $18, is_good_with_cats = $19,
          health_status = $20, health_notes = $21, has_pedigree = $22,
          pedigree_number = $23, personality = $24, special_needs = $25, dietary_notes = $26
        WHERE listing_id = $27
      `, [d.breed_id, d.gender, d.age_months, d.age_years, d.color, d.coat_length,
          d.eye_color, d.weight_kg, d.is_neutered, d.is_vaccinated, d.is_microchipped, d.is_dewormed,
          d.is_fiv_felv_tested, d.fiv_felv_result, d.is_litter_trained, d.is_indoor, d.is_good_with_kids,
          d.is_good_with_dogs, d.is_good_with_cats, d.health_status, d.health_notes, d.has_pedigree,
          d.pedigree_number, d.personality, d.special_needs, d.dietary_notes, id]);
    } else if (pet_details && existingListing.pet_type === 'dog') {
      const d = pet_details;
      await client.query(`
        UPDATE dog_details SET
          breed_id = COALESCE($1, breed_id), gender = COALESCE($2, gender),
          age_months = $3, age_years = $4, color = $5, coat_length = $6,
          size = $7, weight_kg = $8, height_cm = $9, is_neutered = $10, is_vaccinated = $11,
          is_microchipped = $12, is_dewormed = $13, is_rabies_vaccinated = $14,
          is_house_trained = $15, is_leash_trained = $16, is_crate_trained = $17,
          is_good_with_kids = $18, is_good_with_dogs = $19, is_good_with_cats = $20,
          energy_level = $21, barking_level = $22, training_level = $23,
          health_status = $24, health_notes = $25, has_pedigree = $26,
          pedigree_number = $27, personality = $28, special_needs = $29,
          dietary_notes = $30, exercise_needs = $31
        WHERE listing_id = $32
      `, [d.breed_id, d.gender, d.age_months, d.age_years, d.color, d.coat_length,
          d.size, d.weight_kg, d.height_cm, d.is_neutered, d.is_vaccinated,
          d.is_microchipped, d.is_dewormed, d.is_rabies_vaccinated,
          d.is_house_trained, d.is_leash_trained, d.is_crate_trained,
          d.is_good_with_kids, d.is_good_with_dogs, d.is_good_with_cats,
          d.energy_level, d.barking_level, d.training_level, d.health_status, d.health_notes,
          d.has_pedigree, d.pedigree_number, d.personality, d.special_needs,
          d.dietary_notes, d.exercise_needs, id]);
    }

    await client.query('COMMIT');

    res.json({ message: 'İlan güncellendi', listing: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Delete listing
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(
      "UPDATE listings SET status = 'removed' WHERE id = $1 AND user_id = $2 AND status = 'active' RETURNING id",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }
    res.json({ message: 'İlan silindi' });
  } catch (err) {
    next(err);
  }
});

// Get my listing for editing
router.get('/user/my-listings/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const listingResult = await db.query('SELECT * FROM listings WHERE id = $1 AND user_id = $2 AND status != $3', [id, req.user.id, 'removed']);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }
    const listing = listingResult.rows[0];

    let petDetails = null;
    if (listing.pet_type === 'cat') {
      const r = await db.query('SELECT cd.*, cb.name_tr as breed_name_tr FROM cat_details cd LEFT JOIN cat_breeds cb ON cd.breed_id = cb.id WHERE cd.listing_id = $1', [id]);
      petDetails = r.rows[0] || null;
    } else if (listing.pet_type === 'dog') {
      const r = await db.query('SELECT dd.*, db.name_tr as breed_name_tr FROM dog_details dd LEFT JOIN dog_breeds db ON dd.breed_id = db.id WHERE dd.listing_id = $1', [id]);
      petDetails = r.rows[0] || null;
    }

    const imagesResult = await db.query('SELECT * FROM listing_images WHERE listing_id = $1 ORDER BY sort_order', [id]);

    // Get subscription for featured info
    const subResult = await db.query(
      "SELECT featured_listings FROM subscriptions WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );

    res.json({
      ...listing,
      pet_details: petDetails,
      images: imagesResult.rows,
      featured_credits: subResult.rows[0]?.featured_listings || 0
    });
  } catch (err) { next(err); }
});

// Get my listings
router.get('/user/my-listings', authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT l.*, 
        (SELECT image_url FROM listing_images li WHERE li.listing_id = l.id AND li.is_primary LIMIT 1) AS primary_image,
        COALESCE(cb.name_tr, db.name_tr) AS breed_name
      FROM listings l
      LEFT JOIN cat_details cd ON l.id = cd.listing_id AND l.pet_type = 'cat'
      LEFT JOIN cat_breeds cb ON cd.breed_id = cb.id
      LEFT JOIN dog_details dd ON l.id = dd.listing_id AND l.pet_type = 'dog'
      LEFT JOIN dog_breeds db ON dd.breed_id = db.id
      WHERE l.user_id = $1 AND l.status != 'removed'
      ORDER BY l.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
