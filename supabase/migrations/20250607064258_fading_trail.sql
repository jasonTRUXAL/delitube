/*
  # Allow admin to create system profiles for content anonymization

  1. Security Updates
    - Update INSERT policy on profiles table to allow admins to create system profiles
    - Specifically allow creation of the deleted_user placeholder profile
    - Maintain existing security for regular user profile creation

  2. Changes
    - Modify "Users can create their own profile" policy to include admin exception
    - Allow admins to create profiles with specific system IDs for content preservation
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;

-- Create updated INSERT policy that allows admins to create system profiles
CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT
  TO public
  WITH CHECK (
    -- Regular users can only create their own profile
    (auth.uid() = id) 
    OR 
    -- Admins can create system profiles (like deleted_user placeholder)
    (
      id = '00000000-0000-0000-0000-000000000000'::uuid 
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND is_admin = true
      )
    )
  );