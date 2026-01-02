
import React from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-gray-100 flex flex-col h-full">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={listing.thumbnail} 
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-[10px] font-semibold text-gray-700 shadow-sm">
             <span className="text-urban-green">📍</span> {listing.area}
          </div>
          {listing.is_verified && (
            <div className="bg-urban-green text-white px-3 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold shadow-sm">
               <i className="fas fa-check-circle"></i> Verified
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm">
            🤍
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
           <span className="bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/20">
             {listing.category}
           </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-gray-800 mb-2 leading-tight">
          {listing.title}
        </h3>
        
        <div className="flex flex-wrap gap-y-1 gap-x-3 mb-4">
          {listing.features.slice(0, 3).map((feature, idx) => (
            <span key={idx} className="text-[11px] text-gray-500 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-300"></span> {feature}
            </span>
          ))}
          {listing.features.length > 3 && (
            <span className="text-[11px] text-gray-400">+{listing.features.length - 3} more</span>
          )}
        </div>

        <div className="mt-auto">
          <div className="bg-[#F3F7F5] border border-gray-100 rounded-full py-2 px-4 mb-4 flex justify-center items-center gap-1">
             <span className="text-xl font-bold text-gray-800">৳ {listing.rent.toLocaleString()}</span>
             <span className="text-xs text-gray-500 font-medium">/mo</span>
          </div>

          <Link 
            to={`/listing/${listing.id}`}
            className="w-full bg-urban-green text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover-urban-green transition"
          >
            View Details <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
