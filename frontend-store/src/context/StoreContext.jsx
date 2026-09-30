import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { getTenantId } from '../utils/tenant';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [storeSlug, setStoreSlug] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Store URL or subdomain-il ninnu extract cheyyunnu
    const slug = getTenantId();
    if (slug) {
      setStoreSlug(slug);
    } else {
      setError("No store specified. Try using ?store=store-name in the URL");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Slug illenkil onnum cheyyanda
    if (!storeSlug) return;

    // Backend-il ninnu store details-um products-um fetch cheyyanulla function
    const fetchStoreData = async () => {
      setLoading(true);
      try {
        const [storeRes, productsRes] = await Promise.all([
          api.get(`/tenant/store/${storeSlug}`),
          api.get('/products')
        ]);

        if (storeRes.data.success) {
          setStoreInfo(storeRes.data.data);
          document.title = storeRes.data.data.storeName;
          
          if (storeRes.data.data.logoUrl) {
            const favicon = document.querySelector("link[rel~='icon']");
            if (favicon) favicon.href = storeRes.data.data.logoUrl;
          }
        }

        if (productsRes.data.success) {
          const prods = productsRes.data.data;
          setProducts(prods);
          
          // Products-il ninnu unique aayulla categories mathram edukkunnu
          const uniqueCategories = [...new Set(prods.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error("Error fetching store data:", err);
        setError("Failed to load store data");
      } finally {
        // Fetching kazhinjal loading false aakkunnu
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeSlug]);

  return (
    <StoreContext.Provider value={{ storeSlug, storeInfo, products, categories, loading, error, setProducts }}>
      {children}
    </StoreContext.Provider>
  );
};
