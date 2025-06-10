import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailNotificationRequest {
  type: 'welcome' | 'email_change' | 'password_change' | 'password_reset_request' | 'account_deletion';
  email: string;
  username?: string;
  oldEmail?: string;
  newEmail?: string;
  options?: any;
}

// Mailgun configuration
const MAILGUN_API_KEY = '8c07f5ba8ecf9c3e774628f1b428e9a8-08c79601-bb22e8c0'
const MAILGUN_DOMAIN = 'delitube.co'
const MAILGUN_API_URL = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`

async function sendEmailViaMailgun(to: string, subject: string, htmlContent: string, textContent: string) {
  const formData = new FormData()
  formData.append('from', `DeliTube <noreply@${MAILGUN_DOMAIN}>`)
  formData.append('to', to)
  formData.append('subject', subject)
  formData.append('html', htmlContent)
  formData.append('text', textContent)

  const response = await fetch(MAILGUN_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`
    },
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Mailgun API error: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, email, username, oldEmail, newEmail, options }: EmailNotificationRequest = await req.json()

    if (!type || !email) {
      return new Response(
        JSON.stringify({ error: 'Type and email are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For certain operations that require authentication, verify the user
    const authRequiredTypes = ['email_change', 'password_change', 'account_deletion']
    
    if (authRequiredTypes.includes(type)) {
      const authHeader = req.headers.get('Authorization')
      
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required for this operation' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Create Supabase client to verify the user
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

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    let subject = ''
    let htmlContent = ''
    let textContent = ''

    switch (type) {
      case 'welcome':
        subject = 'Welcome to DeliTube!'
        htmlContent = `
          <div style="font-family: 'JetBrains Mono', monospace; max-width: 600px; margin: 0 auto; background: #f9fbf5; padding: 20px;">
            <div style="background: #ffc582; border: 3px solid #000; padding: 20px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; color: #000;">
                WELCOME TO DELITUBE!
              </h1>
            </div>
            
            <div style="background: white; border: 3px solid #000; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 15px 0; font-weight: bold; text-transform: uppercase; color: #000;">
                Hello ${username || 'User'},
              </p>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                Your account has been successfully created! You can now start uploading and sharing your raw, unfiltered video content.
              </p>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                Remember: DeliTube is all about authentic, real content. No filters, no fake engagement - just pure video sharing.
              </p>
              
              <p style="margin: 0; font-weight: bold; color: #000;">
                Welcome to the community!
              </p>
            </div>
            
            <div style="background: #000; color: white; padding: 15px; text-align: center;">
              <p style="margin: 0; font-weight: bold; text-transform: uppercase; font-size: 12px;">
                © ${new Date().getFullYear()} DeliTube - Raw Video Sharing
              </p>
            </div>
          </div>
        `
        textContent = `
WELCOME TO DELITUBE!

Hello ${username || 'User'},

Your account has been successfully created! You can now start uploading and sharing your raw, unfiltered video content.

Remember: DeliTube is all about authentic, real content. No filters, no fake engagement - just pure video sharing.

Welcome to the community!

© ${new Date().getFullYear()} DeliTube - Raw Video Sharing
        `
        break

      case 'email_change':
        subject = 'Email Change Notification - DeliTube'
        htmlContent = `
          <div style="font-family: 'JetBrains Mono', monospace; max-width: 600px; margin: 0 auto; background: #f9fbf5; padding: 20px;">
            <div style="background: #f59e0b; border: 3px solid #000; padding: 20px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; color: #000;">
                EMAIL CHANGE NOTIFICATION
              </h1>
            </div>
            
            <div style="background: white; border: 3px solid #000; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 15px 0; font-weight: bold; text-transform: uppercase; color: #000;">
                Hello ${username || 'User'},
              </p>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                Your email address has been changed on your DeliTube account.
              </p>
              
              <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin: 15px 0;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #000;">
                  <strong>OLD EMAIL:</strong> ${oldEmail || 'N/A'}
                </p>
                <p style="margin: 0; font-weight: bold; color: #000;">
                  <strong>NEW EMAIL:</strong> ${newEmail || email}
                </p>
              </div>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                If you did not make this change, please contact support immediately.
              </p>
              
              <p style="margin: 0; font-weight: bold; color: #000;">
                This notification was sent to both your old and new email addresses for security purposes.
              </p>
            </div>
            
            <div style="background: #000; color: white; padding: 15px; text-align: center;">
              <p style="margin: 0; font-weight: bold; text-transform: uppercase; font-size: 12px;">
                © ${new Date().getFullYear()} DeliTube - Raw Video Sharing
              </p>
            </div>
          </div>
        `
        textContent = `
EMAIL CHANGE NOTIFICATION

Hello ${username || 'User'},

Your email address has been changed on your DeliTube account.

OLD EMAIL: ${oldEmail || 'N/A'}
NEW EMAIL: ${newEmail || email}

If you did not make this change, please contact support immediately.

This notification was sent to both your old and new email addresses for security purposes.

© ${new Date().getFullYear()} DeliTube - Raw Video Sharing
        `
        break

      case 'password_change':
        subject = 'Password Changed - DeliTube'
        htmlContent = `
          <div style="font-family: 'JetBrains Mono', monospace; max-width: 600px; margin: 0 auto; background: #f9fbf5; padding: 20px;">
            <div style="background: #22c55e; border: 3px solid #000; padding: 20px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; color: #000;">
                PASSWORD CHANGED
              </h1>
            </div>
            
            <div style="background: white; border: 3px solid #000; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 15px 0; font-weight: bold; text-transform: uppercase; color: #000;">
                Hello ${username || 'User'},
              </p>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                Your password has been successfully changed on your DeliTube account.
              </p>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                <strong>Date:</strong> ${new Date().toLocaleString()}
              </p>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                If you did not make this change, please contact support immediately and consider that your account may have been compromised.
              </p>
              
              <p style="margin: 0; font-weight: bold; color: #000;">
                For security, we recommend using a strong, unique password for your DeliTube account.
              </p>
            </div>
            
            <div style="background: #000; color: white; padding: 15px; text-align: center;">
              <p style="margin: 0; font-weight: bold; text-transform: uppercase; font-size: 12px;">
                © ${new Date().getFullYear()} DeliTube - Raw Video Sharing
              </p>
            </div>
          </div>
        `
        textContent = `
PASSWORD CHANGED

Hello ${username || 'User'},

Your password has been successfully changed on your DeliTube account.

Date: ${new Date().toLocaleString()}

If you did not make this change, please contact support immediately and consider that your account may have been compromised.

For security, we recommend using a strong, unique password for your DeliTube account.

© ${new Date().getFullYear()} DeliTube - Raw Video Sharing
        `
        break

      case 'password_reset_request':
        subject = 'Password Reset Request - DeliTube'
        htmlContent = `
          <div style="font-family: 'JetBrains Mono', monospace; max-width: 600px; margin: 0 auto; background: #f9fbf5; padding: 20px;">
            <div style="background: #ef4444; border: 3px solid #000; padding: 20px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; color: white;">
                PASSWORD RESET REQUEST
              </h1>
            </div>
            
            <div style="background: white; border: 3px solid #000; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 15px 0; font-weight: bold; text-transform: uppercase; color: #000;">
                Hello,
              </p>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                A password reset was requested for your DeliTube account.
              </p>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                <strong>Date:</strong> ${new Date().toLocaleString()}
              </p>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                If you did not request this password reset, you can safely ignore this email. Your password will not be changed.
              </p>
              
              <p style="margin: 0; font-weight: bold; color: #000;">
                If you did request this reset, please check your email for the password reset link from Supabase.
              </p>
            </div>
            
            <div style="background: #000; color: white; padding: 15px; text-align: center;">
              <p style="margin: 0; font-weight: bold; text-transform: uppercase; font-size: 12px;">
                © ${new Date().getFullYear()} DeliTube - Raw Video Sharing
              </p>
            </div>
          </div>
        `
        textContent = `
PASSWORD RESET REQUEST

Hello,

A password reset was requested for your DeliTube account.

Date: ${new Date().toLocaleString()}

If you did not request this password reset, you can safely ignore this email. Your password will not be changed.

If you did request this reset, please check your email for the password reset link from Supabase.

© ${new Date().getFullYear()} DeliTube - Raw Video Sharing
        `
        break

      case 'account_deletion':
        subject = 'Account Deletion Confirmation - DeliTube'
        const preservedContent = []
        if (options?.preserveVideos) preservedContent.push('videos')
        if (options?.preserveComments) preservedContent.push('comments')
        
        htmlContent = `
          <div style="font-family: 'JetBrains Mono', monospace; max-width: 600px; margin: 0 auto; background: #f9fbf5; padding: 20px;">
            <div style="background: #ef4444; border: 3px solid #000; padding: 20px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; color: white;">
                ACCOUNT DELETION CONFIRMATION
              </h1>
            </div>
            
            <div style="background: white; border: 3px solid #000; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 15px 0; font-weight: bold; text-transform: uppercase; color: #000;">
                Hello ${username || 'User'},
              </p>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                Your DeliTube account has been successfully deleted.
              </p>
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                <strong>Date:</strong> ${new Date().toLocaleString()}
              </p>
              
              ${preservedContent.length > 0 ? `
                <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin: 15px 0;">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #000;">
                    <strong>PRESERVED CONTENT:</strong>
                  </p>
                  <p style="margin: 0; font-weight: bold; color: #000;">
                    Your ${preservedContent.join(' and ')} ${options?.anonymizeContent ? 'have been preserved anonymously' : 'have been preserved with your original attribution'}.
                  </p>
                </div>
              ` : `
                <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 15px; margin: 15px 0;">
                  <p style="margin: 0; font-weight: bold; color: #000;">
                    All your content has been permanently deleted.
                  </p>
                </div>
              `}
              
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #000;">
                Thank you for being part of the DeliTube community. We're sorry to see you go.
              </p>
              
              <p style="margin: 0; font-weight: bold; color: #000;">
                If you have any questions or concerns, please contact our support team.
              </p>
            </div>
            
            <div style="background: #000; color: white; padding: 15px; text-align: center;">
              <p style="margin: 0; font-weight: bold; text-transform: uppercase; font-size: 12px;">
                © ${new Date().getFullYear()} DeliTube - Raw Video Sharing
              </p>
            </div>
          </div>
        `
        textContent = `
ACCOUNT DELETION CONFIRMATION

Hello ${username || 'User'},

Your DeliTube account has been successfully deleted.

Date: ${new Date().toLocaleString()}

${preservedContent.length > 0 
  ? `PRESERVED CONTENT: Your ${preservedContent.join(' and ')} ${options?.anonymizeContent ? 'have been preserved anonymously' : 'have been preserved with your original attribution'}.`
  : 'All your content has been permanently deleted.'
}

Thank you for being part of the DeliTube community. We're sorry to see you go.

If you have any questions or concerns, please contact our support team.

© ${new Date().getFullYear()} DeliTube - Raw Video Sharing
        `
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid notification type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    // For email changes, send to both old and new email
    const recipients = type === 'email_change' && oldEmail ? [oldEmail, newEmail || email] : [email]

    // Send emails to all recipients using Mailgun
    const emailPromises = recipients.map(async (recipientEmail) => {
      try {
        const result = await sendEmailViaMailgun(recipientEmail, subject, htmlContent, textContent)
        console.log(`Successfully sent ${type} email to: ${recipientEmail}`)
        console.log('Mailgun response:', result)
        return { success: true, recipient: recipientEmail, messageId: result.id }
      } catch (error) {
        console.error(`Failed to send ${type} email to ${recipientEmail}:`, error)
        return { success: false, recipient: recipientEmail, error: error.message }
      }
    })

    const results = await Promise.all(emailPromises)
    const successfulSends = results.filter(r => r.success)
    const failedSends = results.filter(r => !r.success)

    if (failedSends.length > 0) {
      console.error('Some emails failed to send:', failedSends)
    }

    return new Response(
      JSON.stringify({ 
        success: successfulSends.length > 0,
        message: `${type} notification email ${successfulSends.length > 0 ? 'sent successfully' : 'failed to send'}`,
        recipients: successfulSends.map(r => r.recipient),
        emailsSent: successfulSends.length,
        emailsFailed: failedSends.length,
        ...(failedSends.length > 0 && { failures: failedSends })
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Send notification email error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notification email',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})