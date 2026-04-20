import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const planDetails = {
  basic: { name: 'Temel Paket', icon: '📦', price: 99.99, listing_limit: 1, featured: 0, badge: false },
  premium: { name: 'Premium Paket', icon: '👑', price: 349.99, listing_limit: 5, featured: 1, badge: true },
  business: { name: 'İşletme Paketi', icon: '🏢', price: 799.99, listing_limit: 20, featured: 5, badge: true }
};

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

function toTurkishUpper(value) {
  return (value || '')
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .replace(/ğ/g, 'Ğ')
    .replace(/ü/g, 'Ü')
    .replace(/ş/g, 'Ş')
    .replace(/ö/g, 'Ö')
    .replace(/ç/g, 'Ç')
    .toUpperCase();
}

function detectCardBrand(number) {
  const n = (number || '').replace(/\D/g, '');
  if (!n) return null;
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^(9792|65)/.test(n)) return 'troy';
  return null;
}

function CardBrandLogo({ brand, size = 'md' }) {
  const dims = size === 'sm' ? 'h-6 w-10' : 'h-8 w-14';
  if (brand === 'visa') {
    return (
      <div className={`${dims} bg-white rounded flex items-center justify-center shadow-sm`}>
        <span className="font-black italic text-[#1a1f71] text-sm tracking-tight">VISA</span>
      </div>
    );
  }
  if (brand === 'mastercard') {
    return (
      <div className={`${dims} bg-white rounded flex items-center justify-center gap-0 shadow-sm`}>
        <span className="inline-block w-4 h-4 rounded-full bg-[#eb001b] -mr-1.5" />
        <span className="inline-block w-4 h-4 rounded-full bg-[#f79e1b] mix-blend-multiply" />
      </div>
    );
  }
  if (brand === 'amex') {
    return (
      <div className={`${dims} bg-[#2e77bb] rounded flex items-center justify-center shadow-sm`}>
        <span className="font-black text-white text-[8px] tracking-tight">AMEX</span>
      </div>
    );
  }
  if (brand === 'troy') {
    return (
      <div className={`${dims} bg-white rounded flex items-center justify-center shadow-sm`}>
        <span className="font-black text-[#00aeef] text-[10px] tracking-tight">troy</span>
      </div>
    );
  }
  return null;
}

export default function Checkout() {
  const { user } = useAuth();
  const { plan } = useParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const [card, setCard] = useState({
    holder: '', number: '', expiry: '', cvv: ''
  });

  const selectedPlan = planDetails[plan];
  const cardBrand = detectCardBrand(card.number);

  useEffect(() => {
    if (!user) { navigate('/giris'); return; }
    if (!selectedPlan) { navigate('/paketler'); return; }
  }, [user, plan]);

  const updateCard = (key, val) => setCard(c => ({ ...c, [key]: val }));

  const handleCardNumber = (e) => {
    updateCard('number', formatCardNumber(e.target.value));
  };

  const handleExpiry = (e) => {
    updateCard('expiry', formatExpiry(e.target.value));
  };

  const handleCvv = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
    updateCard('cvv', digits);
  };

  const handleHolder = (e) => {
    updateCard('holder', toTurkishUpper(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const cardDigits = card.number.replace(/\s/g, '');
    if (!card.holder.trim()) return toast.error('Kart sahibi adını giriniz');
    if (cardDigits.length < 16) return toast.error('Kart numarası 16 haneli olmalıdır');
    if (card.expiry.length < 5) return toast.error('Son kullanma tarihini giriniz (AA/YY)');
    if (card.cvv.length !== 3) return toast.error('CVV 3 haneli olmalıdır');

    // Expiry validation
    const [month, year] = card.expiry.split('/');
    const expMonth = parseInt(month);
    if (expMonth < 1 || expMonth > 12) return toast.error('Geçersiz ay (01-12)');

    setProcessing(true);

    // Simulated delay
    setTimeout(() => {
      setProcessing(false);
      toast.error('Ödeme sistemi henüz aktif değil. Yakında hizmet verilecektir.');
    }, 2000);
  };

  if (!user || !selectedPlan) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <SEO title="Ödeme" noindex />
      <div className="mb-6">
        <Link to="/paketler" className="text-sm text-gray-400 hover:text-peach-500 transition-colors flex items-center gap-1">
          ← Paketlere Dön
        </Link>
      </div>

      <h1 className="font-display font-extrabold text-2xl text-gray-800 mb-8">Ödeme</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Payment Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Card Preview */}
            <div className="relative h-52 rounded-3xl p-6 text-white overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-8 rounded-md bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-80" />
                  {cardBrand ? (
                    <CardBrandLogo brand={cardBrand} />
                  ) : (
                    <span className="text-xs opacity-50 font-mono">CREDIT CARD</span>
                  )}
                </div>

                <div>
                  <p className="font-mono text-xl tracking-[0.2em] mb-3">
                    {card.number || '•••• •••• •••• ••••'}
                  </p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] opacity-50 uppercase">Kart Sahibi</p>
                      <p className="text-sm font-semibold tracking-wide">
                        {card.holder || 'AD SOYAD'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] opacity-50 uppercase">Son Kullanma</p>
                      <p className="text-sm font-mono">{card.expiry || 'AA/YY'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Form */}
            <div className="card p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-gray-800 flex items-center gap-2">
                <span>💳</span> Kart Bilgileri
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kart Sahibi <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={card.holder}
                  onChange={handleHolder}
                  placeholder="AD SOYAD"
                  className="input-field"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kart Numarası <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    value={card.number}
                    onChange={handleCardNumber}
                    placeholder="0000 0000 0000 0000"
                    className="input-field font-mono tracking-wider pr-16"
                    maxLength={19}
                  />
                  {cardBrand && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CardBrandLogo brand={cardBrand} size="sm" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Son Kullanma <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    value={card.expiry}
                    onChange={handleExpiry}
                    placeholder="AA/YY"
                    className="input-field font-mono"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">CVV <span className="text-rose-400">*</span></label>
                  <input
                    type="password"
                    value={card.cvv}
                    onChange={handleCvv}
                    placeholder="•••"
                    className="input-field font-mono"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3.5 rounded-2xl text-base font-bold transition-all bg-gradient-to-r from-peach-400 via-rose-400 to-peach-500 text-white hover:from-peach-500 hover:via-rose-500 hover:to-peach-600 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block">⏳</span> Ödeme İşleniyor...
                </span>
              ) : (
                `₺${selectedPlan.price} Öde`
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">🔒 256-bit SSL</span>
              <span>•</span>
              <span className="flex items-center gap-1">🛡️ 3D Secure</span>
              <span>•</span>
              <span className="flex items-center gap-1">✅ PCI DSS</span>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-8">
            <h3 className="font-display font-bold text-base text-gray-800 mb-4 flex items-center gap-2">
              <span>📋</span> Sipariş Özeti
            </h3>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-cream-50 to-peach-50 border-2 border-peach-200 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedPlan.icon}</span>
                <div>
                  <p className="font-display font-extrabold text-gray-800">{selectedPlan.name}</p>
                  <p className="text-xs text-gray-500">Tek seferlik</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">İlan Hakkı</span>
                <span className="font-bold text-gray-800">{selectedPlan.listing_limit} ilan</span>
              </div>
              {selectedPlan.featured > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Öne Çıkan İlan</span>
                  <span className="font-bold text-amber-500">{selectedPlan.featured} hak</span>
                </div>
              )}
              {selectedPlan.badge && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Premium Çerçeve</span>
                  <span className="font-bold text-amber-500">👑 Aktif</span>
                </div>
              )}
            </div>

            <div className="border-t-2 border-dashed border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Toplam</span>
                <span className="font-display font-black text-2xl text-gray-800">₺{selectedPlan.price}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">KDV dahildir</p>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-sky-50 border border-sky-200">
              <p className="text-xs text-sky-600 flex items-start gap-1.5">
                <span className="mt-0.5">ℹ️</span>
                Paket satın alımından sonra mevcut ilan haklarınız yeni paketle değiştirilecektir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
