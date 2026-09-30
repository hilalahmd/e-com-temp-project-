import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import api from '../api/axios';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { storeInfo, storeSlug } = useStore();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist(storeSlug);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const themeColor = storeInfo?.theme?.primaryColor || '#000000';

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
          if (storeInfo) {
            document.title = `${res.data.data.name} - ${storeInfo.storeName}`;
          }
        }
      } catch (error) {
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, storeInfo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" style={{ borderTopColor: themeColor }}></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <Link to={`/?store=${storeSlug}`} className="text-blue-500 hover:underline">Return to Store</Link>
      </div>
    );
  }

  const outOfStock = product.stock < 1;
  const isWished = isInWishlist(product._id);

  const handleAddToCart = () => {
    if (outOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`${quantity} ${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(`/?store=${storeSlug}`)}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to store
        </button>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Product Image */}
          <div className="w-full md:w-1/2">
            <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden relative">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">No Image Available</div>
              )}
              {outOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <span className="bg-white text-black px-6 py-2 rounded-full font-bold tracking-wider">OUT OF STOCK</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="mb-2 text-sm font-medium tracking-wide text-gray-500 uppercase">{product.category}</div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="text-3xl font-bold mb-6 text-gray-900">${product.price.toFixed(2)}</div>
            
            <div className="prose text-gray-600 mb-8 max-w-none">
              <p>{product.description || 'No description available for this product.'}</p>
            </div>

            <div className="mt-auto space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <button 
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => q - 1)} 
                    className="text-gray-500 hover:text-gray-900 disabled:opacity-50"
                  >-</button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button 
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity(q => q + 1)} 
                    className="text-gray-500 hover:text-gray-900 disabled:opacity-50"
                  >+</button>
                </div>
                <span className="text-sm text-gray-500">{product.stock} available</span>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-white font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: outOfStock ? '#9ca3af' : themeColor }}
                >
                  <ShoppingBag size={20} />
                  {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`p-4 rounded-full border-2 transition-colors ${isWished ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Heart size={24} className={isWished ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ProductDetail;
