import { create } from 'zustand';
import { supabase, User } from '../lib/supabase';
import { API_ENDPOINTS } from '../utils/constants';
import { toast } from 'sonner';

type AuthState = {
  user: User | null;
  session: any;
  refreshUser: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  
  signUp: async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
            email,
            avatar_url: null,
            is_admin: false,
          });

        if (profileError) throw profileError;
        
        // Send welcome email notification (no auth required for welcome emails)
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}${API_ENDPOINTS.sendNotificationEmail}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              type: 'welcome',
              email,
              username
            })
          });
        } catch (notificationError) {
          console.warn('Failed to send welcome email:', notificationError);
          // Don't fail signup for notification errors
        }
        
        toast.success('Please check your email to verify your account.');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          toast.error('Please verify your email before signing in.');
          await supabase.auth.signOut();
          set({ user: null, session: null });
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileData) {
          set({ user: profileData, session: data.session });
          toast.success('Signed in successfully!');
        } else {
          await supabase.auth.signOut();
          set({ user: null, session: null });
          toast.error('Profile not found. Please contact support.');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null });
      toast.success('Signed out successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      // First check if the email exists in our system
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.trim())
        .maybeSingle();
      
      if (profileError) {
        console.error('Error checking email:', profileError);
        throw new Error('Failed to verify email address');
      }
      
      if (!profileData) {
        throw new Error('No account found with this email address');
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/change-password`,
      });
      
      if (error) throw error;
      
      // Send notification email about the password reset request
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}${API_ENDPOINTS.sendNotificationEmail}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            type: 'password_reset_request',
            email: email.trim()
          })
        });
      } catch (notificationError) {
        console.warn('Failed to send password reset notification:', notificationError);
        // Don't fail the password reset for notification errors
      }
      
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send password reset email');
      throw error;
    }
  },

  updateProfile: async (updates) => {
    try {
      const { user } = get();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      set({ user: { ...user, ...updates } });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  },

  updatePassword: async (newPassword) => {
    try {
      const { user } = get();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      // Send notification email about password change
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}${API_ENDPOINTS.sendNotificationEmail}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            type: 'password_change',
            email: user.email,
            username: user.username
          })
        });
      } catch (notificationError) {
        console.warn('Failed to send password change notification:', notificationError);
        // Don't fail the password change for notification errors
      }
      
      toast.success('Password updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  },

  resendVerificationEmail: async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      toast.success('Verification email resent. Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  },

  refreshUser: async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.user) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .maybeSingle();
          
        if (userData) {
          set({ user: userData, session: sessionData.session });
        } else {
          set({ user: null, session: null });
        }
      }
    } catch (error) {
      set({ user: null, session: null });
    }
  },
}));

// Set up auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user?.id) {
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          useAuthStore.setState({ user: data, session });
        } else {
          // If no profile exists, sign out the user
          supabase.auth.signOut().then(() => {
            useAuthStore.setState({ user: null, session: null });
            toast.error('Profile not found. Please contact support.');
          });
        }
      });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, session: null });
  }
});