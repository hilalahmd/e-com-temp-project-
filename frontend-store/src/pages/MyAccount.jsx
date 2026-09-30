import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Package, User, LogOut, ArrowLeft } from 'lucide-react';

const MyAccount = () => {
  const { customer, handleLogout } = useCustomerAuth();
  const { storeSlug, storeInfo } = useStore();
  const navigate = useNavigate();
  
  const themeColor = storeInfo?.theme?.primaryColor || '#000000';

  useEffect(() => {
    // If not logged in, redirect to login
    if (!customer) {
      navigate(`/login?store=${storeSlug}`);
    }
  }, [customer, navigate, storeSlug]);

  if (!customer) return null;

  const onLogout = () => {
    handleLogout();
    navigate(`/?store=${storeSlug}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <button 
          onClick={() => navigate(`/?store=${storeSlug}`)}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to store
        </button>

        <h1 className="text-3xl font-bold mb-8 text-gray-900">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar / Profile Info */}
          <div className="md:w-1/3 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold" style={{ color: themeColor }}>
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                  <p className="text-gray-500 text-sm">{customer.email}</p>
                </div>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-gray-400" />
                  <span className="text-sm">Personal Info</span>
                </div>
                {customer.phone && (
                  <div className="text-sm text-gray-600 ml-8">{customer.phone}</div>
                )}
              </div>

              <button 
                onClick={onLogout}
                className="w-full mt-8 py-3 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>

          {/* Past Orders */}
          <div className="md:w-2/3">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Package size={24} style={{ color: themeColor }} />
                <h2 className="text-xl font-bold">Past Orders</h2>
              </div>

              {(!customer.orders || customer.orders.length === 0) ? (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>You haven't placed any orders yet.</p>
                  <Link 
                    to={`/?store=${storeSlug}`}
                    className="inline-block mt-4 text-sm font-semibold hover:underline"
                    style={{ color: themeColor }}
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {customer.orders.map((order) => (
                    <Link 
                      key={order._id}
                      to={`/track/${order._id}?store=${storeSlug}`}
                      className="block border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
                        <div>
                          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md mb-2 inline-block">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold block">${order.totalAmount?.toFixed(2)}</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 border-t border-gray-50 pt-3">
                        {order.items?.length || 0} item(s) • {order.paymentMethod}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyAccount;
