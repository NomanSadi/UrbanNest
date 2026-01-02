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
    e.preventDefault(); if (!profile) return;
    setSaving(true);
    try { await updateProfile(profile.id, { full_name: formData.fullName, avatar_url: formData.avatarUrl }); alert("Profile updated successfully!"); }
    catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-24 text-center text-urban-green font-bold text-xl">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-16 md:py-24 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-[40px] p-10 md:p-16 shadow-sm border border-gray-100">
        <header className="text-center mb-12">
          <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-6 bg-gray-50 flex items-center justify-center border-2 border-white shadow-lg">
             {formData.avatarUrl ? <img src={formData.avatarUrl} className="w-full h-full object-cover" /> : <i className="fas fa-user text-2xl text-gray-300"></i>}
          </div>
          <span className="text-urban-green text-[10px] font-bold uppercase tracking-[0.3em] block mb-1">Account Management</span>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Profile</h1>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Full Name</label>
             <input required type="text" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4.5 focus:ring-4 focus:ring-urban-green/5 font-bold text-sm" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Avatar Image URL</label>
             <input type="text" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4.5 focus:ring-4 focus:ring-urban-green/5 text-sm font-medium" placeholder="https://..." value={formData.avatarUrl} onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })} />
           </div>
           
           <div className="pt-4">
            <button type="submit" disabled={saving} className="w-full bg-urban-green text-white py-5 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-urban-green/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;