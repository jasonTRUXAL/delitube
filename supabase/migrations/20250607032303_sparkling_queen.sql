/*
  # Generate test accounts and content for deletion testing

  1. New Test Data
    - Create test profiles based on existing auth users
    - Reassign some videos to create test scenarios
    - Generate realistic comments from test users
    - Add hashtags to test user content
  
  2. Test Scenarios
    - Heavy content users (videos + comments)
    - Comment-only users
    - Video-only users  
    - Empty users (no content)
    
  3. Security
    - Uses existing auth users to avoid foreign key issues
    - Maintains RLS policies
*/

-- Create function to generate random usernames
CREATE OR REPLACE FUNCTION generate_random_username()
RETURNS TEXT AS $$
DECLARE
  adjectives TEXT[] := ARRAY['Cool', 'Epic', 'Super', 'Mega', 'Ultra', 'Pro', 'Elite', 'Master', 'Ninja', 'Cyber'];
  nouns TEXT[] := ARRAY['Gamer', 'Creator', 'Artist', 'Explorer', 'Builder', 'Maker', 'Coder', 'Designer', 'Streamer', 'Vlogger'];
  numbers TEXT[] := ARRAY['42', '99', '2024', '777', '123', '88', '2000', '360', '404', '101'];
BEGIN
  RETURN (
    adjectives[1 + floor(random() * array_length(adjectives, 1))] ||
    nouns[1 + floor(random() * array_length(nouns, 1))] ||
    numbers[1 + floor(random() * array_length(numbers, 1))]
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to generate random comments
CREATE OR REPLACE FUNCTION generate_random_comment()
RETURNS TEXT AS $$
DECLARE
  comments TEXT[] := ARRAY[
    'This is amazing! Great work!',
    'Love this content, keep it up!',
    'Incredible video, thanks for sharing!',
    'This helped me so much, thank you!',
    'Awesome tutorial, very clear explanation!',
    'Can''t wait to see more content like this!',
    'This is exactly what I was looking for!',
    'Great quality and very informative!',
    'You''re so talented, amazing work!',
    'This deserves more views!',
    'Fantastic content, subscribed!',
    'This is so cool, how did you do this?',
    'Perfect timing, I needed this!',
    'Your content always inspires me!',
    'This is professional level work!',
    'Thanks for the detailed explanation!',
    'This video made my day!',
    'Incredible skills on display here!',
    'This is why I love this platform!',
    'Keep creating amazing content!'
  ];
BEGIN
  RETURN comments[1 + floor(random() * array_length(comments, 1))];
END;
$$ LANGUAGE plpgsql;

-- Create test user profiles by modifying existing users to be test accounts
DO $$
DECLARE
  existing_users UUID[];
  user_id UUID;
  username_text TEXT;
  email_text TEXT;
  i INTEGER;
  test_count INTEGER := 0;
BEGIN
  -- Get existing user IDs (excluding admin users)
  SELECT ARRAY(
    SELECT id FROM profiles 
    WHERE is_admin = false 
    AND email NOT LIKE '%@testuser.com'
    ORDER BY created_at DESC 
    LIMIT 10
  ) INTO existing_users;
  
  -- Convert some existing users to test users
  FOR i IN 1..LEAST(array_length(existing_users, 1), 8) LOOP
    user_id := existing_users[i];
    
    -- Generate unique test username and email
    username_text := 'Test' || generate_random_username();
    email_text := lower(username_text) || '@testuser.com';
    
    -- Ensure username is unique
    WHILE EXISTS (SELECT 1 FROM profiles WHERE username = username_text) LOOP
      username_text := 'Test' || generate_random_username();
      email_text := lower(username_text) || '@testuser.com';
    END LOOP;
    
    -- Update existing user to be a test user
    UPDATE profiles SET
      username = username_text,
      email = email_text,
      avatar_url = CASE 
        WHEN random() > 0.7 THEN 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
        ELSE NULL
      END,
      created_at = now() - (random() * interval '90 days')
    WHERE id = user_id;
    
    test_count := test_count + 1;
    RAISE NOTICE 'Converted user to test account: %', username_text;
  END LOOP;
  
  RAISE NOTICE 'Created % test user accounts', test_count;
END $$;

-- Create specialized test users by updating existing profiles
DO $$
DECLARE
  available_users UUID[];
  heavy_user_id UUID;
  comment_only_user_id UUID;
  video_only_user_id UUID;
  empty_user_id UUID;
BEGIN
  -- Get available non-admin users that aren't already test users
  SELECT ARRAY(
    SELECT id FROM profiles 
    WHERE is_admin = false 
    AND email NOT LIKE '%@testuser.com'
    ORDER BY created_at DESC 
    LIMIT 4
  ) INTO available_users;
  
  -- Only proceed if we have enough users
  IF array_length(available_users, 1) >= 4 THEN
    heavy_user_id := available_users[1];
    comment_only_user_id := available_users[2];
    video_only_user_id := available_users[3];
    empty_user_id := available_users[4];
    
    -- Update users to be specialized test accounts
    UPDATE profiles SET
      username = 'HeavyContentUser',
      email = 'heavy@testuser.com',
      created_at = now() - interval '60 days'
    WHERE id = heavy_user_id;
    
    UPDATE profiles SET
      username = 'CommentOnlyUser',
      email = 'comments@testuser.com',
      created_at = now() - interval '45 days'
    WHERE id = comment_only_user_id;
    
    UPDATE profiles SET
      username = 'VideoOnlyUser',
      email = 'videos@testuser.com',
      created_at = now() - interval '30 days'
    WHERE id = video_only_user_id;
    
    UPDATE profiles SET
      username = 'EmptyUser',
      email = 'empty@testuser.com',
      created_at = now() - interval '15 days'
    WHERE id = empty_user_id;
    
    RAISE NOTICE 'Created specialized test users for deletion testing';
  ELSE
    RAISE NOTICE 'Not enough available users to create specialized test accounts';
  END IF;
END $$;

-- Reassign some existing videos to test users (about 30% of videos)
DO $$
DECLARE
  video_record RECORD;
  test_users UUID[];
  random_user_id UUID;
  reassign_count INTEGER := 0;
BEGIN
  -- Get all test user IDs
  SELECT ARRAY(
    SELECT id FROM profiles 
    WHERE email LIKE '%@testuser.com' 
    ORDER BY created_at DESC
  ) INTO test_users;
  
  -- Only proceed if we have test users
  IF array_length(test_users, 1) > 0 THEN
    -- Reassign approximately 30% of existing videos to test users
    FOR video_record IN 
      SELECT id FROM videos 
      WHERE random() < 0.3 
      ORDER BY random()
      LIMIT 20
    LOOP
      -- Pick a random test user
      random_user_id := test_users[1 + floor(random() * array_length(test_users, 1))];
      
      -- Update video ownership
      UPDATE videos 
      SET user_id = random_user_id,
          created_at = now() - (random() * interval '60 days')
      WHERE id = video_record.id;
      
      reassign_count := reassign_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Reassigned % videos to test users', reassign_count;
  END IF;
END $$;

-- Generate comments from test users on existing videos
DO $$
DECLARE
  video_record RECORD;
  test_users UUID[];
  random_user_id UUID;
  comment_count INTEGER;
  i INTEGER;
  total_comments INTEGER := 0;
BEGIN
  -- Get all test user IDs
  SELECT ARRAY(
    SELECT id FROM profiles 
    WHERE email LIKE '%@testuser.com'
  ) INTO test_users;
  
  -- Only proceed if we have test users
  IF array_length(test_users, 1) > 0 THEN
    -- Add comments to random videos
    FOR video_record IN 
      SELECT id FROM videos 
      ORDER BY random()
      LIMIT 30  -- Comment on 30 random videos
    LOOP
      -- Generate 1-5 comments per video
      comment_count := 1 + floor(random() * 5);
      
      FOR i IN 1..comment_count LOOP
        -- Pick a random test user
        random_user_id := test_users[1 + floor(random() * array_length(test_users, 1))];
        
        -- Insert comment
        INSERT INTO comments (
          content,
          user_id,
          video_id,
          created_at
        ) VALUES (
          generate_random_comment(),
          random_user_id,
          video_record.id,
          now() - (random() * interval '30 days')
        );
        
        total_comments := total_comments + 1;
      END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Generated % comments from test users', total_comments;
  END IF;
END $$;

-- Assign specific content to specialized test users
DO $$
DECLARE
  heavy_user_id UUID;
  comment_only_user_id UUID;
  video_only_user_id UUID;
  video_ids UUID[];
  video_record RECORD;
  i INTEGER;
BEGIN
  -- Get specialized test user IDs
  SELECT id INTO heavy_user_id FROM profiles WHERE email = 'heavy@testuser.com';
  SELECT id INTO comment_only_user_id FROM profiles WHERE email = 'comments@testuser.com';
  SELECT id INTO video_only_user_id FROM profiles WHERE email = 'videos@testuser.com';
  
  -- Only proceed if specialized users exist
  IF heavy_user_id IS NOT NULL AND comment_only_user_id IS NOT NULL AND video_only_user_id IS NOT NULL THEN
    -- Get some videos to assign
    SELECT ARRAY(SELECT id FROM videos ORDER BY random() LIMIT 8) INTO video_ids;
    
    -- Give heavy user 5 videos (if available)
    FOR i IN 1..LEAST(5, array_length(video_ids, 1)) LOOP
      UPDATE videos SET user_id = heavy_user_id WHERE id = video_ids[i];
    END LOOP;
    
    -- Give video-only user remaining videos (if available)
    FOR i IN 6..LEAST(8, array_length(video_ids, 1)) LOOP
      UPDATE videos SET user_id = video_only_user_id WHERE id = video_ids[i];
    END LOOP;
    
    -- Add lots of comments for heavy user and comment-only user
    FOR video_record IN SELECT id FROM videos ORDER BY random() LIMIT 15 LOOP
      -- Heavy user comments
      INSERT INTO comments (content, user_id, video_id, created_at) VALUES 
      (generate_random_comment(), heavy_user_id, video_record.id, now() - (random() * interval '30 days'));
      
      -- Comment-only user comments  
      INSERT INTO comments (content, user_id, video_id, created_at) VALUES 
      (generate_random_comment(), comment_only_user_id, video_record.id, now() - (random() * interval '30 days'));
    END LOOP;
    
    RAISE NOTICE 'Assigned content to specialized test users';
  END IF;
END $$;

-- Add some hashtags to videos owned by test users
DO $$
DECLARE
  video_record RECORD;
  hashtag_names TEXT[] := ARRAY['test', 'demo', 'sample', 'tutorial', 'guide', 'review', 'gaming', 'tech', 'art', 'music'];
  hashtag_name TEXT;
  hashtag_id UUID;
BEGIN
  -- Add hashtags to videos owned by test users
  FOR video_record IN 
    SELECT v.id FROM videos v
    JOIN profiles p ON v.user_id = p.id
    WHERE p.email LIKE '%@testuser.com'
    LIMIT 20
  LOOP
    -- Add 1-3 random hashtags per video
    FOR i IN 1..(1 + floor(random() * 3)) LOOP
      hashtag_name := hashtag_names[1 + floor(random() * array_length(hashtag_names, 1))];
      
      -- Get or create hashtag
      SELECT id INTO hashtag_id FROM hashtags WHERE name = hashtag_name;
      
      IF hashtag_id IS NULL THEN
        INSERT INTO hashtags (name) VALUES (hashtag_name) RETURNING id INTO hashtag_id;
      END IF;
      
      -- Link video to hashtag (ignore duplicates)
      INSERT INTO video_hashtags (video_id, hashtag_id) 
      VALUES (video_record.id, hashtag_id)
      ON CONFLICT (video_id, hashtag_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Clean up temporary functions
DROP FUNCTION generate_random_username();
DROP FUNCTION generate_random_comment();

-- Display summary of created test data
DO $$
DECLARE
  test_user_count INTEGER;
  test_video_count INTEGER;
  test_comment_count INTEGER;
  hashtag_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO test_user_count FROM profiles WHERE email LIKE '%@testuser.com';
  
  SELECT COUNT(*) INTO test_video_count 
  FROM videos v 
  JOIN profiles p ON v.user_id = p.id 
  WHERE p.email LIKE '%@testuser.com';
  
  SELECT COUNT(*) INTO test_comment_count 
  FROM comments c 
  JOIN profiles p ON c.user_id = p.id 
  WHERE p.email LIKE '%@testuser.com';
  
  SELECT COUNT(*) INTO hashtag_count
  FROM video_hashtags vh
  JOIN videos v ON vh.video_id = v.id
  JOIN profiles p ON v.user_id = p.id
  WHERE p.email LIKE '%@testuser.com';
  
  RAISE NOTICE '=== TEST DATA SUMMARY ===';
  RAISE NOTICE 'Created % test user accounts', test_user_count;
  RAISE NOTICE 'Test users own % videos', test_video_count;
  RAISE NOTICE 'Test users made % comments', test_comment_count;
  RAISE NOTICE 'Test content has % hashtag relationships', hashtag_count;
  RAISE NOTICE '========================';
END $$;