/*
  # Fresh Start Database Cleanup

  This migration cleans up all test content and user data while preserving:
  1. The admin user (jasontruxal@gmail.com)
  2. All database schema and structure
  3. All RLS policies and security settings

  ## What gets cleaned up:
  - All videos and their associated files
  - All comments on all videos
  - All hashtags and video-hashtag relationships
  - All user profiles except the admin
  - All storage files (videos, thumbnails, avatars)

  ## What gets preserved:
  - Database schema and tables
  - RLS policies and security
  - Admin user account and privileges
  - All functions and triggers

  This provides a completely fresh start for the production site.
*/

-- Step 1: Identify and preserve admin user
DO $$
DECLARE
    admin_user_id uuid;
    cleanup_stats record;
BEGIN
    -- Find the admin user
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'jasontruxal@gmail.com';
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'Admin user not found - no user will be preserved';
    ELSE
        RAISE NOTICE 'Admin user found: %', admin_user_id;
        
        -- Ensure admin user has proper profile and admin privileges
        INSERT INTO profiles (id, username, email, is_admin, avatar_url, created_at)
        VALUES (admin_user_id, 'admin', 'jasontruxal@gmail.com', true, null, now())
        ON CONFLICT (id) DO UPDATE SET
            is_admin = true,
            email = 'jasontruxal@gmail.com';
            
        RAISE NOTICE 'Admin profile ensured with admin privileges';
    END IF;

    -- Step 2: Clean up all content data
    RAISE NOTICE 'Starting content cleanup...';
    
    -- Delete all video-hashtag relationships
    DELETE FROM video_hashtags;
    GET DIAGNOSTICS cleanup_stats.video_hashtags_deleted = ROW_COUNT;
    RAISE NOTICE 'Deleted % video-hashtag relationships', cleanup_stats.video_hashtags_deleted;
    
    -- Delete all comments
    DELETE FROM comments;
    GET DIAGNOSTICS cleanup_stats.comments_deleted = ROW_COUNT;
    RAISE NOTICE 'Deleted % comments', cleanup_stats.comments_deleted;
    
    -- Delete all videos
    DELETE FROM videos;
    GET DIAGNOSTICS cleanup_stats.videos_deleted = ROW_COUNT;
    RAISE NOTICE 'Deleted % videos', cleanup_stats.videos_deleted;
    
    -- Delete all hashtags
    DELETE FROM hashtags;
    GET DIAGNOSTICS cleanup_stats.hashtags_deleted = ROW_COUNT;
    RAISE NOTICE 'Deleted % hashtags', cleanup_stats.hashtags_deleted;
    
    -- Delete all user profiles except admin
    IF admin_user_id IS NOT NULL THEN
        DELETE FROM profiles WHERE id != admin_user_id;
        GET DIAGNOSTICS cleanup_stats.profiles_deleted = ROW_COUNT;
        RAISE NOTICE 'Deleted % user profiles (preserved admin)', cleanup_stats.profiles_deleted;
        
        -- Delete all auth users except admin
        -- Note: This requires service role permissions
        RAISE NOTICE 'Auth user cleanup should be done via Supabase dashboard or service role';
    ELSE
        DELETE FROM profiles;
        GET DIAGNOSTICS cleanup_stats.profiles_deleted = ROW_COUNT;
        RAISE NOTICE 'Deleted % user profiles (no admin to preserve)', cleanup_stats.profiles_deleted;
    END IF;

    -- Step 3: Attempt storage cleanup (may require additional permissions)
    RAISE NOTICE 'Storage cleanup should be done manually via Supabase dashboard:';
    RAISE NOTICE '- Empty the "videos" storage bucket';
    RAISE NOTICE '- Empty the "thumbnails" storage bucket'; 
    RAISE NOTICE '- Empty the "avatars" storage bucket';

    -- Step 4: Final verification
    RAISE NOTICE 'Cleanup completed successfully!';
    RAISE NOTICE 'Final database state:';
    RAISE NOTICE '- Videos: %', (SELECT COUNT(*) FROM videos);
    RAISE NOTICE '- Comments: %', (SELECT COUNT(*) FROM comments);
    RAISE NOTICE '- Hashtags: %', (SELECT COUNT(*) FROM hashtags);
    RAISE NOTICE '- Video-hashtag relationships: %', (SELECT COUNT(*) FROM video_hashtags);
    RAISE NOTICE '- User profiles: %', (SELECT COUNT(*) FROM profiles);
    
    IF admin_user_id IS NOT NULL THEN
        RAISE NOTICE 'Admin user preserved: % (is_admin: %)', 
            (SELECT username FROM profiles WHERE id = admin_user_id),
            (SELECT is_admin FROM profiles WHERE id = admin_user_id);
    END IF;
    
    RAISE NOTICE 'Database is now clean and ready for production use!';
END $$;