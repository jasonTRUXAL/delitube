/*
  # Make usernames unique and clean up duplicates

  1. Changes
    - Remove duplicate usernames
    - Add unique constraint on username column
    
  2. Security
    - No changes to security policies
*/

-- First, identify and update duplicate usernames
WITH duplicates AS (
  SELECT username, COUNT(*) as count
  FROM profiles
  GROUP BY username
  HAVING COUNT(*) > 1
)
UPDATE profiles p
SET username = username || '_' || gen_random_uuid()
WHERE username IN (
  SELECT username FROM duplicates
)
AND id NOT IN (
  SELECT DISTINCT ON (username) id
  FROM profiles
  WHERE username IN (SELECT username FROM duplicates)
  ORDER BY username, created_at ASC
);

-- Now add the unique constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_username_unique UNIQUE (username);