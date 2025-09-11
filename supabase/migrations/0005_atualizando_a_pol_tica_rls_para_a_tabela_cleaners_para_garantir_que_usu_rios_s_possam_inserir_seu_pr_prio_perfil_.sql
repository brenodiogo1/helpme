-- Remove a política existente para inserção de cleaners
DROP POLICY IF EXISTS "Cleaners can insert their own profile" ON public.cleaners;

-- Cria uma nova política que permite a usuários autenticados inserir um perfil de cleaner,
-- mas apenas se o user_id do perfil corresponder ao auth.uid() do usuário logado.
CREATE POLICY "Cleaners can insert their own profile" ON public.cleaners
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);