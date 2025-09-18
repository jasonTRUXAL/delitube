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
            className="w-full text-center text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Forgot Password?
          </button>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-black">
            <h3 className="font-bold text-lg mb-3">RESET PASSWORD</h3>
            <form onSubmit={handlePasswordReset}>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full p-3 border-2 border-black rounded-none font-mono text-sm mb-3"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isResetting || !resetEmail.trim()}
                  className="flex-1 bg-black text-white p-3 font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? 'SENDING...' : 'SEND RESET EMAIL'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  className="px-4 py-3 border-2 border-black bg-white hover:bg-gray-100 font-bold"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;