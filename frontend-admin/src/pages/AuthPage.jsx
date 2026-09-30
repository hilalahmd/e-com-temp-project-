import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email: authForm.email, password: authForm.password } : authForm;
      const res = await api.post(endpoint, payload);
      
      login(res.data.token, res.data.user);
      toast.success(isLogin ? 'Logged in successfully!' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 font-sans text-black">
      <div className="p-10 max-w-md w-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-4xl font-black text-center mb-2 uppercase tracking-tighter">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <p className="text-center text-gray-800 mb-10 font-bold uppercase tracking-widest text-xs">
          {isLogin ? 'Access your dashboard' : 'Start your journey'}
        </p>
        
        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" required className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 font-bold" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
            </div>
          )}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" required className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 font-bold" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2">Password</label>
            <input type="password" required minLength="6" className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 font-bold" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
          </div>
          <button type="submit" className="w-full flex justify-center py-4 bg-black text-white font-black uppercase tracking-widest border-2 border-black hover:bg-white hover:text-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <p className="text-center text-sm font-black mt-8 uppercase">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="underline underline-offset-4 cursor-pointer hover:bg-black hover:text-white px-1" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}
