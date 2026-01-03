-- Step 1: Check if user exists in auth.users
SELECT id, email, created_at FROM auth.users;

-- Step 2: Insert profile for your admin user (replace email with your actual Gmail)
INSERT INTO profiles (id, role, user_id, display_name, is_active, created_by)
SELECT 
  id,
  'admin',
  NULL,
  'Admin',
  true,
  id
FROM auth.users
WHERE email = 'your-gmail@gmail.com'  -- Replace with your actual email
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- Step 3: Verify profile was created
SELECT p.*, u.email 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'your-gmail@gmail.com';  -- Replace with your actual email
