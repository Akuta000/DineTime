import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Bell, Star, Flame, Plus, Coffee, Pizza, Utensils, Sandwich, Soup, IceCream } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { Stall, MenuItem } from '../types';
import { formatCurrency } from '../lib/utils';
// AI Recommendations logic below

interface HomeProps {
  onNavigateMenu: (stallId?: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigateMenu }) => {
  const { profile } = useAuth();
  const { addItem } = useCart();
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    const size = 32;
    if (cat.includes('coffee') || cat.includes('drink') || cat.includes('beverage')) return <Coffee size={size} />;
    if (cat.includes('burger') || cat.includes('sandwich')) return <Sandwich size={size} />;
    if (cat.includes('pizza')) return <Pizza size={size} />;
    if (cat.includes('rice') || cat.includes('meal')) return <Utensils size={size} />;
    if (cat.includes('soup') || cat.includes('ramen') || cat.includes('noodle')) return <Soup size={size} />;
    if (cat.includes('dessert') || cat.includes('ice cream')) return <IceCream size={size} />;
    return <Utensils size={size} />;
  };

  const getStallGradient = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('strip') && lowerName.includes('dip')) {
      return 'from-black via-gray-500 to-white/90 text-black'; 
    }
    if (lowerName.includes('kapi') && lowerName.includes('kita')) {
      return 'from-blue-700 via-blue-400 to-white/95 text-blue-900';
    }
    const gradients = [
      'from-blue-600 to-indigo-700',
      'from-brand-orange to-orange-600',
      'from-emerald-500 to-teal-700',
      'from-purple-600 to-pink-700',
      'from-rose-500 to-red-700',
      'from-sky-400 to-blue-600',
    ];
    // Simple hash to consistently pick a gradient
    const index = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % gradients.length;
    return gradients[index];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Stalls and Popular Items in parallel
        const [stallsRes, itemsRes] = await Promise.all([
          supabase.from('stalls').select('*').order('created_at', { ascending: true }).limit(6),
          supabase.from('menu_items').select('*').order('popularity', { ascending: false }).limit(10)
        ]);

        if (stallsRes.data) setStalls(stallsRes.data as Stall[]);
        if (itemsRes.data) setPopularItems(itemsRes.data as MenuItem[]);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  return (
    <div className="px-6 py-8 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-brand-orange/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MapPin size={22} className="text-brand-orange" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-orange/70 font-medium">Location</p>
            <h1 className="text-base font-display font-bold tracking-tight">BU Polangui</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-11 h-11 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl"
          >
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-brand-orange rounded-full ring-4 ring-brand-dark" />
          </motion.button>
        </div>
      </header>

      {/* Hero Bento Section */}
      <div className="mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-brand-orange p-8 rounded-3xl overflow-hidden group interactive-card border-none min-h-[220px] flex flex-col justify-center"
        >
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <span className="inline-block px-2 py-1 bg-black/20 backdrop-blur-md rounded-md text-[9px] font-mono uppercase tracking-widest text-white mb-4">Official Campus Hub</span>
            <h2 className="text-4xl font-display font-bold text-white mb-3 leading-[0.9]">
              Stay Hungry,<br />
              {profile?.name.split(' ')[0] || 'Oragon'}!
            </h2>
            <p className="text-sm text-white/70 max-w-[240px] font-medium leading-relaxed">Browse the best meals and snacks from your favorite BUPC campus stalls.</p>
            
            <motion.button 
              whileHover={{ x: 5 }}
              onClick={() => onNavigateMenu()}
              className="mt-6 flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest group/btn"
            >
              Explore Menu <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Featured Stalls Bento Grid */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-white/40">Featured Stalls</h3>
          <button onClick={() => onNavigateMenu()} className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">Expand All</button>
        </div>
        <div className="bento-grid">
          {stalls.length === 0 ? (
            <div className="col-span-6 h-40 bg-white/5 rounded-[32px] animate-pulse" />
          ) : (
            stalls.map((stall, idx) => {
              // Symmetry: 3/3 for first pair, 2/2/2 for next row
              const span = (idx === 0 || idx === 1) ? 'col-span-3 row-span-2' : 'col-span-2 row-span-2';
              const gradient = getStallGradient(stall.name);
              const isLight = gradient.includes('to-white');

              return (
                <motion.div 
                  key={stall.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigateMenu(stall.id)}
                  className={`${span} bento-item group cursor-pointer relative overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:scale-110 transition-transform duration-700`} />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={16} className={isLight ? 'text-black' : 'text-white'} />
                    </div>
                    <h4 className={`font-display font-bold ${idx < 2 ? 'text-xl' : 'text-sm'} leading-tight ${isLight ? 'text-black/80' : 'text-white'} mb-1 drop-shadow-sm`}>{stall.name}</h4>
                    <div className="flex items-center gap-2">
                      <Star size={idx < 2 ? 14 : 10} className={isLight ? 'fill-black/40 text-black/40' : 'fill-white/80 text-white/80'} />
                      <span className={`text-[10px] font-bold ${isLight ? 'text-black/40' : 'text-white/60'}`}>4.9 (2k+)</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* Most Loved / Popular */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8 px-1">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-white/40">Most Loved (5★)</h3>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-brand-orange rounded-full" />
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <div className="w-1 h-1 bg-white/10 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {popularItems.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group"
            >
              <div className="bg-white/5 p-3 rounded-[32px] overflow-hidden interactive-card border border-white/5">
                <div className="relative aspect-square rounded-[24px] overflow-hidden bg-white/5 mb-4 flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors">
                  {item.image_url ? (
                    <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="text-brand-orange/30 group-hover:text-brand-orange transition-all duration-500 scale-90 group-hover:scale-100">
                       {getCategoryIcon(item.category)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button className="absolute top-2.5 right-2.5 w-8 h-8 bg-black/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white/40 transition-all hover:bg-brand-orange hover:text-white">
                    <Heart fill="currentColor" size={14} />
                  </button>
                  {i < 2 && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-1 bg-brand-orange text-white text-[7px] font-mono font-black rounded-md tracking-[0.2em] uppercase shadow-xl shadow-brand-orange/40">
                      Top
                    </div>
                  )}
                </div>
                <div className="px-2 pb-2">
                  <h4 className="font-display font-bold text-xs truncate text-white/80 group-hover:text-white transition-colors">{item.name}</h4>
                  <p className="text-[9px] font-mono text-white/20 mt-0.5 truncate uppercase tracking-widest">{item.category}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <span className="text-[11px] font-mono font-bold text-brand-orange">{formatCurrency(item.price)}</span>
                    <motion.button 
                      whileTap={{ scale: 0.85 }}
                      onClick={() => addItem(item)}
                      className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-xl hover:bg-brand-orange hover:text-white transition-all shadow-xl shadow-white/5"
                    >
                      <Plus size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Heart = ({ size, fill, className }: { size: number, fill?: string, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export default Home;
