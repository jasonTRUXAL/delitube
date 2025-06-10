-- Create function to get videos by hashtag with proper return type
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