/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  // Adicione outras variáveis de ambiente aqui, se necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}