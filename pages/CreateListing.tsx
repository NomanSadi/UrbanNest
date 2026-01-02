import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createListing, updateListing, uploadImage, getListings } from '../supabase';
import { generatePropertyDescription } from '../services/gemini';
import { UserProfile, Listing } from '../types';

interface CreateListingProps {
  user: UserProfile | null;
}

const CreateListing: React.FC<CreateListingProps> = ({ user }) => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>(); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [statusText, setStatusText] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    area: '',
    category: 'Apartment',
    rent: 0,
    sqft: 1200,
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    description: '',
    features: '',
  });

  useEffect(() => {
    if (editId && user) {
      const fetchListing = async () => {
        try {
          const list = await getListings();
          const found = list.find(l => l.id === editId);
          if (found) {
            if (found.owner_id !== user.id) {
              alert("You don't have permission to edit this ad.");
              navigate('/');
              return;
            }
            setFormData({
              title: found.title || '',
              location: found.location || '',
              area: found.area || '',
              category: found.category || 'Apartment',
              rent: found.rent || 0,
              sqft: found.sqft || 0,
              bedrooms: found.bedrooms || 0,
              bathrooms: found.bathrooms || 0,
              balconies: found.balconies || 0,
              description: found.description || '',
              features: Array.isArray(found.features) ? found.features.join(', ') : '',
            });
            setImagePreviews(found.images || []);
          }
        } catch (err) {
          console.error("Error fetching for edit:", err);
        } finally {
          setFetching(false);
        }
      };
      fetchListing();
    } else if (editId && !user) {
       navigate('/');
    }
  }, [editId, user, navigate]);

  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="text-center bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100 max-w-lg">
           <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
             <i className="fas fa-user-lock"></i>
           </div>
           <h2 className="text-2xl font-semibold text-gray-900 mb-4">Owner Access Only</h2>
           <button onClick={() => navigate('/')} className="w-full bg-urban-green text-white px-8 py-4 rounded-xl font-semibold">Return Home</button>
        </div>
      </div>
    );
  }

  if (fetching) return <div className="p-20 text-center font-semibold text-urban-green">Loading listing data...</div>;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files) as File[];
      setImageFiles(prev => [...prev, ...newFiles]);
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAiDescription = async () => {
    if (!formData.title) return alert("Please provide a Title first!");
    setAiGenerating(true);
    try {
      const desc = await generatePropertyDescription({
        title: formData.title,
        location: formData.location || formData.area,
        rent: formData.rent,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean)
      });
      setFormData(prev => ({ ...prev, description: desc || '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const adjustCount = (field: 'bedrooms' | 'bathrooms' | 'balconies', amount: number) => {
    setFormData(prev => ({ ...prev, [field]: Math.max(0, prev[field] + amount) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusText('Starting...');
    
    try {
      let finalImages = [...imagePreviews.filter(img => img.startsWith('http'))]; 
      
      if (imageFiles.length > 0) {
        setStatusText('Uploading photos...');
        for (let i = 0; i < imageFiles.length; i++) {
          const url = await uploadImage(imageFiles[i]);
          finalImages.push(url);
        }
      }

      if (finalImages.length === 0) throw new Error("At least one image is required.");

      setStatusText('Updating database...');
      const listingData = {
        owner_id: user.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        area: formData.area,
        rent: Number(formData.rent),
        sqft: Number(formData.sqft),
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        balconies: formData.balconies,
        category: formData.category,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        images: finalImages,
        thumbnail: finalImages[0],
        is_available: true,
      };

      let result;
      if (editId) {
        result = await updateListing(editId, listingData);
        alert("🎉 Listing updated successfully!");
      } else {
        result = await createListing(listingData);
        alert("🎉 Property published successfully!");
      }
      
      navigate(`/listing/${result.id || editId}`);
    } catch (err: any) {
      console.error("Submit Error:", err);
      alert(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-24 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-16 shadow-sm border border-gray-100">
        <header className="mb-12 space-y-1">
          <span className="text-urban-green text-[10px] font-semibold uppercase tracking-[0.3em] block ml-1">Publisher</span>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            {editId ? 'Edit Listing' : 'Create New Ad'}
          </h1>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-12">
          <section className="space-y-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Property Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {imagePreviews.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                  <img src={img} className="w-full h-full object-cover" alt="Preview" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-urban-green hover:bg-urban-green/5 transition-all bg-gray-50/50">
                <i className="fas fa-plus text-lg text-gray-300"></i>
                <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-widest text-center">Add Photo</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageChange} />
          </section>

          <section className="space-y-8">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Core Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Title</label>
                <input required type="text" className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 focus:ring-4 focus:ring-urban-green/5 font-semibold text-sm" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Monthly Rent (৳)</label>
                <input required type="number" className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 focus:ring-4 focus:ring-urban-green/5 font-semibold text-base text-urban-green" value={formData.rent || ''} onChange={e => setFormData({ ...formData, rent: Number(e.target.value) })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Square Feet</label>
                <input required type="number" className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 focus:ring-4 focus:ring-urban-green/5 font-semibold text-sm" value={formData.sqft || ''} onChange={e => setFormData({ ...formData, sqft: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Area</label>
                <select required className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 focus:ring-4 focus:ring-urban-green/5 font-semibold text-sm" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })}>
                  <option value="">Select Area</option>
                  <option value="Gulshan">Gulshan</option>
                  <option value="Banani">Banani</option>
                  <option value="Dhanmondi">Dhanmondi</option>
                  <option value="Uttara">Uttara</option>
                  <option value="Mirpur">Mirpur</option>
                  <option value="Bashundhara">Bashundhara R/A</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Bed', field: 'bedrooms' as const },
                { label: 'Bath', field: 'bathrooms' as const },
                { label: 'Balcony', field: 'balconies' as const },
              ].map((item) => (
                <div key={item.field} className="space-y-2 text-center">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{item.label}</label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                    <button type="button" onClick={() => adjustCount(item.field, -1)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-urban-green transition"><i className="fas fa-minus text-[8px]"></i></button>
                    <span className="font-semibold text-gray-800 text-sm">{formData[item.field]}</span>
                    <button type="button" onClick={() => adjustCount(item.field, 1)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-urban-green transition"><i className="fas fa-plus text-[8px]"></i></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Description</label>
                <button type="button" onClick={handleAiDescription} disabled={aiGenerating} className="text-[9px] font-semibold uppercase text-urban-green bg-urban-green/10 px-3 py-1.5 rounded-lg hover:bg-urban-green/20 transition">
                   {aiGenerating ? 'Writing...' : '✨ AI Generate'}
                </button>
              </div>
              <textarea rows={6} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-6 focus:ring-4 focus:ring-urban-green/5 leading-relaxed text-sm font-medium" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </section>

          <button type="submit" disabled={loading} className="w-full bg-urban-green text-white py-5 rounded-2xl font-semibold text-base shadow-xl transition-all hover:bg-urban-green/90 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 uppercase tracking-widest">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span className="text-xs uppercase tracking-widest">{statusText}</span>
              </>
            ) : (editId ? 'Update Listing' : 'Publish Ad')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;