import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useStore } from './StoreContext';
import toast from 'react-hot-toast';

const CustomerAuthContext = createContext();

export const CustomerAuthProvider = ({ children }) => {
  const { storeSlug } = useStore();
  const [customer, setCustomer] = useState(null);
  const [customerToken, setCustomerToken] = useState(localStorage.getItem('customerToken') || null);
  const [loading, setLoading] = useState(true);

  // Initial load-il token undenkil customer data fetch cheyyam
  useEffect(() => {
    const fetchCustomer = async () => {
      if (customerToken && storeSlug) {
        try {
          const res = await api.get('/customers/me', {
            headers: {
              Authorization: `Bearer ${customerToken}`,
              'x-store-slug': storeSlug
            }
          });
          if (res.data.success) {
            setCustomer(res.data.data);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("Error fetching customer data:", error);
          handleLogout();
        }
      }
      setLoading(false);
    };
    
    fetchCustomer();
  }, [customerToken, storeSlug]);

  const handleLogin = async (email, password) => {
    try {
      const res = await api.post('/customers/login', { email, password }, {
        headers: {
          'x-store-slug': storeSlug
        }
      });
      if (res.data.success) {
        setCustomerToken(res.data.data.token);
        setCustomer(res.data.data.customer);
        localStorage.setItem('customerToken', res.data.data.token);
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const handleRegister = async (name, email, password, phone) => {
    try {
      const res = await api.post('/customers/register', { name, email, password, phone }, {
        headers: {
          'x-store-slug': storeSlug
        }
      });
      if (res.data.success) {
        setCustomerToken(res.data.data.token);
        setCustomer(res.data.data.customer);
        localStorage.setItem('customerToken', res.data.data.token);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const handleLogout = () => {
    setCustomerToken(null);
    setCustomer(null);
    localStorage.removeItem('customerToken');
  };

  return (
    <CustomerAuthContext.Provider value={{
      customer,
      customerToken,
      loading,
      handleLogin,
      handleRegister,
      handleLogout
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);
