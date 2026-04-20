import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { cities } from '../utils/cities';
import SEO from '../components/SEO';
import PhoneVerification from '../components/PhoneVerification';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', password_confirm: '', city: '' });
  const [phoneIdToken, setPhoneIdToken] = useState(null);
  const [verifiedPhone, setVerifiedPhone] = useState('');

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === 'phone' && v !== verifiedPhone) {
      setPhoneIdToken(null);
      setVerifiedPhone('');
    }
  };

  const formatPhone = (digits) => {
    const d = digits.slice(0, 11);
    if (d.length <= 4) return d;
    if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
    if (d.length <= 9) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) return toast.error('Şifreler eşleşmiyor');
    if (form.password.length < 6) return toast.error('Şifre en az 6 karakter olmalı');
    if (!form.phone.match(/^(\+90|0)?[0-9]{10}$/)) return toast.error('Geçerli bir telefon numarası giriniz');
    if (!phoneIdToken) return toast.error('Lütfen önce telefon numaranızı doğrulayın');

    setLoading(true);
    try {
      const res = await register({ ...form, firebase_id_token: phoneIdToken });
      toast.success(res.message || 'Hesabınız oluşturuldu! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Kayıt başarısız');
    } finally { setLoading(false); }
  };

  const handlePhoneVerified = (idToken) => {
    setPhoneIdToken(idToken);
    setVerifiedPhone(form.phone);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <SEO
        title="Ücretsiz Kayıt Ol"
        description="PatiVar'a ücretsiz kayıt olun ve ilk ilanınızı yayınlayın. Kedi ve köpek sahiplendirme ilanları için hemen hesap oluşturun."
        keywords="pativar kayıt, ücretsiz üyelik, ilan ver, kedi ilanı ver, köpek ilanı ver"
        noindex
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block text-5xl mb-3 float-animation">🐾</div>
          <h1 className="font-display font-extrabold text-2xl text-gray-800">PatiVar'a Katılın!</h1>
          <p className="text-sm text-gray-500 mt-1">Ücretsiz kayıt olun ve <span className="font-bold text-peach-500">1 ilan hakkı</span> kazanın</p>
        </div>

        <div className="card p-6">
          <div className="mb-4 p-3 rounded-2xl bg-sky-50 border border-sky-200">
            <p className="text-xs text-sky-700 font-medium">
              📱 Aynı telefon numarası ile yalnızca <strong>1 adet</strong> hesap oluşturulabilir.
              Her hesap, ilk aboneliğe özel <strong>1 ücretsiz ilan hakkı</strong> ile gelir.
            </p>
          </div>
     
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ad *</label>
                <input type="text" value={form.first_name} onChange={e => update('first_name', e.target.value)} required
                  placeholder="Adınız" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Soyad *</label>
                <input type="text" value={form.last_name} onChange={e => update('last_name', e.target.value)} required
                  placeholder="Soyadınız" className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">E-posta *</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required
                placeholder="ornek@email.com" className="input-field" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Telefon Numarası *</label>
              <input
                type="tel"
                inputMode="numeric"
                value={formatPhone(form.phone)}
                onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 14))}
                required
                maxLength={14}
                placeholder="05XX XXX XX XX"
                className="input-field"
              />
              <div className="mt-2">
                <PhoneVerification
                  phone={form.phone}
                  onVerified={handlePhoneVerified}
                  disabled={!/^(\+90|0)?[0-9]{10}$/.test(form.phone) || (phoneIdToken && form.phone === verifiedPhone)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Şehir</label>
              <select value={form.city} onChange={e => update('city', e.target.value)} className="input-field">
                <option value="">Seçiniz (opsiyonel)</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Şifre *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} required
                  placeholder="En az 6 karakter" className="input-field !pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Şifre Tekrar *</label>
              <input type="password" value={form.password_confirm} onChange={e => update('password_confirm', e.target.value)} required
                placeholder="Şifrenizi tekrar giriniz" className="input-field" />
            </div>

            <button
              type="submit"
              disabled={loading || !phoneIdToken}
              className="btn-primary w-full !mt-5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Kayıt yapılıyor...' : '🎉 Ücretsiz Kayıt Ol'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Zaten hesabınız var mı?{' '}
              <Link to="/giris" className="text-peach-500 font-bold hover:text-peach-600 transition-colors">Giriş Yap</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
