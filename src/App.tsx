/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Home from './views/Home';
import Menu from './views/Menu';
import Cart from './views/Cart';
import Orders from './views/Orders';
import Profile from './views/Profile';
import Login from './views/Login';
import Signup from './views/Signup';
import Landing from './views/Landing';
import { Home as HomeIcon, Utensils, ShoppingBag, ClipboardList, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MainApp = () => {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'menu' | 'cart' | 'orders' | 'profile'>('home');
  const [selectedStallId, setSelectedStallId] = useState<string | undefined>(undefined);
  const [isAuthView, setIsAuthView] = useState<'login' | 'signup' | 'landing'>('landing');

  const handleNavigateMenu = (stallId?: string) => {
    setSelectedStallId(stallId);
    setCurrentView('menu');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0b0e14]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full mb-4"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        {isAuthView === 'landing' && (
          <Landing key="landing" onSignup={() => setIsAuthView('signup')} onLogin={() => setIsAuthView('login')} />
        )}
        {isAuthView === 'login' && (
          <Login key="login" onBack={() => setIsAuthView('landing')} onSignup={() => setIsAuthView('signup')} />
        )}
        {isAuthView === 'signup' && (
          <Signup key="signup" onBack={() => setIsAuthView('landing')} onLogin={() => setIsAuthView('login')} />
        )}
      </AnimatePresence>
    );
  }

  // Profile is being fetched or fallback is being determined
  if (!profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0b0e14]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full mb-4"
        />
        <p className="text-white/30 font-mono text-[10px] uppercase tracking-widest">Synchronizing Profile...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0b0e14] text-white">
      <main className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          {currentView === 'home' && <Home key="home" onNavigateMenu={handleNavigateMenu} />}
          {currentView === 'menu' && <Menu key="menu" initialStallId={selectedStallId} />}
          {currentView === 'cart' && <Cart key="cart" onOrders={() => setCurrentView('orders')} />}
          {currentView === 'orders' && <Orders key="orders" />}
          {currentView === 'profile' && <Profile key="profile" />}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-6 left-6 right-6 h-20 glass-card rounded-[32px] border border-white/10 flex items-center justify-around px-4 z-50 shadow-2xl">
        <NavButton active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<HomeIcon />} label="Home" />
        <NavButton active={currentView === 'menu'} onClick={() => { setSelectedStallId(undefined); setCurrentView('menu'); }} icon={<Utensils />} label="Menu" />
        <NavButton active={currentView === 'cart'} onClick={() => setCurrentView('cart')} icon={<ShoppingBag />} label="Cart" badge={0} />
        <NavButton active={currentView === 'orders'} onClick={() => setCurrentView('orders')} icon={<ClipboardList />} label="Orders" />
        <NavButton active={currentView === 'profile'} onClick={() => setCurrentView('profile')} icon={<User />} label="Profile" />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, badge }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: number }) => (
  <button 
    onClick={onClick}
    className="relative flex flex-col items-center justify-center w-16 transition-all"
  >
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.9 }}
      className={`p-2.5 rounded-2xl transition-all duration-300 ${active ? 'bg-brand-orange text-white shadow-[0_0_20px_rgba(255,107,0,0.3)]' : 'text-white/20 hover:text-white/50'}`}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    </motion.div>
    {badge !== undefined && badge > 0 && (
      <span className="absolute top-1 right-2 bg-brand-orange text-white text-[9px] font-mono font-bold w-4 h-4 flex items-center justify-center rounded-full ring-4 ring-brand-card">
        {badge}
      </span>
    )}
  </button>
);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}

