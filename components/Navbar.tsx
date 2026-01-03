import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onOpenAuth: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onOpenAuth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-urban-green text-white py-5 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-urban-green shadow-lg transform group-hover:rotate-6 transition-transform">
          <i className="fas fa-house-chimney text-xl"></i>
        </div>
        <span className="text-2xl font-semibold tracking-tight">UrbanNest</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-tight">
        {user && (
          <>
            <Link to="/chat" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition">
              <i className="fas fa-comment-dots text-xs"></i> Chat
            </Link>
            <Link to="/profile" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition">
              <i className="fas fa-user text-xs"></i> Profile
            </Link>
            {user.role === 'owner' && (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition">
                  <i className="fas fa-table-columns text-xs"></i> My Ads
                </Link>
                <Link to="/create" className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl transition flex items-center gap-2 border border-white/20">
                  <i className="fas fa-plus text-[10px]"></i> Create Ad
                </Link>
              </>
            )}
          </>
        )}
        
        {!user ? (
          <button onClick={onOpenAuth} className="flex items-center gap-3 bg-white text-urban-green px-6 py-2.5 rounded-xl hover:bg-gray-50 transition shadow-sm font-bold uppercase tracking-widest text-[11px]">
            <i className="fas fa-right-to-bracket text-[12px]"></i> Login
          </button>
        ) : (
          <div className="flex items-center gap-5">
             <button onClick={onLogout} className="opacity-60 hover:opacity-100 transition font-bold uppercase tracking-widest text-[10px]">Logout</button>
             <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 flex items-center justify-center bg-white/10">
               {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="Profile" /> : <span className="font-bold text-xs">{user.full_name?.charAt(0)}</span>}
             </div>
          </div>
        )}
      </div>

      <button className="md:hidden text-2xl p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars-staggered'}`}></i>
      </button>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white text-gray-800 p-8 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <span className="font-bold text-xl text-urban-green tracking-tight">UrbanNest</span>
              <button onClick={() => setIsMenuOpen(false)} className="text-gray-400"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <div className="flex flex-col gap-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 text-gray-900 font-bold text-sm">
                <i className="fas fa-home text-urban-green"></i> Home
              </Link>
              
              {user ? (
                <>
                  <Link to="/chat" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 text-gray-900 font-bold text-sm">
                    <i className="fas fa-comment-dots text-urban-green"></i> Chat
                  </Link>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 text-gray-900 font-bold text-sm">
                    <i className="fas fa-user text-urban-green"></i> Profile
                  </Link>
                  {user.role === 'owner' && (
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 text-gray-900 font-bold text-sm">
                      <i className="fas fa-table-columns text-urban-green"></i> My Ads
                    </Link>
                  )}
                  <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="flex items-center gap-4 p-5 rounded-2xl text-red-500 bg-red-50 font-bold text-sm text-left w-full mt-4">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { onOpenAuth(); setIsMenuOpen(false); }} 
                  className="flex items-center gap-4 p-6 rounded-3xl bg-urban-green text-white shadow-lg shadow-urban-green/20 mt-4"
                >
                  <i className="fas fa-user-circle text-xl"></i>
                  <span className="font-bold uppercase tracking-widest text-xs">Login / Sign Up</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;