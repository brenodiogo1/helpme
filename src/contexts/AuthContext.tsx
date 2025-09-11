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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);

        if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
          // Optionally, fetch user profile or role here if needed for immediate redirection
          // For now, we rely on the login component to handle initial redirection
        } else if (_event === 'SIGNED_OUT') {
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
      navigate('/login');
    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || "Erro ao desconectar.");
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut }}>
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