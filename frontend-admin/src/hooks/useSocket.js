import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export default function useSocket(storeSlug) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!storeSlug) return;

    const socket = io('http://localhost:5001', {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to server');
      socket.emit('join-store', storeSlug);
    });

    socket.on('new_order', (data) => {
      // Play notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczFjqR0+PNZi0YOIjI4NRfKBQ4f7vZ2FkhEjZ0rb3VWh8SNnGqt9RYHhEzaqWwz1YaDzJoo63LUA0LLJiatcJLCAsoh5+jwkcJCiSEl66+RQgKJIKUq7pFCQgfg5KoskQICR2Cj6KySAgGHIGKn7JGBwUYgoigs0MHBR+BhZuuQQYFIoGEmazCBwQdhIWarMIHBBuCg5erv');  
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch(e) {}

      toast(
        `🛒 New Order!\n${data.customerName} - $${data.totalAmount?.toFixed(2)}`,
        {
          duration: 8000,
          icon: '🔔',
          style: {
            background: '#000',
            color: '#fff',
            border: '2px solid #000',
            borderRadius: '0',
            fontWeight: 'bold',
          },
        }
      );
    });

    socket.on('order_status_updated', (data) => {
      toast(`📦 Order ${data.orderId.slice(-6)} → ${data.status}`, {
        icon: '📋',
        style: {
          border: '2px solid #000',
          borderRadius: '0',
        }
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [storeSlug]);

  return socketRef.current;
}
