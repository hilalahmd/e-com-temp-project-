import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <nav className="border-b-4 border-black py-6 px-8 flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter">StoreBuilder</h1>
        <div className="space-x-6">
          <button onClick={() => navigate('/auth')} className="text-black font-black uppercase hover:underline underline-offset-4">Login</button>
          <button onClick={() => navigate('/auth')} className="bg-black text-white px-6 py-2 font-black uppercase border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Start</button>
        </div>
      </nav>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none uppercase">
          SELL <br /> ANYTHING.
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-800 mx-auto mb-12 font-bold border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
          Zero friction. Pure conversion. Create your isolated e-commerce store in 60 seconds and accept orders via WhatsApp.
        </p>
        <div className="flex justify-center">
          <button onClick={() => navigate('/auth')} className="bg-black text-white px-10 py-5 text-xl font-black hover:bg-white hover:text-black transition uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            Build Store
          </button>
        </div>
        
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-0 border-t-4 border-black">
          <div className="p-10 border-b-4 md:border-b-0 md:border-r-4 border-black">
             <h3 className="text-2xl font-black mb-4 uppercase">01. Instant</h3>
             <p className="text-gray-800 font-bold">Type your business name. We auto-generate your live URL instantly.</p>
          </div>
          <div className="p-10 border-b-4 md:border-b-0 md:border-r-4 border-black bg-black text-white">
             <h3 className="text-2xl font-black mb-4 uppercase">02. Direct</h3>
             <p className="text-gray-300 font-bold">Customers browse your minimal catalog and checkout directly to WhatsApp.</p>
          </div>
          <div className="p-10">
             <h3 className="text-2xl font-black mb-4 uppercase">03. Secure</h3>
             <p className="text-gray-800 font-bold">Your store's data is stored in a completely isolated database.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
