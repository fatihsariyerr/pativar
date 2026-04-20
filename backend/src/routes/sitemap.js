const express = require('express');
const router = express.Router();
const db = require('../utils/db');

const SITE_URL = process.env.FRONTEND_URL || 'https://pativar.com';

const escapeXml = (s) => String(s || '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const staticUrls = [
      { loc: '/', changefreq: 'daily', priority: '1.0' },
      { loc: '/ilanlar', changefreq: 'hourly', priority: '0.9' },
      { loc: '/ilanlar?pet_type=cat', changefreq: 'hourly', priority: '0.9' },
      { loc: '/ilanlar?pet_type=dog', changefreq: 'hourly', priority: '0.9' },
      { loc: '/paketler', changefreq: 'weekly', priority: '0.6' },
      { loc: '/iletisim', changefreq: 'monthly', priority: '0.4' },
      { loc: '/gizlilik', changefreq: 'yearly', priority: '0.2' },
      { loc: '/kullanim-sartlari', changefreq: 'yearly', priority: '0.2' },
    ];

    const { rows: listings } = await db.query(
      `SELECT id, updated_at FROM listings WHERE status = 'active' ORDER BY updated_at DESC LIMIT 5000`
    );

    const { rows: catBreeds } = await db.query(`SELECT id FROM cat_breeds`).catch(() => ({ rows: [] }));
    const { rows: dogBreeds } = await db.query(`SELECT id FROM dog_breeds`).catch(() => ({ rows: [] }));

    const urls = [
      ...staticUrls.map(u => ({ loc: `${SITE_URL}${u.loc}`, changefreq: u.changefreq, priority: u.priority })),
      ...catBreeds.map(b => ({ loc: `${SITE_URL}/ilanlar?pet_type=cat&breed_id=${b.id}`, changefreq: 'weekly', priority: '0.7' })),
      ...dogBreeds.map(b => ({ loc: `${SITE_URL}/ilanlar?pet_type=dog&breed_id=${b.id}`, changefreq: 'weekly', priority: '0.7' })),
      ...listings.map(l => ({
        loc: `${SITE_URL}/ilan/${l.id}`,
        lastmod: l.updated_at ? new Date(l.updated_at).toISOString() : undefined,
        changefreq: 'daily',
        priority: '0.8',
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `
    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
