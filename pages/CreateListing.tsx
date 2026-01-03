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
        <div className="text-center bg-white p-10 md:p-16 rounded-[40px] shadow-sm border border-gray-100 max-w-lg">
           <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8">
             <i className="fas fa-user-lock"></i>
           </div>
           <h2 className="text-3xl font-bold text-gray-900 mb-4">Owner Access Only</h2>
           <p className="text-gray-400 font-medium mb-10 leading-relaxed">Only verified property owners can publish advertisements on UrbanNest.</p>
           <button onClick={() => navigate('/')} className="w-full bg-urban-green text-white px-8 py-5 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-urban-green/20 transition-all">Return Home</button>
        </div>
      </div>
    );
  }

  if (fetching) return <div className="p-24 text-center font-bold text-urban-green text-xl">Loading property details...</div>;

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
    
    // Explicit validation check
    if (!formData.category || formData.category === "") {
       alert("Property Category is required. Please select one.");
       return;
    }
    
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

      setStatusText('Saving data...');
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
      <div className="max-w-4xl mx-auto bg-white rounded-[40px] p-8 md:p-16 shadow-sm border border-gray-100">
        <header className="mb-12 space-y-1">
          <span className="text-urban-green text-[10px] font-bold uppercase tracking-[0.3em] block mb-1">Publisher Dashboard</span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            {editId ? 'Edit Listing' : 'Create New Ad'}
          </h1>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Photos Section */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Property Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {imagePreviews.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                  <img src={img} className="w-full h-full object-cover" alt="Preview" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center shadow-lg">
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-urban-green/30 hover:bg-urban-green/5 transition-all bg-gray-50/50 group">
                <i className="fas fa-plus text-xl text-gray-300 group-hover:text-urban-green transition-colors"></i>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center group-hover:text-urban-green transition-colors">Add Photo</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageChange} />
          </section>

          {/* Core Information */}
          <section className="space-y-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Core Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Property Title</label>
                <input required type="text" placeholder="e.g. Modern Apartment with Lake View" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4.5 focus:ring-4 focus:ring-urban-green/5 font-bold text-sm" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Monthly Rent (৳)</label>
                <input required type="number" placeholder="25,000" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4.5 focus:ring-4 focus:ring-urban-green/5 font-bold text-base text-urban-green" value={formData.rent || ''} onChange={e => setFormData({ ...formData, rent: Number(e.target.value) })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Square Feet (Sq Ft)</label>
                <input required type="number" placeholder="1200" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4.5 focus:ring-4 focus:ring-urban-green/5 font-bold text-sm" value={formData.sqft || ''} onChange={e => setFormData({ ...formData, sqft: Number(e.target.value) })} />
              </div>
              {/* FIXED CATEGORY DROPDOWN */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Property Category / Type</label>
                <div className="relative">
                  <select 
                    required 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4.5 focus:ring-4 focus:ring-urban-green/5 font-bold text-sm appearance-none cursor-pointer" 
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Bachelors">Bachelor House</option>
                    <option value="Sublet">Sublet / Room</option>
                    <option value="House">Independent House</option>
                    <option value="Duplex">Duplex Villa</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">District/Area</label>
                <select required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4.5 focus:ring-4 focus:ring-urban-green/5 font-bold text-sm" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })}>
                  <option value="">Select Area</option>
                  <option value="Gulshan">Gulshan</option>
                  <option value="Banani">Banani</option>
                  <option value="Dhanmondi">Dhanmondi</option>
                  <option value="Uttara">Uttara</option>
                  <option value="Mirpur">Mirpur</option>
                  <option value="Bashundhara">Bashundhara R/A</option>
                  <option value="Baridhara">Baridhara</option>
                  <option value="Khilgaon">Khilgaon</option>
                  <option value="Mohammadpur">Mohammadpur</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Detailed Location</label>
                <input required type="text" placeholder="e.g. House 12, Road 4, Sector 7" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4.5 focus:ring-4 focus:ring-urban-green/5 font-bold text-sm" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Bedrooms', field: 'bedrooms' as const },
                { label: 'Bathrooms', field: 'bathrooms' as const },
                { label: 'Balconies', field: 'balconies' as const },
              ].map((item) => (
                <div key={item.field} className="space-y-3 text-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2 border border-gray-100">
                    <button type="button" onClick={() => adjustCount(item.field, -1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-urban-green transition active:scale-90"><i className="fas fa-minus text-[10px]"></i></button>
                    <span className="font-bold text-gray-800 text-base">{formData[item.field]}</span>
                    <button type="button" onClick={() => adjustCount(item.field, 1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-urban-green transition active:scale-90"><i className="fas fa-plus text-[10px]"></i></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                <button type="button" onClick={handleAiDescription} disabled={aiGenerating} className="text-[10px] font-bold uppercase text-urban-green bg-urban-green/10 px-4 py-2 rounded-xl hover:bg-urban-green/20 transition active:scale-95">
                   {aiGenerating ? <><i className="fas fa-spinner animate-spin mr-2"></i> Writing...</> : <>✨ AI Magic</>}
                </button>
              </div>
              <textarea rows={6} placeholder="Describe the atmosphere, security, and unique selling points..." className="w-full bg-gray-50 border-none rounded-[32px] px-8 py-8 focus:ring-4 focus:ring-urban-green/5 leading-relaxed text-sm font-medium" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Features & Amenities (Comma separated)</label>
              <input type="text" placeholder="Security 24/7, Lift, Generator, Gas, Garage" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4.5 focus:ring-4 focus:ring-urban-green/5 font-bold text-sm" value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} />
            </div>
          </section>

          <button type="submit" disabled={loading} className="w-full bg-urban-green text-white py-6 rounded-[24px] font-bold text-lg shadow-2xl shadow-urban-green/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 flex flex-col items-center justify-center gap-1 uppercase tracking-widest">
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin mb-1"></div>
                <span className="text-[10px] uppercase tracking-widest">{statusText}</span>
              </>
            ) : (
              <>
                <span>{editId ? 'Update Advertisement' : 'Publish Advertisement'}</span>
                <span className="text-[9px] opacity-40 font-medium">UrbanNest - Premium Listing</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;