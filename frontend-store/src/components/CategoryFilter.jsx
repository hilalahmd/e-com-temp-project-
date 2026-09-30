import React from 'react';
import { useStore } from '../context/StoreContext';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  const { categories, storeInfo } = useStore();
  
  const themeColor = storeInfo?.theme?.primaryColor || '#000000';

  return (
    <div className="flex overflow-x-auto py-4 gap-3 no-scrollbar mb-6">
      <button
        onClick={() => onCategoryChange('All')}
        className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors`}
        style={activeCategory === 'All' ? { backgroundColor: themeColor, color: '#fff' } : { backgroundColor: '#f3f4f6', color: '#374151' }}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors`}
          style={activeCategory === cat ? { backgroundColor: themeColor, color: '#fff' } : { backgroundColor: '#f3f4f6', color: '#374151' }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
