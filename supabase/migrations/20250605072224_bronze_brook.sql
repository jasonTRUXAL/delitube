/*
  # Add Insert Policy for Profiles

  1. Changes
    - Add RLS policy to allow new users to create their profile during registration
    
  2. Security
    - Policy ensures users can only create their own profile
    - Profile ID must match the authenticated user's ID
*/

CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);