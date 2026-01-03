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
           <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-8">
             <i className="fas fa-user-lock"></i>
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Owner Access Only</h2>
           <p className="text-gray-400 font-medium mb-10 leading-relaxed text-sm">Only verified property owners can publish advertisements on UrbanNest.</p>
           <button onClick={() => navigate('/')} className="w-full bg-urban-green text-white px-8 py-4.5 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-urban-green/20 transition-all text-xs">Return Home</button>
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
    
    if (!formData.category || formData.category === "") {
       alert("Property Category is required. Please select one.");
       return;
    }
    
    setLoading(true);
    setStatusText('Syncing data...');
    
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
      if (err.message.includes('category') || err.message.includes('column') || err.message.includes('404')) {
         alert("DATABASE FIX REQUIRED:\nYou must add the 'category' column to your Supabase 'listings' table.\n\nInstructions:\n1. Go to Supabase SQL Editor.\n2. Run: ALTER TABLE listings ADD COLUMN category text DEFAULT 'Apartment';");
      } else {
         alert(err.message || "An error occurred while saving. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-50/80 border-none rounded-[24px] px-8 py-5.5 focus:ring-8 focus:ring-urban-green/5 font-bold text-lg transition-all placeholder:text-gray-200";
  const labelClass = "text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] block ml-3 mb-1.5";

  return (
    <div className="min-h-screen bg-[#F9FBFA] py-12 md:py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-[48px] p-8 md:p-16 shadow-sm border border-gray-100">
        <header className="mb-16 space-y-3">
          <span className="text-urban-green text-[12px] font-bold uppercase tracking-[0.4em] block mb-2">UrbanNest Publisher</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            {editId ? 'Refine Your Ad' : 'List Your Property'}
          </h1>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-20">
          {/* Media Section */}
          <section className="space-y-8">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-300">Property Media</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {imagePreviews.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-[32px] overflow-hidden group border border-gray-100 shadow-sm ring-8 ring-transparent hover:ring-urban-green/5 transition-all">
                  <img src={img} className="w-full h-full object-cover" alt="Preview" />
                  
                  {/* THUMBNAIL INDICATOR */}
                  {idx === 0 && (
                    <div className="absolute top-3 left-3 bg-urban-green text-white text-[8px] font-bold px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-[0.15em] z-10 border border-white/10">
                      Thumbnail
                    </div>
                  )}

                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center shadow-lg hover:scale-110 active:scale-90">
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[32px] border-3 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 hover:border-urban-green/30 hover:bg-urban-green/5 transition-all bg-gray-50/50 group">
                <i className="fas fa-plus text-2xl text-gray-200 group-hover:text-urban-green transition-colors"></i>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center group-hover:text-urban-green transition-colors">Add Photo</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageChange} />
          </section>

          {/* Details Section */}
          <section className="space-y-12">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-300">Listing Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <label className={labelClass}>Property Title</label>
                <input required type="text" placeholder="e.g. Modern Lakeview Suite" className={inputClass} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-6">
                <label className={labelClass}>Monthly Rent (৳)</label>
                <input required type="number" placeholder="45,000" className={`${inputClass} text-urban-green`} value={formData.rent || ''} onChange={e => setFormData({ ...formData, rent: Number(e.target.value) })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <label className={labelClass}>Living Space (Sq Ft)</label>
                <input required type="number" placeholder="1200" className={inputClass} value={formData.sqft || ''} onChange={e => setFormData({ ...formData, sqft: Number(e.target.value) })} />
              </div>
              <div className="space-y-6">
                <label className={labelClass}>Property Type</label>
                <div className="relative">
                  <select 
                    required 
                    className={`${inputClass} appearance-none cursor-pointer`} 
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Bachelors">Bachelor House</option>
                    <option value="Sublet">Sublet / Room</option>
                    <option value="House">Independent House</option>
                    <option value="Duplex">Duplex Villa</option>
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <i className="fas fa-chevron-down text-sm"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <label className={labelClass}>Area / Neighborhood</label>
                <select required className={`${inputClass} cursor-pointer`} value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })}>
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
              <div className="space-y-6">
                <label className={labelClass}>Specific Address</label>
                <input required type="text" placeholder="e.g. House 12, Road 4, Sector 7" className={inputClass} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {[
                { label: 'Bedrooms', field: 'bedrooms' as const },
                { label: 'Bathrooms', field: 'bathrooms' as const },
                { label: 'Balconies', field: 'balconies' as const },
              ].map((item) => (
                <div key={item.field} className="space-y-6">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center block">{item.label}</label>
                  <div className="flex items-center justify-between bg-gray-50/80 rounded-[24px] p-2 border border-gray-100 shadow-sm">
                    <button type="button" onClick={() => adjustCount(item.field, -1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-urban-green transition active:scale-90"><i className="fas fa-minus text-[10px]"></i></button>
                    <span className="font-bold text-gray-800 text-lg">{formData[item.field]}</span>
                    <button type="button" onClick={() => adjustCount(item.field, 1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-urban-green transition active:scale-90"><i className="fas fa-plus text-[10px]"></i></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <label className={labelClass}>Property Narrative</label>
                <button type="button" onClick={handleAiDescription} disabled={aiGenerating} className="text-[10px] font-bold uppercase text-urban-green bg-urban-green/10 px-6 py-3 rounded-xl hover:bg-urban-green/20 transition active:scale-95 flex items-center gap-2 tracking-widest">
                   {aiGenerating ? <><i className="fas fa-spinner animate-spin text-[10px]"></i> Writing...</> : <>✨ AI Writer</>}
                </button>
              </div>
              <textarea rows={6} placeholder="Describe the ambiance, local benefits, and unique details..." className="w-full bg-gray-50/80 border-none rounded-[32px] px-10 py-8 focus:ring-8 focus:ring-urban-green/5 leading-relaxed text-lg font-medium" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            
            <div className="space-y-6">
              <label className={labelClass}>Top Amenities (Comma separated)</label>
              <input type="text" placeholder="e.g. 24/7 Lift, Generator, Security, Rooftop Access" className={inputClass} value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} />
            </div>
          </section>

          <button type="submit" disabled={loading} className="w-full bg-urban-green text-white py-7 rounded-[28px] font-bold text-xl shadow-2xl shadow-urban-green/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 flex flex-col items-center justify-center gap-2 uppercase tracking-[0.3em]">
            {loading ? (
              <>
                <div className="w-7 h-7 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span className="text-[11px] font-bold uppercase tracking-widest">{statusText}</span>
              </>
            ) : (
              <>
                <span>{editId ? 'Save Changes' : 'Post Ad Now'}</span>
                <span className="text-[10px] opacity-40 font-bold tracking-widest">Premium Marketplace</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;