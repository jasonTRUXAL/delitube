import { create } from 'zustand';
import { supabase, User } from '../lib/supabase';
import { toast } from 'sonner';

type AuthState = {
  user: User | null;
  session: any;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  
  signUp: async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create a profile record for the new user
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
        
        toast.success('Account created! Please check your email for verification.');
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
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({ user: profileData, session: data.session });
        toast.success('Signed in successfully!');
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

  refreshUser: async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.user) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();
          
        set({ user: userData, session: sessionData.session, loading: false });
      } else {
        set({ user: null, session: null, loading: false });
      }
    } catch (error) {
      set({ loading: false });
    }
  },
}));

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const { refreshUser } = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    await refreshUser();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, session: null });
  }
});