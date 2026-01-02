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
    <nav className="bg-urban-green text-white py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-urban-green shadow-lg transform group-hover:scale-110 transition-transform">
          <i className="fas fa-house-chimney text-xl"></i>
        </div>
        <span className="text-2xl font-black tracking-tighter">UrbanNest</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
        {user && (
          <>
            <Link to="/chat" className="flex items-center gap-2 hover:text-white/80 transition">
              <i className="fas fa-comment-dots"></i> Chat
            </Link>
            <Link to="/profile" className="flex items-center gap-2 hover:text-white/80 transition">
              <i className="fas fa-user"></i> Profile
            </Link>
            {user.role === 'owner' && (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 hover:text-white/80 transition">
                  <i className="fas fa-table-columns"></i> My Ads
                </Link>
                <Link to="/create" className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl transition flex items-center gap-2 border border-white/20">
                  <i className="fas fa-plus"></i> Create Ad
                </Link>
              </>
            )}
          </>
        )}
        
        {!user ? (
          <button onClick={onOpenAuth} className="flex items-center gap-2 bg-white text-urban-green px-6 py-2.5 rounded-xl hover:bg-gray-100 transition shadow-sm">
            <i className="fas fa-user-circle"></i> Login
          </button>
        ) : (
          <div className="flex items-center gap-4">
             <button onClick={onLogout} className="text-white/70 hover:text-white transition">Logout</button>
             <div className="w-9 h-9 rounded-full overflow-hidden border border-white/30 flex items-center justify-center bg-white/20">
               {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <span className="font-bold">{user.full_name?.charAt(0)}</span>}
             </div>
          </div>
        )}
      </div>

      <button className="md:hidden text-2xl p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars-staggered'}`}></i>
      </button>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white text-gray-800 p-8 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <span className="font-bold text-xl text-urban-green">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="text-gray-400"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <div className="flex flex-col gap-6 font-semibold">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
                <i className="fas fa-home text-urban-green"></i> Home
              </Link>
              {user && (
                <>
                  <Link to="/chat" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
                    <i className="fas fa-comment-dots text-urban-green"></i> Chat
                  </Link>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
                    <i className="fas fa-user text-urban-green"></i> Profile
                  </Link>
                  {user.role === 'owner' && (
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
                      <i className="fas fa-table-columns text-urban-green"></i> My Ads
                    </Link>
                  )}
                  <button onClick={onLogout} className="flex items-center gap-4 p-4 rounded-2xl text-red-500 bg-red-50">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;