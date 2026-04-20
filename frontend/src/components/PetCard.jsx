import React from 'react';
import { Link } from 'react-router-dom';

export default function PetCard({ listing }) {
  const age = listing.age_years
    ? `${listing.age_years} yaş${listing.age_months ? ` ${listing.age_months} ay` : ''}`
    : listing.age_months ? `${listing.age_months} ay` : '';

  const isPremium = listing.owner_plan === 'premium' || listing.owner_plan === 'business';

  return (
    <Link to={`/ilan/${listing.id}`} className={`card group cursor-pointer ${isPremium ? 'ring-2 ring-amber-300/70 shadow-lg' : ''}`}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-cream-100 to-peach-50">
        {listing.primary_image ? (
          <img src={listing.primary_image}
            alt={`${listing.title}${listing.breed_name ? ' - ' + listing.breed_name : ''} ${listing.pet_type === 'cat' ? 'kedi' : 'köpek'} ${listing.purpose === 'mating' ? 'çiftleştirme' : 'sahiplendirme'} ilanı${listing.city ? ' - ' + listing.city : ''}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-30">{listing.pet_type === 'cat' ? '🐱' : '🐶'}</span>
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5 pointer-events-none">
          <span className={`badge !px-2.5 !py-1 text-[11px] ${listing.pet_type === 'cat' ? 'badge-cat' : 'badge-dog'}`}>
            {listing.pet_type === 'cat' ? '🐱 Kedi' : '🐶 Köpek'}
          </span>
          <span className={`badge !px-2.5 !py-1 text-[11px] ${listing.purpose === 'mating' ? 'bg-rose-100 text-rose-600' : 'badge-adoption'}`}>
            {listing.purpose === 'mating' ? '💕 Çiftleştirme' : 'Sahiplendirme'}
          </span>
          {isPremium && (
            <span className="badge !px-2.5 !py-1 text-[11px] bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-sm ml-auto">👑 Premium</span>
          )}
          {!isPremium && listing.is_featured && (
            <span className="badge !px-2.5 !py-1 text-[11px] bg-yellow-100 text-yellow-700 ml-auto">⭐ Öne Çıkan</span>
          )}
        </div>

        {listing.image_count > 1 && (
          <div className="absolute bottom-3 right-3 badge bg-black/40 text-white backdrop-blur-sm">
            📸 {listing.image_count}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-bold text-base text-gray-800 truncate group-hover:text-peach-500 transition-colors">
          {listing.title}
        </h3>
        {listing.breed_name && (
          <p className="text-xs text-gray-500 mt-0.5 font-medium">{listing.breed_name}</p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          {age && <span className="flex items-center gap-1">📅 {age}</span>}
          {listing.gender && <span className="flex items-center gap-1">{listing.gender === 'male' ? '♂️' : '♀️'} {listing.gender === 'male' ? 'Erkek' : 'Dişi'}</span>}
          {listing.is_vaccinated && <span className="flex items-center gap-1">💉 Aşılı</span>}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className={`text-sm font-semibold ${listing.purpose === 'mating' ? 'text-rose-500' : 'text-sage-500'}`}>
            {listing.purpose === 'mating' ? '💕 Çiftleştirme' : '🏠 Sahiplendirme'}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>📍</span>{listing.city}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
          <span>👁 {listing.view_count || 0}</span>
          <span>❤️ {listing.favorite_count || 0}</span>
        </div>
      </div>
    </Link>
  );
}
