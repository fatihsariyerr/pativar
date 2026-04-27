import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';

const purposeLabels = { adoption: 'Sahiplendirme', mating: 'Çiftleştirme' };
const genderLabels = { male: 'Erkek', female: 'Dişi' };
const sizeLabels = { mini: 'Mini', small: 'Küçük', medium: 'Orta', large: 'Büyük', giant: 'Dev' };
const healthLabels = { healthy: 'Sağlıklı', treatment_needed: 'Tedavi Gerekli', chronic_condition: 'Kronik Durum' };
const coatLabels = { hairless: 'Tüysüz', short: 'Kısa', medium: 'Orta', long: 'Uzun' };

const InfoRow = ({ icon, label, value }) => value != null && value !== '' && value !== false ? (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-100/60 last:border-0">
    <span className="text-lg">{icon}</span>
    <span className="text-sm text-gray-500 w-32 flex-shrink-0">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{typeof value === 'boolean' ? (value ? '✅ Evet' : '❌ Hayır') : value}</span>
  </div>
) : null;

const LevelBar = ({ value, max = 5, label }) => value ? (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-100/60">
    <span className="text-sm text-gray-500 w-32 flex-shrink-0">{label}</span>
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`w-5 h-2 rounded-full ${i < value ? 'bg-peach-400' : 'bg-gray-200'}`} />
      ))}
    </div>
    <span className="text-xs text-gray-400">{value}/{max}</span>
  </div>
) : null;

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`).then(r => {
      setListing(r.data);
      setFavorited(r.data.is_favorited);
    }).catch(() => toast.error('İlan bulunamadı')).finally(() => setLoading(false));
  }, [id]);

  const toggleFav = async () => {
    if (!user) return toast.error('Favorilere eklemek için giriş yapın');
    try {
      if (favorited) { await api.delete(`/favorites/${id}`); toast.success('Favorilerden kaldırıldı'); }
      else { await api.post(`/favorites/${id}`); toast.success('Favorilere eklendi'); }
      setFavorited(!favorited);
    } catch { toast.error('İşlem başarısız'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!listing) return <div className="text-center py-20"><p>İlan bulunamadı</p></div>;

  const d = listing.pet_details || {};
  const isCat = listing.pet_type === 'cat';

  const petLabel = isCat ? 'Kedi' : 'Köpek';
  const purposeLabel = purposeLabels[listing.purpose] || '';
  const seoTitle = `${listing.title} - ${listing.breed_name || petLabel} ${purposeLabel} İlanı${listing.city ? ' - ' + listing.city : ''}`;
  const seoDesc = (listing.description ? String(listing.description).slice(0, 160) : `${listing.breed_name || petLabel} ${purposeLabel.toLowerCase()} ilanı. ${listing.city || ''}`).trim();
  const primaryImg = listing.images?.[0]?.image_url;
  const seoImage = primaryImg ? (primaryImg.startsWith('http') ? primaryImg : `${window.location.origin}${primaryImg}`) : undefined;

  const listingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: seoDesc,
    image: seoImage ? [seoImage] : undefined,
    category: `${petLabel} İlanları`,
    brand: { '@type': 'Brand', name: listing.breed_name || petLabel },
    offers: {
      '@type': 'Offer',
      price: listing.purpose === 'adoption' ? '0' : (listing.price || '0'),
      priceCurrency: 'TRY',
      availability: 'https://schema.org/InStock',
      areaServed: listing.city,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    },
    additionalProperty: [
      listing.city && { '@type': 'PropertyValue', name: 'Şehir', value: listing.city },
      listing.breed_name && { '@type': 'PropertyValue', name: 'Cins', value: listing.breed_name },
      d.gender && { '@type': 'PropertyValue', name: 'Cinsiyet', value: genderLabels[d.gender] || d.gender },
    ].filter(Boolean),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: window.location.origin + '/' },
      { '@type': 'ListItem', position: 2, name: `${petLabel} İlanları`, item: `${window.location.origin}/ilanlar?pet_type=${listing.pet_type}` },
      { '@type': 'ListItem', position: 3, name: listing.title, item: window.location.href },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO
        title={seoTitle}
        description={seoDesc}
        image={seoImage}
        type="article"
        jsonLd={[listingJsonLd, breadcrumbJsonLd]}
      />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-peach-500">Ana Sayfa</Link>
        <span>/</span>
        <Link to="/ilanlar" className="hover:text-peach-500">İlanlar</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{listing.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Images (3 col) */}
        <div className="lg:col-span-3">
          <div className="card p-2">
            <div className="rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center min-h-[260px] max-h-[500px]">
              {listing.images?.length > 0 ? (
                <img
                  src={listing.images[activeImage]?.image_url}
                  alt={`${listing.title}${listing.breed_name ? ' - ' + listing.breed_name : ''} ${petLabel.toLowerCase()} ${purposeLabel.toLowerCase()} ilanı${listing.city ? ' - ' + listing.city : ''}`}
                  className="w-full max-h-[500px] object-contain"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center">
                  <span className="text-8xl opacity-20">{isCat ? '🐱' : '🐶'}</span>
                </div>
              )}
            </div>
            {listing.images?.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto p-1">
                {listing.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      i === activeImage ? 'border-peach-400 shadow-glow' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}>
                    <img src={img.image_url || img.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info (2 col) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title & price card */}
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex gap-1.5 mb-2">
                  <span className={`badge ${isCat ? 'badge-cat' : 'badge-dog'}`}>{isCat ? '🐱 Kedi' : '🐶 Köpek'}</span>
                  <span className={`badge ${listing.purpose === 'mating' ? 'bg-rose-100 text-rose-600' : 'badge-adoption'}`}>
                    {listing.purpose === 'mating' ? '💕 Çiftleştirme' : 'Sahiplendirme'}
                  </span>
                </div>
                <h1 className="font-display font-extrabold text-xl text-gray-800">{listing.title}</h1>
                {d.breed_name_tr && <p className="text-sm text-gray-500 mt-0.5">{d.breed_name_tr}</p>}
              </div>
              <button onClick={toggleFav} className={`p-2.5 rounded-xl transition-all ${favorited ? 'bg-rose-100 text-rose-500' : 'bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-400'}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>

            <div className={`mt-4 p-4 rounded-2xl text-center ${listing.purpose === 'mating' ? 'bg-rose-50' : 'bg-sage-50'}`}>
              <span className={`text-lg font-bold ${listing.purpose === 'mating' ? 'text-rose-500' : 'text-sage-500'}`}>
                {listing.purpose === 'mating' ? '💕 Çiftleştirme' : '🏠 Sahiplendirme'}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
              <span>📍 {listing.city}{listing.district ? `, ${listing.district}` : ''}</span>
              <span>👁 {listing.view_count}</span>
              <span>❤️ {listing.favorite_count}</span>
            </div>
          </div>

          {/* Owner card */}
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-peach-300 to-lavender-300 flex items-center justify-center text-white font-bold">
                {listing.first_name?.[0]}{listing.last_name?.[0]}
              </div>
              <div>
                <p className="font-bold text-gray-800">{listing.first_name} {listing.last_name}</p>
                <p className="text-xs text-gray-500">📍 {listing.user_city}</p>
              </div>
            </div>
            {listing.contact_phone && (
              <a href={`tel:${listing.contact_phone}`} className="btn-primary w-full mt-4 text-center block text-sm">
                📞 Ara: {listing.contact_phone}
              </a>
            )}
            {listing.contact_whatsapp && listing.contact_phone && (
              <a href={`https://wa.me/${listing.contact_phone.replace(/\+/g, '')}`} target="_blank" rel="noopener"
                className="btn-secondary w-full mt-2 text-center block text-sm !text-green-600 !border-green-200 hover:!bg-green-50">
                💬 WhatsApp ile Yaz
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Details sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Description */}
        {listing.description && (
          <div className="card p-5 lg:col-span-2">
            <h2 className="font-display font-bold text-lg text-gray-800 mb-3">📝 Açıklama</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>
        )}

        {/* General Info */}
        <div className="card p-5">
          <h2 className="font-display font-bold text-lg text-gray-800 mb-3">ℹ️ Genel Bilgiler</h2>
          <InfoRow icon="🔖" label="Cins" value={d.breed_name_tr} />
          <InfoRow icon={d.gender === 'male' ? '♂️' : '♀️'} label="Cinsiyet" value={genderLabels[d.gender]} />
          <InfoRow icon="📅" label="Yaş" value={d.age_years ? `${d.age_years} yıl${d.age_months ? ` ${d.age_months} ay` : ''}` : d.age_months ? `${d.age_months} ay` : null} />
          <InfoRow icon="🎨" label="Renk" value={d.color} />
          <InfoRow icon="✂️" label="Tüy Uzunluğu" value={coatLabels[d.coat_length]} />
          <InfoRow icon="⚖️" label="Ağırlık" value={d.weight_kg ? `${d.weight_kg} kg` : null} />
          {!isCat && <InfoRow icon="📏" label="Boyut" value={sizeLabels[d.size]} />}
          {!isCat && <InfoRow icon="📐" label="Boy" value={d.height_cm ? `${d.height_cm} cm` : null} />}
          {isCat && <InfoRow icon="👁" label="Göz Rengi" value={d.eye_color} />}
        </div>

        {/* Health */}
        <div className="card p-5">
          <h2 className="font-display font-bold text-lg text-gray-800 mb-3">🏥 Sağlık Bilgileri</h2>
          <InfoRow icon="💊" label="Sağlık Durumu" value={healthLabels[d.health_status]} />
          <InfoRow icon="💉" label="Aşıları Tam" value={d.is_vaccinated} />
          <InfoRow icon="🔬" label="Kısırlaştırılmış" value={d.is_neutered} />
          <InfoRow icon="📟" label="Mikroçipli" value={d.is_microchipped} />
          <InfoRow icon="🐛" label="İç/Dış Parazit" value={d.is_dewormed} />
          {!isCat && <InfoRow icon="💉" label="Kuduz Aşısı" value={d.is_rabies_vaccinated} />}
          {isCat && <InfoRow icon="🧬" label="FIV/FeLV Test" value={d.is_fiv_felv_tested} />}
          {isCat && d.fiv_felv_result && <InfoRow icon="📋" label="FIV/FeLV Sonuç" value={d.fiv_felv_result} />}
          <InfoRow icon="📋" label="Soy Kütüğü" value={d.has_pedigree} />
          {d.pedigree_number && <InfoRow icon="🔢" label="Soy Kütük No" value={d.pedigree_number} />}
          {d.health_notes && <InfoRow icon="📝" label="Sağlık Notu" value={d.health_notes} />}
        </div>

        {/* Behavior */}
        <div className="card p-5">
          <h2 className="font-display font-bold text-lg text-gray-800 mb-3">🐾 Davranış & Karakter</h2>
          {isCat ? (
            <>
              <InfoRow icon="🚿" label="Kum Eğitimli" value={d.is_litter_trained} />
              <InfoRow icon="🏠" label="Ev Kedisi" value={d.is_indoor} />
            </>
          ) : (
            <>
              <InfoRow icon="🏠" label="Ev Eğitimli" value={d.is_house_trained} />
              <InfoRow icon="🦮" label="Tasma Eğitimli" value={d.is_leash_trained} />
              <InfoRow icon="📦" label="Kafes Eğitimli" value={d.is_crate_trained} />
              <LevelBar label="⚡ Enerji" value={d.energy_level} />
              <LevelBar label="🔊 Havlama" value={d.barking_level} />
              <LevelBar label="🎓 Eğitim" value={d.training_level} />
            </>
          )}
          <InfoRow icon="👶" label="Çocuklarla" value={d.is_good_with_kids} />
          <InfoRow icon="🐶" label="Köpeklerle" value={d.is_good_with_dogs} />
          <InfoRow icon="🐱" label="Kedilerle" value={d.is_good_with_cats} />
          {d.personality && <div className="mt-3 p-3 bg-cream-50 rounded-xl"><p className="text-sm text-gray-600">💬 {d.personality}</p></div>}
        </div>

        {/* Special needs */}
        {(d.special_needs || d.dietary_notes || d.exercise_needs) && (
          <div className="card p-5">
            <h2 className="font-display font-bold text-lg text-gray-800 mb-3">⚠️ Özel İhtiyaçlar</h2>
            {d.special_needs && <InfoRow icon="🩺" label="Özel İhtiyaç" value={d.special_needs} />}
            {d.dietary_notes && <InfoRow icon="🍖" label="Beslenme" value={d.dietary_notes} />}
            {!isCat && d.exercise_needs && <InfoRow icon="🏃" label="Egzersiz" value={d.exercise_needs} />}
          </div>
        )}
      </div>
    </div>
  );
}
