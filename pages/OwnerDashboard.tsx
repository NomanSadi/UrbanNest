import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getOwnerListings, deleteListing } from '../supabase';
import { Listing, UserProfile } from '../types';

interface OwnerDashboardProps { user: UserProfile | null; }

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'owner') { navigate('/'); return; }
    fetchMyListings();
  }, [user, navigate]);

  const fetchMyListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getOwnerListings(user.id);
      setListings(data);
    } catch (err) { console.error("Failed to fetch listings", err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm("Are you sure?")) return;
    setDeletingId(id);
    try { await deleteListing(id); setListings(prev => prev.filter(l => l.id !== id)); }
    catch (err: any) { alert(`Error: ${err.message}`); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <span className="text-urban-green text-[10px] font-bold uppercase tracking-[0.3em] block">Properties</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">My Property Ads</h1>
          </div>
          <Link to="/create" className="bg-urban-green text-white px-8 py-3.5 rounded-xl font-bold shadow-xl shadow-urban-green/20 hover:bg-urban-green/90 transition-all text-[11px] uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-plus"></i> Post New Ad
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => <div key={i} className="h-72 bg-white rounded-[32px] animate-pulse"></div>)}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col group">
                <div className="h-48 relative overflow-hidden">
                  <img src={listing.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-white/95 px-3 py-1.5 rounded-xl text-[11px] font-bold text-urban-green shadow-sm">৳{listing.rent.toLocaleString()}</div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-6 truncate text-base">{listing.title}</h3>
                  <div className="mt-auto flex gap-3">
                    <button onClick={() => navigate(`/edit/${listing.id}`)} className="flex-1 bg-gray-50 text-gray-600 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-urban-green hover:text-white transition-all">Edit</button>
                    <button disabled={deletingId === listing.id} onClick={(e) => handleDelete(e, listing.id)} className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-24 rounded-[40px] text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <i className="fas fa-bullhorn text-3xl text-gray-200"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">No active ads yet</h3>
            <Link to="/create" className="bg-urban-green text-white px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-urban-green/20">Post Your First Ad</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;