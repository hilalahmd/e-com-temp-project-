import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { X, Image as ImageIcon, Loader } from 'lucide-react';
import ImageUpload from './ImageUpload';
const CATEGORIES = ['Clothing', 'Electronics', 'Accessories', 'Footwear', 'Food & Beverages', 'Home & Living', 'Sports', 'Books', 'Other'];

export default function EditProductModal({ product, onClose, onProductUpdated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || '',
    category: product?.category || CATEGORIES[0],
    imageUrl: product?.imageUrl || '',
    isBestSeller: product?.isBestSeller || false,
    isActive: product?.isActive !== false // default true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      return toast.error('Please fill required fields');
    }
    try {
      setLoading(true);
      await api.put(`/products/${product._id}`, formData);
      toast.success('Product updated successfully!');
      onProductUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border-4 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center p-6 border-b-4 border-black bg-blue-100">
          <h2 className="text-xl font-black uppercase tracking-widest">Edit Product</h2>
          <button onClick={onClose} className="hover:bg-black hover:text-white p-1 border-2 border-transparent hover:border-black transition-colors"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Name *</label>
                <input type="text" required className="w-full border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Price ($) *</label>
                <input type="number" required min="0" step="0.01" className="w-full border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Stock *</label>
                <input type="number" required min="0" className="w-full border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Category</label>
                <select className="w-full border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">Description</label>
                <textarea rows="4" className="w-full border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <ImageUpload 
                value={formData.imageUrl} 
                onChange={(url) => setFormData({...formData, imageUrl: url})} 
                label="Product Image" 
              />
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="editIsBestSeller" className="w-6 h-6 border-2 border-black accent-black" checked={formData.isBestSeller} onChange={(e) => setFormData({...formData, isBestSeller: e.target.checked})} />
                  <label htmlFor="editIsBestSeller" className="text-sm font-bold uppercase tracking-widest">Mark as Best Seller</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="editIsActive" className="w-6 h-6 border-2 border-black accent-black" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                  <label htmlFor="editIsActive" className="text-sm font-bold uppercase tracking-widest">Product Active</label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-6 border-t-2 border-black">
            <button type="button" onClick={onClose} className="px-6 py-3 border-2 border-black font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed">
              {loading && <Loader className="animate-spin" size={18} />}
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
