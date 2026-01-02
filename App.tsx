import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ListingDetails from './pages/ListingDetails';
import CreateListing from './pages/CreateListing';
import OwnerDashboard from './pages/OwnerDashboard';
import Chat from './pages/Chat';
import Profile from './pages/Profile'; // New import
import AuthModal from './components/AuthModal';
import { UserProfile } from './types';
import { getSmartAssistance } from './services/gemini';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiChat, setAiChat] = useState<{role: 'user' | 'bot', text: string}[]>([
    {role: 'bot', text: 'Hello! I am UrbanNest Assistant. How can I help you find your dream home today?'}
  ]);

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

  const sendAiMessage = async () => {
    if (!aiMessage.trim()) return;
    const userMsg = aiMessage;
    setAiChat(prev => [...prev, {role: 'user', text: userMsg}]);
    setAiMessage('');
    const botResponse = await getSmartAssistance(userMsg);
    setAiChat(prev => [...prev, {role: 'bot', text: botResponse}]);
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

        <div className="fixed bottom-8 right-8 z-[60]">
          {isAiOpen ? (
            <div className="bg-white rounded-3xl shadow-2xl w-80 md:w-96 overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4">
              <div className="bg-urban-green p-4 flex justify-between items-center text-white font-bold">✨ Assistant <button onClick={() => setIsAiOpen(false)}>✕</button></div>
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                 {aiChat.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-sm ${msg.role === 'user' ? 'bg-urban-green text-white' : 'bg-white text-gray-800'}`}>{msg.text}</div>
                   </div>
                 ))}
              </div>
              <div className="p-4 border-t flex gap-2">
                 <input type="text" placeholder="Ask anything..." className="flex-1 text-sm bg-gray-50 rounded-xl px-4 py-3" value={aiMessage} onChange={e => setAiMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendAiMessage()} />
                 <button onClick={sendAiMessage} className="bg-urban-green text-white w-10 h-10 rounded-xl flex items-center justify-center"><i className="fas fa-paper-plane text-xs"></i></button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAiOpen(true)} className="bg-urban-green text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-all">✨</button>
          )}
        </div>

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    </Router>
  );
};

export default App;