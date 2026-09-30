import React, { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { storeInfo, storeSlug } = useStore();
  const themeColor = storeInfo?.theme?.primaryColor || '#000000';
  
  const searchParams = new URLSearchParams(location.search);
  const isPaymentSuccess = searchParams.get('payment') === 'success';

  useEffect(() => {
    if (storeInfo) {
      document.title = `Order Confirmed - ${storeInfo.storeName}`;
    }
  }, [storeInfo]);

  const handleWhatsApp = () => {
    if (!storeInfo?.whatsappNumber) return;
    
    const text = encodeURIComponent(`Hello! I just placed an order on your store.\n\nOrder ID: ${orderId}\n\nPlease let me know the status of my order. Thank you!`);
    const whatsappUrl = `https://wa.me/${storeInfo.whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`;
    
    // Instead of window.open which might get blocked
    window.location.href = whatsappUrl;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isPaymentSuccess ? 'Payment Successful!' : 'Order Placed!'}
          </h1>
          <p className="text-gray-500 mb-6">
            Thank you for your purchase. We've received your order and will begin processing it right away.
          </p>

          <div className="flex justify-center mb-8">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${isPaymentSuccess ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {isPaymentSuccess ? 'Paid Online' : 'Cash on Delivery'}
            </span>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Your Order ID</p>
            <p className="text-xl font-bold font-mono text-gray-900">{orderId}</p>
          </div>

          <div className="space-y-4">
            {storeInfo?.whatsappNumber && (
              <button 
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold transition-colors"
              >
                <MessageCircle size={20} />
                Send via WhatsApp
              </button>
            )}

            <Link 
              to={`/track/${orderId}?store=${storeSlug}`}
              className="w-full flex items-center justify-center py-3.5 rounded-full text-white font-bold transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              Track Your Order
            </Link>

            <Link 
              to={`/?store=${storeSlug}`}
              className="w-full flex items-center justify-center py-3.5 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 font-bold transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
