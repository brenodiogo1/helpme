import { createClient } from '@supabase/supabase-js';
import { showError } from '@/utils/toast'; // Importar showError

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação básica para garantir que as chaves estão presentes
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is not defined in environment variables.');
  showError('Erro: VITE_SUPABASE_URL não definida. Verifique seu arquivo .env');
}
if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not defined in environment variables.');
  showError('Erro: VITE_SUPABASE_ANON_KEY não definida. Verifique seu arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// New authentication functions
export async function signInWithGoogle(role: 'customer' | 'cleaner' = 'customer') {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: { prompt: 'select_account' },
      data: { signup_role: role }, // trigger lê isso
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
}

export async function signUpEmailPassword(email: string, password: string, role: 'customer' | 'cleaner' = 'customer', full_name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: { signup_role: role, full_name: full_name ?? '' },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) throw error;
  return { data, error }; // Return the full AuthResponse object
}

export async function linkGoogleIdentity() {
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'google',
    // Browser: redireciona automaticamente; server: tratar URL de retorno
  });
  if (error) throw error;
  return data;
}

// This function will be integrated into AuthContext for centralized routing
export async function routeAfterAuth(userRole: string | null, navigate: (path: string) => void) {
  if (!userRole) {
    navigate('/login');
    return;
  }

  if (userRole === 'admin') {
    navigate('/admin');
  } else if (userRole === 'cleaner') {
    // Fetch cleaner_status
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('cleaner_status')
      .eq('id', supabase.auth.getUser().then(res => res.data.user?.id))
      .single();

    if (error) {
      console.error("Error fetching cleaner status:", error);
      navigate('/login'); // Fallback
      return;
    }

    if (profile?.cleaner_status === 'approved') {
      navigate('/dashboard'); // Cleaner dashboard
    } else {
      navigate('/awaiting-approval'); // Cleaner awaiting approval
    }
  } else if (userRole === 'customer') {
    navigate('/account'); // Customer dashboard
  } else {
    navigate('/'); // Default fallback
  }
}