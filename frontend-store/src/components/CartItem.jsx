import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { storeInfo } = useStore();
  const themeColor = storeInfo?.theme?.primaryColor || '#000000';

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</h4>
          <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
            <button 
              onClick={() => updateQuantity(item._id, item.quantity - 1)}
              className="text-gray-500 hover:text-gray-900"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
            <button 
              onClick={() => updateQuantity(item._id, item.quantity + 1)}
              className="text-gray-500 hover:text-gray-900"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
