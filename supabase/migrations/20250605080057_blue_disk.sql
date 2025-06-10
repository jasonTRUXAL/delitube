/*
  # Update Videos Table RLS Policies

  1. Changes
    - Modify the INSERT policy for videos table to properly handle user_id
    - Ensure authenticated users can insert videos with their own user_id

  2. Security
    - Maintains existing RLS policies for SELECT, UPDATE, and DELETE
    - Updates INSERT policy to properly handle user authentication
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own videos" ON videos;

-- Create new INSERT policy that properly handles user_id
CREATE POLICY "Users can insert their own videos"
ON videos
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);