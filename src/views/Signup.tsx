import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, User, Mail, Lock, GraduationCap, Store, Heart, ShieldAlert, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface SignupProps {
  onBack: () => void;
  onLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onBack, onLogin }) => {
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as UserRole,
    studentId: '',
    phone: '',
    department: '',
    dietaryPrefs: [] as string[],
    allergies: [] as string[],
    budgetRange: '50-100'
  });

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      const tableName = 'profiles';

      // Ensure the profile record is created immediately to avoid 404s
      const profileData: any = {
        id: authData.user.id,
        name: formData.name,
        role: formData.role,
        student_id: formData.studentId,
        dietary_prefs: formData.dietaryPrefs,
        allergies: formData.allergies,
        budget_range: formData.budgetRange,
        updated_at: new Date().toISOString()
      };

      const { error: dbError } = await supabase.from(tableName).upsert([profileData]);
      if (dbError) {
        console.warn(`DB Upsert failed in ${tableName}:`, dbError);
      }

      if (authData.session) {
        // Instead of reload, just refresh the profile context
        await refreshProfile();
      } else {
        setError('success: Please check your email for a confirmation link.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  const togglePref = (listName: 'dietaryPrefs' | 'allergies', value: string) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].includes(value)
        ? prev[listName].filter(v => v !== value)
        : [...prev[listName], value]
    }));
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col px-6 py-12 relative overflow-y-auto">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-orange/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={step === 1 ? onBack : () => setStep(1)}
        className="w-10 h-10 flex items-center justify-center bg-[#151921] rounded-2xl border border-white/5 mb-8 z-10 hover:bg-white/5 transition-colors"
      >
        <ArrowLeft size={18} />
      </motion.button>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 z-10"
          >
             <div className="mb-10 text-center">
                <h2 className="text-4xl font-display font-bold text-white tracking-tight">Create Account</h2>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <div className="h-[2px] w-8 bg-brand-orange" />
                  <p className="text-brand-orange font-mono text-[10px] font-bold uppercase tracking-[0.3em]">Personal Details • Step 1</p>
                  <div className="h-[2px] w-8 bg-brand-orange" />
                </div>
            </div>

            <div className="space-y-5">
               <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.25em] px-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-orange transition-colors" size={16} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Maria Santos" 
                    className="w-full bg-[#151921] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-brand-orange/50 transition-all font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.25em] px-1">Account Type</label>
                <div className="grid grid-cols-1 gap-3 mt-1">
                  <button 
                    onClick={() => setFormData({...formData, role: 'STUDENT'})}
                    className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border transition-all ${formData.role === 'STUDENT' ? 'bg-brand-orange/20 border-brand-orange/50 text-brand-orange shadow-[0_0_20px_rgba(242,125,38,0.1)]' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}
                  >
                    <GraduationCap size={20} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Student / User</span>
                  </button>
                </div>
              </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.25em] px-1">Student ID Number</label>
                  <input 
                    type="text" 
                    value={formData.studentId}
                    onChange={e => setFormData({...formData, studentId: e.target.value})}
                    placeholder="e.g. 2024-12345" 
                    className="w-full bg-[#151921] border border-white/5 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-brand-orange/50 transition-all font-medium font-mono" 
                  />
                </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.25em] px-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-orange transition-colors" size={16} />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="your.email@bicol-u.edu.ph" 
                    className="w-full bg-[#151921] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-brand-orange/50 transition-all font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.25em] px-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-orange transition-colors" size={16} />
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••••••" 
                    className="w-full bg-[#151921] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-brand-orange/50 transition-all font-medium" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.25em] px-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="09XXXXXXXXX" 
                    className="w-full bg-[#151921] border border-white/5 rounded-2xl py-4 px-6 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-brand-orange/50 transition-all font-mono" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.25em] px-1">College/Dept</label>
                  <input 
                    type="text" 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g. CS / CBEM" 
                    className="w-full bg-[#151921] border border-white/5 rounded-2xl py-4 px-6 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-brand-orange/50 transition-all font-medium uppercase" 
                  />
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-5 bg-brand-orange rounded-3xl font-mono font-bold text-xs tracking-[0.2em] uppercase text-white shadow-[0_10px_30px_rgba(242,125,38,0.3)] hover:translate-y-[-2px] active:translate-y-[0] transition-all"
                disabled={!formData.name || !formData.email || formData.password.length < 6 || !formData.phone}
              >
                Next: Set Preferences
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 space-y-10 z-10"
          >
            <div className="mb-10 text-center">
                 <h2 className="text-4xl font-display font-bold text-white tracking-tight">Preferences</h2>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <div className="h-[2px] w-8 bg-brand-orange" />
                  <p className="text-brand-orange font-mono text-[10px] font-bold uppercase tracking-[0.3em]">Diet & Allergies • Step 2</p>
                  <div className="h-[2px] w-8 bg-brand-orange" />
                </div>
            </div>

            <section className="space-y-5">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.3em] px-1">
                <Heart size={14} className="text-brand-orange/50" /> Dietary Preferences
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Vegetarian', 'Vegan', 'Halal', 'No Pork', 'No Seafood', 'Gluten-Free'].map(p => (
                  <button
                    key={p}
                    onClick={() => togglePref('dietaryPrefs', p)}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest border transition-all ${formData.dietaryPrefs.includes(p) ? 'bg-brand-orange/20 border-brand-orange/50 text-brand-orange' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.3em] px-1">
                <ShieldAlert size={14} className="text-red-500/50" /> Allergy Alerts
              </div>
              <div className="flex flex-wrap gap-2">
                {['Nuts', 'Dairy', 'Eggs', 'Shellfish', 'Wheat'].map(p => (
                  <button
                    key={p}
                    onClick={() => togglePref('allergies', p)}
                    className={`px-4 py-3 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest border transition-all ${formData.allergies.includes(p) ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>

            <button 
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-5 bg-brand-orange rounded-3xl font-mono font-bold text-xs tracking-[0.2em] uppercase text-white shadow-[0_10px_30px_rgba(242,125,38,0.3)] hover:translate-y-[-2px] active:translate-y-[0] transition-all"
            >
              {loading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest text-center ${error.startsWith('success') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {error.startsWith('success') ? error.replace('success: ', '') : error}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 text-center pb-8 z-10">
        <button 
          onClick={onLogin}
          className="text-[10px] font-mono font-bold text-white/20 hover:text-brand-orange uppercase tracking-[0.3em] transition-colors"
        >
          Already have an account? <span className="text-brand-orange underline underline-offset-4">Sign In</span>
        </button>
      </div>
    </div>
  );
};

export default Signup;
