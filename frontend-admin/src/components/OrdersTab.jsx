import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, Loader, ShoppingBag } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';
import Pagination from './Pagination';

const STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  'Pending': 'bg-yellow-300 text-black',
  'Processing': 'bg-blue-300 text-black',
  'Shipped': 'bg-purple-300 text-black',
  'Delivered': 'bg-green-300 text-black',
  'Cancelled': 'bg-red-500 text-white'
};

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders?page=${page}&limit=10${statusFilter !== 'All' ? `&status=${statusFilter}` : ''}&search=${search}`);
      setOrders(res.data.orders || []);
      setPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, search]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 font-bold uppercase tracking-widest border-2 border-black transition-all ${
                statusFilter === s 
                  ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]' 
                  : 'bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full xl:w-80">
          <input 
            type="text" 
            placeholder="Search by customer/phone..." 
            className="w-full border-4 border-black p-3 pl-12 font-bold focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div>
      </div>

      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-4 border-black text-sm uppercase font-black tracking-widest">
              <th className="p-4">Order#</th>
              <th className="p-4">Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center"><Loader className="animate-spin mx-auto" size={32} /></td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold uppercase tracking-widest">No orders found</p>
                </td>
              </tr>
            ) : (
              orders.map(o => (
                <tr key={o._id} className="border-b-2 border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                  <td className="p-4 font-bold font-mono text-sm">{o._id.slice(-8).toUpperCase()}</td>
                  <td className="p-4 text-sm font-bold text-gray-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="font-bold text-sm">{o.customerName}</div>
                    <div className="text-xs text-gray-500">{o.customerPhone}</div>
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-600">
                    {o.items?.length || 0} items
                  </td>
                  <td className="p-4 font-black">${o.totalAmount?.toFixed(2)}</td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                      className={`text-xs font-black uppercase tracking-wider border-2 border-black p-1 focus:outline-none ${STATUS_COLORS[o.status] || 'bg-gray-300'}`}
                    >
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && <Pagination page={page} pages={pages} onPageChange={setPage} />}

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdateStatus={handleUpdateStatus} 
        />
      )}
    </div>
  );
}
