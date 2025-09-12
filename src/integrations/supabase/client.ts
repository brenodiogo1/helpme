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