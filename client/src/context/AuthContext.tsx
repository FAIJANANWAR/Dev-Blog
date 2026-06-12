import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../types';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAuthHeaders: () => { Authorization: string } | {};
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to construct headers with the current valid JWT
  const getAuthHeaders = () => {
    if (user?.token) {
      return { Authorization: `Bearer ${user.token}` };
    }
    return {};
  };

  useEffect(() => {
    // 1. Check current session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          await syncProfile(session.user, session.access_token);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen for auth changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      if (session && session.user) {
        await syncProfile(session.user, session.access_token);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync profile data from the public.users database schema
  const syncProfile = async (authUser: any, token: string) => {
    try {
      // Query profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', authUser.id)
        .single();

      if (error || !profile) {
        // Fallback in case profile syncing trigger hasn't completed or is slow
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.raw_user_meta_data?.name || authUser.email?.split('@')[0] || 'User',
          role: (authUser.raw_user_meta_data?.role as UserRole) || 'author',
          token
        });
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: profile.name,
          role: profile.role as UserRole,
          token
        });
      }
    } catch (err) {
      console.error('Profile sync error:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'author' // New signups are always authors by default
        }
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, getAuthHeaders }}>
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
