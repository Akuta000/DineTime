import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('dinetime_cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const cached = localStorage.getItem('dinetime_cached_profile');
      return cached ? { ...JSON.parse(cached), cached: true } : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cachedUser = localStorage.getItem('dinetime_cached_user');
      const cachedProfile = localStorage.getItem('dinetime_cached_profile');
      return !(cachedUser && cachedProfile);
    } catch {
      return true;
    }
  });

  const fetchProfile = async (uid: string, currentUser?: User | null) => {
    const userObj = currentUser || user;
    if (!userObj) return;
    
    let userRole: 'STUDENT' | 'VENDOR' = 'STUDENT';
    const rawRole = userObj?.user_metadata?.role;
    if (rawRole === 'VENDOR' || rawRole === 'vendor') {
      userRole = 'VENDOR';
    }
    const tableName = 'profiles';
    
    const fallbackProfile: Profile = {
      id: uid,
      name: userObj?.user_metadata?.name || userObj?.email?.split('@')[0] || 'User',
      email: userObj?.email || '',
      role: userRole,
      dietary_prefs: [],
      allergies: [],
      budget_range: 'Medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Fast path: Set fallback profile immediately so UX loads instantly
    setProfile(fallbackProfile);
    setLoading(false);
    try {
      localStorage.setItem('dinetime_cached_profile', JSON.stringify(fallbackProfile));
    } catch (e) {
      console.warn("Failed to set profile cache:", e);
    }

    try {
      // Direct call to Supabase to fetch the profile in background
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, let's create it in the background
          const dbPayload = {
            id: fallbackProfile.id,
            name: fallbackProfile.name,
            role: fallbackProfile.role,
            dietary_prefs: fallbackProfile.dietary_prefs,
            allergies: fallbackProfile.allergies,
            budget_range: fallbackProfile.budget_range,
            updated_at: fallbackProfile.updated_at
          };
          
          supabase
            .from(tableName as any)
            .upsert(dbPayload)
            .then(({ error: upsertError }) => {
              if (upsertError) {
                console.error("Async upsert failed:", upsertError);
              } else {
                try {
                  localStorage.setItem('dinetime_cached_profile', JSON.stringify(fallbackProfile));
                } catch (ce) {
                  console.warn("Async set cache failed", ce);
                }
              }
            });
        } else {
          console.warn(`Profile fetch error from ${tableName}:`, error);
        }
      } else if (data) {
        const freshProfile = {
          ...(data as Profile),
          email: userObj?.email || ''
        };
        // Loaded from persistence - set cached to false/omit to indicate verified fresh data
        setProfile(freshProfile);
        try {
          localStorage.setItem('dinetime_cached_profile', JSON.stringify(freshProfile));
        } catch (e) {
          console.warn("Failed to set profile cache:", e);
        }
      }
    } catch (error: any) {
      console.warn("Profile fetch error:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Safety timeout: stop loading after 5 seconds no matter what
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    const clearSupabaseStorage = () => {
      try {
        localStorage.removeItem('dinetime_cached_user');
        localStorage.removeItem('dinetime_cached_profile');
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase.auth.token'))) {
            localStorage.removeItem(key);
          }
        }
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase.auth.token'))) {
            sessionStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.error("Failed to clear Supabase storage keys:", e);
      }
    };

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn("Session fetch error during initAuth:", error);
          const errMsg = error.message || '';
          if (errMsg.includes('Refresh Token') || errMsg.includes('refresh_token') || errMsg.includes('invalid_grant') || errMsg.includes('not found')) {
            clearSupabaseStorage();
            await supabase.auth.signOut().catch(() => {});
          }
        }
        
        if (!mounted) return;
        
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            localStorage.setItem('dinetime_cached_user', JSON.stringify(session.user));
          } catch (e) {
            console.warn("Failed to set user cache", e);
          }
          // Trigger non-blocking backend load
          fetchProfile(session.user.id, session.user);
        } else {
          try {
            localStorage.removeItem('dinetime_cached_user');
            localStorage.removeItem('dinetime_cached_profile');
          } catch (e) {}
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Auth init exception:", err);
        const errMsg = err.message || '';
        if (errMsg.includes('Refresh Token') || errMsg.includes('refresh_token') || errMsg.includes('invalid_grant') || errMsg.includes('not found')) {
          clearSupabaseStorage();
          await supabase.auth.signOut().catch(() => {});
        }
        if (mounted) setLoading(false);
      } finally {
        if (mounted) {
          clearTimeout(timeout);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setUser(currentUser);
        if (currentUser) {
          try {
            localStorage.setItem('dinetime_cached_user', JSON.stringify(currentUser));
          } catch (e) {
            console.warn("Failed to set user cache", e);
          }
          // Non-blocking trigger
          fetchProfile(currentUser.id, currentUser);
        } else {
          if (mounted) setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        try {
          localStorage.removeItem('dinetime_cached_user');
          localStorage.removeItem('dinetime_cached_profile');
        } catch (e) {}
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
