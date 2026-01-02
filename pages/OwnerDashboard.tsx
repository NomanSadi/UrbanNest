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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'owner') {
      navigate('/');
      return;
    }
    fetchMyListings();
  }, [user, navigate]);

  const fetchMyListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getOwnerListings(user.id);
      setListings(data);
    } catch (err) {
      console.error("Failed to fetch listings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this ad? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteListing(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <span className="text-urban-green text-[10px] font-semibold uppercase tracking-[0.3em] block ml-1">Properties</span>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">My Property Ads</h1>
          </div>
          <Link to="/create" className="bg-urban-green text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-urban-green/20 hover:bg-urban-green/90 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
            <i className="fas fa-plus"></i> Post New Ad
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-3xl animate-pulse"></div>)}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col group">
                <div className="relative h-48">
                  <img src={listing.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-urban-green shadow-sm">
                    ৳{listing.rent.toLocaleString()}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-semibold text-white uppercase tracking-widest">
                    {listing.area}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-4 truncate text-base">{listing.title}</h3>
                  
                  <div className="flex items-center gap-4 mb-6 text-gray-400 text-xs">
                    <span className="flex items-center gap-1.5"><i className="fas fa-bed"></i> {listing.bedrooms}</span>
                    <span className="flex items-center gap-1.5"><i className="fas fa-bath"></i> {listing.bathrooms}</span>
                    <span className="flex items-center gap-1.5"><i className="fas fa-expand"></i> {listing.sqft}</span>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <button 
                      onClick={(e) => handleEdit(e, listing.id)}
                      className="flex-1 bg-gray-50 text-gray-700 py-3 rounded-lg text-[10px] font-semibold uppercase tracking-widest hover:bg-urban-green hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-pen-to-square"></i> Edit
                    </button>
                    <button 
                      disabled={deletingId === listing.id}
                      onClick={(e) => handleDelete(e, listing.id)}
                      className={`flex-1 ${deletingId === listing.id ? 'bg-gray-100 text-gray-300' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'} py-3 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2`}
                    >
                      {deletingId === listing.id ? (
                        <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                      ) : (
                        <><i className="fas fa-trash-can"></i> Delete</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-3xl text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-bullhorn text-2xl text-gray-200"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No active ads yet</h3>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto text-sm font-medium">Start listing your properties today.</p>
            <Link to="/create" className="bg-urban-green text-white px-8 py-3.5 rounded-xl font-semibold uppercase tracking-widest text-xs">Post Your First Ad</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;