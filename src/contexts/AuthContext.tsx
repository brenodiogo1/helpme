"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  userRole: string | null; // Adicionado para armazenar o role do usuário
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>; // Added to refresh user data and role
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Estado para o role
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserRole = async (userId: string) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, cleaner_status')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for new users
      console.error("Error fetching user profile role:", profileError);
      return null;
    }
    return profile;
  };

  const routeUser = async (sessionUser: User | null, event: string) => {
    if (!sessionUser) {
      setUserRole(null);
      if (event === 'SIGNED_OUT') {
        showSuccess("Você foi desconectado.");
        navigate('/login');
      } else if (event === 'INITIAL_SESSION') {
        // Do nothing, let other routes handle unauthenticated state
      } else {
        navigate('/login');
      }
      return;
    }

    const profile = await fetchUserRole(sessionUser.id);
    const currentRole = profile?.role || null;
    setUserRole(currentRole);

    if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      showSuccess("Login bem-sucedido!"); // Only show on explicit sign-in/update
      if (currentRole === 'admin') {
        navigate('/admin');
      } else if (currentRole === 'cleaner') {
        if (profile?.cleaner_status === 'approved') {
          navigate('/dashboard');
        } else {
          navigate('/awaiting-approval');
        }
      } else if (currentRole === 'customer') {
        navigate('/account');
      } else {
        navigate('/'); // Default redirect if no specific role dashboard
      }
    } else if (event === 'INITIAL_SESSION' && sessionUser) {
      // For initial session, just set the role, don't force navigate unless on login/register page
      // This prevents redirect loops if user is already on a protected page
      if (currentRole === 'admin' && !location.pathname.startsWith('/admin')) navigate('/admin');
      else if (currentRole === 'cleaner' && profile?.cleaner_status === 'approved' && !location.pathname.startsWith('/dashboard')) navigate('/dashboard');
      else if (currentRole === 'cleaner' && profile?.cleaner_status !== 'approved' && !location.pathname.startsWith('/awaiting-approval')) navigate('/awaiting-approval');
      else if (currentRole === 'customer' && !location.pathname.startsWith('/account')) navigate('/account');
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event, "Session:", session);

        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);

        await routeUser(session?.user || null, event);
      }
    );

    // Initial session check
    const getInitialSession = async () => {
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting initial session:", error);
      }
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setIsLoading(false);
      await routeUser(initialSession?.user || null, 'INITIAL_SESSION');
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    const toastId = showLoading("Saindo...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      dismissToast(toastId);
      showSuccess("Desconectado com sucesso!");
      setSession(null);
      setUser(null);
      setUserRole(null); // Clear role on sign out
      navigate('/login');
    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || "Erro ao desconectar.");
      console.error("Sign out error:", error);
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    const { data: { user: refreshedUser }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error refreshing user:", error);
      setIsLoading(false);
      return;
    }
    setUser(refreshedUser);
    if (refreshedUser) {
      const profile = await fetchUserRole(refreshedUser.id);
      setUserRole(profile?.role || null);
    } else {
      setUserRole(null);
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, userRole, signOut, refreshUser }}>
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