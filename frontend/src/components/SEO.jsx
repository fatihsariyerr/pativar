import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'PatiVar';
const SITE_URL = (typeof window !== 'undefined' && window.location.origin) || 'https://pativar.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESC = 'Türkiye\'nin en kapsamlı kedi ve köpek ilan platformu. Ücretsiz sahiplendirme ilanları, cins filtreleri, şehir bazlı arama ile patili dostunuza yuva bulun veya yeni bir dost edinin.';
const DEFAULT_KEYWORDS = 'kedi ilanı, köpek ilanı, kedi sahiplendirme, köpek sahiplendirme, ücretsiz kedi, ücretsiz köpek, yavru kedi, yavru köpek, kedi ilanları, köpek ilanları, evcil hayvan ilan, pet ilan, sahiplendirme, çiftleştirme, kedi çiftleştirme, köpek çiftleştirme';

export default function SEO({
  title,
  description = DEFAULT_DESC,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Kedi & Köpek İlan Platformu`;
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : SITE_URL);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : <meta name="robots" content="index,follow,max-image-preview:large" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Hreflang */}
      <meta httpEquiv="content-language" content="tr" />

      {Array.isArray(jsonLd)
        ? jsonLd.map((ld, i) => (
            <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
          ))
        : jsonLd && (
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
          )}
    </Helmet>
  );
}
