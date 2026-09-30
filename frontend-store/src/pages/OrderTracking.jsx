import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';

const OrderTracking = () => {
  const { orderId: paramOrderId } = useParams();
  const navigate = useNavigate();
  const { storeInfo, storeSlug } = useStore();
  
  const [orderId, setOrderId] = useState(paramOrderId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const themeColor = storeInfo?.theme?.primaryColor || '#000000';

  useEffect(() => {
    if (paramOrderId) {
      handleTrack();
    }
  }, [paramOrderId]);

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await api.get(`/orders/track/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.data);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Could not track order. Please check the ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 1;
    if (s === 'processing') return 2;
    if (s === 'shipped') return 3;
    if (s === 'delivered') return 4;
    return 0;
  };

  const currentStep = order ? getStatusStep(order.status) : 0;
  const isCancelled = order?.status?.toLowerCase() === 'cancelled';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Track Your Order</h1>
          
          <form onSubmit={handleTrack} className="flex gap-2 mb-10">
            <input 
              type="text" 
              placeholder="Enter Order ID" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 outline-none transition-all font-mono"
            />
            <button 
              type="submit"
              disabled={loading || !orderId.trim()}
              className="px-8 py-4 rounded-xl text-white font-bold transition-colors disabled:opacity-70"
              style={{ backgroundColor: themeColor }}
            >
              {loading ? '...' : 'Track'}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-50 text-red-500 rounded-xl text-center mb-6">
              {error}
            </div>
          )}

          {order && (
            <div className="animate-fade-in-up">
              <div className="mb-10 text-center">
                <p className="text-sm text-gray-500">Order Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                <h2 className="text-3xl font-bold mt-2" style={{ color: isCancelled ? '#ef4444' : themeColor }}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </h2>
              </div>

              {/* Stepper */}
              {!isCancelled && (
                <div className="relative flex justify-between items-center mb-16 px-4 md:px-12">
                  <div className="absolute left-8 right-8 top-1/2 h-1 bg-gray-100 -z-10 -translate-y-1/2"></div>
                  <div className="absolute left-8 right-8 top-1/2 h-1 -z-10 -translate-y-1/2 transition-all duration-1000" 
                    style={{ 
                      backgroundColor: themeColor,
                      width: `${((currentStep - 1) / 3) * 100}%` 
                    }}>
                  </div>

                  <Step icon={<Clock size={20} />} label="Pending" active={currentStep >= 1} color={themeColor} />
                  <Step icon={<Package size={20} />} label="Processing" active={currentStep >= 2} color={themeColor} />
                  <Step icon={<Truck size={20} />} label="Shipped" active={currentStep >= 3} color={themeColor} />
                  <Step icon={<CheckCircle2 size={20} />} label="Delivered" active={currentStep >= 4} color={themeColor} />
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-medium border border-gray-200">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-gray-700">{item.productName || 'Product'}</span>
                      </div>
                      <span className="font-medium">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center font-bold text-lg text-gray-900 mt-2">
                    <span>Total Amount</span>
                    <span>${order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Step = ({ icon, label, active, color }) => (
  <div className="flex flex-col items-center gap-2">
    <div 
      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${active ? 'text-white' : 'bg-white text-gray-300 border-2 border-gray-200'}`}
      style={active ? { backgroundColor: color, boxShadow: `0 0 15px ${color}40` } : {}}
    >
      {icon}
    </div>
    <span className={`text-xs md:text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
  </div>
);

export default OrderTracking;
