import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { storeInfo, storeSlug } = useStore();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist(storeSlug);
  
  const themeColor = storeInfo?.theme?.primaryColor || '#000000';
  const isWished = isInWishlist(product._id);
  const outOfStock = product.stock < 1;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
    if (!isWished) toast.success('Added to wishlist');
  };

  return (
    <Link to={`/product/${product._id}?store=${storeSlug}`} className="group relative block bg-white rounded-2xl p-3 transition-all duration-300 hover:shadow-xl border border-gray-100 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 mb-4">
        {product.images?.[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${outOfStock ? 'opacity-50 grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
        
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold tracking-wider">OUT OF STOCK</span>
          </div>
        )}

        {product.isBestSeller && !outOfStock && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full">
            Best Seller
          </div>
        )}

        <button 
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow-sm transition-all"
        >
          <Heart size={18} className={isWished ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
        </button>
      </div>

      <div className="space-y-1 px-1">
        <p className="text-sm text-gray-500">{product.category}</p>
        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
          <button 
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`p-2.5 rounded-full transition-transform hover:scale-110 active:scale-95 ${outOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'text-white'}`}
            style={!outOfStock ? { backgroundColor: themeColor } : {}}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
