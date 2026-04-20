import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { cities } from '../utils/cities';
import SEO from '../components/SEO';

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [catBreeds, setCatBreeds] = useState([]);
  const [dogBreeds, setDogBreeds] = useState([]);

  const [filters, setFilters] = useState({
    pet_type: searchParams.get('pet_type') || '',
    purpose: searchParams.get('purpose') || '',
    city: searchParams.get('city') || '',
    breed_id: '',
    gender: '',
    size: '',
    is_vaccinated: '',
    search: searchParams.get('search') || '',
    sort_by: 'created_at',
    page: 1
  });

  useEffect(() => {
    api.get('/breeds/cats').then(r => setCatBreeds(r.data)).catch(() => {});
    api.get('/breeds/dogs').then(r => setDogBreeds(r.data)).catch(() => {});
  }, []);

  // Sync filters when URL search params change (e.g. navigating from Navbar links)
  useEffect(() => {
    const petType = searchParams.get('pet_type') || '';
    const search = searchParams.get('search') || '';
    setFilters(f => ({
      ...f,
      pet_type: petType,
      search: search,
      breed_id: petType !== f.pet_type ? '' : f.breed_id,
      page: 1
    }));
  }, [searchParams]);

  useEffect(() => { fetchListings(); }, [filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const r = await api.get('/listings', { params });
      setListings(r.data.listings || []);
      setPagination(r.data.pagination || {});
    } catch {} finally { setLoading(false); }
  };

  const updateFilter = (key, val) => {
    const newFilters = { ...filters, [key]: val, page: 1 };
    if (key === 'pet_type') newFilters.breed_id = '';
    setFilters(newFilters);
    // Update URL params for key filters
    const newParams = new URLSearchParams();
    if (key === 'pet_type' ? val : newFilters.pet_type) newParams.set('pet_type', key === 'pet_type' ? val : newFilters.pet_type);
    if (key === 'search' ? val : newFilters.search) newParams.set('search', key === 'search' ? val : newFilters.search);
    setSearchParams(newParams, { replace: true });
  };
  const clearFilters = () => {
    setFilters({ pet_type: '', purpose: '', city: '', breed_id: '', gender: '', size: '', is_vaccinated: '', search: '', sort_by: 'created_at', page: 1 });
    setSearchParams({}, { replace: true });
  };

  const breeds = filters.pet_type === 'cat' ? catBreeds : filters.pet_type === 'dog' ? dogBreeds : [];

  const petTypeLabel = filters.pet_type === 'cat' ? 'Kedi' : filters.pet_type === 'dog' ? 'Köpek' : 'Kedi ve Köpek';
  const purposeLabel = filters.purpose === 'mating' ? 'Çiftleştirme' : filters.purpose === 'adoption' ? 'Sahiplendirme' : '';
  const cityLabel = filters.city ? ` ${filters.city}` : '';
  const seoTitle = [petTypeLabel, 'İlanları', purposeLabel, cityLabel].filter(Boolean).join(' ').trim();
  const seoDesc = `${petTypeLabel} ilanları${cityLabel ? cityLabel + ' bölgesinde' : ''}. ${pagination.total || 'Binlerce'} ücretsiz ${petTypeLabel.toLowerCase()} ${purposeLabel ? purposeLabel.toLowerCase() + ' ilanı' : 'sahiplendirme ve çiftleştirme ilanı'} PatiVar'da. Cins, yaş, şehir filtreleri ile aradığınız patili dostu bulun.`;
  const seoKeywords = `${petTypeLabel.toLowerCase()} ilanı, ${petTypeLabel.toLowerCase()} sahiplendirme, ${petTypeLabel.toLowerCase()} ilanları, ücretsiz ${petTypeLabel.toLowerCase()}${filters.city ? ', ' + filters.city + ' ' + petTypeLabel.toLowerCase() : ''}, yavru ${petTypeLabel.toLowerCase()}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <SEO title={seoTitle} description={seoDesc} keywords={seoKeywords} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-gray-800">
            {filters.pet_type === 'cat' ? '🐱 Kedi İlanları' : filters.pet_type === 'dog' ? '🐶 Köpek İlanları' : '🐾 Tüm İlanlar'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} ilan bulundu</p>
        </div>
        <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-outline text-sm flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 4h18M3 12h12M3 20h6"/>
          </svg>
          Filtrele
        </button>
      </div>

      {/* Filters */}
      {filtersOpen && (
        <div className="glass p-5 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-6">
              <input type="text" value={filters.search} onChange={e => updateFilter('search', e.target.value)}
                placeholder="Anahtar kelime ara..." className="input-field" />
            </div>

            {/* Pet Type */}
            <select value={filters.pet_type} onChange={e => updateFilter('pet_type', e.target.value)} className="input-field">
              <option value="">Tüm Türler</option>
              <option value="cat">🐱 Kedi</option>
              <option value="dog">🐶 Köpek</option>
            </select>

            {/* City */}
            <select value={filters.city} onChange={e => updateFilter('city', e.target.value)} className="input-field">
              <option value="">Tüm Şehirler</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Breed */}
            {filters.pet_type && (
              <select value={filters.breed_id} onChange={e => updateFilter('breed_id', e.target.value)} className="input-field">
                <option value="">Tüm Cinsler</option>
                {breeds.map(b => <option key={b.id} value={b.id}>{b.name_tr}</option>)}
              </select>
            )}

            {/* Gender */}
            <select value={filters.gender} onChange={e => updateFilter('gender', e.target.value)} className="input-field">
              <option value="">Cinsiyet</option>
              <option value="male">Erkek</option>
              <option value="female">Dişi</option>
            </select>

            {filters.pet_type === 'dog' && (
              <select value={filters.size} onChange={e => updateFilter('size', e.target.value)} className="input-field">
                <option value="">Boyut</option>
                <option value="mini">Mini</option>
                <option value="small">Küçük</option>
                <option value="medium">Orta</option>
                <option value="large">Büyük</option>
                <option value="giant">Dev</option>
              </select>
            )}

            {/* Sort */}
            <select value={filters.sort_by} onChange={e => updateFilter('sort_by', e.target.value)} className="input-field">
              <option value="created_at">En Yeni</option>
              <option value="view_count">Popüler</option>
            </select>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-peach-500 transition-colors font-medium">
              ✕ Filtreleri Temizle
            </button>
          </div>
        </div>
      )}

      {/* Quick category tabs */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
        {[
          { label: 'Tümü', value: '', icon: '🐾' },
          { label: 'Kediler', value: 'cat', icon: '🐱' },
          { label: 'Köpekler', value: 'dog', icon: '🐶' }
        ].map(t => (
          <button key={t.value} onClick={() => updateFilter('pet_type', t.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filters.pet_type === t.value ? 'bg-peach-100 text-peach-600 shadow-sm' : 'bg-white/50 text-gray-500 hover:bg-white/80'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Purpose tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { label: 'Tüm Amaçlar', value: '', icon: '✨' },
          { label: 'Sahiplendirme', value: 'adoption', icon: '🏠' },
          { label: 'Çiftleştirme', value: 'mating', icon: '💕' }
        ].map(t => (
          <button key={t.value} onClick={() => updateFilter('purpose', t.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filters.purpose === t.value ? 'bg-lavender-100 text-lavender-600 shadow-sm' : 'bg-white/50 text-gray-500 hover:bg-white/80'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Listings grid */}
      {loading ? (
        <LoadingSpinner />
      ) : listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map(l => <PetCard key={l.id} listing={l} />)}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                className="btn-outline !py-2 !px-3 disabled:opacity-30">← Önceki</button>
              <span className="text-sm text-gray-500 font-medium px-4">
                {filters.page} / {pagination.totalPages}
              </span>
              <button disabled={filters.page >= pagination.totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                className="btn-outline !py-2 !px-3 disabled:opacity-30">Sonraki →</button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 glass">
          <span className="text-6xl">🔍</span>
          <p className="mt-4 text-lg font-semibold text-gray-600">Aradığınız kriterlere uygun ilan bulunamadı</p>
          <p className="text-sm text-gray-400 mt-1">Filtreleri değiştirerek tekrar deneyebilirsiniz</p>
          <button onClick={clearFilters} className="btn-primary mt-4">Filtreleri Temizle</button>
        </div>
      )}
    </div>
  );
}
