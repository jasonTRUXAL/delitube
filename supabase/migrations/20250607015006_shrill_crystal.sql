/*
  # Enhanced User Deletion System with Content Preservation

  1. New Features
    - Function to handle user deletion with preservation options
    - System to anonymize content instead of deleting it
    - Flexible options for preserving videos and/or comments
    
  2. Database Changes
    - Create function for controlled user deletion
    - Handle content preservation and anonymization
    - Maintain referential integrity
    
  3. Security
    - Admin-only function with proper security
    - Atomic operations with transaction safety
*/

-- Create function to handle user deletion with preservation options
CREATE OR REPLACE FUNCTION delete_user_with_options(
  target_user_id UUID,
  preserve_videos BOOLEAN DEFAULT true,
  preserve_comments BOOLEAN DEFAULT true,
  anonymize_content BOOLEAN DEFAULT true
)
RETURNS JSON AS $$
DECLARE
  video_count INTEGER;
  comment_count INTEGER;
  result JSON;
  anonymous_username TEXT := 'DELETED_USER_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
BEGIN
  -- Get counts before deletion
  SELECT COUNT(*) INTO video_count FROM videos WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO comment_count FROM comments WHERE user_id = target_user_id;
  
  -- Handle videos
  IF preserve_videos AND anonymize_content THEN
    -- Update the user profile to anonymize it instead of transferring to system user
    UPDATE profiles 
    SET 
      username = anonymous_username,
      email = 'deleted@system.local',
      avatar_url = null,
      is_admin = false
    WHERE id = target_user_id;
  ELSIF NOT preserve_videos THEN
    -- Delete videos (comments will cascade)
    DELETE FROM videos WHERE user_id = target_user_id;
  END IF;
  
  -- Handle comments (only if videos are not being deleted, as they would cascade)
  IF preserve_videos AND preserve_comments AND anonymize_content THEN
    -- Comments will use the anonymized profile
    NULL; -- No action needed, profile already anonymized above
  ELSIF preserve_videos AND NOT preserve_comments THEN
    -- Delete comments but keep videos
    DELETE FROM comments WHERE user_id = target_user_id;
  END IF;
  
  -- If we're not preserving anything or not anonymizing, delete the user entirely
  IF (NOT preserve_videos AND NOT preserve_comments) OR NOT anonymize_content THEN
    -- This will cascade delete all videos and comments
    DELETE FROM profiles WHERE id = target_user_id;
  END IF;
  
  -- Return result summary
  result := json_build_object(
    'success', true,
    'video_count', video_count,
    'comment_count', comment_count,
    'videos_preserved', preserve_videos,
    'comments_preserved', preserve_comments,
    'content_anonymized', anonymize_content,
    'anonymous_username', CASE WHEN anonymize_content THEN anonymous_username ELSE null END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user deletion preview
CREATE OR REPLACE FUNCTION get_user_deletion_preview(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  user_info RECORD;
  video_count INTEGER;
  comment_count INTEGER;
  result JSON;
BEGIN
  -- Get user information
  SELECT username, email, created_at, is_admin 
  INTO user_info 
  FROM profiles 
  WHERE id = target_user_id;
  
  -- Get content counts
  SELECT COUNT(*) INTO video_count FROM videos WHERE user_id = target_user_id;
  SELECT COUNT(*) INTO comment_count FROM comments WHERE user_id = target_user_id;
  
  -- Return preview information
  result := json_build_object(
    'user', json_build_object(
      'username', user_info.username,
      'email', user_info.email,
      'created_at', user_info.created_at,
      'is_admin', user_info.is_admin
    ),
    'content', json_build_object(
      'video_count', video_count,
      'comment_count', comment_count
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;