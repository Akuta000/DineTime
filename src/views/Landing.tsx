import React from 'react';
import { motion } from 'motion/react';
import { UtensilsCrossed } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin, onSignup }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-10 text-center bg-[#0b0e14] relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-15%] right-[-15%] w-[60%] h-[60%] bg-brand-orange/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-15%] left-[-15%] w-[60%] h-[60%] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-16 relative z-10"
      >
        <div className="relative mx-auto mb-10 group w-fit">
            <div className="absolute inset-0 bg-brand-orange blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="w-24 h-24 bg-[#151921] border border-white/10 rounded-[32px] flex items-center justify-center relative z-10 shadow-2xl backdrop-blur-md">
                <UtensilsCrossed size={48} className="text-white group-hover:scale-110 transition-transform duration-500" />
            </div>
            {/* Geometric accents */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-orange translate-x-2 -translate-y-2 opacity-50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-orange -translate-x-2 translate-y-2 opacity-50" />
        </div>
        
        <h1 className="text-5xl font-display font-bold text-white mb-3 tracking-tighter">
          Dine<span className="text-brand-orange">Time</span>
        </h1>
        <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-4 bg-white/20" />
            <p className="text-white/40 font-mono text-[9px] font-bold uppercase tracking-[0.4em]">
                BU Polangui Campus Hub
            </p>
            <div className="h-[1px] w-4 bg-white/20" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-[280px] space-y-6 relative z-10"
      >
        <button 
          onClick={onSignup}
          className="w-full py-5 bg-brand-orange rounded-3xl font-mono font-bold text-xs tracking-[0.2em] uppercase text-white shadow-[0_10px_30px_rgba(242,125,38,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Get Started
        </button>
        
        <button 
          onClick={onLogin}
          className="w-full text-[10px] font-mono font-bold text-white/30 hover:text-brand-orange uppercase tracking-[0.3em] transition-colors underline-offset-4 hover:underline"
        >
          Sign In to Order
        </button>
      </motion.div>

      <div className="absolute bottom-12 flex flex-col items-center gap-2 z-10">
        <div className="h-8 w-[1px] bg-gradient-to-b from-white/20 to-transparent" />
        <div className="text-[8px] text-white/20 uppercase tracking-[0.4em] font-mono font-bold">
           BU Polangui Campus • 2026
        </div>
      </div>
    </div>
  );
};

export default Landing;
