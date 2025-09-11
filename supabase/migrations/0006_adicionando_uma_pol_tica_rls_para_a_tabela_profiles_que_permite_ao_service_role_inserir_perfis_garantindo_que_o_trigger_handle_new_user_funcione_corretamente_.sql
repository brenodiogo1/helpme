-- Adiciona uma política para permitir que o service_role (usado por triggers) insira perfis.
-- Isso garante que o trigger 'handle_new_user' sempre consiga criar o perfil inicial.
CREATE POLICY "Allow service role to insert profiles" ON public.profiles
FOR INSERT TO service_role WITH CHECK (true);