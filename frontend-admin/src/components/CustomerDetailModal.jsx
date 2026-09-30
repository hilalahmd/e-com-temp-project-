import React from 'react';
import { X, Package, Calendar } from 'lucide-react';

export default function CustomerDetailModal({ customer, onClose }) {
  // Modal close cheyyan
  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-[fadeIn_0.2s_ease-out]">
        
        {/* Header section */}
        <div className="flex justify-between items-center p-6 border-b-4 border-black bg-yellow-300 sticky top-0 z-10">
          <h2 className="text-2xl font-black uppercase tracking-widest">Customer Details</h2>
          <button 
            onClick={onClose}
            className="p-2 border-2 border-black bg-white hover:bg-red-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content section */}
        <div className="p-6 space-y-8">
          
          {/* Customer info card */}
          <div className="bg-gray-50 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Name</p>
                <p className="font-bold text-lg">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Email</p>
                <p className="font-bold text-lg">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Status</p>
                <span className={`inline-block mt-1 px-3 py-1 font-black uppercase text-xs border-2 border-black ${customer.isBlocked ? 'bg-red-400 text-white' : 'bg-green-400 text-black'}`}>
                  {customer.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Joined On</p>
                <p className="font-bold text-lg">{new Date(customer.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Aggregated stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-200 border-4 border-black p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black uppercase tracking-widest text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-black">{customer.totalOrders || 0}</p>
            </div>
            <div className="bg-green-200 border-4 border-black p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black uppercase tracking-widest text-sm mb-1">Total Spent</p>
              <p className="text-3xl font-black font-mono">${(customer.totalSpent || 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Past orders list if available */}
          <div>
            <h3 className="font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">Order History</h3>
            
            {!customer.orders || customer.orders.length === 0 ? (
              <div className="bg-gray-100 border-4 border-black p-8 text-center">
                <Package className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="font-bold uppercase tracking-widest text-gray-500">No orders found for this customer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customer.orders.map((order, index) => (
                  <div key={order._id || index} className="border-4 border-black p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="font-black uppercase tracking-wider mb-1">Order #{order._id?.slice(-6) || 'N/A'}</p>
                      <div className="flex items-center text-sm font-bold text-gray-600 gap-2">
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-black text-lg">${(order.totalAmount || 0).toFixed(2)}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs font-black uppercase border-2 border-black ${
                        order.status === 'DELIVERED' ? 'bg-green-300' : 
                        order.status === 'CANCELLED' ? 'bg-red-300' : 'bg-yellow-300'
                      }`}>
                        {order.status || 'PENDING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
