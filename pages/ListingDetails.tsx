import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getListings } from '../supabase';
import { Listing } from '../types';

const ListingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      const list = await getListings();
      const found = list.find(l => l.id === id);
      if (found) setListing(found);
    };
    fetchListing();
  }, [id]);

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
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-urban-green font-semibold text-xs uppercase tracking-widest">
             <i className="fas fa-arrow-left"></i> Back to search
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-200 shadow-xl">
              <img src={images[activeImage]} className="w-full h-full object-cover" alt={listing.title} />
              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center">
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center">
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === idx ? 'border-urban-green scale-95' : 'border-transparent opacity-60'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-urban-green/10 text-urban-green text-[9px] font-semibold uppercase px-3 py-1 rounded-md tracking-widest">{listing.area}</span>
                  {listing.is_available && <span className="bg-green-100 text-green-600 text-[9px] font-semibold px-3 py-1 rounded-md">Available</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight tracking-tight">{listing.title}</h1>
                <p className="text-gray-500 flex items-center gap-2 font-medium text-xs">
                  <i className="fas fa-location-dot text-urban-green"></i> {listing.location}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: 'fa-bed', label: listing.bedrooms, sub: 'Bed' },
                  { icon: 'fa-bath', label: listing.bathrooms, sub: 'Bath' },
                  { icon: 'fa-kaaba', label: listing.balconies, sub: 'Balcony' },
                  { icon: 'fa-expand', label: listing.sqft?.toLocaleString() || '0', sub: 'Sq Ft' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                    <i className={`fas ${item.icon} text-sm text-urban-green mb-1.5`}></i>
                    <div className="text-xs font-semibold text-gray-900 leading-tight">{item.label}</div>
                    <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 uppercase tracking-widest text-[10px]">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm font-medium">{listing.description}</p>
              </div>

              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mb-1">Monthly Rent</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-gray-900 tracking-tight">৳{listing.rent.toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  onClick={handleContactOwner} 
                  className="w-full sm:w-auto bg-urban-green text-white px-8 py-4 rounded-xl font-semibold shadow-xl shadow-urban-green/30 text-center text-xs uppercase tracking-widest hover:bg-urban-green/90 transition-colors"
                >
                  Contact Owner
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