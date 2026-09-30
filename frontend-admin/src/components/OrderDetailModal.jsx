import { X } from 'lucide-react';
import { useState } from 'react';

const STATUS_COLORS = {
  'Pending': 'bg-yellow-300 text-black',
  'Processing': 'bg-blue-300 text-black',
  'Shipped': 'bg-purple-300 text-black',
  'Delivered': 'bg-green-300 text-black',
  'Cancelled': 'bg-red-500 text-white'
};

export default function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  const [status, setStatus] = useState(order.status);
  
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border-4 border-black w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center p-6 border-b-4 border-black bg-gray-100">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest">Order #{order._id.slice(-8)}</h2>
            <p className="text-sm font-bold text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="hover:bg-black hover:text-white p-1 border-2 border-transparent hover:border-black transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 border-2 border-black">
            <span className="font-bold uppercase tracking-widest">Current Status</span>
            <span className={`px-3 py-1 text-sm font-black uppercase tracking-widest border-2 border-black ${STATUS_COLORS[order.status] || 'bg-gray-300'}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-4 border-black p-4">
              <h3 className="font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Customer Info</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">Name:</span> {order.customerName}</p>
                <p><span className="font-bold">Phone:</span> {order.customerPhone}</p>
                <p><span className="font-bold">Address:</span> {order.shippingAddress}</p>
              </div>
            </div>
            
            <div className="border-4 border-black p-4 bg-gray-50 flex flex-col justify-between">
              <div>
                <h3 className="font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Update Status</h3>
                <select 
                  className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:ring-2 focus:ring-black mb-4"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button 
                onClick={() => onUpdateStatus(order._id, status)}
                disabled={status === order.status}
                className="w-full py-3 bg-black text-white font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors border-2 border-black"
              >
                Update Status
              </button>
            </div>
          </div>

          <div className="border-4 border-black">
            <h3 className="font-black uppercase tracking-widest p-4 border-b-4 border-black bg-gray-100">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-black text-xs uppercase font-bold text-gray-500">
                    <th className="p-3">Product</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Price</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="p-3 font-bold text-sm">{item.productName || item.product?.name || 'Unknown Item'}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">${item.price?.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold">${(item.quantity * item.price)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-yellow-100 border-t-4 border-black">
                    <td colSpan="3" className="p-4 text-right font-black uppercase tracking-widest">Total Amount</td>
                    <td className="p-4 text-right font-black text-xl">${order.totalAmount?.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
