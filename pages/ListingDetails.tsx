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
    <div className="min-h-screen bg-white md:bg-gray-50 py-4 md:py-12 px-0 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="px-6 md:px-0 flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-urban-green font-bold text-sm">
             <i className="fas fa-arrow-left"></i> Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] md:rounded-[40px] overflow-hidden bg-gray-200 group">
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
            <div className="hidden md:flex gap-4 overflow-x-auto py-2 no-scrollbar">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`w-24 h-24 rounded-2xl overflow-hidden border-4 flex-shrink-0 ${activeImage === idx ? 'border-urban-green' : 'border-transparent opacity-60'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 md:px-0">
            <div className="bg-white md:rounded-[40px] md:p-10 md:shadow-xl md:border md:border-gray-50 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-urban-green/10 text-urban-green text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-lg">{listing.area}</span>
                  {listing.is_available && <span className="bg-green-100 text-green-600 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">Available</span>}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{listing.title}</h1>
                <p className="text-gray-500 flex items-center gap-2 font-medium">
                  <i className="fas fa-location-dot text-urban-green"></i> {listing.location}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: 'fa-bed', label: listing.bedrooms, sub: 'Bedrooms' },
                  { icon: 'fa-bath', label: listing.bathrooms, sub: 'Bathrooms' },
                  { icon: 'fa-kaaba', label: listing.balconies, sub: 'Balconies' },
                  { icon: 'fa-expand', label: listing.sqft?.toLocaleString() || '0', sub: 'Sq Ft' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-3xl p-5 border border-gray-100 text-center">
                    <i className={`fas ${item.icon} text-lg text-urban-green mb-2`}></i>
                    <div className="text-sm font-bold text-gray-900 leading-tight">{item.label}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase">{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">{listing.description}</p>
              </div>

              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Monthly Rent</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900">৳{listing.rent.toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  onClick={handleContactOwner} 
                  className="w-full sm:w-auto bg-urban-green text-white px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-urban-green/30 text-center"
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