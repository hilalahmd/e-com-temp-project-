import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { useStore } from '../context/StoreContext';

const StoreFront = () => {
  const { products, loading, storeInfo } = useStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Page load aavumbo store-nte peru title aayi set cheyyan
    if (storeInfo) {
      document.title = `${storeInfo.storeName} - Home`;
    }
  }, [storeInfo]);

  // Search-um category-um vech products filter cheyyunnu
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar onSearch={setSearchQuery} />
      <Hero />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <CategoryFilter 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
          />
        </div>

        <ProductGrid products={filteredProducts} loading={loading} />
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default StoreFront;
