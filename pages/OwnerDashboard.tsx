
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getOwnerListings, deleteListing } from '../supabase';
import { Listing, UserProfile } from '../types';

interface OwnerDashboardProps {
  user: UserProfile | null;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/');
      return;
    }
    fetchMyListings();
  }, [user]);

  const fetchMyListings = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getOwnerListings(user.id);
    setListings(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ad? This cannot be undone.")) return;
    try {
      await deleteListing(id);
      setListings(listings.filter(l => l.id !== id));
      alert("Ad removed successfully.");
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">My Property Ads</h1>
            <p className="text-gray-500 font-medium">You have {listings.length} active listings on UrbanNest.</p>
          </div>
          <Link to="/create" className="bg-urban-green text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
            <i className="fas fa-plus"></i> New Listing
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20 text-urban-green font-bold">Fetching your ads...</div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col group">
                <div className="relative h-48">
                  <img src={listing.thumbnail} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-urban-green uppercase tracking-widest shadow-sm">
                    ৳{listing.rent.toLocaleString()}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-2 truncate">{listing.title}</h3>
                  <p className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
                    <i className="fas fa-location-dot"></i> {listing.area}
                  </p>
                  
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => navigate(`/edit/${listing.id}`)}
                      className="bg-gray-50 text-gray-700 py-3 rounded-xl text-xs font-bold hover:bg-urban-green hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(listing.id)}
                      className="bg-red-50 text-red-500 py-3 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                  <Link to={`/listing/${listing.id}`} className="mt-4 text-[10px] text-center font-bold uppercase tracking-widest text-gray-300 hover:text-urban-green transition-colors">
                    View Public Page
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-gray-100">
            <div className="text-4xl mb-4">📢</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No active ads yet</h3>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto">Start listing your properties today to reach thousands of potential renters.</p>
            <Link to="/create" className="text-urban-green font-black underline">Create your first ad</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
