import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Square, Trash2, LogOut, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import UserDeletionModal from '../components/modals/UserDeletionModal';
import { API_ENDPOINTS } from '../utils/constants';

const ProfilePage = () => {
  const { user, updateProfile, signOut } = useAuthStore();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(user?.email || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [error, setError] = useState<string | null>(null);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [deletionModal, setDeletionModal] = useState<{
    isOpen: boolean;
    loading: boolean;
    contentCounts?: { videoCount: number; commentCount: number };
  }>({
    isOpen: false,
    loading: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type (only accept image files)
    if (!file.type.startsWith('image/')) {
      setError('PLEASE SELECT A VALID IMAGE FILE');
      return;
    }
    
    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('IMAGE IS TOO LARGE. PLEASE SELECT A FILE UNDER 5MB');
      return;
    }
    
    setAvatarFile(file);
    setError(null);
    
    // Create a preview URL for the avatar
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Upload avatar if a new one is selected
      let avatarUrl = user?.avatar_url || null;
      
      if (avatarFile) {
        const fileName = `${user.id}_${Date.now()}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);
        
        if (uploadError) throw uploadError;
        
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
      }
      
      // Update profile (only avatar since username is now disabled)
      await updateProfile({
        avatar_url: avatarUrl,
      });
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message?.toUpperCase() || 'AN ERROR OCCURRED WHILE UPDATING YOUR PROFILE');
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (email === user.email) {
      setEmailChangeError('NEW EMAIL MUST BE DIFFERENT FROM CURRENT EMAIL');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setEmailChangeError('PLEASE ENTER A VALID EMAIL ADDRESS');
      return;
    }

    setEmailChangeLoading(true);
    setEmailChangeError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        email: email.trim()
      });

      if (error) throw error;

      // Send confirmation email about the email change
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
            type: 'email_change',
            oldEmail: user.email,
            newEmail: email.trim(),
            username: user.username
          })
        });
      } catch (notificationError) {
        console.warn('Failed to send notification email:', notificationError);
        // Don't fail the email change for notification errors
      }

      alert('EMAIL CHANGE CONFIRMATION SENT TO YOUR NEW EMAIL ADDRESS. PLEASE CHECK YOUR INBOX AND CONFIRM THE CHANGE.');
      setEmailChangeLoading(false);
    } catch (err: any) {
      // Handle specific Supabase error for email already exists
      if (err.message?.includes('email_exists') || err.message?.includes('already been registered')) {
        setEmailChangeError('THIS EMAIL IS ALREADY REGISTERED. PLEASE USE A DIFFERENT EMAIL ADDRESS OR LOG IN WITH THE EXISTING ACCOUNT.');
      } else {
        setEmailChangeError(err.message?.toUpperCase() || 'FAILED TO CHANGE EMAIL');
      }
      setEmailChangeLoading(false);
    }
  };

  const handleDeleteAccountClick = async () => {
    try {
      // Get user's content counts
      const { count: videoCount, error: videoError } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (videoError) throw videoError;
      
      const { count: commentCount, error: commentError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (commentError) throw commentError;
      
      setDeletionModal({
        isOpen: true,
        loading: false,
        contentCounts: {
          videoCount: videoCount || 0,
          commentCount: commentCount || 0
        }
      });
    } catch (error) {
      console.error('Failed to get content counts:', error);
      setDeletionModal({
        isOpen: true,
        loading: false,
        contentCounts: { videoCount: 0, commentCount: 0 }
      });
    }
  };

  const handleConfirmDeletion = async (options: {
    preserveVideos: boolean;
    preserveComments: boolean;
    anonymizeContent: boolean;
  }) => {
    setDeletionModal(prev => ({ ...prev, loading: true }));
    
    try {
      // Send notification email about account deletion
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
            type: 'account_deletion',
            email: user.email,
            username: user.username,
            options
          })
        });
      } catch (notificationError) {
        console.warn('Failed to send deletion notification email:', notificationError);
        // Don't fail the deletion for notification errors
      }

      const { preserveVideos, preserveComments, anonymizeContent } = options;
      
      // Call the delete user edge function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}${API_ENDPOINTS.deleteUser}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          userId: user.id,
          options: { preserveVideos, preserveComments, anonymizeContent }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account');
      }
      
      // Sign out and redirect
      await signOut();
      navigate('/');
      
      setDeletionModal({ isOpen: false, loading: false });
    } catch (error: any) {
      console.error('Account deletion error:', error);
      setError('FAILED TO DELETE ACCOUNT. PLEASE TRY AGAIN.');
      setDeletionModal(prev => ({ ...prev, loading: false }));
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="card-brutal p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-primary-600 border-3 border-brutal-black flex items-center justify-center">
            <Square size={32} className="text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brutal-black font-mono uppercase mb-2 dark:text-white">
              YOUR PROFILE
            </h1>
            <p className="text-brutal-gray font-bold uppercase tracking-wide dark:text-gray-400">
              MANAGE YOUR DELITUBE ACCOUNT
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card-brutal p-8 mb-8">
        {error && (
          <div className="mb-6 p-4 bg-accent-500 border-3 border-brutal-black text-white font-mono font-bold text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <label className="block text-sm font-black text-brutal-black mb-4 font-mono uppercase dark:text-white">
                PROFILE PICTURE
              </label>
              
              <div className="relative">
                <div className="w-32 h-32 border-3 border-brutal-black bg-white overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 text-3xl font-black font-mono">
                        {user.username.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-secondary-600 border-3 border-brutal-black flex items-center justify-center brutal-hover"
                >
                  <Camera size={20} className="text-white" />
                </button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              
              <p className="text-xs text-brutal-gray font-bold mt-2 uppercase dark:text-gray-400">
                SQUARE IMAGES WORK BEST
              </p>
            </div>
            
            {/* Form Fields */}
            <div className="flex-grow space-y-6">
              <div>
                <label className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase dark:text-white">
                  USERNAME
                </label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="input-brutal w-full px-4 py-3 font-mono uppercase bg-brutal-gray/20 text-brutal-gray cursor-not-allowed"
                />
                <p className="mt-2 text-xs text-brutal-gray font-bold uppercase dark:text-gray-400">
                  USERNAME CANNOT BE CHANGED TO ENSURE UNIQUENESS
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t-3 border-brutal-black">
            <button
              type="submit"
              disabled={loading}
              className="btn-brutal px-6 py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin mr-3"></div>
                  SAVING...
                </span>
              ) : (
                'SAVE CHANGES'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Email Change Section */}
      <div className="card-brutal p-8 mb-8">
        <h2 className="text-xl font-black text-brutal-black mb-6 font-mono uppercase dark:text-white">
          CHANGE EMAIL
        </h2>
        
        {emailChangeError && (
          <div className="mb-6 p-4 bg-accent-500 border-3 border-brutal-black text-white font-mono font-bold text-sm">
            {emailChangeError}
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase dark:text-white">
              CURRENT EMAIL
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input-brutal w-full px-4 py-3 font-mono bg-brutal-gray/20 text-brutal-gray cursor-not-allowed"
            />
          </div>
          
          <div>
            <label className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase dark:text-white">
              NEW EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-brutal w-full px-4 py-3 font-mono placeholder:text-brutal-gray"
              placeholder="ENTER NEW EMAIL ADDRESS"
            />
          </div>
          
          <button
            onClick={handleEmailChange}
            disabled={emailChangeLoading || email === user.email}
            className="btn-brutal px-6 py-3"
          >
            {emailChangeLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin mr-3"></div>
                CHANGING EMAIL...
              </span>
            ) : (
              <>
                <Mail size={18} className="inline mr-2" />
                CHANGE EMAIL
              </>
            )}
          </button>
          
          <p className="text-xs text-brutal-gray font-bold uppercase dark:text-gray-400">
            YOU WILL RECEIVE A CONFIRMATION EMAIL AT YOUR NEW ADDRESS. YOU MUST CONFIRM THE CHANGE TO COMPLETE THE PROCESS.
          </p>
        </div>
      </div>
      
      {/* Account Actions */}
      <div className="card-brutal p-8 mt-8">
        <h2 className="text-xl font-black text-brutal-black mb-6 font-mono uppercase dark:text-white">
          ACCOUNT ACTIONS
        </h2>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/change-password')}
            className="w-full btn-brutal-secondary py-3 text-left px-4"
          >
            <Lock size={18} className="inline mr-2" />
            CHANGE PASSWORD
          </button>
          
          <button
            onClick={() => {
              if (confirm('ARE YOU SURE YOU WANT TO SIGN OUT?')) {
                signOut();
                navigate('/');
              }
            }}
            className="w-full btn-brutal-secondary py-3 text-left px-4"
          >
            <LogOut size={18} className="inline mr-2" />
            SIGN OUT
          </button>
          
          <button
            onClick={handleDeleteAccountClick}
            className="w-full py-3 px-4 text-accent-600 border-3 border-accent-600 bg-white hover:bg-accent-50 transition-colors font-bold uppercase tracking-wide brutal-hover dark:bg-brutal-dark-brown dark:hover:bg-accent-900"
          >
            <Trash2 size={18} className="inline mr-2" />
            DELETE ACCOUNT
          </button>
        </div>
      </div>

      {/* User Deletion Modal */}
      <UserDeletionModal
        user={{
          id: user.id,
          username: user.username,
          email: user.email,
          videoCount: deletionModal.contentCounts?.videoCount || 0,
          commentCount: deletionModal.contentCounts?.commentCount || 0
        }}
        isOpen={deletionModal.isOpen}
        onClose={() => setDeletionModal({ isOpen: false, loading: false })}
        onConfirm={handleConfirmDeletion}
        loading={deletionModal.loading}
        isOwnAccount={true}
      />
    </div>
  );
};

export default ProfilePage;