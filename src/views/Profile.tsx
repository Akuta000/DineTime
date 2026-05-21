import React from 'react';
import { motion } from 'motion/react';
import { LogOut, Wallet, ChevronRight, Heart, ShieldAlert, Gift, Star, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Profile as ProfileType, BuyerProfile } from '../types';

const ProfilePage: React.FC = () => {
  const { profile, loading } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-brand-dark text-white">
        <p className="font-mono text-xs text-white/50 animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  const buyerProfile = profile as BuyerProfile;

  return (
    <div className="flex flex-col h-full bg-brand-dark overflow-x-hidden">
      <header className="px-6 pt-16 pb-12 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute inset-[-4px] bg-brand-orange blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="w-28 h-28 bg-brand-orange text-white rounded-[40px] flex items-center justify-center text-4xl font-display font-bold shadow-2xl relative border-4 border-brand-dark">
             {profile?.name.charAt(0) || 'U'}
          </div>
          <div className="absolute bottom-1 right-1 w-8 h-8 bg-brand-dark border-4 border-brand-dark rounded-full flex items-center justify-center">
            <div className="w-full h-full bg-emerald-500 rounded-full ring-2 ring-emerald-500/20" />
          </div>
        </div>
        
        <div className="text-center mt-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">{profile?.name}</h2>
          <div className="flex items-center justify-center gap-3">
             <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest text-white/40">
               {profile?.role}
             </span>
             <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest text-brand-orange">
               {buyerProfile?.student_id || 'ID: 2024-XXXX'}
             </span>
          </div>
        </div>
      </header>

      <div className="flex-1 px-6 space-y-8 pb-40">
        {/* Stats Bento Grid */}
        <div className="grid grid-cols-6 grid-rows-2 gap-3 h-48">
           <div className="col-span-3 row-span-2 bg-brand-orange/10 border border-brand-orange/20 rounded-3xl p-5 flex flex-col justify-between">
              <div className="w-10 h-10 bg-brand-orange rounded-2xl flex items-center justify-center text-white">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-brand-orange/60 uppercase">Credits</p>
                <h4 className="text-2xl font-display font-bold text-white">₱0.00</h4>
              </div>
           </div>
           <div className="col-span-3 row-span-1 bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-dark border border-white/5 rounded-2xl flex items-center justify-center text-brand-orange">
                <ClipboardList size={18} />
              </div>
              <div>
                <p className="text-[9px] font-mono font-bold text-white/30 uppercase">Orders</p>
                <h4 className="text-lg font-display font-bold text-white">12</h4>
              </div>
           </div>
           <div className="col-span-3 row-span-1 bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-dark border border-white/5 rounded-2xl flex items-center justify-center text-brand-orange">
                <Star size={18} />
              </div>
              <div>
                <p className="text-[9px] font-mono font-bold text-white/30 uppercase">Rank</p>
                <h4 className="text-lg font-display font-bold text-white">Elite</h4>
              </div>
           </div>
        </div>

        {/* Personal Details Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.3em] px-2">Profile Information</h3>
          <div className="bg-brand-card/50 border border-white/5 rounded-[32px] overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[9px] font-mono font-bold text-white/30 uppercase">Email Address</p>
                <p className="text-sm font-bold text-white mt-1">{profile?.email || 'UNSPECIFIED'}</p>
              </div>
              <span className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Verified</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[9px] font-mono font-bold text-white/30 uppercase">Estimated Budget</p>
                <p className="text-sm font-bold text-white mt-1">
                  ₱{buyerProfile?.budget_range || '50-100'} / meal
                </p>
              </div>
              <button className="text-[10px] font-bold text-brand-orange uppercase">Edit</button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[9px] font-mono font-bold text-white/30 uppercase">Student Registration ID</p>
                <p className="text-sm font-bold font-mono text-white mt-1">{buyerProfile?.student_id || 'NOT PROVIDED'}</p>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#f27d26]/40 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </section>

        {/* Menu Sections */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.3em] px-2">Dietary & Health Profile</h3>
          <div className="bg-brand-card/50 border border-white/5 rounded-[32px] overflow-hidden">
            <MenuButton icon={<Heart size={18} />} label="Dietary Profile" subtitle={`${buyerProfile.dietary_prefs.length} tags active`} />
            <div className="h-[1px] bg-white/5 mx-6" />
            <MenuButton icon={<ShieldAlert size={18} />} label="Security & Privacy" subtitle="Advanced protection" />
            <div className="h-[1px] bg-white/5 mx-6" />
            <MenuButton icon={<Gift size={18} />} label="Rewards Program" subtitle="3 pending gifts" />
          </div>
        </section>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full p-5 bg-rose-500/5 text-rose-500 font-bold text-[10px] uppercase font-mono tracking-[0.2em] rounded-3xl flex items-center justify-center gap-3 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5"
        >
          <LogOut size={16} /> Log Out
        </motion.button>

        <div className="py-12 text-center">
          <p className="text-[8px] font-mono font-bold tracking-[0.4em] text-white/10 uppercase font-bold">DineTime Campus Hub v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

const MenuButton = ({ icon, label, subtitle }: { icon: React.ReactNode, label: string, subtitle?: string }) => (
  <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left group">
    <div className="flex items-center gap-4">
      <div className="text-brand-orange group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold">{label}</p>
        {subtitle && <p className="text-[10px] text-gray-500 font-medium">{subtitle}</p>}
      </div>
    </div>
    <ChevronRight size={18} className="text-gray-700" />
  </button>
);

export default ProfilePage;
