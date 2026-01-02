import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../types';
import { supabase, toggleBookmark, getBookmarks } from '../supabase';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    checkBookmarkStatus();
  }, [listing.id]);

  const checkBookmarkStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const bookmarks = await getBookmarks(session.user.id);
        setIsBookmarked(bookmarks.includes(listing.id));
      }
    } catch (e) {
      console.error("Auth check failed", e);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Please login to bookmark listings.");
      return;
    }
    
    try {
      const result = await toggleBookmark(session.user.id, listing.id);
      setIsBookmarked(result);
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };

  return (
    <div className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-100 flex flex-col h-full max-w-[480px] mx-auto w-full">
      {/* Visual Section */}
      <div className="relative h-[220px] overflow-hidden">
        <img 
          src={listing.thumbnail} 
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        <div className="absolute top-4 left-4">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 text-[9px] font-semibold text-gray-900 shadow-sm border border-white/10 uppercase tracking-widest">
             <i className="fas fa-location-dot text-urban-green"></i> {listing.area}
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <button 
            onClick={handleBookmark}
            className={`w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-90 ${isBookmarked ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
          >
            <i className={`${isBookmarked ? 'fas' : 'far'} fa-heart text-sm`}></i>
          </button>
        </div>
      </div>

      {/* Content Section - Compacted Padding */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-semibold text-xl text-gray-900 mb-2 leading-tight tracking-tight group-hover:text-urban-green transition-colors line-clamp-1">
          {listing.title}
        </h3>
        
        <p className="text-gray-400 text-[13px] font-medium mb-5 line-clamp-2 leading-relaxed">
          {listing.description || "Modern property featuring premium finishes in a prime location."}
        </p>
        
        {/* Modern Horizontal Features List */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-6">
          <div className="flex items-center gap-2 min-w-max">
            <i className="fas fa-bed text-urban-green text-[12px]"></i>
            <span className="text-[11px] font-semibold text-gray-600">{listing.bedrooms} Bedroom</span>
          </div>
          <div className="flex items-center gap-2 min-w-max">
            <i className="fas fa-bath text-urban-green text-[12px]"></i>
            <span className="text-[11px] font-semibold text-gray-600">{listing.bathrooms} Bathroom</span>
          </div>
          <div className="flex items-center gap-2 min-w-max">
            <i className="fas fa-kaaba text-urban-green text-[12px]"></i>
            <span className="text-[11px] font-semibold text-gray-600">{listing.balconies || 0} Balcony</span>
          </div>
          <div className="flex items-center gap-2 min-w-max">
            <i className="fas fa-expand text-urban-green text-[12px]"></i>
            <span className="text-[11px] font-semibold text-gray-600">{listing.sqft?.toLocaleString()} Square Feet</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-gray-50">
          <div className="flex flex-col">
             <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Rent</span>
             <span className="text-2xl font-semibold text-gray-900 tracking-tight">৳{listing.rent.toLocaleString()}</span>
          </div>

          <Link 
            to={`/listing/${listing.id}`}
            className="px-6 py-3 bg-urban-green text-white rounded-xl flex items-center justify-center gap-2 hover:bg-urban-green/90 active:scale-[0.97] transition-all shadow-md font-semibold text-[10px] uppercase tracking-widest whitespace-nowrap"
          >
            Details <i className="fas fa-arrow-right text-[8px] opacity-60"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;