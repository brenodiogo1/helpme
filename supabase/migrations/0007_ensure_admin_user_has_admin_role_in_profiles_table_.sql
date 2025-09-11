-- Primeiro, verifique se o usuário existe na tabela auth.users
    -- Se não existir, o usuário precisará se registrar primeiro.
    -- Supondo que o usuário já se registrou com o email brenodiogo27@icloud.com

    -- Obtenha o ID do usuário a partir do email
    DO $$
    DECLARE
        admin_user_id UUID;
    BEGIN
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'brenodiogo27@icloud.com';

        IF admin_user_id IS NOT NULL THEN
            -- Atualize ou insira o perfil do administrador
            INSERT INTO public.profiles (id, first_name, last_name, role)
            VALUES (admin_user_id, 'Breno', 'Diogo', 'admin')
            ON CONFLICT (id) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                role = EXCLUDED.role,
                updated_at = NOW();
            RAISE NOTICE 'Admin user profile updated/inserted successfully.';
        ELSE
            RAISE WARNING 'User brenodiogo27@icloud.com not found in auth.users. Please ensure the user registers first.';
        END IF;
    END $$;