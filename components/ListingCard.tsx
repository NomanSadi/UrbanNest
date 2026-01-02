import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../types';
import { supabase, toggleBookmark, getBookmarks } from '../supabase';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkBookmarkStatus();
  }, [listing.id]);

  const checkBookmarkStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const uid = session.user.id;
        setUserId(uid);
        const bookmarks = await getBookmarks(uid);
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
    <div className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-100 flex flex-col h-full max-w-[500px] mx-auto w-full">
      {/* Shorter Image Section */}
      <div className="relative h-[220px] overflow-hidden">
        <img 
          src={listing.thumbnail} 
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        
        {/* Location Badge */}
        <div className="absolute top-5 left-5">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-black text-gray-800 shadow-sm border border-white/10">
             <i className="fas fa-location-dot text-urban-green"></i> {listing.area}
          </div>
        </div>

        {/* Bookmark Button */}
        <div className="absolute top-5 right-5">
          <button 
            onClick={handleBookmark}
            className={`w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-90 ${isBookmarked ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
          >
            <i className={`${isBookmarked ? 'fas' : 'far'} fa-heart text-lg`}></i>
          </button>
        </div>
      </div>

      {/* Optimized Content Section */}
      <div className="p-7 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
           <span className="text-[9px] font-black text-urban-green uppercase tracking-[0.2em] bg-urban-green/5 px-3 py-1 rounded-lg">
             {listing.category}
           </span>
        </div>
        
        <h3 className="font-black text-xl text-gray-900 mb-2 leading-tight group-hover:text-urban-green transition-colors line-clamp-1">
          {listing.title}
        </h3>
        
        <p className="text-gray-400 text-xs font-medium mb-5 line-clamp-1 leading-relaxed">
          {listing.description || "Experience modern urban living in this beautifully designed property."}
        </p>
        
        {/* Feature Tags - Compact Single Row */}
        <div className="flex items-center justify-between bg-gray-50/50 rounded-2xl p-3 mb-6 border border-gray-100/50">
          <div className="flex items-center gap-2">
            <i className="fas fa-bed text-[10px] text-urban-green"></i>
            <span className="text-[10px] font-black text-gray-900">{listing.bedrooms} <span className="text-gray-400 font-bold uppercase text-[8px]">Bed</span></span>
          </div>
          <div className="w-px h-3 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <i className="fas fa-bath text-[10px] text-urban-green"></i>
            <span className="text-[10px] font-black text-gray-900">{listing.bathrooms} <span className="text-gray-400 font-bold uppercase text-[8px]">Bath</span></span>
          </div>
          <div className="w-px h-3 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <i className="fas fa-door-open text-[10px] text-urban-green"></i>
            <span className="text-[10px] font-black text-gray-900">{listing.balconies || 0} <span className="text-gray-400 font-bold uppercase text-[8px]">Balc</span></span>
          </div>
          <div className="w-px h-3 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <i className="fas fa-expand text-[10px] text-urban-green"></i>
            <span className="text-[10px] font-black text-gray-900">{listing.sqft} <span className="text-gray-400 font-bold uppercase text-[8px]">Sqft</span></span>
          </div>
        </div>

        {/* Pricing & CTA - Horizontal Layout to save height */}
        <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-gray-50">
          <div className="flex flex-col min-w-fit">
             <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Monthly Rent</span>
             <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900 tracking-tighter">৳{listing.rent.toLocaleString()}</span>
                <span className="text-gray-300 font-black text-[9px]">/MO</span>
             </div>
          </div>

          <Link 
            to={`/listing/${listing.id}`}
            className="flex-1 bg-urban-green text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-urban-green/90 active:scale-[0.97] transition-all shadow-lg shadow-urban-green/20 font-black text-[10px] uppercase tracking-widest whitespace-nowrap"
          >
            View Details
            <i className="fas fa-arrow-right-long transition-transform group-hover:translate-x-1"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;