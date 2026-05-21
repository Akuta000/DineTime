import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, OrderItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

interface CartItem extends MenuItem {
  quantity: number;
}

interface ToastMessage {
  id: string;
  title: string;
  description: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const ToastItem: React.FC<{ toast: ToastMessage; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
      className="flex items-center gap-3.5 bg-[#151921]/95 text-white p-4 pr-5 rounded-2xl border border-brand-orange/20 shadow-[0_10px_35px_rgba(255,107,0,0.15)] backdrop-blur-md pointer-events-auto min-w-[280px]"
    >
      <div className="w-9 h-9 rounded-full bg-brand-orange/15 text-brand-orange flex items-center justify-center shrink-0">
        <Check size={18} strokeWidth={3} />
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-display font-bold text-white leading-tight uppercase tracking-wider">{toast.title}</h4>
        <p className="text-[10px] font-mono font-medium text-white/50 mt-0.5">{toast.description}</p>
      </div>
    </motion.div>
  );
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addItem = (item: MenuItem, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    addToast(item.name, quantity > 1 ? `${quantity} items added to tray` : 'Added to your tray');
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
      
      {/* Success Toasts Fixed Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
