import React from 'react';
import { useStore } from '../context/StoreContext';

const Hero = () => {
  const { storeInfo } = useStore();
  const themeColor = storeInfo?.theme?.primaryColor || '#000000';
  
  if (!storeInfo) return null;

  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-gray-900 flex items-center justify-center overflow-hidden">
      {storeInfo.heroBgUrl ? (
        <img 
          src={storeInfo.heroBgUrl} 
          alt="Hero Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-800 to-gray-900" />
      )}
      
      <div className="relative z-10 text-center px-4 max-w-3xl animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
          {storeInfo.storeName}
        </h1>
        {storeInfo.category && (
          <p className="text-lg md:text-xl text-gray-200 mb-8 font-light drop-shadow">
            Your destination for the best {storeInfo.category}
          </p>
        )}
        <button 
          onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
          className="px-8 py-3 rounded-full text-white font-medium hover:scale-105 transition-transform shadow-lg"
          style={{ backgroundColor: themeColor }}
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default Hero;
