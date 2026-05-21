import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface LoginProps {
  onBack: () => void;
  onSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack, onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          setError('Email not confirmed. Please check your inbox for the confirmation link.');
        } else if (authError.message.toLowerCase().includes('failed to fetch') || authError.message.toLowerCase().includes('network') || !isSupabaseConfigured) {
          setError('Connection Error: Unable to reach your database. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly as environment variables in your Vercel Project Settings, then rebuild/re-deploy.');
        } else if (authError.status === 400 || authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      // If success, we don't setLoading(false) yet to prevent double clicks 
      // while the AuthContext catches up and App switches views.
      console.log("Login successful, waiting for session update...");
    } catch (err: any) {
      console.error("Login exception:", err);
      let msg = 'An unexpected error occurred. Please try again.';
      if (err?.message?.toLowerCase().includes('failed to fetch') || err?.toString()?.toLowerCase().includes('failed to fetch') || !isSupabaseConfigured) {
        msg = 'Connection Error: Unable to reach your database. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly as environment variables in your Vercel Project Settings, then rebuild/re-deploy.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#0b0e14] flex flex-col px-6 py-12 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-orange/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="w-10 h-10 flex items-center justify-center bg-[#151921] rounded-2xl border border-white/5 mb-12 z-10 hover:bg-white/5 transition-colors shadow-2xl"
      >
        <ArrowLeft size={18} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 z-10 text-center"
      >
        <h2 className="text-4xl font-display font-bold text-white tracking-tight">Welcome Back</h2>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="h-[2px] w-8 bg-brand-orange" />
          <p className="text-brand-orange font-mono text-[10px] font-bold uppercase tracking-[0.3em]">Sign in to your account</p>
          <div className="h-[2px] w-8 bg-brand-orange" />
        </div>
      </motion.div>

      {!isSupabaseConfigured && (
        <div className="mb-8 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left z-10">
          <h4 className="text-amber-500 font-mono font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            ⚠️ Supabase Keys Missing on Vercel
          </h4>
          <p className="text-white/80 text-xs leading-relaxed">
            To sign in or register on your deployed site, please configure your Supabase variables:
          </p>
          <ol className="list-decimal pl-5 mt-3 space-y-1.5 text-white/70 font-mono text-[10px] uppercase tracking-wider">
            <li>Go to your <strong className="text-amber-500">Vercel Dashboard</strong></li>
            <li>Open <strong className="text-amber-500">Project Settings &rarr; Environment Variables</strong></li>
            <li>Add <strong className="text-white font-extrabold">VITE_SUPABASE_URL</strong></li>
            <li>Add <strong className="text-white font-extrabold">VITE_SUPABASE_ANON_KEY</strong></li>
            <li>Redeploy the project on Vercel</li>
          </ol>
          <div className="mt-3 text-[10px] text-white/40 leading-relaxed italic">
            Note: Email confirmation is enabled in Supabase by default. If your users aren't signing in instantly, disable "Confirm email" under <strong className="text-white">Authentication &rarr; Providers &rarr; Email</strong> in your Supabase Dashboard.
          </div>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6 z-10">
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.25em] px-1">
            Email Address
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-orange transition-colors" size={16} />
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@bicol-u.edu.ph"
              className="w-full bg-[#151921] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-brand-orange/50 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.25em] px-1">
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-orange transition-colors" size={16} />
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#151921] border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-brand-orange/50 transition-all font-medium"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
          >
            <p className="text-red-500 text-[10px] font-mono font-bold uppercase tracking-widest leading-relaxed text-center">{error}</p>
          </motion.div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-brand-orange rounded-3xl font-mono font-bold text-xs tracking-[0.2em] uppercase text-white shadow-[0_10px_30px_rgba(242,125,38,0.3)] hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50"
        >
          {loading ? 'Logging In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-auto text-center pb-8 z-10">
        <button 
          onClick={onSignup}
          className="text-[10px] font-mono font-bold text-white/20 hover:text-brand-orange uppercase tracking-[0.3em] transition-colors"
        >
          Don't have an account? <span className="text-brand-orange underline underline-offset-4">Sign Up</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
