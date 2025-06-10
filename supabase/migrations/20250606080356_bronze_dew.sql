/*
  # Fix RPC function type mismatch

  1. Database Changes
    - Update get_related_videos_by_hashtags function to cast bigint to integer
    - Ensure all returned columns match expected types

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_related_videos_by_hashtags(uuid);

-- Recreate the function with proper type casting
CREATE OR REPLACE FUNCTION get_related_videos_by_hashtags(target_video_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  url text,
  thumbnail_url text,
  user_id uuid,
  created_at timestamptz,
  views integer,
  likes integer,
  shared_hashtags integer
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    v.id,
    v.title,
    v.description,
    v.url,
    v.thumbnail_url,
    v.user_id,
    v.created_at,
    v.views,
    v.likes,
    COUNT(vh2.hashtag_id)::integer as shared_hashtags
  FROM videos v
  JOIN video_hashtags vh2 ON v.id = vh2.video_id
  WHERE vh2.hashtag_id IN (
    SELECT vh1.hashtag_id
    FROM video_hashtags vh1
    WHERE vh1.video_id = target_video_id
  )
  AND v.id != target_video_id
  GROUP BY v.id, v.title, v.description, v.url, v.thumbnail_url, v.user_id, v.created_at, v.views, v.likes
  ORDER BY shared_hashtags DESC, v.created_at DESC
  LIMIT 10;
END;
$$;