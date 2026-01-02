import React, { useState, useEffect } from 'react';
import { getListings } from '../supabase';
import ListingCard from '../components/ListingCard';
import { Listing } from '../types';

const Home: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getListings();
    setListings(data);
    setLoading(false);
  };

  const filteredListings = listings.filter(l => {
    const matchesSearch = 
      l.title?.toLowerCase().includes(search.toLowerCase()) || 
      l.location?.toLowerCase().includes(search.toLowerCase()) ||
      l.area?.toLowerCase().includes(search.toLowerCase());
    
    let matchesCategory = true;
    if (activeCategory === 'Budget') {
      matchesCategory = l.rent <= 15000;
    } else if (activeCategory === 'Verified') {
      matchesCategory = l.is_verified === true;
    } else if (activeCategory !== 'All') {
      matchesCategory = l.category === activeCategory;
    }

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { name: 'All', icon: 'fa-house' },
    { name: 'Apartment', icon: 'fa-building' },
    { name: 'Bachelors', icon: 'fa-user-graduate' },
    { name: 'Sublet', icon: 'fa-door-open' },
    { name: 'Budget', icon: 'fa-wallet' },
    { name: 'Verified', icon: 'fa-certificate' },
  ];

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <div className="bg-urban-green pt-10 pb-20 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10 space-y-4">
             <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">Find your next <br/><span className="text-white/60">perfect home</span></h1>
             <p className="text-white/50 text-sm md:text-base font-medium">Thousands of premium rentals in Dhaka, Chittagong & more.</p>
          </div>

          <div className="relative max-w-3xl mx-auto group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 text-white/30 group-focus-within:text-white transition-colors">
               <i className="fas fa-magnifying-glass text-xl"></i>
            </div>
            <input 
              type="text" 
              placeholder="Search by area, location or title..." 
              className="w-full h-18 md:h-20 bg-white/10 border-2 border-white/10 rounded-[30px] pl-16 pr-24 text-white placeholder-white/30 focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all text-lg shadow-2xl backdrop-blur-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="absolute right-2.5 top-1/2 -translate-y-1/2 w-13 h-13 md:w-15 md:h-15 bg-white text-urban-green rounded-[22px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl">
               <i className="fas fa-search text-lg md:text-xl"></i>
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Gulshan', 'Banani', 'Dhanmondi', 'Uttara', 'Mirpur'].map(loc => (
              <button 
                key={loc}
                onClick={() => setSearch(loc)}
                className="bg-white/10 hover:bg-white/20 text-white/70 text-xs font-bold px-4 py-2 rounded-full border border-white/10 transition"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Categories Toolbar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-[72px] z-40 overflow-x-auto no-scrollbar py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between md:justify-around px-6 gap-6 md:gap-4 min-w-max">
          {categories.map((cat, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveCategory(cat.name)}
              className={`flex flex-col md:flex-row items-center gap-2 font-bold transition text-xs md:text-sm group ${activeCategory === cat.name ? 'text-urban-green' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`w-10 h-10 md:w-8 md:h-8 rounded-xl flex items-center justify-center transition-colors ${activeCategory === cat.name ? 'bg-urban-green text-white shadow-lg' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                <i className={`fas ${cat.icon}`}></i>
              </div>
              <span className="hidden sm:inline">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24">
        <section className="mb-20">
          <div className="flex items-end justify-between mb-12 px-4">
            <div className="space-y-2">
              <span className="text-urban-green text-[10px] font-black uppercase tracking-[0.3em]">
                {activeCategory !== 'All' ? `${activeCategory} Listings` : 'Featured Collection'}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                {activeCategory === 'Budget' ? 'Best Values under ৳15k' : 'Rentals Near You'}
              </h2>
            </div>
            {activeCategory !== 'All' && (
              <button onClick={() => setActiveCategory('All')} className="text-[10px] font-black text-gray-400 hover:text-urban-green uppercase tracking-widest bg-gray-100 px-4 py-2 rounded-xl transition">
                Reset
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-gray-50 rounded-[40px] animate-pulse"></div>)}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
              {filteredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-gray-50 rounded-[50px] border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                 <i className="fas fa-house-chimney-crack text-3xl text-gray-200"></i>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">No matching homes found</h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-10 text-sm font-medium">Try adjusting your search criteria or explore other areas in the city.</p>
              <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="bg-urban-green text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-urban-green/20">Clear Search</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;