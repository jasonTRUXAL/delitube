import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DeleteUserRequest {
  userId: string;
  options?: {
    preserveVideos: boolean;
    preserveComments: boolean;
    anonymizeContent: boolean;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client for checking permissions
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Verify the requesting user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { userId, options = {
      preserveVideos: true,
      preserveComments: true,
      anonymizeContent: true
    } }: DeleteUserRequest = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { preserveVideos, preserveComments, anonymizeContent } = options

    // Get the user's current profile data
    const { data: userProfile, error: getUserError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (getUserError) {
      console.error('Error getting user profile:', getUserError)
      throw new Error('User not found')
    }

    let deletedContent = []
    let preservedContent = []

    // Handle video deletion/preservation
    if (!preserveVideos) {
      // Delete all videos (this will cascade delete comments, hashtags, etc.)
      const { error: videoDeleteError } = await supabaseAdmin
        .from('videos')
        .delete()
        .eq('user_id', userId)

      if (videoDeleteError) {
        console.error('Error deleting videos:', videoDeleteError)
        throw videoDeleteError
      }
      deletedContent.push('videos')
    } else {
      preservedContent.push('videos')
    }

    // Handle comment deletion/preservation (only if videos are preserved)
    if (preserveVideos && !preserveComments) {
      // Delete only the user's comments
      const { error: commentDeleteError } = await supabaseAdmin
        .from('comments')
        .delete()
        .eq('user_id', userId)

      if (commentDeleteError) {
        console.error('Error deleting comments:', commentDeleteError)
        throw commentDeleteError
      }
      deletedContent.push('comments')
    } else if (preserveComments) {
      preservedContent.push('comments')
    }

    // Handle anonymization or complete deletion
    if (preserveVideos || preserveComments) {
      if (anonymizeContent) {
        // Anonymize the user profile instead of deleting it
        const anonymousUsername = `DELETED_USER_${Date.now()}`
        const anonymousEmail = `deleted_${Date.now()}@system.local`
        
        const { error: anonymizeError } = await supabaseAdmin
          .from('profiles')
          .update({
            username: anonymousUsername,
            email: anonymousEmail,
            avatar_url: null,
            is_admin: false
          })
          .eq('id', userId)

        if (anonymizeError) {
          console.error('Error anonymizing profile:', anonymizeError)
          throw anonymizeError
        }

        // Delete the auth user but keep the profile for content attribution
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        
        if (authDeleteError) {
          console.error('Error deleting auth user:', authDeleteError)
          // Don't throw here as the anonymization was successful
        }

        const message = `User account deleted and content anonymized (${preservedContent.join(', ')} preserved as anonymous)`
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message,
            anonymized: true,
            preserved: preservedContent,
            deleted: deletedContent
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        // Keep the user profile as-is but delete auth access
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        
        if (authDeleteError) {
          console.error('Error deleting auth user:', authDeleteError)
          // Don't throw here as we want to preserve the profile
        }

        const message = `User account deleted but content preserved with original attribution (${preservedContent.join(', ')} preserved)`
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message,
            anonymized: false,
            preserved: preservedContent,
            deleted: deletedContent
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else {
      // Delete everything - profile and auth user
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileDeleteError) {
        console.error('Error deleting profile:', profileDeleteError)
        throw profileDeleteError
      }

      // Delete user's auth record
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (authDeleteError) {
        console.error('Error deleting auth user:', authDeleteError)
        // Don't throw here as the profile deletion was successful
      }

      const message = 'User and all content deleted successfully'
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message,
          anonymized: false,
          preserved: [],
          deleted: ['profile', 'videos', 'comments']
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Delete user error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to delete user',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})