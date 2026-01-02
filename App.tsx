import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ListingDetails from './pages/ListingDetails';
import CreateListing from './pages/CreateListing';
import OwnerDashboard from './pages/OwnerDashboard';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import AuthModal from './components/AuthModal';
import { UserProfile } from './types';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchProfile(session.user.id);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data && !error) setUser(data as UserProfile);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen relative">
        <Navbar user={user} onLogout={handleLogout} onOpenAuth={() => setShowAuth(true)} />
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
            <Route path="/create" element={<CreateListing user={user} />} />
            <Route path="/edit/:id" element={<CreateListing user={user} />} />
            <Route path="/dashboard" element={<OwnerDashboard user={user} />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>

        <Footer />

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    </Router>
  );
};

export default App;