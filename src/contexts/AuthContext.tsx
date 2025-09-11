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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Estado para o role
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);

        if (session?.user) {
          // Fetch user role from the public.profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for new users
            console.error("Error fetching user profile role:", profileError);
            setUserRole(null);
          } else if (profile) {
            setUserRole(profile.role);
          } else {
            setUserRole(null); // No profile found or no role set
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

    // Initial session check
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
          .select('role')
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