import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuthStore } from '../stores/authStore';

const RegisterPage = () => {
  const { signUp } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (data: { email: string; password: string; username: string }) => {
    await signUp(data.email, data.password, data.username);
    navigate('/login');
  };

  return (
    <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm type="register" onSubmit={handleRegister} />
    </div>
  );
};

export default RegisterPage;