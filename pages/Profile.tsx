import React, { useState, useEffect } from 'react';
import { supabase, updateProfile } from '../supabase';
import { UserProfile } from '../types';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', avatarUrl: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile(data as UserProfile);
        setFormData({ fullName: data.full_name, avatar_url: data.avatar_url || '' });
      }
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile(profile.id, { full_name: formData.fullName, avatar_url: formData.avatarUrl });
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-urban-green font-semibold">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-24 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-16 shadow-sm border border-gray-100">
        <header className="text-center mb-12">
          <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6 border-2 border-gray-50 shadow-sm bg-gray-50 flex items-center justify-center">
             {formData.avatarUrl ? (
               <img src={formData.avatarUrl} className="w-full h-full object-cover" />
             ) : (
               <i className="fas fa-user text-2xl text-gray-300"></i>
             )}
          </div>
          <span className="text-urban-green text-[9px] font-semibold uppercase tracking-[0.3em] block mb-1">Account settings</span>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Manage Profile</h1>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
           <div className="space-y-2">
             <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
             <input 
               required 
               type="text" 
               className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 focus:ring-4 focus:ring-urban-green/5 font-semibold text-sm" 
               value={formData.fullName} 
               onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
             />
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Avatar Image URL</label>
             <input 
               type="text" 
               placeholder="Paste image URL here..."
               className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 focus:ring-4 focus:ring-urban-green/5 font-medium text-sm" 
               value={formData.avatarUrl} 
               onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })} 
             />
           </div>

           <div className="bg-urban-green/5 p-5 rounded-2xl border border-urban-green/10">
             <div className="text-[9px] font-semibold text-urban-green uppercase tracking-widest mb-3">System Information</div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Registered Email:</span>
                <span className="font-semibold text-gray-700">{profile?.email}</span>
             </div>
             <div className="flex justify-between items-center text-xs mt-3">
                <span className="text-gray-500 font-medium">Current Role:</span>
                <span className="font-semibold text-gray-700 uppercase tracking-widest text-[9px] bg-urban-green text-white px-2 py-0.5 rounded">{profile?.role}</span>
             </div>
           </div>

           <button 
             type="submit" 
             disabled={saving} 
             className="w-full bg-urban-green text-white py-4 rounded-xl font-semibold text-sm uppercase tracking-widest shadow-lg shadow-urban-green/20 hover:bg-urban-green/90 transition-all"
           >
             {saving ? 'Saving...' : 'Update Profile'}
           </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;