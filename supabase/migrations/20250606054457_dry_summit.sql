/*
  # Make Lavarinth an admin user

  1. Changes
    - Update Lavarinth's profile to have admin privileges
    
  2. Security
    - No changes to security policies
*/

UPDATE profiles
SET is_admin = true
WHERE username = 'Lavarinth';