/*
  # Fix get_related_videos_by_hashtags function type mismatch

  1. Function Updates
    - Drop and recreate the `get_related_videos_by_hashtags` function
    - Fix return type mismatch for bigint vs integer columns
    - Ensure all column types match the actual data types returned

  2. Changes Made
    - Updated function signature to properly handle bigint return types
    - Fixed column type declarations to match PostgreSQL's native return types
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_related_videos_by_hashtags(uuid, integer);

-- Create the corrected function
CREATE OR REPLACE FUNCTION get_related_videos_by_hashtags(
  video_uuid uuid,
  limit_count integer DEFAULT 4
)
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
  shared_hashtags bigint
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
    COUNT(vh2.hashtag_id) as shared_hashtags
  FROM videos v
  JOIN video_hashtags vh2 ON v.id = vh2.video_id
  WHERE vh2.hashtag_id IN (
    SELECT vh1.hashtag_id
    FROM video_hashtags vh1
    WHERE vh1.video_id = video_uuid
  )
  AND v.id != video_uuid
  GROUP BY v.id, v.title, v.description, v.url, v.thumbnail_url, v.user_id, v.created_at, v.views, v.likes
  ORDER BY shared_hashtags DESC, v.created_at DESC
  LIMIT limit_count;
END;
$$;