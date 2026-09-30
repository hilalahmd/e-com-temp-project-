import React from 'react';
import { ShoppingBag, Heart, Search, Menu, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onSearch }) => {
  const { storeInfo, storeSlug } = useStore();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist(storeSlug);
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();

  const themeColor = storeInfo?.theme?.primaryColor || '#000000';

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-gray-600">
            <Menu size={24} />
          </button>
          <Link to={`/?store=${storeSlug}`} className="flex items-center gap-2">
            {storeInfo?.logoUrl ? (
              <img src={storeInfo.logoUrl} alt={storeInfo.storeName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="font-bold text-xl tracking-tight" style={{ color: themeColor }}>
                {storeInfo?.storeName || 'Store'}
              </span>
            )}
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none focus:ring-2 outline-none transition-all"
            style={{ focusRing: themeColor }}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-2.5 text-gray-400" size={18} />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {customer ? (
            <Link to={`/account?store=${storeSlug}`} className="hidden md:flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <User size={20} />
              <span className="text-sm font-medium">{customer.name.split(' ')[0]}</span>
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-3 mr-2">
              <Link to={`/login?store=${storeSlug}`} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Login
              </Link>
              <Link 
                to={`/register?store=${storeSlug}`} 
                className="text-sm font-medium text-white px-4 py-2 rounded-full transition-opacity hover:opacity-90"
                style={{ backgroundColor: themeColor }}
              >
                Register
              </Link>
            </div>
          )}

          <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative">
            <Heart size={24} />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] text-white flex items-center justify-center rounded-full" style={{ backgroundColor: themeColor }}>
                {wishlist.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative"
          >
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[10px] text-white flex items-center justify-center rounded-full" style={{ backgroundColor: themeColor }}>
                {cartCount}
              </span>
            )}
          </button>
          
          {/* Mobile Auth Icons */}
          <div className="md:hidden">
            {customer ? (
              <Link to={`/account?store=${storeSlug}`} className="p-2 text-gray-600 hover:text-gray-900 transition-colors block">
                <User size={24} />
              </Link>
            ) : (
              <Link to={`/login?store=${storeSlug}`} className="p-2 text-gray-600 hover:text-gray-900 transition-colors block">
                <User size={24} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
