import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import SEO from '../components/SEO';

export default function Home() {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, cats: 0, dogs: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/listings?is_featured=true&limit=8&sort_by=created_at').then(r => {
      setFeaturedListings(r.data.listings || []);
    }).catch(() => {});

    api.get('/listings?limit=8&sort_by=created_at').then(r => {
      setListings(r.data.listings || []);
      setStats(s => ({ ...s, total: r.data.pagination?.total || 0 }));
    }).catch(() => {});

    api.get('/listings?pet_type=cat&limit=1').then(r => setStats(s => ({ ...s, cats: r.data.pagination?.total || 0 }))).catch(() => {});
    api.get('/listings?pet_type=dog&limit=1').then(r => setStats(s => ({ ...s, dogs: r.data.pagination?.total || 0 }))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/ilanlar?search=${encodeURIComponent(search)}`);
  };

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'PatiVar - Kedi & Köpek İlan Platformu',
    description: 'Türkiye\'nin en kapsamlı kedi ve köpek ilan platformu.',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://pativar.com',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: stats.total,
      name: 'Kedi ve Köpek İlanları',
    },
  };

  return (
    <div className="animated-bg">
      <SEO
        title="Kedi & Köpek Sahiplendirme ve Çiftleştirme"
        description="Türkiye'nin kedi ve köpek ilan platformu. Ücretsiz sahiplendirme ilanları, cins ve şehir bazlı arama ile patili dostuna yuva bulun."
        jsonLd={homeJsonLd}
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-peach-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-lavender-200/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-sky-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-16 pb-20 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-gray-600 border border-white/60">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Türkiye'nin En Sevimli Pet Platformu
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-tight">
              <span className="bg-gradient-to-r from-peach-500 via-rose-400 to-lavender-500 bg-clip-text text-transparent">
                Patili Dostlarınız
              </span>
              <br />
              <span className="text-gray-800">İçin Sıcak Bir Yuva</span>
            </h1>

            <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              Kedi ve köpek sahiplenme ve çiftleştirme ilanlarını keşfedin.
              Tüylu dostunuza mükemmel eşleşmeyi bulun!
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="mt-8 max-w-lg mx-auto">
              <div className="glass flex items-center p-2 gap-2">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Cins, şehir veya anahtar kelime ara..."
                    className="w-full bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <button type="submit" className="btn-primary !py-2.5 !px-6 text-sm">Ara</button>
              </div>
            </form>

            {/* Quick filters */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Link to="/ilanlar?pet_type=cat" className="glass flex items-center gap-2 px-5 py-2.5 hover:bg-lavender-50 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">🐱</span>
                <div className="text-left">
                  <span className="block text-sm font-bold text-gray-800">Kediler</span>
                  <span className="block text-xs text-gray-400">{stats.cats} ilan</span>
                </div>
              </Link>
              <Link to="/ilanlar?pet_type=dog" className="glass flex items-center gap-2 px-5 py-2.5 hover:bg-sky-50 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">🐶</span>
                <div className="text-left">
                  <span className="block text-sm font-bold text-gray-800">Köpekler</span>
                  <span className="block text-xs text-gray-400">{stats.dogs} ilan</span>
                </div>
              </Link>
              <Link to="/ilanlar" className="glass flex items-center gap-2 px-5 py-2.5 hover:bg-sage-50 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">🏠</span>
                <div className="text-left">
                  <span className="block text-sm font-bold text-gray-800">Sahiplendir</span>
                  <span className="block text-xs text-gray-400">{stats.total} ilan</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Toplam İlan', value: stats.total, icon: '📋', color: 'from-peach-100 to-peach-50' },
            { label: 'Kedi İlanı', value: stats.cats, icon: '🐱', color: 'from-lavender-100 to-lavender-50' },
            { label: 'Köpek İlanı', value: stats.dogs, icon: '🐶', color: 'from-sky-100 to-sky-50' },
            { label: 'Şehir', value: '81', icon: '📍', color: 'from-sage-100 to-sage-50' },
          ].map((s, i) => (
            <div key={i} className={`glass bg-gradient-to-br ${s.color} text-center py-5 px-4`}>
              <span className="text-3xl">{s.icon}</span>
              <div className="font-display font-black text-2xl text-gray-800 mt-1">{s.value}</div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-gray-800">Öne Çıkan İlanlar</h2>
              <p className="text-sm text-gray-500 mt-1">En çok öne çıkarılan patili dostlar</p>
            </div>
            <Link to="/ilanlar" className="btn-outline text-sm !py-2">Tümünü Gör →</Link>
          </div>

          {featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredListings.map(l => <PetCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <div className="text-center py-20 glass">
              <span className="text-6xl">🐾</span>
              <p className="mt-4 text-lg font-semibold text-gray-600">Henüz ilan yok</p>
              <p className="text-sm text-gray-400 mt-1">İlk ilanı sen ver!</p>
              <Link to="/ilan-ver" className="btn-primary mt-4 inline-block">İlan Ver</Link>
            </div>
          )}
        </div>
      </section>

      {/* Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-gray-800">Son İlanlar</h2>
              <p className="text-sm text-gray-500 mt-1">En yeni eklenen patili dostlar</p>
            </div>
            <Link to="/ilanlar" className="btn-outline text-sm !py-2">Tümünü Gör →</Link>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {listings.map(l => <PetCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <div className="text-center py-20 glass">
              <span className="text-6xl">🐾</span>
              <p className="mt-4 text-lg font-semibold text-gray-600">Henüz ilan yok</p>
              <p className="text-sm text-gray-400 mt-1">İlk ilanı sen ver!</p>
              <Link to="/ilan-ver" className="btn-primary mt-4 inline-block">İlan Ver</Link>
            </div>
          )}
        </div>
      </section>
      {/* How it works */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display font-extrabold text-2xl text-center text-gray-800 mb-10">Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', icon: '📝', title: 'Kayıt Ol', desc: 'Ücretsiz hesap oluşturun ve ilk aboneliğe özel 1 ilan hakkınızı kazanın.' },
              { step: '2', icon: '📸', title: 'İlan Oluştur', desc: 'Kedininiz veya köpeğiniz için detaylı bilgi ve fotoğraflarla ilan verin.' },
              { step: '3', icon: '🤝', title: 'Eşleşin', desc: 'İlgilenenlerin mesajlarını alın ve patili dostunuza sıcak bir yuva bulun.' },
            ].map((item, i) => (
              <div key={i} className="card p-6 text-center group hover:-translate-y-1 transition-all duration-500">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-peach-100 to-lavender-100 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="badge bg-peach-100 text-peach-500 mb-3">Adım {item.step}</div>
                <h3 className="font-display font-bold text-lg text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="glass bg-gradient-to-r from-peach-50 via-lavender-50 to-sky-50 p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[120px] opacity-10 -mt-4 -mr-4">🐾</div>
            <h2 className="font-display font-extrabold text-2xl text-gray-800 relative">
              Patili Dostunuza Yuva Bulmaya Hazır mısınız?
            </h2>
            <p className="text-gray-500 mt-3 relative">Hemen ücretsiz kaydolun ve ilk ilanınızı yayınlayın!</p>
            <div className="flex items-center justify-center gap-3 mt-6 relative">
              <Link to="/kayit" className="btn-primary">Ücretsiz Kayıt Ol</Link>
              <Link to="/ilanlar" className="btn-secondary">İlanları Keşfet</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
