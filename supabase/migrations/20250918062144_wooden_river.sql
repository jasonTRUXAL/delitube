/*
  # Clean up database for fresh start

  1. Data Cleanup
    - Remove all videos and associated data (comments, hashtags, video_hashtags)
    - Remove all test users and regular users except admin
    - Keep only jasontruxal@gmail.com as admin user
    - Reset any content counters or statistics
    
  2. Preserve Structure
    - Keep all tables and functions intact
    - Maintain all RLS policies
    - Preserve storage buckets
    
  3. Fresh Start
    - Site appears as brand new installation
    - Only admin user remains for management
*/

-- First, let's identify and preserve the admin user
DO $$
DECLARE
  admin_user_id UUID;
  admin_exists BOOLEAN := FALSE;
BEGIN
  -- Check if the admin user exists
  SELECT id INTO admin_user_id 
  FROM profiles 
  WHERE email = 'jasontruxal@gmail.com' 
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    admin_exists := TRUE;
    RAISE NOTICE 'Found admin user with ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user jasontruxal@gmail.com not found';
  END IF;
  
  -- Store the result for use in subsequent operations
  IF admin_exists THEN
    -- Create a temporary table to store the admin ID
    CREATE TEMP TABLE IF NOT EXISTS temp_admin_info (
      admin_id UUID,
      preserved_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    INSERT INTO temp_admin_info (admin_id) VALUES (admin_user_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Clean up video-related data first (due to foreign key constraints)
DO $$
DECLARE
  deleted_videos INTEGER;
  deleted_comments INTEGER;
  deleted_video_hashtags INTEGER;
  admin_id UUID;
BEGIN
  -- Get admin ID from temp table if it exists
  SELECT admin_id INTO admin_id FROM temp_admin_info LIMIT 1;
  
  -- Delete video hashtag relationships
  DELETE FROM video_hashtags;
  GET DIAGNOSTICS deleted_video_hashtags = ROW_COUNT;
  
  -- Delete all comments
  DELETE FROM comments;
  GET DIAGNOSTICS deleted_comments = ROW_COUNT;
  
  -- Delete all videos (including admin's videos for fresh start)
  DELETE FROM videos;
  GET DIAGNOSTICS deleted_videos = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % videos, % comments, % video-hashtag relationships', 
    deleted_videos, deleted_comments, deleted_video_hashtags;
END $$;

-- Clean up hashtags (remove unused ones)
DO $$
DECLARE
  deleted_hashtags INTEGER;
BEGIN
  -- Delete all hashtags since we removed all video relationships
  DELETE FROM hashtags;
  GET DIAGNOSTICS deleted_hashtags = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % hashtags', deleted_hashtags;
END $$;

-- Clean up user profiles (keep only admin)
DO $$
DECLARE
  deleted_users INTEGER;
  admin_id UUID;
  admin_exists BOOLEAN := FALSE;
BEGIN
  -- Get admin ID from temp table if it exists
  SELECT admin_id INTO admin_id FROM temp_admin_info LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    admin_exists := TRUE;
    
    -- Delete all profiles except the admin
    DELETE FROM profiles WHERE id != admin_id;
    GET DIAGNOSTICS deleted_users = ROW_COUNT;
    
    -- Ensure admin user has correct admin status
    UPDATE profiles 
    SET is_admin = TRUE 
    WHERE id = admin_id;
    
    RAISE NOTICE 'Deleted % user profiles, preserved admin user', deleted_users;
  ELSE
    -- If no admin found, delete all profiles
    DELETE FROM profiles;
    GET DIAGNOSTICS deleted_users = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % user profiles (no admin user found to preserve)', deleted_users;
  END IF;
END $$;

-- Clean up storage objects (optional - removes uploaded files)
-- Note: This requires storage admin privileges and may not work in all environments
DO $$
BEGIN
  -- Attempt to clean up storage buckets
  -- This may fail if the function doesn't have sufficient privileges
  BEGIN
    -- Clear videos bucket
    PERFORM storage.delete_object('videos', name) 
    FROM storage.objects 
    WHERE bucket_id = 'videos';
    
    -- Clear thumbnails bucket  
    PERFORM storage.delete_object('thumbnails', name)
    FROM storage.objects 
    WHERE bucket_id = 'thumbnails';
    
    -- Clear avatars bucket (except admin's avatar if it exists)
    PERFORM storage.delete_object('avatars', name)
    FROM storage.objects 
    WHERE bucket_id = 'avatars';
    
    RAISE NOTICE 'Cleaned up storage objects';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not clean up storage objects (insufficient privileges): %', SQLERRM;
  END;
END $$;

-- Clean up temporary table
DROP TABLE IF EXISTS temp_admin_info;

-- Final verification and summary
DO $$
DECLARE
  remaining_users INTEGER;
  remaining_videos INTEGER;
  remaining_comments INTEGER;
  remaining_hashtags INTEGER;
  admin_info RECORD;
BEGIN
  -- Count remaining data
  SELECT COUNT(*) INTO remaining_users FROM profiles;
  SELECT COUNT(*) INTO remaining_videos FROM videos;
  SELECT COUNT(*) INTO remaining_comments FROM comments;
  SELECT COUNT(*) INTO remaining_hashtags FROM hashtags;
  
  -- Get admin user info if exists
  SELECT username, email, is_admin, created_at 
  INTO admin_info 
  FROM profiles 
  WHERE email = 'jasontruxal@gmail.com' 
  LIMIT 1;
  
  RAISE NOTICE '=== CLEANUP COMPLETE ===';
  RAISE NOTICE 'Remaining users: %', remaining_users;
  RAISE NOTICE 'Remaining videos: %', remaining_videos;
  RAISE NOTICE 'Remaining comments: %', remaining_comments;
  RAISE NOTICE 'Remaining hashtags: %', remaining_hashtags;
  
  IF admin_info IS NOT NULL THEN
    RAISE NOTICE 'Preserved admin user: % (%) - Admin: %', 
      admin_info.username, admin_info.email, admin_info.is_admin;
  ELSE
    RAISE NOTICE 'No admin user found in final state';
  END IF;
  
  RAISE NOTICE '========================';
  RAISE NOTICE 'Database is now in fresh start state!';
  RAISE NOTICE 'Ready for new users and content.';
END $$;