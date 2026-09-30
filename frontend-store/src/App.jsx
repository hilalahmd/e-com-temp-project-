import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

// Pages
import StoreFront from './pages/StoreFront';
import ProductDetail from './pages/ProductDetail';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import MyAccount from './pages/MyAccount';
import NotFound from './pages/NotFound';

// Store variables and routing-nulla main App component
// storeSlug CartProvider-ilekk pass cheyyanulla wrapper component
const AppContent = () => {
  const storeSlug = new URLSearchParams(window.location.search).get('store') || '';
  
  return (
    <CartProvider storeSlug={storeSlug}>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '9999px',
            background: '#333',
            color: '#fff',
          }
        }} 
      />
      <Routes>
        <Route path="/" element={<StoreFront />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="/track/:orderId" element={<OrderTracking />} />
        <Route path="/track" element={<OrderTracking />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CartProvider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <StoreProvider>
        <CustomerAuthProvider>
          <AppContent />
        </CustomerAuthProvider>
      </StoreProvider>
    </BrowserRouter>
  );
};

export default App;
