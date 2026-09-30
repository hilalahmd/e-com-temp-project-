import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  const { storeSlug, storeInfo } = useStore();
  const themeColor = storeInfo?.theme?.primaryColor || '#000000';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-9xl font-black text-gray-200 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
        <Link 
          to={`/?store=${storeSlug}`}
          className="px-8 py-3 rounded-full text-white font-bold transition-all hover:-translate-y-1 hover:shadow-lg"
          style={{ backgroundColor: themeColor }}
        >
          Return to Store
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
