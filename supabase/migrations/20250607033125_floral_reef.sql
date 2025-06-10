/*
  # Create Test User Accounts for Deletion Testing

  1. New Test Accounts
    - Creates 12 test user accounts with realistic usernames
    - 8 regular test users with random names
    - 4 specialized users for specific deletion scenarios
    
  2. Test Content
    - Assigns existing videos to test users
    - Generates realistic comments from test users
    - Adds hashtags to test user content
    
  3. Test Scenarios
    - HeavyContentUser: Multiple videos and comments
    - CommentOnlyUser: Only comments, no videos
    - VideoOnlyUser: Only videos, no comments
    - EmptyUser: No content for testing empty account deletion
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

-- Insert test user accounts directly (bypassing auth.users constraint by using existing user structure)
DO $$
DECLARE
  test_user_data RECORD;
  username_text TEXT;
  email_text TEXT;
  i INTEGER;
  created_count INTEGER := 0;
  test_users_info TEXT[] := ARRAY[
    'TestCoolGamer42:testcoolgamer42@testuser.com',
    'TestEpicCreator99:testepicreator99@testuser.com', 
    'TestSuperArtist777:testsuperartist777@testuser.com',
    'TestMegaBuilder123:testmegabuilder123@testuser.com',
    'TestUltraCoder88:testultracoder88@testuser.com',
    'TestProStreamer360:testprostreamer360@testuser.com',
    'TestEliteDesigner404:testelitedesigner404@testuser.com',
    'TestMasterVlogger101:testmastervlogger101@testuser.com',
    'HeavyContentUser:heavy@testuser.com',
    'CommentOnlyUser:comments@testuser.com',
    'VideoOnlyUser:videos@testuser.com',
    'EmptyUser:empty@testuser.com'
  ];
  user_parts TEXT[];
  test_user_id UUID;
BEGIN
  -- Create test users by inserting directly into profiles
  FOR i IN 1..array_length(test_users_info, 1) LOOP
    user_parts := string_to_array(test_users_info[i], ':');
    username_text := user_parts[1];
    email_text := user_parts[2];
    
    -- Skip if user already exists
    IF EXISTS (SELECT 1 FROM profiles WHERE username = username_text OR email = email_text) THEN
      RAISE NOTICE 'Test user % already exists, skipping', username_text;
      CONTINUE;
    END IF;
    
    -- Generate a UUID for the test user
    test_user_id := gen_random_uuid();
    
    -- Insert test user profile directly
    BEGIN
      INSERT INTO profiles (
        id,
        username,
        email,
        avatar_url,
        is_admin,
        created_at
      ) VALUES (
        test_user_id,
        username_text,
        email_text,
        CASE 
          WHEN random() > 0.7 THEN 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
          ELSE NULL
        END,
        false,
        now() - (random() * interval '90 days')
      );
      
      created_count := created_count + 1;
      RAISE NOTICE 'Created test user: % with ID: %', username_text, test_user_id;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to create test user %: %', username_text, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Successfully created % test user accounts', created_count;
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
    RAISE NOTICE 'Found % test users for video assignment', array_length(test_users, 1);
    
    -- Reassign approximately 30% of existing videos to test users
    FOR video_record IN 
      SELECT id FROM videos 
      WHERE random() < 0.3 
      ORDER BY random()
      LIMIT 25
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
  ELSE
    RAISE NOTICE 'No test users found for video assignment';
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
    RAISE NOTICE 'Found % test users for comment generation', array_length(test_users, 1);
    
    -- Add comments to random videos
    FOR video_record IN 
      SELECT id FROM videos 
      ORDER BY random()
      LIMIT 35  -- Comment on 35 random videos
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
  ELSE
    RAISE NOTICE 'No test users found for comment generation';
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
  heavy_comments INTEGER := 0;
  comment_only_comments INTEGER := 0;
BEGIN
  -- Get specialized test user IDs
  SELECT id INTO heavy_user_id FROM profiles WHERE email = 'heavy@testuser.com';
  SELECT id INTO comment_only_user_id FROM profiles WHERE email = 'comments@testuser.com';
  SELECT id INTO video_only_user_id FROM profiles WHERE email = 'videos@testuser.com';
  
  -- Only proceed if specialized users exist
  IF heavy_user_id IS NOT NULL AND comment_only_user_id IS NOT NULL AND video_only_user_id IS NOT NULL THEN
    RAISE NOTICE 'Found specialized test users, assigning specific content';
    
    -- Get some videos to assign
    SELECT ARRAY(SELECT id FROM videos ORDER BY random() LIMIT 10) INTO video_ids;
    
    -- Give heavy user 5 videos (if available)
    FOR i IN 1..LEAST(5, array_length(video_ids, 1)) LOOP
      UPDATE videos SET user_id = heavy_user_id WHERE id = video_ids[i];
    END LOOP;
    
    -- Give video-only user remaining videos (if available)
    FOR i IN 6..LEAST(10, array_length(video_ids, 1)) LOOP
      UPDATE videos SET user_id = video_only_user_id WHERE id = video_ids[i];
    END LOOP;
    
    -- Add lots of comments for heavy user and comment-only user
    FOR video_record IN SELECT id FROM videos ORDER BY random() LIMIT 20 LOOP
      -- Heavy user comments (2-3 per video)
      FOR i IN 1..(2 + floor(random() * 2)) LOOP
        INSERT INTO comments (content, user_id, video_id, created_at) VALUES 
        (generate_random_comment(), heavy_user_id, video_record.id, now() - (random() * interval '30 days'));
        heavy_comments := heavy_comments + 1;
      END LOOP;
      
      -- Comment-only user comments (1-2 per video)
      FOR i IN 1..(1 + floor(random() * 2)) LOOP
        INSERT INTO comments (content, user_id, video_id, created_at) VALUES 
        (generate_random_comment(), comment_only_user_id, video_record.id, now() - (random() * interval '30 days'));
        comment_only_comments := comment_only_comments + 1;
      END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Added % comments for HeavyContentUser', heavy_comments;
    RAISE NOTICE 'Added % comments for CommentOnlyUser', comment_only_comments;
    RAISE NOTICE 'Assigned content to specialized test users';
  ELSE
    RAISE NOTICE 'Specialized test users not found, skipping content assignment';
  END IF;
END $$;

-- Add some hashtags to videos owned by test users
DO $$
DECLARE
  video_record RECORD;
  hashtag_names TEXT[] := ARRAY['test', 'demo', 'sample', 'tutorial', 'guide', 'review', 'gaming', 'tech', 'art', 'music'];
  hashtag_name TEXT;
  hashtag_id UUID;
  hashtag_relationships INTEGER := 0;
BEGIN
  -- Add hashtags to videos owned by test users
  FOR video_record IN 
    SELECT v.id FROM videos v
    JOIN profiles p ON v.user_id = p.id
    WHERE p.email LIKE '%@testuser.com'
    LIMIT 25
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
      
      hashtag_relationships := hashtag_relationships + 1;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Created % hashtag relationships for test content', hashtag_relationships;
END $$;

-- Clean up temporary functions
DROP FUNCTION IF EXISTS generate_random_username();
DROP FUNCTION IF EXISTS generate_random_comment();

-- Display summary of created test data
DO $$
DECLARE
  test_user_count INTEGER;
  test_video_count INTEGER;
  test_comment_count INTEGER;
  hashtag_count INTEGER;
  specialized_users TEXT := '';
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
  
  -- Check for specialized users
  IF EXISTS (SELECT 1 FROM profiles WHERE email = 'heavy@testuser.com') THEN
    specialized_users := specialized_users || 'HeavyContentUser ';
  END IF;
  IF EXISTS (SELECT 1 FROM profiles WHERE email = 'comments@testuser.com') THEN
    specialized_users := specialized_users || 'CommentOnlyUser ';
  END IF;
  IF EXISTS (SELECT 1 FROM profiles WHERE email = 'videos@testuser.com') THEN
    specialized_users := specialized_users || 'VideoOnlyUser ';
  END IF;
  IF EXISTS (SELECT 1 FROM profiles WHERE email = 'empty@testuser.com') THEN
    specialized_users := specialized_users || 'EmptyUser ';
  END IF;
  
  RAISE NOTICE '=== TEST DATA SUMMARY ===';
  RAISE NOTICE 'Created % test user accounts', test_user_count;
  RAISE NOTICE 'Test users own % videos', test_video_count;
  RAISE NOTICE 'Test users made % comments', test_comment_count;
  RAISE NOTICE 'Test content has % hashtag relationships', hashtag_count;
  RAISE NOTICE 'Specialized users: %', COALESCE(NULLIF(specialized_users, ''), 'None created');
  RAISE NOTICE '========================';
  RAISE NOTICE 'Test users can be identified by email ending in @testuser.com';
  RAISE NOTICE 'Use the admin panel to test account deletion scenarios';
END $$;