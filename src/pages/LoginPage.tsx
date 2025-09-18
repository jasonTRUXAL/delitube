import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuthStore } from '../stores/authStore';

const LoginPage = () => {
  const { signIn, resetPassword } = useAuthStore();
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async (data: { email: string; password: string }) => {
    await signIn(data.email, data.password);
    navigate('/');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    
    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      // Error is already handled in the store
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm type="login" onSubmit={handleLogin} />
      
      <div className="max-w-md mx-auto mt-6">
        {!showForgotPassword ? (
          <button
            onClick={() => setShowForgotPassword(true)}
            className="w-full text-center text-sm text-brutal-gray hover:text-brutal-black underline font-bold uppercase tracking-wide transition-colors dark:text-gray-400 dark:hover:text-white"
          >
            FORGOT PASSWORD?
          </button>
        ) : (
          <div className="card-brutal p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-warning-500 border-2 border-brutal-black flex items-center justify-center">
                <span className="text-white font-black text-xs">!</span>
              </div>
              <h3 className="font-black text-lg text-brutal-black font-mono uppercase dark:text-white">
                RESET PASSWORD
              </h3>
            </div>
            <form onSubmit={handlePasswordReset}>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL ADDRESS"
                className="input-brutal w-full px-4 py-3 font-mono uppercase placeholder:text-brutal-gray mb-4"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isResetting || !resetEmail.trim()}
                  className="btn-brutal flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? 'SENDING...' : 'SEND RESET EMAIL'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  className="btn-brutal-secondary px-6 py-3"
                >
                  CANCEL
                </button>
              </div>
            </form>
            <p className="text-xs text-brutal-gray font-bold uppercase mt-3 dark:text-gray-400">
              WE'LL SEND A RESET LINK TO YOUR EMAIL IF AN ACCOUNT EXISTS.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;