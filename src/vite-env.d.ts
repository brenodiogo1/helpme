/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string; // Adicionado para a chave publicável do Stripe
  // Adicione outras variáveis de ambiente aqui, se necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}