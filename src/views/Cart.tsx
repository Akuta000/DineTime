import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard, ChevronRight, Coffee, Pizza, Utensils, Sandwich, Soup, IceCream } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Order, OrderItem } from '../types';

interface CartProps {
  onOrders: () => void;
}

const Cart: React.FC<CartProps> = ({ onOrders }) => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    const size = 30;
    if (cat.includes('coffee') || cat.includes('drink') || cat.includes('beverage')) return <Coffee size={size} />;
    if (cat.includes('burger') || cat.includes('sandwich')) return <Sandwich size={size} />;
    if (cat.includes('pizza')) return <Pizza size={size} />;
    if (cat.includes('rice') || cat.includes('meal')) return <Utensils size={size} />;
    if (cat.includes('soup') || cat.includes('ramen') || cat.includes('noodle')) return <Soup size={size} />;
    if (cat.includes('dessert') || cat.includes('ice cream')) return <IceCream size={size} />;
    return <Utensils size={size} />;
  };

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;
    
    setIsCheckingOut(true);
    try {
      // Determine stall_id (for simplicity, assume all from one stall or take the first)
      const stallId = items[0].stall_id;
      
      const orderData = {
        user_id: user.id,
        stall_id: stallId,
        total_amount: total,
        status: 'PENDING',
        payment_method: 'CASH',
        special_notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: order, error: oErr } = await supabase.from('orders').insert([orderData]).select().single();
      if (oErr) throw oErr;

      const orderItemsData = items.map(item => ({
        order_id: order.id,
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: iErr } = await supabase.from('order_items').insert(orderItemsData);
      if (iErr) throw iErr;

      clearCart();
      onOrders();
    } catch (e) {
      console.error(e);
      alert("Checkout failed. Check logs.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-12 text-center bg-[#0b0e14]">
        <div className="w-32 h-32 bg-[#151921] border border-[#232a35] rounded-[40px] flex items-center justify-center mb-8 shadow-2xl relative">
          <ShoppingBag size={56} className="text-[#2d3646]" />
          <div className="absolute inset-0 bg-brand-orange/5 blur-2xl rounded-full" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Your order tray is empty</h2>
        <p className="text-gray-500 mb-10 text-sm leading-relaxed">
          Looks like you haven't added any meals yet. Explore the menu to find something delicious!
        </p>
        <button 
          onClick={() => window.location.reload()} // Quick hack to go home
          className="orange-button px-12 text-xs tracking-widest uppercase font-bold"
        >
          START BROWSING
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-brand-dark">
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-brand-dark/90 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-brand-orange">
             <ShoppingBag size={22} />
           </div>
           <div>
             <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/30 mb-0.5">Order Summary</p>
             <h2 className="text-2xl font-display font-bold text-white">My Food Tray</h2>
           </div>
        </div>
      </header>

      <div className="flex-1 px-6 space-y-4 pb-48 pt-6">
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-brand-card/50 border border-white/5 rounded-3xl flex gap-4 items-center group interactive-card"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors">
                 {item.image_url ? (
                   <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 ) : (
                   <div className="text-brand-orange/30 group-hover:text-brand-orange transition-all duration-500 scale-90 group-hover:scale-100">
                     {getCategoryIcon(item.category)}
                   </div>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-display font-bold text-sm text-white/90 truncate">{item.name}</h4>
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => removeItem(item.id)} 
                    className="text-white/20 hover:text-red-500/80 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
                <div className="flex items-center justify-between">
                   <span className="font-mono font-bold text-sm text-brand-orange">{formatCurrency(item.price)}</span>
                   <div className="flex items-center gap-4 bg-white/5 p-1 rounded-xl border border-white/5">
                     <motion.button 
                       whileTap={{ scale: 0.8 }}
                       onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                       className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white transition-colors"
                     >
                       <Minus size={14} />
                     </motion.button>
                     <span className="text-sm font-mono font-bold w-4 text-center">{item.quantity}</span>
                     <motion.button 
                       whileTap={{ scale: 0.8 }}
                       onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                       className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white transition-colors"
                     >
                       <Plus size={14} />
                     </motion.button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Bill Card */}
      <footer className="fixed bottom-28 left-6 right-6 p-6 bg-brand-card border border-white/10 rounded-[32px] z-40 shadow-2xl overflow-hidden orange-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">Total Amount</p>
              <p className="text-2xl font-display font-bold text-white">{formatCurrency(total)}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-mono font-bold text-brand-orange uppercase tracking-widest bg-brand-orange/10 px-2 py-1 rounded">Free Service Fee</p>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full h-14 bg-brand-orange text-white rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 font-bold text-sm tracking-widest shadow-xl shadow-brand-orange/20 overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {isCheckingOut ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                PLACE CASH ORDER <ArrowLeft size={18} className="rotate-180" />
              </>
            )}
          </motion.button>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
