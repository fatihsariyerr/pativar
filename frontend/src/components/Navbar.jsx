import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PawIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="7.5" cy="8" rx="2.5" ry="3" />
    <ellipse cx="16.5" cy="8" rx="2.5" ry="3" />
    <ellipse cx="4" cy="14" rx="2" ry="2.5" />
    <ellipse cx="20" cy="14" rx="2" ry="2.5" />
    <path d="M12 20c-3.5 0-6-2.5-6-5.5S9 10 12 10s6 2 6 4.5S15.5 20 12 20z" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Route değiştiğinde dropdown'ları kapat
  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  // Dışarı tıklayınca profil dropdown'ını kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Ana Sayfa', icon: '🏠' },
    { path: '/ilanlar', label: 'İlanlar', icon: '📋' },
    { path: '/ilanlar?pet_type=cat', label: 'Kediler', icon: '🐱' },
    { path: '/ilanlar?pet_type=dog', label: 'Köpekler', icon: '🐶' },
    { path: '/paketler', label: 'Paketler', icon: '📦' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="text-peach-500 group-hover:text-peach-400 transition-colors float-animation">
              <PawIcon />
            </div>
            <span className="font-display font-black text-xl lg:text-2xl bg-gradient-to-r from-peach-500 via-rose-400 to-lavender-400 bg-clip-text text-transparent">
              PatiVar
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-peach-100 text-peach-600'
                    : 'text-gray-600 hover:bg-white/50 hover:text-peach-500'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/ilan-ver" className="hidden sm:flex btn-primary text-sm !py-2 !px-4 gap-1.5">
                  <span>✨</span> İlan Ver
                </Link>
                <Link to="/favoriler" className="p-2 rounded-xl hover:bg-rose-50 transition-colors text-gray-500 hover:text-rose-500">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </Link>
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/50 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-peach-300 to-lavender-300 flex items-center justify-center text-white font-bold text-sm">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <span className="hidden lg:block text-sm font-semibold text-gray-700">{user.first_name}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-lg py-2 border border-white/40">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-800">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <div className="mt-1 badge badge-sale text-[10px]">
                          {user.plan === 'free' ? 'Ücretsiz' : user.plan === 'basic' ? 'Temel Paket' : user.plan === 'premium' ? 'Premium' : user.plan === 'business' ? 'İşletme' : 'Ücretsiz'}
                          {' • '}{user.listings_used ?? 0}/{user.listing_limit ?? 1} İlan
                        </div>
                      </div>
                      <Link to="/profil" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-peach-50 transition-colors">
                        <span>👤</span> Profilim & İlanlarım
                      </Link>
                      <Link to="/favoriler" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-peach-50 transition-colors">
                        <span>❤️</span> Favorilerim
                      </Link>
                      <Link to="/paketler" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 transition-colors">
                        <span>📦</span> Paketler
                        {user.plan !== 'business' && <span className="ml-auto badge bg-amber-100 text-amber-600 text-[9px]">Yükselt</span>}
                      </Link>
                      <button onClick={() => { logout(); setProfileOpen(false); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <span>🚪</span> Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/giris" className="btn-outline text-sm !py-2 !px-4">Giriş</Link>
                <Link to="/kayit" className="btn-primary text-sm !py-2 !px-4">Kayıt Ol</Link>
              </div>
            )}

            {/* Mobile menu btn */}
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileOpen ? <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/30 mt-2 pt-3">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-peach-50">
                <span>{link.icon}</span> {link.label}
              </Link>
            ))}
            {user && (
              <Link to="/ilan-ver" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 mt-2 mx-4 btn-primary text-sm justify-center">
                <span>✨</span> İlan Ver
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
