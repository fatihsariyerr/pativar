import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const purposeLabels = { adoption: '🏠 Sahiplendirme', mating: '💕 Çiftleştirme' };
const statusLabels = { active: 'Aktif', draft: 'Taslak', sold: 'Satıldı', expired: 'Süresi Doldu' };
const statusColors = { active: 'bg-green-100 text-green-600', draft: 'bg-gray-100 text-gray-500', sold: 'bg-sky-100 text-sky-600', expired: 'bg-rose-100 text-rose-500' };

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [sub, setSub] = useState(null);
  const [tab, setTab] = useState('listings');
  const [deleting, setDeleting] = useState(null);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    api.get('/listings/user/my-listings').then(r => setMyListings(r.data)).catch(() => {});
    api.get('/subscriptions/current').then(r => setSub(r.data)).catch(() => {});
  };

  useEffect(() => {
    if (!user) { navigate('/giris'); return; }
    setProfileForm({ first_name: user.first_name || '', last_name: user.last_name || '' });
    fetchData();
  }, [user]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`"${title}" ilanını silmek istediğinize emin misiniz?\n\n⚠️ DİKKAT: İlan silinirse ilan hakkınız geri yüklenmez!`)) return;
    setDeleting(id);
    try {
      await api.delete(`/listings/${id}`);
      toast.success('İlan silindi');
      setMyListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'İlan silinemedi');
    } finally { setDeleting(null); }
  };

  const handleProfileSave = async () => {
    if (!profileForm.first_name.trim() || !profileForm.last_name.trim()) {
      return toast.error('Ad ve soyad boş bırakılamaz');
    }
    setSaving(true);
    try {
      await api.put('/users/profile', profileForm);
      const updated = { ...user, ...profileForm };
      localStorage.setItem('pativar_user', JSON.stringify(updated));
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Profil güncellenemedi');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password) {
      return toast.error('Tüm alanları doldurun');
    }
    if (passwordForm.new_password.length < 6) {
      return toast.error('Yeni şifre en az 6 karakter olmalı');
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return toast.error('Yeni şifreler eşleşmiyor');
    }
    setSaving(true);
    try {
      await api.put('/users/password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      toast.success('Şifre başarıyla güncellendi');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Şifre değiştirilemedi');
    } finally { setSaving(false); }
  };

  if (!user) return null;

  const planNames = { free: 'Ücretsiz', basic: 'Temel', premium: 'Premium', business: 'İşletme' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEO title="Profilim" noindex />
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-peach-300 via-rose-300 to-lavender-300 flex items-center justify-center text-white font-display font-black text-2xl shadow-glow">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="font-display font-extrabold text-xl text-gray-800">{user.first_name} {user.last_name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">📱 {user.phone}</p>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="btn-outline text-sm !text-red-400 !border-red-200 hover:!bg-red-50">
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Package Card */}
      <div className="card p-5 mb-6 bg-gradient-to-r from-peach-50 via-cream-50 to-lavender-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-gray-600">İlan Paketi</h3>
            <p className="font-display font-extrabold text-lg text-peach-500 mt-0.5">
              {planNames[sub?.plan] || 'Ücretsiz'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-gray-800">
              {sub?.listings_used || 0} / {sub?.listing_limit || 1} İlan
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-peach-400 to-rose-400 rounded-full transition-all"
                style={{ width: `${Math.min(((sub?.listings_used || 0) / (sub?.listing_limit || 1)) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
        <Link to="/paketler" className="flex items-center justify-between mt-3 p-2.5 bg-white/60 rounded-xl hover:bg-white/80 transition-colors">
          <span className="text-xs text-gray-500">
            {(sub?.listings_used ?? 0) >= (sub?.listing_limit ?? 1)
              ? '💡 Daha fazla ilan vermek için paketinizi yükseltin!'
              : '📦 Daha fazla ilan hakkı ve öne çıkarma için paketleri inceleyin'}
          </span>
          <span className="text-xs font-bold text-peach-500 whitespace-nowrap ml-2">Paketleri Gör →</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ k: 'listings', l: '📋 İlanlarım', c: myListings.length },
          { k: 'settings', l: '⚙️ Ayarlar' }
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.k ? 'bg-peach-100 text-peach-600' : 'bg-white/50 text-gray-500 hover:bg-white/80'
            }`}>
            {t.l} {t.c != null && <span className="ml-1 text-xs opacity-60">({t.c})</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'listings' && (
        <>
          {myListings.length > 0 ? (
            <div className="space-y-4">
              {myListings.map(l => (
                <div key={l.id} className="card p-4 flex items-center gap-4 hover:shadow-glow transition-all">
                  {/* Image */}
                  <Link to={`/ilan/${l.id}`} className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-cream-100 to-peach-50">
                      {l.primary_image ? (
                        <img src={l.primary_image} alt={l.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl opacity-30">{l.pet_type === 'cat' ? '🐱' : '🐶'}</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/ilan/${l.id}`} className="font-display font-bold text-base text-gray-800 truncate block hover:text-peach-500 transition-colors">
                      {l.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`badge text-[10px] ${l.pet_type === 'cat' ? 'badge-cat' : 'badge-dog'}`}>
                        {l.pet_type === 'cat' ? '🐱 Kedi' : '🐶 Köpek'}
                      </span>
                      <span className={`badge text-[10px] ${statusColors[l.status] || 'bg-gray-100 text-gray-500'}`}>
                        {statusLabels[l.status] || l.status}
                      </span>
                      {l.breed_name && <span className="text-xs text-gray-400">{l.breed_name}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span>📍 {l.city}</span>
                      <span>{purposeLabels[l.purpose] || 'Sahiplendirme'}</span>
                      <span>👁 {l.view_count || 0}</span>
                      <span>❤️ {l.favorite_count || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Link to={`/ilan/${l.id}`}
                      className="p-2 rounded-xl bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors"
                      title="Görüntüle">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </Link>
                    {l.status === 'active' && (
                      <Link to={`/ilan-duzenle/${l.id}`}
                        className="p-2 rounded-xl bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors"
                        title="Düzenle">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </Link>
                    )}
                    <button onClick={() => handleDelete(l.id, l.title)} disabled={deleting === l.id}
                      className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors disabled:opacity-50"
                      title="Sil">
                      {deleting === l.id ? (
                        <span className="w-4 h-4 block text-xs">⏳</span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass">
              <span className="text-5xl">📭</span>
              <p className="mt-3 font-semibold text-gray-600">Henüz ilanınız yok</p>
              <Link to="/ilan-ver" className="btn-primary mt-4 inline-block">İlk İlanınızı Verin</Link>
            </div>
          )}
        </>
      )}

      {tab === 'settings' && (
        <div className="space-y-4">
          {/* Name Edit */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-base text-gray-800 mb-4 flex items-center gap-2">
              <span>👤</span> Profil Bilgileri
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ad</label>
                <input type="text" value={profileForm.first_name}
                  onChange={e => setProfileForm(f => ({ ...f, first_name: e.target.value }))}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Soyad</label>
                <input type="text" value={profileForm.last_name}
                  onChange={e => setProfileForm(f => ({ ...f, last_name: e.target.value }))}
                  className="input-field" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={handleProfileSave} disabled={saving} className="btn-primary text-sm !py-2 !px-5">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>

          {/* Password Change */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-base text-gray-800 mb-4 flex items-center gap-2">
              <span>🔒</span> Şifre Değiştir
            </h3>
            <div className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mevcut Şifre</label>
                <input type="password" value={passwordForm.current_password}
                  onChange={e => setPasswordForm(f => ({ ...f, current_password: e.target.value }))}
                  className="input-field" placeholder="Mevcut şifreniz" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Yeni Şifre</label>
                <input type="password" value={passwordForm.new_password}
                  onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))}
                  className="input-field" placeholder="En az 6 karakter" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Yeni Şifre (Tekrar)</label>
                <input type="password" value={passwordForm.confirm_password}
                  onChange={e => setPasswordForm(f => ({ ...f, confirm_password: e.target.value }))}
                  className="input-field" placeholder="Yeni şifrenizi tekrar girin" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={handlePasswordChange} disabled={saving} className="btn-primary text-sm !py-2 !px-5">
                {saving ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
