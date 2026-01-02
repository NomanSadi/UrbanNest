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
        setFormData({ fullName: data.full_name, avatarUrl: data.avatar_url || '' });
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

  if (loading) return <div className="p-20 text-center text-urban-green font-bold">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-24 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-[40px] p-8 md:p-16 shadow-2xl border border-gray-100">
        <header className="text-center mb-12">
          <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 border-4 border-gray-100 shadow-xl bg-gray-100 flex items-center justify-center">
             {formData.avatarUrl ? (
               <img src={formData.avatarUrl} className="w-full h-full object-cover" />
             ) : (
               <i className="fas fa-user text-4xl text-gray-300"></i>
             )}
          </div>
          <h1 className="text-3xl font-black text-gray-900">Manage Profile</h1>
          <p className="text-gray-500 font-medium">Update your public identity on UrbanNest.</p>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
           <div className="space-y-3">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
             <input 
               required 
               type="text" 
               className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 focus:ring-4 focus:ring-urban-green/5 font-bold" 
               value={formData.fullName} 
               onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
             />
           </div>

           <div className="space-y-3">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Avatar Image URL</label>
             <input 
               type="text" 
               placeholder="Paste image URL here..."
               className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 focus:ring-4 focus:ring-urban-green/5 font-medium" 
               value={formData.avatarUrl} 
               onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })} 
             />
           </div>

           <div className="bg-urban-green/5 p-6 rounded-3xl">
             <div className="text-[10px] font-black text-urban-green uppercase tracking-widest mb-2">Account Info</div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Email:</span>
                <span className="font-bold text-gray-700">{profile?.email}</span>
             </div>
             <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-500">Role:</span>
                <span className="font-bold text-gray-700 uppercase tracking-widest text-[10px] bg-urban-green text-white px-2 py-1 rounded-md">{profile?.role}</span>
             </div>
           </div>

           <button 
             type="submit" 
             disabled={saving} 
             className="w-full bg-urban-green text-white py-6 rounded-[22px] font-black text-lg shadow-xl shadow-urban-green/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70"
           >
             {saving ? 'Saving...' : 'Update Profile'}
           </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;