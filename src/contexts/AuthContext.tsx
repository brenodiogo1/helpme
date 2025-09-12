"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { routeAfterAuth } from '@/lib/auth'; // Import the new routing function

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  userRole: string | null; // Adicionado para armazenar o role do usuário
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Estado para o role
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Keep navigate for internal component use, but routeAfterAuth handles main redirects

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state change event:", _event, "Session:", session); // Added for debugging

        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);

        let currentRole: string | null = null;

        if (session?.user) {
          // Fetch user role from the public.profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for new users
            console.error("Error fetching user profile role:", profileError);
          } else if (profile) {
            currentRole = profile.role;
          }
          setUserRole(currentRole);

          // Use routeAfterAuth for redirection after sign-in or user update
          if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
            showSuccess("Login bem-sucedido!");
            // routeAfterAuth will handle the actual window.location.assign
            // We use navigate here as a fallback or for immediate UI updates if routeAfterAuth doesn't trigger a full page reload
            if (currentRole === 'admin') {
              navigate('/admin');
            } else if (currentRole === 'cleaner') {
              if (profile?.cleaner_status === 'approved') {
                navigate('/dashboard');
              } else {
                navigate('/awaiting-approval');
              }
            } else if (currentRole === 'provider') { // 'provider' is the customer role
              navigate('/account');
            } else {
              navigate('/'); // Default redirect if no specific role dashboard
            }
          }
        } else {
          setUserRole(null);
        }

        if (_event === 'SIGNED_OUT') {
          showSuccess("Você foi desconectado.");
          navigate('/login');
        }
      }
    );

    // Initial session check (keep this as is, it sets initial state)
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      }
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);

      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, cleaner_status')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching initial user profile role:", profileError);
          setUserRole(null);
        } else if (profile) {
          setUserRole(profile.role);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    };

    getSession();

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

  return (
    <AuthContext.Provider value={{ session, user, isLoading, userRole, signOut }}>
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