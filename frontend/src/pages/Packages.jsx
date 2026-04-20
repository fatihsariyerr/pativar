import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';


const planIcons = { free: '🎁', basic: '📦', premium: '👑', business: '🏢' };
const planColors = {
  free: 'from-gray-100 to-gray-50 border-gray-200',
  basic: 'from-sky-50 to-sky-100 border-sky-200',
  premium: 'from-amber-50 to-yellow-50 border-amber-300',
  business: 'from-purple-50 to-lavender-50 border-purple-300'
};
const planHighlight = {
  free: '',
  basic: '',
  premium: 'ring-2 ring-amber-300 shadow-lg scale-[1.02]',
  business: ''
};

export default function Packages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    api.get('/subscriptions/plans').then(r => setPlans(r.data)).catch(() => {});
    if (user) {
      api.get('/subscriptions/current').then(r => setCurrentPlan(r.data)).catch(() => {});
    }
  }, [user]);

  const handlePurchase = (plan) => {
    if (!user) {
      toast.error('Paket satın almak için giriş yapmalısınız');
      navigate('/giris');
      return;
    }
    if (plan === 'free') return;
    // Ödeme sayfasına yönlendir
    navigate(`/odeme/${plan}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <SEO
        title="İlan Paketleri - Premium, Business, Temel"
        description="PatiVar ilan paketleri: Ücretsiz, Temel, Premium ve Business. Öne çıkan ilanlar, daha fazla ilan hakkı ve profesyonel görünüm için uygun paketinizi seçin."
        keywords="ilan paketi, premium ilan, öne çıkan ilan, pet ilan paketi, sahiplendirme ilan paketi"
      />
      <div className="text-center mb-10">
        <h1 className="font-display font-black text-3xl text-gray-800">
          İlan Paketleri
        </h1>
        <p className="text-gray-500 mt-2 max-w-lg mx-auto">
          Tek seferlik ilan paketi satın alarak daha fazla ilan verebilirsiniz. Premium ve İşletme paketlerinde ilanlarınız özel çerçeve ile öne çıkar!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
        {plans.map(plan => {
          const isCurrent = currentPlan?.plan === plan.plan;
          const isPopular = plan.plan === 'premium';

          return (
            <div key={plan.plan}
              className={`relative card !overflow-visible p-6 bg-gradient-to-b ${planColors[plan.plan]} border-2 ${planHighlight[plan.plan]} transition-all duration-300 hover:-translate-y-1`}>

              {isCurrent ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge bg-green-400 text-white text-[10px] shadow-md whitespace-nowrap">Mevcut Paket</span>
                </div>
              ) : isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge bg-amber-400 text-white text-[10px] shadow-md whitespace-nowrap">En Popüler</span>
                </div>
              )}

              <div className="text-center mb-4">
                <span className="text-4xl">{planIcons[plan.plan]}</span>
                <h3 className="font-display font-extrabold text-lg text-gray-800 mt-2">{plan.name}</h3>
              </div>

              <div className="text-center mb-5">
                {plan.price > 0 ? (
                  <>
                    <span className="font-display font-black text-3xl text-gray-800">₺{plan.price}</span>
                    <span className="text-xs text-gray-400 block mt-0.5">tek seferlik</span>
                  </>
                ) : (
                  <>
                    <span className="font-display font-black text-3xl text-gray-800">Ücretsiz</span>
                    <span className="text-xs text-gray-400 block mt-0.5">kayıt ile</span>
                  </>
                )}
              </div>

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>{plan.listing_limit}</strong> ilan hakkı</span>
                </div>
                {plan.featured_listings > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>{plan.featured_listings}</strong> öne çıkan ilan</span>
                  </div>
                )}
                {plan.badge && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Premium ilan çerçevesi</span>
                  </div>
                )}
                {!plan.badge && plan.plan !== 'free' && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span>✕</span>
                    <span>Premium çerçeve yok</span>
                  </div>
                )}
              </div>

              {plan.plan === 'free' ? (
                <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">
                  Varsayılan
                </button>
              ) : isCurrent ? (
                <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold bg-green-100 text-green-600 cursor-not-allowed">
                  Aktif Paketiniz
                </button>
              ) : (
                <button onClick={() => handlePurchase(plan.plan)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isPopular
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-white hover:from-amber-500 hover:to-yellow-500 shadow-md'
                      : 'btn-primary'
                  }`}>
                  Satın Al
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8 glass p-5 max-w-2xl mx-auto">
        <p className="text-xs text-gray-400">
          Paketler tek seferlik satın alımlardır, süre sınırı yoktur. Satın alınan ilan hakları kullanıldığında yeni paket alabilirsiniz.
          Premium ve İşletme paketlerinde ilanlarınız özel çerçeve ile diğerlerinden ayrışır.
        </p>
      </div>
    </div>
  );
}
