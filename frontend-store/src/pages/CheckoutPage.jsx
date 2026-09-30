import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Wallet, Ticket, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { storeSlug, storeInfo } = useStore();
  const { customer, customerToken } = useCustomerAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: customer?.name || '',
    customerPhone: customer?.phone || '',
    customerAddress: '',
    email: customer?.email || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const themeColor = storeInfo?.theme?.primaryColor || '#000000';

  useEffect(() => {
    if (storeInfo) {
      document.title = `Checkout - ${storeInfo.storeName}`;
    }
  }, [storeInfo]);

  useEffect(() => {
    // Cart-il aarum illenkil home-ilekk thirichu povaan
    if (cart.length === 0) {
      navigate(`/?store=${storeSlug}`);
    }
  }, [cart, navigate, storeSlug]);

  // Form input marumbo ath state-il update cheyyanulla function
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Coupon validate cheyyanulla backend call
  const applyCoupon = async () => {
    setApplyingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponInput, orderTotal: cartTotal });
      if (res.data.success) {
        setAppliedCoupon(res.data.data);
        setDiscountAmount(res.data.data.discountAmount);
        toast.success(`Yay! Coupon applied. You saved $${res.data.data.discountAmount.toFixed(2)}!`);
        setCouponInput('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Oops! This coupon seems invalid.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const finalTotal = cartTotal - discountAmount;

  // Checkout process start cheyyunnu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        email: formData.email,
        items: cart.map(item => ({ productId: item._id, quantity: item.quantity })),
        couponCode: appliedCoupon?.code || null,
        paymentMethod,
      };

      const headers = { 'x-store-slug': storeSlug };
      if (customerToken) {
        headers.Authorization = `Bearer ${customerToken}`;
      }

      if (paymentMethod === 'Online') {
        // Online payment anenkil stripe-ilekk redirect cheyyunnu
        const res = await api.post('/payments/create-checkout-session', orderData, { headers });
        if (res.data.success) {
          clearCart();
          window.location.href = res.data.data.sessionUrl;
        }
      } else {
        // COD aanenkil direct order place cheyyunnu
        const res = await api.post('/orders', orderData, { headers });
        if (res.data.success) {
          clearCart();
          toast.success('Awesome! Your order is placed successfully!');
          navigate(`/order-confirmation/${res.data.data._id}?store=${storeSlug}`);
        }
      }
    } catch (error) {
      console.error("Order error", error);
      toast.error(error.response?.data?.message || "Oops! Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <button 
          onClick={() => navigate(`/?store=${storeSlug}`)}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to cart
        </button>

        <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="lg:w-2/3 order-2 lg:order-1">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-6">Delivery Details</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Full Name *</label>
                    <input 
                      required
                      type="text" 
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 outline-none transition-all"
                      style={{ focusRing: themeColor }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                    <input 
                      required
                      type="tel" 
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Delivery Address *</label>
                  <textarea 
                    required
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                {/* Coupon Code Section */}
                <div className="bg-gray-50 rounded-2xl p-4 mt-6">
                  <h3 className="text-sm font-semibold mb-3">Have a coupon?</h3>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2">
                        <Ticket size={16} className="text-green-600" />
                        <span className="font-bold text-green-700">{appliedCoupon.code}</span>
                        <span className="text-sm text-green-600">
                          {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% off` : `$${appliedCoupon.value} off`}
                        </span>
                      </div>
                      <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 p-3 bg-white border border-gray-200 rounded-xl uppercase font-mono"
                      />
                      <button 
                        type="button"
                        onClick={applyCoupon}
                        disabled={!couponInput || applyingCoupon}
                        className="px-6 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50"
                        style={{ backgroundColor: themeColor }}
                      >
                        {applyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="mt-6 mb-2">
                  <h3 className="text-sm font-semibold mb-3">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === 'COD' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Wallet size={24} />
                      <span className="text-sm font-medium">Cash on Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Online')}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        paymentMethod === 'Online' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard size={24} />
                      <span className="text-sm font-medium">Pay Online</span>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 rounded-full text-white font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-70"
                  style={{ backgroundColor: themeColor }}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {paymentMethod === 'Online' ? (
                        <><CreditCard size={20} /> Pay ${finalTotal.toFixed(2)}</>
                      ) : (
                        <><CheckCircle2 size={20} /> Place Order - ${finalTotal.toFixed(2)}</>
                      )}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 order-1 lg:order-2">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item._id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
