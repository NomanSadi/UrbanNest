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
    <div className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group border border-gray-100 flex flex-col h-full max-w-[480px] mx-auto w-full">
      {/* Visual Section */}
      <div className="relative h-[240px] overflow-hidden">
        <img 
          src={listing.thumbnail} 
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        <div className="absolute top-5 left-5">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-[9px] font-bold text-gray-900 shadow-sm border border-white/10 uppercase tracking-widest">
             <i className="fas fa-location-dot text-urban-green"></i> {listing.area}
          </div>
        </div>

        <div className="absolute top-5 right-5">
          <button 
            onClick={handleBookmark}
            className={`w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-90 ${isBookmarked ? 'text-urban-green' : 'text-gray-300 hover:text-urban-green/60'}`}
          >
            <i className={`${isBookmarked ? 'fas' : 'far'} fa-heart text-sm`}></i>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-7 flex flex-col flex-1">
        <h3 className="font-bold text-xl text-gray-900 mb-1.5 leading-tight tracking-tight group-hover:text-urban-green transition-colors line-clamp-1">
          {listing.title}
        </h3>
        
        <p className="text-gray-400 text-[13px] font-medium mb-6 line-clamp-2 leading-relaxed">
          {listing.description || "Modern property featuring premium finishes in a prime location."}
        </p>
        
        {/* Compact 2-Column Feature Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-urban-green/5 flex items-center justify-center text-urban-green">
              <i className="fas fa-bed text-[11px]"></i>
            </div>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{listing.bedrooms} Bedroom</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-urban-green/5 flex items-center justify-center text-urban-green">
              <i className="fas fa-bath text-[11px]"></i>
            </div>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{listing.bathrooms} Bathroom</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-urban-green/5 flex items-center justify-center text-urban-green">
              <i className="fas fa-kaaba text-[11px]"></i>
            </div>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{listing.balconies || 0} Balcony</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-urban-green/5 flex items-center justify-center text-urban-green">
              <i className="fas fa-expand text-[11px]"></i>
            </div>
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{listing.sqft?.toLocaleString()} Sq Ft</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-auto flex items-center justify-between gap-4 pt-6 border-t border-gray-50">
          <div className="flex flex-col">
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5 ml-0.5">Amount</span>
             <div className="flex items-baseline gap-1">
               <span className="text-2xl font-bold text-gray-900 tracking-tight">৳{listing.rent.toLocaleString()}</span>
               <span className="text-[10px] font-semibold text-gray-400">/ per month</span>
             </div>
          </div>

          <Link 
            to={`/listing/${listing.id}`}
            className="px-6 py-3.5 bg-urban-green text-white rounded-xl flex items-center justify-center gap-2 hover:bg-urban-green/90 active:scale-[0.97] transition-all shadow-lg shadow-urban-green/10 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap"
          >
            View Details <i className="fas fa-arrow-right text-[8px] opacity-40"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;