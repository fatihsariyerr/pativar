import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto bg-white/40 backdrop-blur-md border-t border-white/40">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="font-display font-black text-xl bg-gradient-to-r from-peach-500 to-lavender-400 bg-clip-text text-transparent">
              🐾 PatiVar
            </h3>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Türkiye'nin en sevimli kedi ve köpek ilan platformu. Evcil hayvanınıza sıcak bir yuva bulun.
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-gray-800 mb-3">Keşfet</h4>
            <div className="space-y-2">
              <Link to="/ilanlar?pet_type=cat" className="block text-sm text-gray-500 hover:text-peach-500 transition-colors">🐱 Kedi İlanları</Link>
              <Link to="/ilanlar?pet_type=dog" className="block text-sm text-gray-500 hover:text-peach-500 transition-colors">🐶 Köpek İlanları</Link>
              <Link to="/ilanlar?purpose=adoption" className="block text-sm text-gray-500 hover:text-peach-500 transition-colors">🏠 Sahiplendirme</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-gray-800 mb-3">Hesap</h4>
            <div className="space-y-2">
              <Link to="/ilan-ver" className="block text-sm text-gray-500 hover:text-peach-500 transition-colors">İlan Ver</Link>
              <Link to="/profil" className="block text-sm text-gray-500 hover:text-peach-500 transition-colors">Profilim</Link>
              <Link to="/favoriler" className="block text-sm text-gray-500 hover:text-peach-500 transition-colors">Favorilerim</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-gray-800 mb-3">Abonelik</h4>
            <div className="space-y-2 text-sm text-gray-500">
                  <p>Ücretsiz: 1 İlan</p>
               <Link to="/paketler" className="block text-sm text-gray-500 hover:text-peach-500 transition-colors">Temel: 1 İlan - ₺99.99</Link>
                <Link to="/paketler" className="block text-sm text-gray-500 hover:text-peach-500 transition-colors">Premium: 5 İlan - ₺349.99</Link>
                <Link to="/paketler" className="block text-sm text-gray-500 hover:text-peach-500 transition-colors">İşletme: 20 İlan - ₺799.99</Link>
          
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© 2026 PatiVar. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link to="/gizlilik" className="hover:text-peach-500 transition-colors">Gizlilik Politikası</Link>
            <Link to="/kullanim-sartlari" className="hover:text-peach-500 transition-colors">Kullanım Şartları</Link>
            <Link to="/iletisim" className="hover:text-peach-500 transition-colors">İletişim</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
