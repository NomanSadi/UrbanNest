import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getListings, toggleBookmark, getBookmarks, supabase } from '../supabase';
import { Listing } from '../types';

const ListingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      const list = await getListings();
      const found = list.find(l => l.id === id);
      if (found) {
        setListing(found);
        checkBookmarkStatus(found.id);
      }
    };
    fetchListing();
  }, [id]);

  const checkBookmarkStatus = async (listingId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const bookmarks = await getBookmarks(session.user.id);
      setIsBookmarked(bookmarks.includes(listingId));
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Please login to bookmark listings.");
      return;
    }
    
    try {
      const result = await toggleBookmark(session.user.id, listing!.id);
      setIsBookmarked(result);
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };

  if (!listing) return <div className="p-20 text-center text-gray-400 font-medium">Loading premium listing...</div>;

  const images = listing.images && listing.images.length > 0 ? listing.images : [listing.thumbnail];
  const nextImg = () => setActiveImage((prev) => (prev + 1) % images.length);
  const prevImg = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length);

  const handleContactOwner = () => {
    navigate(`/chat?listingId=${listing.id}&ownerId=${listing.owner_id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-urban-green font-bold text-[10px] uppercase tracking-widest">
             <i className="fas fa-arrow-left"></i> Back to search
          </Link>
          
          <button 
            onClick={handleBookmark}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90 border border-gray-100 ${isBookmarked ? 'bg-urban-green text-white shadow-urban-green/20' : 'bg-white text-gray-300 hover:text-urban-green/60'}`}
          >
            <i className={`${isBookmarked ? 'fas' : 'far'} fa-heart text-xl`}></i>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-6">
            <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden bg-gray-200 shadow-xl border border-white">
              <img src={images[activeImage]} className="w-full h-full object-cover" alt={listing.title} />
              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-xl text-white border border-white/20 flex items-center justify-center hover:bg-white/60 transition">
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button onClick={nextImg} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-xl text-white border border-white/20 flex items-center justify-center hover:bg-white/60 transition">
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar px-1">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`w-24 h-24 rounded-[28px] overflow-hidden border-4 flex-shrink-0 transition-all ${activeImage === idx ? 'border-urban-green scale-95 shadow-lg' : 'border-white opacity-40 hover:opacity-100'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-urban-green/10 text-urban-green text-[9px] font-bold uppercase px-4 py-1.5 rounded-xl tracking-[0.2em]">{listing.area}</span>
                  {listing.is_available && <span className="bg-green-100 text-green-600 text-[9px] font-bold px-4 py-1.5 rounded-xl uppercase tracking-widest">Available</span>}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">{listing.title}</h1>
                <p className="text-gray-400 flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                  <i className="fas fa-location-dot text-urban-green"></i> {listing.location}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: 'fa-bed', label: listing.bedrooms, sub: 'Bed' },
                  { icon: 'fa-bath', label: listing.bathrooms, sub: 'Bath' },
                  { icon: 'fa-kaaba', label: listing.balconies, sub: 'Balcony' },
                  { icon: 'fa-expand', label: listing.sqft?.toLocaleString() || '0', sub: 'Sq Ft' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50/50 rounded-3xl p-5 border border-gray-100 text-center flex flex-col items-center justify-center">
                    <i className={`fas ${item.icon} text-sm text-urban-green mb-2`}></i>
                    <div className="text-sm font-bold text-gray-900">{item.label}</div>
                    <div className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em]">{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em]">Property Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm font-medium">{listing.description}</p>
              </div>

              <div className="pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-1">Monthly Investment</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 tracking-tight">৳{listing.rent.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">/ month</span>
                  </div>
                </div>
                <button 
                  onClick={handleContactOwner} 
                  className="w-full sm:w-auto bg-urban-green text-white px-10 py-5 rounded-[22px] font-bold shadow-xl shadow-urban-green/20 text-center text-[10px] uppercase tracking-[0.3em] hover:bg-urban-green/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Message Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;