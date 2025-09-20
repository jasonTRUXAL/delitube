import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Square } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const ChangePasswordPage = () => {
  const { user, updatePassword } = useAuthStore();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords
    if (newPassword.length < 6) {
      setError('NEW PASSWORD MUST BE AT LEAST 6 CHARACTERS LONG');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('NEW PASSWORDS DO NOT MATCH');
      return;
    }
    
    if (currentPassword === newPassword) {
      setError('NEW PASSWORD MUST BE DIFFERENT FROM CURRENT PASSWORD');
      return;
    }
    
    setLoading(true);
    
    try {
      await updatePassword(newPassword);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message?.toUpperCase() || 'FAILED TO UPDATE PASSWORD');
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="btn-brutal-secondary px-4 py-2"
        >
          <ArrowLeft size={16} className="inline mr-2" />
          BACK TO PROFILE
        </button>
      </div>

      {/* Header Section */}
      <div className="card-brutal p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-warning-500 border-3 border-brutal-black flex items-center justify-center">
            <Lock size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brutal-black font-mono uppercase mb-2 dark:text-white">
              CHANGE PASSWORD
            </h1>
            <p className="text-brutal-gray font-bold uppercase tracking-wide dark:text-gray-400">
              UPDATE YOUR ACCOUNT PASSWORD
            </p>
          </div>
        </div>
      </div>

      {/* Password Change Form */}
      <div className="card-brutal p-8">
        {error && (
          <div className="mb-6 p-4 bg-accent-500 border-3 border-brutal-black text-white font-mono font-bold text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase dark:text-white">
              CURRENT PASSWORD
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-brutal w-full px-4 py-3 pr-12 font-mono placeholder:text-brutal-gray"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brutal-gray hover:text-brutal-black transition-colors"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase dark:text-white">
              NEW PASSWORD
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-brutal w-full px-4 py-3 pr-12 font-mono placeholder:text-brutal-gray"
                placeholder="Enter new password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brutal-gray hover:text-brutal-black transition-colors"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-brutal-gray font-bold mt-1 uppercase dark:text-gray-400">
              MINIMUM 6 CHARACTERS
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase dark:text-white">
              CONFIRM NEW PASSWORD
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-brutal w-full px-4 py-3 pr-12 font-mono placeholder:text-brutal-gray"
                placeholder="Confirm new password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brutal-gray hover:text-brutal-black transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t-3 border-brutal-black">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brutal-gray border-3 border-brutal-black flex items-center justify-center">
                  <Square size={16} className="text-white" fill="currentColor" />
                </div>
                <div>
                  <p className="font-black text-brutal-black font-mono uppercase text-sm dark:text-white">
                    SECURE PASSWORD CHANGE
                  </p>
                  <p className="text-xs text-brutal-gray font-bold uppercase dark:text-gray-400">
                    YOUR PASSWORD WILL BE ENCRYPTED
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="btn-brutal-secondary px-6 py-3"
                >
                  CANCEL
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-brutal px-6 py-3"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin mr-3"></div>
                      CHANGING...
                    </span>
                  ) : (
                    <>
                      <Lock size={18} className="inline mr-2" />
                      CHANGE PASSWORD
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;