import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuthStore } from '../stores/authStore';

const LoginPage = () => {
  const { signIn } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (data: { email: string; password: string }) => {
    await signIn(data.email, data.password);
    navigate('/');
  };

  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm type="login" onSubmit={handleLogin} />
    </div>
  );
};

export default LoginPage;