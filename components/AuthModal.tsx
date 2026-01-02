import React, { useState } from 'react';
import { supabase, createProfile } from '../supabase';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'renter' | 'owner'>('renter');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        if (!fullName.trim()) throw new Error("Please enter your full name.");
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: role }
          }
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          await createProfile({
            id: signUpData.user.id,
            email: email,
            full_name: fullName,
            role: role,
            created_at: new Date().toISOString()
          });
        }
        
        alert("Success! Please sign in with your new account.");
        setIsLogin(true);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 py-12 md:py-24">
      <div className="fixed inset-0 z-0" onClick={onClose}></div>
      
      <div className="bg-white rounded-[40px] w-full max-w-5xl relative z-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row min-h-[600px]">
        <div className="hidden md:block w-1/2 relative">
          <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-urban-green/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 p-12 flex flex-col justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-urban-green shadow-lg"><i className="fas fa-house-chimney"></i></div>
              <span className="text-xl font-semibold tracking-tight">UrbanNest</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-semibold leading-tight tracking-tight">Find your sanctuary <br/> in the heart of Dhaka.</h2>
              <p className="text-white/80 font-medium">Join thousands of verified renters and owners across Bangladesh.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-[10px] font-semibold uppercase tracking-widest">Premium Search</div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-[10px] font-semibold uppercase tracking-widest">Secure Chat</div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white flex flex-col p-8 md:p-16">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
            <p className="text-gray-400 font-medium">{isLogin ? 'Please enter your details to sign in.' : 'Fill in the details to get started.'}</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 text-xs font-semibold rounded-2xl border border-red-100 flex items-center gap-3">
              <i className="fas fa-circle-exclamation text-lg"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 flex-1">
            {!isLogin && (
              <>
                <div className="space-y-3 mb-6">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">Account Type</label>
                  <div className="flex bg-gray-50 p-1.5 rounded-2xl">
                    <button type="button" onClick={() => setRole('renter')} className={`flex-1 py-3 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all ${role === 'renter' ? 'bg-white shadow-md text-urban-green' : 'text-gray-400'}`}>Renter</button>
                    <button type="button" onClick={() => setRole('owner')} className={`flex-1 py-3 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all ${role === 'owner' ? 'bg-white shadow-md text-urban-green' : 'text-gray-400'}`}>House Owner</button>
                  </div>
                </div>
                <div className="relative group">
                  <i className="fas fa-user absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  <input required type="text" placeholder="Full Name" className="w-full bg-gray-50 border-2 border-transparent rounded-[20px] pl-14 pr-6 py-4 focus:outline-none focus:bg-white focus:border-urban-green/20 font-medium transition-all" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
              </>
            )}

            <div className="relative group">
              <i className="fas fa-envelope absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"></i>
              <input required type="email" placeholder="Email Address" className="w-full bg-gray-50 border-2 border-transparent rounded-[20px] pl-14 pr-6 py-4 focus:outline-none focus:bg-white focus:border-urban-green/20 font-medium transition-all" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="relative group">
              <i className="fas fa-lock absolute left-6 top-1/2 -translate-y-1/2 text-gray-300"></i>
              <input required type="password" placeholder="Password" className="w-full bg-gray-50 border-2 border-transparent rounded-[20px] pl-14 pr-6 py-4 focus:outline-none focus:bg-white focus:border-urban-green/20 font-medium transition-all" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-urban-green text-white py-5 rounded-[22px] font-semibold text-lg shadow-xl shadow-urban-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4 uppercase tracking-widest">
               {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-auto pt-10 text-center md:text-left">
            <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-xs font-semibold text-gray-400 hover:text-urban-green transition-colors">
              {isLogin ? <>New to UrbanNest? <span className="text-urban-green underline font-semibold">Create Account</span></> : <>Already have an account? <span className="text-urban-green underline font-semibold">Sign In</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;