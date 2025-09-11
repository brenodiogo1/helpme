import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação básica para garantir que as chaves estão presentes
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is not defined in environment variables.');
  // Você pode adicionar um toast de erro aqui se quiser
}
if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not defined in environment variables.');
  // Você pode adicionar um toast de erro aqui se quiser
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);