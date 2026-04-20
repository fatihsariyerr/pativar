import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import PetCard from '../components/PetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/giris'); return; }
    api.get('/favorites').then(r => setFavorites(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="Favorilerim" noindex />
      <h1 className="font-display font-extrabold text-2xl text-gray-800 mb-1">❤️ Favorilerim</h1>
      <p className="text-sm text-gray-500 mb-6">{favorites.length} favori ilan</p>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favorites.map(f => <PetCard key={f.id} listing={f} />)}
        </div>
      ) : (
        <div className="text-center py-20 glass">
          <span className="text-6xl">💔</span>
          <p className="mt-4 text-lg font-semibold text-gray-600">Henüz favori ilanınız yok</p>
          <p className="text-sm text-gray-400 mt-1">Beğendiğiniz ilanlara ❤️ basarak favorilere ekleyin</p>
        </div>
      )}
    </div>
  );
}
