import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase, sendMessage, getMessagesForConversation, getMyConversations, getProfile } from '../supabase';

const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const listingId = searchParams.get('listingId');
  const ownerId = searchParams.get('ownerId');
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert("Please login to chat.");
        navigate('/');
        return;
      }
      setCurrentUser(session.user);
      fetchConversations(session.user.id);
    });

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (currentUser && listingId && ownerId) {
      fetchMessages(currentUser.id, ownerId, listingId);
      fetchOtherUserProfile(ownerId);
    }
  }, [currentUser, listingId, ownerId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const fetchOtherUserProfile = async (id: string) => {
    const profile = await getProfile(id);
    setOtherUser(profile);
  };

  const fetchConversations = async (userId: string) => {
    try {
      const data = await getMyConversations(userId);
      setConversations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string, otherId: string, lId: string) => {
    try {
      const data = await getMessagesForConversation(userId, otherId, lId);
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !currentUser || !ownerId || !listingId) return;
    try {
      await sendMessage(currentUser.id, ownerId, listingId, messageText);
      setMessageText('');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="h-[calc(100vh-72px)] bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col ${ownerId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-gray-50">
           <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
           {conversations.length > 0 ? conversations.map((convo, idx) => (
             <div 
                key={idx}
                onClick={() => navigate(`/chat?listingId=${convo.listing_id}&ownerId=${convo.sender_id === currentUser.id ? convo.receiver_id : convo.sender_id}`)}
                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${listingId === convo.listing_id ? 'bg-gray-50 border-urban-green' : 'border-transparent'}`}
             >
                <div className="w-12 h-12 rounded-xl bg-urban-green/10 flex items-center justify-center font-bold text-urban-green overflow-hidden">
                  {convo.profiles?.avatar_url ? <img src={convo.profiles.avatar_url} className="w-full h-full object-cover" /> : convo.profiles?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                   <div className="font-bold text-gray-900 truncate">{convo.profiles?.full_name || 'Anonymous'}</div>
                   <div className="text-xs text-gray-400 truncate">{convo.listings?.title}</div>
                </div>
             </div>
           )) : (
             <div className="p-10 text-center text-gray-400 text-sm">No chats yet</div>
           )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#F3F7F5] ${!ownerId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {ownerId ? (
          <>
            <div className="bg-white p-4 md:p-6 border-b border-gray-100 flex items-center gap-4 shadow-sm z-10">
               <button onClick={() => navigate('/chat')} className="md:hidden text-gray-400 mr-2"><i className="fas fa-chevron-left text-xl"></i></button>
               <div className="w-10 h-10 rounded-xl bg-urban-green/10 flex items-center justify-center font-bold text-urban-green overflow-hidden">
                 {otherUser?.avatar_url ? <img src={otherUser.avatar_url} className="w-full h-full object-cover" /> : 'O'}
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">{otherUser?.full_name || 'User'}</h3>
                 <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Chat</span>
               </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 no-scrollbar">
               {messages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm text-sm ${msg.sender_id === currentUser?.id ? 'bg-urban-green text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                       {msg.content}
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-4 md:p-8 bg-white border-t border-gray-100">
               <div className="flex gap-3 items-center max-w-4xl mx-auto">
                  <input 
                    type="text" 
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-urban-green/20"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                  />
                  <button onClick={handleSend} className="bg-urban-green text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition">
                    <i className="fas fa-paper-plane"></i>
                  </button>
               </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i className="fas fa-comments text-3xl text-urban-green/20"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Your Conversations</h3>
            <p className="text-gray-400 max-w-xs mx-auto mt-2">Select a chat from the sidebar to start talking with owners.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;