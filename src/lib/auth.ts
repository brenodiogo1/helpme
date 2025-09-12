"use client";

import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

type UserRole = 'admin' | 'cleaner' | 'provider';

export async function signInWithGoogle(role: UserRole = 'provider') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: { prompt: 'select_account' },
      data: { signup_role: role }, // trigger lê isso
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) {
    console.error("Google sign-in error:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function signUpEmailPassword(email: string, password: string, role: UserRole = 'provider', full_name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: { signup_role: role, full_name: full_name ?? '' },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) {
    console.error("Email/password sign-up error:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function linkGoogleIdentity() {
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) {
    console.error("Link Google identity error:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function routeAfterAuth() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error("Error getting user for routing:", userError);
    showError("Erro ao obter informações do usuário.");
    return window.location.assign('/login');
  }
  if (!user) {
    return window.location.assign('/login');
  }

  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for new users
    console.error("Error fetching user profile for routing:", profileError);
    showError("Erro ao carregar perfil do usuário.");
    return window.location.assign('/login');
  }

  if (!profile) {
    // This case should ideally be handled by the handle_new_user trigger,
    // but as a fallback, redirect to an onboarding or profile creation page.
    // For now, we'll redirect to login, but a dedicated onboarding is better.
    console.warn("Profile not found for user, redirecting to login as fallback.");
    showError("Seu perfil não foi encontrado. Por favor, tente novamente.");
    return window.location.assign('/login');
  }

  if (profile.role === 'admin') {
    return window.location.assign('/admin');
  }
  if (profile.role === 'cleaner') {
    if (profile.cleaner_status === 'approved') {
      return window.location.assign('/dashboard'); // Assuming /dashboard is cleaner's main page
    }
    return window.location.assign('/awaiting-approval');
  }
  return window.location.assign('/account'); // 'provider' (customer) role
}