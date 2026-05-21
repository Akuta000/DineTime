import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, Filter, Info, Plus, Coffee, Pizza, Utensils, Sandwich, Soup, IceCream } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MenuItem, Stall } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';

interface MenuProps {
  initialStallId?: string;
}

const Menu: React.FC<MenuProps> = ({ initialStallId }) => {
  const { addItem } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [selectedStallId, setSelectedStallId] = useState<string | 'All'>(initialStallId || 'All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<'All' | 'Under 50' | '50-100' | '100+'>('All');
  const [showBudgetFilter, setShowBudgetFilter] = useState(true);
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
    const index = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % gradients.length;
    return gradients[index];
  };

  const categories = ['All', 'Filipino', 'Rice Meals', 'Snacks', 'Drinks', 'Desserts'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: itemsData } = await supabase.from('menu_items').select('*');
        setItems(itemsData as MenuItem[] || []);
        
        const { data: stallsData } = await supabase.from('stalls').select('*');
        setStalls(stallsData as Stall[] || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesStall = selectedStallId === 'All' || item.stall_id === selectedStallId;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPrice = true;
    if (selectedPriceRange === 'Under 50') {
      matchesPrice = item.price < 50;
    } else if (selectedPriceRange === '50-100') {
      matchesPrice = item.price >= 50 && item.price <= 100;
    } else if (selectedPriceRange === '100+') {
      matchesPrice = item.price > 100;
    }

    return matchesStall && matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <div className="flex flex-col h-full bg-brand-dark">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex flex-col gap-8 sticky top-0 bg-brand-dark/90 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-brand-orange/60 mb-1">Menu</p>
            <h2 className="text-2xl font-display font-bold">Campus Food Hub</h2>
          </div>
          <motion.div 
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowBudgetFilter(!showBudgetFilter)}
            className={`w-12 h-12 border rounded-2xl flex items-center justify-center cursor-pointer transition-all ${
              showBudgetFilter || selectedPriceRange !== 'All'
                ? 'bg-brand-orange/15 border-brand-orange/30 text-brand-orange shadow-[0_0_15px_rgba(242,125,38,0.1)]'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            <Filter size={18} />
          </motion.div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-orange transition-colors" size={18} />
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for snacks, meals..."
            className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-4 pl-12 focus:outline-none focus:border-brand-orange/50 focus:ring-4 focus:ring-brand-orange/5 transition-all font-medium placeholder:text-white/20"
          />
        </div>

        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
            <button
              onClick={() => setSelectedStallId('All')}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap transition-all border ${selectedStallId === 'All' ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
            >
              ALL STALLS
            </button>
            {stalls.map(stall => (
              <button
                key={stall.id}
                onClick={() => setSelectedStallId(stall.id)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap transition-all border ${selectedStallId === stall.id ? 'bg-brand-orange border-brand-orange text-white shadow-[0_0_20px_rgba(255,107,0,0.2)]' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
              >
                {stall.name.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-bold tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-brand-orange/10 text-brand-orange ring-1 ring-brand-orange/50' : 'text-white/30 hover:text-white/60'}`}
              >
                # {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showBudgetFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="flex items-center gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 overflow-hidden"
              >
                <span className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.25em] shrink-0">BUDGET:</span>
                <div className="flex gap-1.5">
                  {[
                    { label: 'ALL', value: 'All' },
                    { label: 'UNDER ₱50', value: 'Under 50' },
                    { label: '₱50 - ₱100', value: '50-100' },
                    { label: '₱100+', value: '100+' }
                  ].map(range => (
                    <button
                      key={range.value}
                      onClick={() => setSelectedPriceRange(range.value as any)}
                      className={`px-4 py-2 rounded-full text-[10px] font-mono font-bold whitespace-nowrap transition-all border ${
                        selectedPriceRange === range.value
                          ? 'bg-brand-orange border-brand-orange text-white shadow-[0_0_15px_rgba(255,107,0,0.25)]'
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedStallId !== 'All' && stalls.find(s => s.id === selectedStallId) && (() => {
          const stall = stalls.find(s => s.id === selectedStallId)!;
          const gradient = getStallGradient(stall.name);
          const isLight = gradient.includes('to-white');
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-3xl glass-card overflow-hidden relative shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
              <div className="absolute top-0 right-0 p-3 z-10">
                <div className={`flex h-1.5 w-1.5 shrink-0 rounded-full ${isLight ? 'bg-black' : 'bg-emerald-500'} animate-pulse`} />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-xl bg-white/10 flex items-center justify-center p-2`}>
                   <div className="w-full h-full rounded-lg bg-white/20 backdrop-blur-md" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-display font-bold text-sm ${isLight ? 'text-black' : 'text-white'}`}>{stall.name}</h3>
                  <p className={`text-[10px] ${isLight ? 'text-black/60' : 'text-white/40'} font-medium line-clamp-1 mt-0.5`}>{stall.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </header>

      {/* Main Content */}
      <div className="flex-1 px-6 space-y-10 pb-32 pt-8">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/5 rounded-3xl animate-pulse" />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Utensils size={32} className="text-white/10" />
            </div>
            <p className="text-white/20 font-display font-medium text-sm tracking-wide">No meals found matching your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item, idx) => {
              const stall = stalls.find(s => s.id === item.stall_id);
              return (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group relative p-4 bg-white/[0.02] border border-white/5 rounded-[32px] flex gap-5 items-center interactive-card"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-[24px] overflow-hidden shrink-0 relative flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors">
                    {item.image_url ? (
                      <img src={item.image_url} className="img-fit-cover group-hover:scale-110" />
                    ) : (
                      <div className="text-brand-orange/30 group-hover:text-brand-orange transition-all duration-500 scale-90 group-hover:scale-100">
                        {getCategoryIcon(item.category)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-brand-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-display font-bold text-sm tracking-tight text-white/90 group-hover:text-brand-orange transition-colors truncate">{item.name}</h4>
                    </div>
                    <p className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-widest mb-3">{stall?.name || 'Loading...'}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-brand-orange">{formatCurrency(item.price)}</span>
                      <motion.button 
                        whileTap={{ scale: 0.85 }}
                        onClick={() => addItem(item)}
                        className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl shadow-white/5 hover:bg-brand-orange hover:text-white transition-all overflow-hidden relative group/btn"
                      >
                        <div className="absolute inset-0 bg-brand-orange origin-left scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300" />
                        <Plus size={20} className="relative z-10" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
