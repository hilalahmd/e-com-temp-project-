import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Loader } from 'lucide-react';

export default function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      setCoupons(res.data || []);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest">Coupons</h2>
          <p className="text-sm font-bold text-gray-500 mt-1">Manage discount codes</p>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null);
            setIsModalOpen(true);
          }}
          className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-gray-800 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all"
        >
          <Plus size={20} />
          Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-black" size={48} />
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black uppercase tracking-widest mb-2">No coupons found</h3>
          <p className="text-gray-500 font-bold mb-6">Create your first discount code to boost sales!</p>
          <button
            onClick={() => {
              setEditingCoupon(null);
              setIsModalOpen(true);
            }}
            className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-gray-800 inline-flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          >
            <Plus size={20} />
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="bg-white border-4 border-black overflow-x-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100 border-b-4 border-black">
                <th className="p-4 font-black uppercase tracking-widest text-sm">Code</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm">Type</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm">Value</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm">Min Order</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm">Max Uses</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm">Used</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm">Expires</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm">Status</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b-2 border-black last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold font-mono">{coupon.code}</td>
                  <td className="p-4 font-bold capitalize">{coupon.type}</td>
                  <td className="p-4 font-bold">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                  </td>
                  <td className="p-4 font-bold">{coupon.minOrderAmount ? `$${coupon.minOrderAmount}` : '-'}</td>
                  <td className="p-4 font-bold">{coupon.maxUses || 'Unlimited'}</td>
                  <td className="p-4 font-bold">{coupon.usedCount || 0}</td>
                  <td className="p-4 font-bold">
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest border-2 border-black ${coupon.isActive ? 'bg-green-400' : 'bg-red-400'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setIsModalOpen(true);
                        }}
                        className="p-2 border-2 border-black hover:bg-blue-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(coupon._id)}
                        className="p-2 border-2 border-black hover:bg-red-100 transition-colors text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <CouponModal
          coupon={editingCoupon}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCoupons();
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white border-4 border-black p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black uppercase tracking-widest mb-4">Delete Coupon?</h3>
            <p className="font-bold text-gray-600 mb-8">This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border-2 border-black font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-red-500 text-white font-bold uppercase tracking-widest border-2 border-black hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CouponModal({ coupon, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    type: coupon?.type || 'percentage',
    value: coupon?.value || '',
    minOrderAmount: coupon?.minOrderAmount || '',
    maxUses: coupon?.maxUses || '',
    expiryDate: coupon?.expiryDate ? new Date(coupon?.expiryDate).toISOString().split('T')[0] : '',
    isActive: coupon ? coupon.isActive : true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        value: Number(formData.value),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
        maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
        expiryDate: formData.expiryDate || undefined
      };

      if (coupon) {
        await api.put(`/coupons/${coupon._id}`, payload);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/coupons', payload);
        toast.success('Coupon created successfully');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border-4 border-black w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center p-6 border-b-4 border-black bg-purple-100">
          <h2 className="text-xl font-black uppercase tracking-widest">{coupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <button onClick={onClose} className="hover:bg-black hover:text-white p-1 border-2 border-transparent hover:border-black transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-2">Code *</label>
            <input
              type="text"
              required
              className="w-full border-2 border-black p-3 font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-black"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SUMMER20"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">Type</label>
              <select
                className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">Value *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">Min Order ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-2">Max Uses</label>
              <input
                type="number"
                min="1"
                className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-2">Expiry Date</label>
            <input
              type="date"
              className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isActive"
              className="w-6 h-6 border-2 border-black accent-black"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm font-bold uppercase tracking-widest cursor-pointer">
              Coupon is Active
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-black font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader className="animate-spin" size={18} />}
              {coupon ? 'Update Coupon' : 'Save Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
