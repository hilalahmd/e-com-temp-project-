import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useStore } from '../context/StoreContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { handleLogin } = useCustomerAuth();
  const { storeSlug, storeInfo } = useStore();
  const navigate = useNavigate();

  const themeColor = storeInfo?.theme?.primaryColor || '#000000';

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await handleLogin(email, password);
    setLoading(false);
    if (res.success) {
      toast.success('Successfully logged in!');
      navigate(`/?store=${storeSlug}`);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <button 
            onClick={() => navigate(`/?store=${storeSlug}`)}
            className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to store
          </button>
          
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mb-8">Log in to your account</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 outline-none transition-all"
                />
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 outline-none transition-all"
                />
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-70 mt-4"
              style={{ backgroundColor: themeColor }}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to={`/register?store=${storeSlug}`} className="font-semibold" style={{ color: themeColor }}>
              Register
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerLogin;
