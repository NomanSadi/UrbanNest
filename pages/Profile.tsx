import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase, updateProfile, getBookmarks, getListingsByIds } from '../supabase';
import { UserProfile, Listing } from '../types';
import ListingCard from '../components/ListingCard';

const Profile: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'account';
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({ fullName: '', avatarUrl: '' });
  
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedHomes();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile(data as UserProfile);
        // Correcting property name to match state definition (avatar_url -> avatarUrl)
        setFormData({ fullName: data.full_name, avatarUrl: data.avatar_url || '' });
      }
    }
    setLoading(false);
  };

  const fetchSavedHomes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    setLoadingSaved(true);
    try {
      const bookmarkIds = await getBookmarks(session.user.id);
      if (bookmarkIds.length > 0) {
        const homes = await getListingsByIds(bookmarkIds);
        setSavedListings(homes);
      } else {
        setSavedListings([]);
      }
    } catch (err) {
      console.error("Failed to fetch saved homes", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!profile) return;
    setSaving(true);
    try { 
      await updateProfile(profile.id, { full_name: formData.fullName, avatar_url: formData.avatarUrl }); 
      alert("Profile updated successfully!"); 
    }
    catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-24 text-center text-urban-green font-bold text-xl">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center md:text-left">
           <span className="text-urban-green text-[10px] font-bold uppercase tracking-[0.4em] block mb-2">Member Workspace</span>
           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">My UrbanNest</h1>
        </header>

        {/* Custom Tab Navigation */}
        <div className="flex gap-4 mb-12 border-b border-gray-200">
           <button 
             onClick={() => setActiveTab('account')} 
             className={`pb-4 px-2 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'account' ? 'text-urban-green' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Account Settings
             {activeTab === 'account' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-urban-green rounded-full"></div>}
           </button>
           <button 
             onClick={() => setActiveTab('saved')} 
             className={`pb-4 px-2 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'saved' ? 'text-urban-green' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Saved Homes ({savedListings.length})
             {activeTab === 'saved' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-urban-green rounded-full"></div>}
           </button>
        </div>

        {activeTab === 'account' ? (
          <div className="max-w-xl bg-white rounded-[40px] p-10 md:p-16 shadow-sm border border-gray-100">
            <div className="text-center mb-10">
              <div className="w-24 h-24 rounded-[32px] overflow-hidden mx-auto mb-6 bg-gray-50 flex items-center justify-center border-4 border-white shadow-xl">
                 {formData.avatarUrl ? <img src={formData.avatarUrl} className="w-full h-full object-cover" /> : <i className="fas fa-user text-3xl text-gray-200"></i>}
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{profile?.role}</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block ml-3">Full Name</label>
                 <input required type="text" className="w-full bg-gray-50/80 border-none rounded-2xl px-7 py-4.5 focus:ring-4 focus:ring-urban-green/5 font-bold text-sm" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block ml-3">Avatar URL</label>
                 <input type="text" className="w-full bg-gray-50/80 border-none rounded-2xl px-7 py-4.5 focus:ring-4 focus:ring-urban-green/5 text-sm font-medium" placeholder="https://..." value={formData.avatarUrl} onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })} />
               </div>
               
               <div className="pt-4">
                <button type="submit" disabled={saving} className="w-full bg-urban-green text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-urban-green/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                  {saving ? 'Updating...' : 'Save Changes'}
                </button>
               </div>
            </form>
          </div>
        ) : (
          <div className="space-y-10">
            {loadingSaved ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-white rounded-[32px] animate-pulse"></div>)}
              </div>
            ) : savedListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {savedListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-heart text-3xl text-gray-200"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No saved homes yet</h3>
                <p className="text-gray-400 max-w-sm mx-auto mb-10 text-sm font-medium">Click the heart icon on any property to save it for later review.</p>
                <button onClick={() => window.location.href = '/'} className="bg-urban-green text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-urban-green/20">Explore Properties</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;