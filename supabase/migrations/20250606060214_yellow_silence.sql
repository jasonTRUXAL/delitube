-- Create a function to generate random titles and descriptions
CREATE OR REPLACE FUNCTION generate_random_video_title()
RETURNS TEXT AS $$
DECLARE
  adjectives TEXT[] := ARRAY['Amazing', 'Incredible', 'Awesome', 'Ultimate', 'Essential', 'Professional', 'Creative', 'Innovative', 'Exciting', 'Perfect'];
  topics TEXT[] := ARRAY['Tutorial', 'Guide', 'Review', 'Walkthrough', 'Tips', 'Tricks', 'Showcase', 'Demo', 'Highlights', 'Series'];
  subjects TEXT[] := ARRAY['Photography', 'Cooking', 'Gaming', 'Travel', 'Technology', 'Art', 'Music', 'Sports', 'Science', 'Nature'];
BEGIN
  RETURN (
    adjectives[1 + floor(random() * array_length(adjectives, 1))] || ' ' ||
    subjects[1 + floor(random() * array_length(subjects, 1))] || ' ' ||
    topics[1 + floor(random() * array_length(topics, 1))] || ' #' ||
    (floor(random() * 100)::TEXT)
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_random_description()
RETURNS TEXT AS $$
DECLARE
  intros TEXT[] := ARRAY[
    'Check out this amazing',
    'Welcome to my latest',
    'Excited to share this',
    'Here''s a comprehensive',
    'Don''t miss this incredible'
  ];
  content_types TEXT[] := ARRAY[
    'tutorial', 'guide', 'video', 'walkthrough', 'showcase'
  ];
  topics TEXT[] := ARRAY[
    'photography techniques',
    'cooking recipes',
    'gaming strategies',
    'travel destinations',
    'tech reviews',
    'art projects',
    'music production',
    'sports highlights',
    'scientific experiments',
    'nature discoveries'
  ];
BEGIN
  RETURN (
    intros[1 + floor(random() * array_length(intros, 1))] || ' ' ||
    content_types[1 + floor(random() * array_length(content_types, 1))] || ' about ' ||
    topics[1 + floor(random() * array_length(topics, 1))] || '. ' ||
    'Like and subscribe for more content like this!'
  );
END;
$$ LANGUAGE plpgsql;

-- Get the current count of videos
DO $$
DECLARE
  current_count INTEGER;
  needed_duplicates INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count FROM videos;
  needed_duplicates := GREATEST(0, 50 - current_count);

  -- Only proceed if we need more videos
  IF needed_duplicates > 0 THEN
    -- Duplicate existing videos with random variations
    WITH RECURSIVE video_generator AS (
      -- Base case: Get existing videos
      SELECT 
        id, 
        url, 
        thumbnail_url, 
        user_id, 
        1 as iteration,
        ROW_NUMBER() OVER () as source_video_num
      FROM videos
      
      UNION ALL
      
      -- Recursive case: Generate more videos
      SELECT 
        v.id,
        v.url,
        v.thumbnail_url,
        v.user_id,
        vg.iteration + 1,
        vg.source_video_num
      FROM videos v
      CROSS JOIN video_generator vg
      WHERE (vg.source_video_num * vg.iteration) <= needed_duplicates
    )
    INSERT INTO videos (
      title,
      description,
      url,
      thumbnail_url,
      user_id,
      created_at,
      views,
      likes
    )
    SELECT
      generate_random_video_title(),
      generate_random_description(),
      url,
      thumbnail_url,
      user_id,
      now() - (random() * interval '30 days'),  -- Random date within last 30 days
      floor(random() * 1000)::int,  -- Random views between 0 and 999
      floor(random() * 100)::int    -- Random likes between 0 and 99
    FROM video_generator
    WHERE iteration > 1  -- Skip the original videos
    LIMIT needed_duplicates;
  END IF;
END $$;

-- Clean up our temporary functions
DROP FUNCTION generate_random_video_title();
DROP FUNCTION generate_random_description();