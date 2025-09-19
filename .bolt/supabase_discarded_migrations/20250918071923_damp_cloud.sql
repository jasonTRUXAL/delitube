@@ .. @@
 
 -- Step 6: Final verification and summary
 DO $$
 DECLARE
     video_count INTEGER;
     comment_count INTEGER;
     hashtag_count INTEGER;
     user_count INTEGER;
     admin_exists BOOLEAN;
 BEGIN
     -- Get final counts
     SELECT COUNT(*) INTO video_count FROM videos;
     SELECT COUNT(*) INTO comment_count FROM comments;
     SELECT COUNT(*) INTO hashtag_count FROM hashtags;
     SELECT COUNT(*) INTO user_count FROM profiles;
     
     -- Check admin still exists
     SELECT EXISTS(
         SELECT 1 FROM profiles 
         WHERE email = 'jasontruxal@gmail.com' AND is_admin = true
     ) INTO admin_exists;
     
     -- Log final state
     RAISE NOTICE 'CLEANUP COMPLETE!';
     RAISE NOTICE 'Final counts:';
     RAISE NOTICE '- Videos: %', video_count;
     RAISE NOTICE '- Comments: %', comment_count;
     RAISE NOTICE '- Hashtags: %', hashtag_count;
     RAISE NOTICE '- Users: %', user_count;
     RAISE NOTICE '- Admin preserved: %', admin_exists;
     
     IF NOT admin_exists THEN
         RAISE EXCEPTION 'CRITICAL ERROR: Admin user was not preserved!';
     END IF;
     
     RAISE NOTICE 'Database successfully reset to fresh state with admin preserved.';
-    RAISE NOTICE 'NOTE: Please manually clear storage buckets (videos, thumbnails, avatars) via Supabase dashboard if needed.';
 END $$;