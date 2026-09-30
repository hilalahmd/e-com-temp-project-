import React from 'react';
import { useStore } from '../context/StoreContext';

const Footer = () => {
  const { storeInfo } = useStore();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12 py-8 text-center text-gray-500">
      <div className="container mx-auto px-4">
        <p className="font-semibold text-gray-700 mb-2">{storeInfo?.storeName || 'Store'}</p>
        <p className="text-sm">Powered by StoreBuilder</p>
      </div>
    </footer>
  );
};

export default Footer;
