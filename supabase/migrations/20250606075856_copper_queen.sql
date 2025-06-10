/*
  # Add hashtag system for videos

  1. New Tables
    - `hashtags`
      - Stores unique hashtag names
    - `video_hashtags`
      - Junction table linking videos to hashtags
  
  2. Security
    - Enable RLS on new tables
    - Add policies for hashtag management
*/

-- Create hashtags table
CREATE TABLE IF NOT EXISTS hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create video_hashtags junction table
CREATE TABLE IF NOT EXISTS video_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(video_id, hashtag_id)
);

-- Enable RLS
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_hashtags ENABLE ROW LEVEL SECURITY;

-- Hashtags policies
CREATE POLICY "Hashtags are viewable by everyone"
  ON hashtags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create hashtags"
  ON hashtags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Video hashtags policies
CREATE POLICY "Video hashtags are viewable by everyone"
  ON video_hashtags FOR SELECT
  USING (true);

CREATE POLICY "Users can add hashtags to their videos"
  ON video_hashtags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE id = video_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove hashtags from their videos"
  ON video_hashtags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE id = video_id AND (user_id = auth.uid() OR is_admin())
    )
  );

-- Create function to get videos by hashtag
CREATE OR REPLACE FUNCTION get_videos_by_hashtag(hashtag_name TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  url TEXT,
  thumbnail_url TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ,
  views INTEGER,
  likes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT v.id, v.title, v.description, v.url, v.thumbnail_url, v.user_id, v.created_at, v.views, v.likes
  FROM videos v
  JOIN video_hashtags vh ON v.id = vh.video_id
  JOIN hashtags h ON vh.hashtag_id = h.id
  WHERE h.name = hashtag_name
  ORDER BY v.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get related videos by hashtags
CREATE OR REPLACE FUNCTION get_related_videos_by_hashtags(video_uuid UUID, limit_count INTEGER DEFAULT 4)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  url TEXT,
  thumbnail_url TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ,
  views INTEGER,
  likes INTEGER,
  shared_hashtags INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH video_hashtags_cte AS (
    SELECT h.name
    FROM video_hashtags vh
    JOIN hashtags h ON vh.hashtag_id = h.id
    WHERE vh.video_id = video_uuid
  ),
  related_videos AS (
    SELECT DISTINCT v.id, v.title, v.description, v.url, v.thumbnail_url, v.user_id, v.created_at, v.views, v.likes,
           COUNT(vh2.hashtag_id) as shared_hashtags
    FROM videos v
    JOIN video_hashtags vh2 ON v.id = vh2.video_id
    JOIN hashtags h2 ON vh2.hashtag_id = h2.id
    WHERE h2.name IN (SELECT name FROM video_hashtags_cte)
      AND v.id != video_uuid
    GROUP BY v.id, v.title, v.description, v.url, v.thumbnail_url, v.user_id, v.created_at, v.views, v.likes
    ORDER BY shared_hashtags DESC, v.created_at DESC
    LIMIT limit_count
  )
  SELECT * FROM related_videos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;