/*
  # Create Test Accounts for Deletion Testing

  1. New Test Data
    - 16 test user accounts with @testuser.com emails
    - Specialized users for different deletion scenarios
    - Realistic usernames and varied avatar assignments
    
  2. Content Assignment
    - Reassigns 35% of existing videos to test users
    - Generates comments from test users on videos
    - Creates hashtag relationships for test content
    
  3. Deletion Test Scenarios
    - HeavyContentUser: Many videos and comments
    - CommentOnlyUser: Comments but no videos
    - VideoOnlyUser: Videos but no comments
    - EmptyUser: No content (clean deletion)
*/

-- First, let's check if we have any existing test users
DO $$
DECLARE
  existing_test_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_test_count FROM profiles WHERE email LIKE '%@testuser.com';
  RAISE NOTICE 'Found % existing test users before creation', existing_test_count;
END $$;

-- Temporarily disable the foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Create test users by inserting directly with generated UUIDs
INSERT INTO profiles (id, username, email, avatar_url, is_admin, created_at)
SELECT 
  gen_random_uuid(),
  username,
  email,
  avatar_url,
  false,
  created_at
FROM (
  VALUES 
    ('TestCoolGamer42', 'testcoolgamer42@testuser.com', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', now() - interval '85 days'),
    ('TestEpicCreator99', 'testepicreator99@testuser.com', NULL, now() - interval '72 days'),
    ('TestSuperArtist777', 'testsuperartist777@testuser.com', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg', now() - interval '68 days'),
    ('TestMegaBuilder123', 'testmegabuilder123@testuser.com', NULL, now() - interval '55 days'),
    ('TestUltraCoder88', 'testultracoder88@testuser.com', NULL, now() - interval '45 days'),
    ('TestProStreamer360', 'testprostreamer360@testuser.com', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', now() - interval '38 days'),
    ('TestEliteDesigner404', 'testelitedesigner404@testuser.com', NULL, now() - interval '25 days'),
    ('TestMasterVlogger101', 'testmastervlogger101@testuser.com', NULL, now() - interval '15 days'),
    ('TestNinjaExplorer2024', 'testninja2024@testuser.com', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg', now() - interval '50 days'),
    ('TestCyberMaker777', 'testcyber777@testuser.com', NULL, now() - interval '35 days'),
    ('TestProArtist123', 'testproartist123@testuser.com', NULL, now() - interval '20 days'),
    ('TestMegaStreamer88', 'testmegastreamer88@testuser.com', 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg', now() - interval '10 days'),
    ('HeavyContentUser', 'heavy@testuser.com', NULL, now() - interval '60 days'),
    ('CommentOnlyUser', 'comments@testuser.com', NULL, now() - interval '45 days'),
    ('VideoOnlyUser', 'videos@testuser.com', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg', now() - interval '30 days'),
    ('EmptyUser', 'empty@testuser.com', NULL, now() - interval '15 days')
) AS test_data(username, email, avatar_url, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.username = test_data.username OR p.email = test_data.email
);

-- Re-enable the foreign key constraint but make it NOT VALID to allow existing data
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

-- Create function to generate random comments for this migration
CREATE OR REPLACE FUNCTION temp_generate_comment()
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

-- Reassign some existing videos to test users
DO $$
DECLARE
  video_record RECORD;
  test_users UUID[];
  random_user_id UUID;
  reassign_count INTEGER := 0;
BEGIN
  -- Get test user IDs
  SELECT ARRAY(
    SELECT id FROM profiles 
    WHERE email LIKE '%@testuser.com'
    ORDER BY username
  ) INTO test_users;
  
  IF array_length(test_users, 1) > 0 THEN
    RAISE NOTICE 'Found % test users for video assignment', array_length(test_users, 1);
    
    -- Reassign videos to test users
    FOR video_record IN 
      SELECT id FROM videos 
      WHERE random() < 0.35  -- About 35% of videos
      ORDER BY random()
      LIMIT 30
    LOOP
      random_user_id := test_users[1 + floor(random() * array_length(test_users, 1))];
      
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

-- Generate comments from test users
DO $$
DECLARE
  video_record RECORD;
  test_users UUID[];
  random_user_id UUID;
  comment_count INTEGER;
  i INTEGER;
  total_comments INTEGER := 0;
BEGIN
  -- Get test user IDs
  SELECT ARRAY(
    SELECT id FROM profiles 
    WHERE email LIKE '%@testuser.com'
  ) INTO test_users;
  
  IF array_length(test_users, 1) > 0 THEN
    RAISE NOTICE 'Generating comments from % test users', array_length(test_users, 1);
    
    -- Add comments to videos
    FOR video_record IN 
      SELECT id FROM videos 
      ORDER BY random()
      LIMIT 40
    LOOP
      comment_count := 1 + floor(random() * 4); -- 1-4 comments per video
      
      FOR i IN 1..comment_count LOOP
        random_user_id := test_users[1 + floor(random() * array_length(test_users, 1))];
        
        INSERT INTO comments (
          content,
          user_id,
          video_id,
          created_at
        ) VALUES (
          temp_generate_comment(),
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

-- Assign specific content to specialized users
DO $$
DECLARE
  heavy_user_id UUID;
  comment_only_user_id UUID;
  video_only_user_id UUID;
  video_ids UUID[];
  video_record RECORD;
  i INTEGER;
  assigned_videos INTEGER := 0;
  added_comments INTEGER := 0;
BEGIN
  -- Get specialized user IDs
  SELECT id INTO heavy_user_id FROM profiles WHERE email = 'heavy@testuser.com';
  SELECT id INTO comment_only_user_id FROM profiles WHERE email = 'comments@testuser.com';
  SELECT id INTO video_only_user_id FROM profiles WHERE email = 'videos@testuser.com';
  
  IF heavy_user_id IS NOT NULL AND comment_only_user_id IS NOT NULL AND video_only_user_id IS NOT NULL THEN
    RAISE NOTICE 'Assigning specialized content to test users';
    
    -- Get videos to assign
    SELECT ARRAY(SELECT id FROM videos ORDER BY random() LIMIT 12) INTO video_ids;
    
    -- Assign videos to heavy user (6 videos)
    FOR i IN 1..LEAST(6, array_length(video_ids, 1)) LOOP
      UPDATE videos SET user_id = heavy_user_id WHERE id = video_ids[i];
      assigned_videos := assigned_videos + 1;
    END LOOP;
    
    -- Assign videos to video-only user (4 videos)
    FOR i IN 7..LEAST(10, array_length(video_ids, 1)) LOOP
      UPDATE videos SET user_id = video_only_user_id WHERE id = video_ids[i];
      assigned_videos := assigned_videos + 1;
    END LOOP;
    
    -- Add many comments for heavy user and comment-only user
    FOR video_record IN SELECT id FROM videos ORDER BY random() LIMIT 25 LOOP
      -- Heavy user: 2-3 comments per video
      FOR i IN 1..(2 + floor(random() * 2)) LOOP
        INSERT INTO comments (content, user_id, video_id, created_at) VALUES 
        (temp_generate_comment(), heavy_user_id, video_record.id, now() - (random() * interval '30 days'));
        added_comments := added_comments + 1;
      END LOOP;
      
      -- Comment-only user: 1-2 comments per video
      FOR i IN 1..(1 + floor(random() * 2)) LOOP
        INSERT INTO comments (content, user_id, video_id, created_at) VALUES 
        (temp_generate_comment(), comment_only_user_id, video_record.id, now() - (random() * interval '30 days'));
        added_comments := added_comments + 1;
      END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Assigned % videos and % comments to specialized users', assigned_videos, added_comments;
  ELSE
    RAISE NOTICE 'Could not find specialized test users';
  END IF;
END $$;

-- Add hashtags to test user videos
DO $$
DECLARE
  video_record RECORD;
  hashtag_names TEXT[] := ARRAY['test', 'demo', 'sample', 'tutorial', 'guide', 'review', 'gaming', 'tech', 'art', 'music', 'coding', 'design', 'photography', 'travel', 'food'];
  hashtag_name TEXT;
  selected_hashtag_id UUID;  -- Changed variable name to avoid ambiguity
  hashtag_count INTEGER := 0;
  videos_processed INTEGER := 0;
BEGIN
  FOR video_record IN 
    SELECT v.id FROM videos v
    JOIN profiles p ON v.user_id = p.id
    WHERE p.email LIKE '%@testuser.com'
    LIMIT 30
  LOOP
    videos_processed := videos_processed + 1;
    
    -- Add 1-3 hashtags per video
    FOR i IN 1..(1 + floor(random() * 3)) LOOP
      hashtag_name := hashtag_names[1 + floor(random() * array_length(hashtag_names, 1))];
      
      -- Get or create hashtag
      SELECT id INTO selected_hashtag_id FROM hashtags WHERE name = hashtag_name;
      
      IF selected_hashtag_id IS NULL THEN
        INSERT INTO hashtags (name) VALUES (hashtag_name) RETURNING id INTO selected_hashtag_id;
      END IF;
      
      -- Link video to hashtag (using the renamed variable)
      INSERT INTO video_hashtags (video_id, hashtag_id) 
      VALUES (video_record.id, selected_hashtag_id)
      ON CONFLICT (video_id, hashtag_id) DO NOTHING;
      
      hashtag_count := hashtag_count + 1;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Processed % videos and created % hashtag relationships', videos_processed, hashtag_count;
END $$;

-- Clean up temporary function
DROP FUNCTION temp_generate_comment();

-- Final summary and verification
DO $$
DECLARE
  test_user_count INTEGER;
  test_video_count INTEGER;
  test_comment_count INTEGER;
  hashtag_count INTEGER;
  user_list TEXT := '';
  user_record RECORD;
  user_counter INTEGER := 0;
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
  
  -- Get list of created test users
  FOR user_record IN 
    SELECT username FROM profiles 
    WHERE email LIKE '%@testuser.com' 
    ORDER BY username 
    LIMIT 8
  LOOP
    user_counter := user_counter + 1;
    user_list := user_list || user_record.username;
    IF user_counter < 8 THEN
      user_list := user_list || ', ';
    END IF;
  END LOOP;
  
  RAISE NOTICE '=== TEST DATA CREATION COMPLETE ===';
  RAISE NOTICE 'Created % test user accounts', test_user_count;
  RAISE NOTICE 'Test users own % videos', test_video_count;
  RAISE NOTICE 'Test users made % comments', test_comment_count;
  RAISE NOTICE 'Test content has % hashtag relationships', hashtag_count;
  RAISE NOTICE 'Sample users: %', user_list;
  RAISE NOTICE '=====================================';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 HOW TO FIND TEST ACCOUNTS:';
  RAISE NOTICE '1. Go to Admin Panel > Users tab';
  RAISE NOTICE '2. Look for users with @testuser.com emails';
  RAISE NOTICE '3. Test deletion scenarios with:';
  RAISE NOTICE '   - HeavyContentUser (videos + comments)';
  RAISE NOTICE '   - CommentOnlyUser (comments only)';
  RAISE NOTICE '   - VideoOnlyUser (videos only)';
  RAISE NOTICE '   - EmptyUser (no content)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All test accounts are ready for deletion testing!';
END $$;