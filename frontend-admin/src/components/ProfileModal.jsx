import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { X, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ onClose }) {
  const { user } = useAuth();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      await api.put('/auth/profile', profileData);
      toast.success('Profile updated successfully. Please login again to see changes if email was updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (pwdData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    try {
      setPwdLoading(true);
      await api.put('/auth/password', { 
        currentPassword: pwdData.currentPassword, 
        newPassword: pwdData.newPassword 
      });
      toast.success('Password changed successfully');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border-4 border-black w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b-4 border-black bg-purple-100">
          <h2 className="text-xl font-black uppercase tracking-widest">Account Profile</h2>
          <button onClick={onClose} className="hover:bg-black hover:text-white p-1 border-2 border-transparent hover:border-black transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-8">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <h3 className="font-black uppercase tracking-widest border-b-2 border-black pb-2">Profile Information</h3>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Name</label>
              <input type="text" required className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Email</label>
              <input type="email" required className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} />
            </div>
            <button type="submit" disabled={profileLoading} className="w-full py-3 bg-black text-white font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors flex justify-center items-center gap-2 border-2 border-black">
              {profileLoading && <Loader size={18} className="animate-spin" />} Save Profile
            </button>
          </form>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <h3 className="font-black uppercase tracking-widest border-b-2 border-black pb-2">Change Password</h3>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Current Password</label>
              <input type="password" required className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black" value={pwdData.currentPassword} onChange={(e) => setPwdData({...pwdData, currentPassword: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">New Password</label>
              <input type="password" required className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black" value={pwdData.newPassword} onChange={(e) => setPwdData({...pwdData, newPassword: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Confirm New Password</label>
              <input type="password" required className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black" value={pwdData.confirmPassword} onChange={(e) => setPwdData({...pwdData, confirmPassword: e.target.value})} />
            </div>
            <button type="submit" disabled={pwdLoading} className="w-full py-3 bg-yellow-400 text-black font-black uppercase tracking-widest hover:bg-yellow-500 disabled:opacity-50 transition-colors flex justify-center items-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {pwdLoading && <Loader size={18} className="animate-spin" />} Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
