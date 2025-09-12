-- Criar a tabela fake_active_users
CREATE TABLE public.fake_active_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (OBRIGATÓRIO para segurança)
ALTER TABLE public.fake_active_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS:
-- Permitir acesso de leitura público (se necessário para demonstração)
CREATE POLICY "Public read access for fake_active_users" ON public.fake_active_users
FOR SELECT USING (true);

-- Permitir que usuários autenticados insiram seus próprios dados (se aplicável)
CREATE POLICY "Authenticated users can insert their own fake_active_users" ON public.fake_active_users
FOR INSERT TO authenticated WITH CHECK (true); -- Ajuste conforme a necessidade de user_id se for para ser user-specific

-- Permitir que usuários autenticados atualizem seus próprios dados (se aplicável)
CREATE POLICY "Authenticated users can update their own fake_active_users" ON public.fake_active_users
FOR UPDATE TO authenticated USING (true); -- Ajuste conforme a necessidade de user_id se for para ser user-specific

-- Permitir que usuários autenticados excluam seus próprios dados (se aplicável)
CREATE POLICY "Authenticated users can delete their own fake_active_users" ON public.fake_active_users
FOR DELETE TO authenticated USING (true); -- Ajuste conforme a necessidade de user_id se for para ser user-specific

-- Inserir alguns dados de usuários falsos e ativos
INSERT INTO public.fake_active_users (name, email, status) VALUES
('João Silva', 'joao.silva@example.com', 'active'),
('Maria Souza', 'maria.souza@example.com', 'active'),
('Pedro Santos', 'pedro.santos@example.com', 'active'),
('Ana Costa', 'ana.costa@example.com', 'active'),
('Carlos Oliveira', 'carlos.oliveira@example.com', 'active');