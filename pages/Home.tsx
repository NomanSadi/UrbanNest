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
  ];

  return (
    <div className="min-h-screen">
      {/* Restored Hero Section with Premium Sizing */}
      <div className="bg-urban-green pt-20 pb-32 px-6 md:px-12 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full -mr-64 -mt-64 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-16 space-y-4">
             <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                Find your next home <br/>
                <span className="text-white/30 italic font-medium">with UrbanNest.</span>
             </h1>
             <p className="text-white/60 text-base md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
               Discover premium house rentals in Dhaka, Chittagong, and across Bangladesh.
             </p>
          </div>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute left-7 top-1/2 -translate-y-1/2 flex items-center gap-3 text-white/30 group-focus-within:text-white transition-colors">
               <i className="fas fa-location-dot"></i>
            </div>
            <input 
              type="text" 
              placeholder="Search by area or property name..." 
              className="w-full h-16 md:h-20 bg-white/10 border border-white/10 rounded-2xl pl-14 pr-20 text-white placeholder-white/30 focus:outline-none focus:bg-white/15 focus:border-white/20 transition-all text-base font-medium shadow-2xl backdrop-blur-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white text-urban-green rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              aria-label="Search"
            >
               <i className="fas fa-magnifying-glass"></i>
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-10">
            {['Gulshan', 'Banani', 'Dhanmondi', 'Uttara', 'Mirpur'].map(loc => (
              <button 
                key={loc}
                onClick={() => setSearch(loc)}
                className="bg-white/5 hover:bg-white/15 text-white/50 hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border border-white/5 transition-all"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Categories Toolbar */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[72px] z-40 overflow-x-auto no-scrollbar py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between md:justify-around px-6 gap-8 min-w-max">
          {categories.map((cat, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveCategory(cat.name)}
              className={`flex flex-col md:flex-row items-center gap-3 transition group ${activeCategory === cat.name ? 'text-urban-green' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${activeCategory === cat.name ? 'bg-urban-green text-white shadow-md' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                <i className={`fas ${cat.icon} text-sm`}></i>
              </div>
              <span className="hidden sm:inline font-bold uppercase tracking-widest text-[10px]">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-1">
              <span className="text-urban-green text-[10px] font-bold uppercase tracking-[0.3em] block">
                {activeCategory !== 'All' ? activeCategory : 'Featured Collection'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-none">
                {activeCategory === 'Budget' ? 'Best Values' : 'Premium Rentals'}
              </h2>
            </div>
            {activeCategory !== 'All' && (
              <button onClick={() => setActiveCategory('All')} className="text-[10px] font-bold text-gray-400 hover:text-urban-green uppercase tracking-widest bg-gray-50 px-6 py-3 rounded-xl transition-all self-start md:self-auto border border-gray-100">
                Reset Filters
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map(i => <div key={i} className="h-[450px] bg-gray-50 rounded-3xl animate-pulse"></div>)}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                 <i className="fas fa-house-chimney-crack text-3xl text-gray-200"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching homes</h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-10 text-base font-medium">Try adjusting your filters or search in a different area.</p>
              <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="bg-urban-green text-white px-10 py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-urban-green/20">Clear All Filters</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;