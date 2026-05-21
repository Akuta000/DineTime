import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Clock, CheckCircle2, CookingPot, BellRing, Package, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Order, OrderStatus } from '../types';
import { formatCurrency } from '../lib/utils';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();

    // Subscribe to changes
    const subscription = supabase
      .channel('orders_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, (payload) => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const currentOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
  const historyOrders = orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));

  const displayOrders = activeTab === 'current' ? currentOrders : historyOrders;

  return (
    <div className="flex flex-col h-full bg-brand-dark">
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-brand-dark/90 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="flex items-center gap-4 mb-10">
           <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-brand-orange">
             <ClipboardList size={22} />
           </div>
           <div>
             <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/30 mb-0.5">Tracking</p>
             <h2 className="text-2xl font-display font-bold text-white">My Orders</h2>
           </div>
        </div>

        <div className="bg-white/5 p-1 rounded-2xl border border-white/5 flex relative overflow-hidden">
          <div 
            className="absolute top-1 bottom-1 transition-all duration-300 ease-out bg-brand-orange rounded-xl"
            style={{ 
              left: activeTab === 'current' ? '4px' : '50%',
              width: 'calc(50% - 4px)'
            }}
          />
          <button 
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest relative z-10 transition-colors ${activeTab === 'current' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest relative z-10 transition-colors ${activeTab === 'history' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            Past
          </button>
        </div>
      </header>

      <div className="flex-1 px-6 space-y-6 pb-32 pt-6">
        {loading ? (
           <div className="space-y-6">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-white/5 rounded-[32px] animate-pulse" />)}
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <ClipboardList size={32} className="text-white/10" />
            </div>
            <p className="text-white/20 font-display font-medium text-sm tracking-wide">No {activeTab} orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return { icon: <Clock />, label: 'Pending Confirmation', color: 'text-sky-400', step: 1, glow: 'shadow-sky-500/20' };
      case 'ACCEPTED': return { icon: <CheckCircle2 />, label: 'Confirmed', color: 'text-brand-orange', step: 2, glow: 'shadow-brand-orange/20' };
      case 'PREPARING': return { icon: <CookingPot />, label: 'Preparing Food', color: 'text-brand-orange', step: 3, glow: 'shadow-brand-orange/20' };
      case 'READY': return { icon: <BellRing />, label: 'Ready for Pickup', color: 'text-emerald-400', step: 4, glow: 'shadow-emerald-500/20' };
      case 'COMPLETED': return { icon: <Package />, label: 'Completed', color: 'text-white/40', step: 5, glow: '' };
      case 'CANCELLED': return { icon: <XCircle />, label: 'Cancelled', color: 'text-rose-500', step: 0, glow: '' };
      default: return { icon: <Clock />, label: status, color: 'text-white/40', step: 1, glow: '' };
    }
  };

  const info = getStatusInfo(order.status);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-brand-card/50 border border-white/5 rounded-[32px] relative overflow-hidden interactive-card"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full ${info.glow ? 'bg-current' : ''} ${info.color}`} />
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <p className="text-[9px] font-mono text-white/20 font-bold uppercase tracking-wider mb-2">Order #{order.id.slice(0, 8)}</p>
          <div className={`flex items-center gap-2.5 font-bold ${info.color}`}>
            <span className="p-1.5 bg-white/5 rounded-lg">
              {React.cloneElement(info.icon as React.ReactElement, { size: 14 })}
            </span>
            <span className="text-xs uppercase tracking-widest">{info.label}</span>
          </div>
        </div>
        <div className="text-right">
           <p className="text-sm font-mono font-bold text-white mb-1">{formatCurrency(order.total_amount)}</p>
           <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Paid Cash</p>
        </div>
      </div>

      {/* Progress Bar (Only for current) */}
      {info.step > 0 && info.step < 5 && (
        <div className="mb-6 px-1 relative z-10">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(info.step / 4) * 100}%` }}
              className={`h-full transition-all duration-1000 ${info.step === 4 ? 'bg-emerald-400' : 'bg-brand-orange shadow-[0_0_12px_rgba(255,107,0,0.4)]'}`}
            />
          </div>
          <div className="flex justify-between mt-3 px-0.5">
             <span className={`text-[8px] font-mono font-bold uppercase tracking-tighter ${info.step >= 1 ? 'text-brand-orange' : 'text-white/10'}`}>Placed</span>
             <span className={`text-[8px] font-mono font-bold uppercase tracking-tighter ${info.step >= 2 ? 'text-brand-orange' : 'text-white/10'}`}>Confirmed</span>
             <span className={`text-[8px] font-mono font-bold uppercase tracking-tighter ${info.step >= 3 ? 'text-brand-orange' : 'text-white/10'}`}>Cooking</span>
             <span className={`text-[8px] font-mono font-bold uppercase tracking-tighter ${info.step >= 4 ? 'text-emerald-400' : 'text-white/10'}`}>Pickup</span>
          </div>
        </div>
      )}

      {order.status === 'READY' && (
        <motion.button 
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-[10px] font-mono font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.1)]"
        >
          Proceed to Stall for Pickup
        </motion.button>
      )}
    </motion.div>
  );
};

export default Orders;
