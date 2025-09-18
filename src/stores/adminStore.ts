import { create } from 'zustand';
import { supabase, User } from '../lib/supabase';
import { toast } from 'sonner';

type AdminState = {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  toggleAdminStatus: (userId: string, isAdmin: boolean) => Promise<void>;
};

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  loading: false,
  
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ users: data, loading: false });
    } catch (error: any) {
      toast.error('Failed to fetch users');
      set({ loading: false });
    }
  },
  
  deleteUser: async (userId) => {
    try {
      // First delete user's auth record
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;
      
      // Then delete user profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      set(state => ({
        users: state.users.filter(u => u.id !== userId)
      }));
      
      toast.success('User deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete user');
    }
  },
  
  toggleAdminStatus: async (userId, isAdmin) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId);
      
      if (error) throw error;
      
      set(state => ({
        users: state.users.map(u => 
          u.id === userId ? { ...u, is_admin: isAdmin } : u
        )
      }));
      
      toast.success(`User is ${isAdmin ? 'now' : 'no longer'} an admin`);
    } catch (error: any) {
      toast.error('Failed to update admin status');
    }
  },
}));