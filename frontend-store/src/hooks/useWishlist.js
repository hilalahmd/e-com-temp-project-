import { useState, useEffect } from 'react';

export const useWishlist = (storeSlug) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!storeSlug) return;
    const saved = localStorage.getItem(`wishlist_${storeSlug}`);
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wishlist");
      }
    }
  }, [storeSlug]);

  useEffect(() => {
    if (!storeSlug) return;
    localStorage.setItem(`wishlist_${storeSlug}`, JSON.stringify(wishlist));
  }, [wishlist, storeSlug]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev.filter(item => item._id !== product._id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  return { wishlist, toggleWishlist, isInWishlist };
};
