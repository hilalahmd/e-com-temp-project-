import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Save, Loader, Copy, Image as ImageIcon } from 'lucide-react';
import ImageUpload from './ImageUpload';
const CATEGORIES = ['Apparel', 'Electronics', 'Goods', 'Clothing', 'Food', 'Sports', 'General Retail'];

export default function SettingsTab({ store }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    whatsappNumber: '',
    category: CATEGORIES[0],
    logoUrl: '',
    heroBgUrl: '',
    themeColor: '#000000'
  });

  useEffect(() => {
    if (store) {
      setFormData({
        storeName: store.storeName || '',
        whatsappNumber: store.whatsappNumber || '',
        category: store.category || CATEGORIES[0],
        logoUrl: store.logoUrl || '',
        heroBgUrl: store.heroBgUrl || '',
        themeColor: store.themeColor || '#000000'
      });
    }
  }, [store]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/tenant/store', formData);
      toast.success('Store settings updated successfully');
    } catch (err) {
      toast.error('Failed to update store settings');
    } finally {
      setLoading(false);
    }
  };

  const storeUrl = `http://localhost:3001?store=${store?.storeSlug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success('Store URL copied!');
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-blue-50 border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-black uppercase tracking-widest mb-2 text-sm text-gray-500">Your Live Store URL</h3>
        <div className="flex items-center gap-2">
          <input type="text" readOnly value={storeUrl} className="flex-1 bg-white border-2 border-black p-3 font-mono font-bold text-sm focus:outline-none" />
          <button onClick={copyUrl} className="p-3 bg-black text-white border-2 border-black hover:bg-gray-800 transition-colors" title="Copy URL">
            <Copy size={20} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-black uppercase tracking-widest mb-8 border-b-4 border-black pb-4">Store Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">Store Name *</label>
              <input type="text" required className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-1">WhatsApp Number *</label>
              <p className="text-xs font-bold text-gray-500 mb-2">Include country code, e.g. +923001234567</p>
              <input type="text" required className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black" value={formData.whatsappNumber} onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">Category</label>
              <select className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">Theme Color</label>
              <div className="flex items-center gap-4">
                <input type="color" className="w-16 h-16 border-4 border-black cursor-pointer p-1" value={formData.themeColor} onChange={(e) => setFormData({...formData, themeColor: e.target.value})} />
                <span className="font-mono font-bold uppercase">{formData.themeColor}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">Store Slug (Read-only)</label>
              <input type="text" readOnly className="w-full border-2 border-gray-300 bg-gray-100 p-3 font-mono font-bold text-gray-500 cursor-not-allowed" value={store?.storeSlug || ''} />
            </div>
          </div>
          
          <div className="space-y-6">
            <ImageUpload 
              value={formData.logoUrl} 
              onChange={(url) => setFormData({...formData, logoUrl: url})} 
              label="Store Logo" 
            />

            <ImageUpload 
              value={formData.heroBgUrl} 
              onChange={(url) => setFormData({...formData, heroBgUrl: url})} 
              label="Hero Background" 
            />
          </div>
        </div>

        <div className="mt-10 border-t-4 border-black pt-6 flex justify-end">
          <button type="submit" disabled={loading} className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] disabled:opacity-50">
            {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
