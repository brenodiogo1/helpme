UPDATE public.profiles
    SET role = 'admin'
    WHERE id = (SELECT id FROM auth.users WHERE email = 'brenodiogo27@icloud.com');