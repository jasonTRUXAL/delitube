import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Square, Eye, EyeOff } from 'lucide-react';

type AuthFormProps = {
  type: 'login' | 'register';
  onSubmit: (data: any) => Promise<void>;
};

const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      // Check for specific Supabase error messages
      if (err.message === 'User already registered') {
        setError('EMAIL ALREADY REGISTERED. TRY LOGGING IN OR USE DIFFERENT EMAIL.');
      } else if (err.message?.includes('duplicate key value violates unique constraint "profiles_username_unique"')) {
        setError('USERNAME TAKEN. CHOOSE A DIFFERENT USERNAME.');
      } else {
        setError(err.message?.toUpperCase() || 'AN ERROR OCCURRED');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto card-brutal p-8">
      {/* Header with brutal icon */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-600 border-3 border-brutal-black flex items-center justify-center mx-auto mb-4">
          <Square size={24} className="text-white" fill="currentColor" />
        </div>
        <h2 className="text-2xl font-black text-brutal-black font-mono uppercase">
          {type === 'login' ? 'LOGIN TO DELITUBE' : 'JOIN DELITUBE'}
        </h2>
        <p className="text-brutal-gray font-bold uppercase tracking-wide mt-2">
          {type === 'login' 
            ? 'ACCESS YOUR ACCOUNT' 
            : 'CREATE YOUR ACCOUNT'
          }
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-accent-500 border-3 border-brutal-black text-white font-mono font-bold text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {type === 'register' && (
          <div>
            <label htmlFor="username\" className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase">
              USERNAME
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="input-brutal w-full px-4 py-3 font-mono uppercase placeholder:text-brutal-gray"
              placeholder="YOUR USERNAME"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase">
            EMAIL
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="input-brutal w-full px-4 py-3 font-mono uppercase placeholder:text-brutal-gray"
            placeholder="YOUR@EMAIL.COM"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-black text-brutal-black mb-2 font-mono uppercase">
            PASSWORD
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="input-brutal w-full px-4 py-3 pr-12 font-mono placeholder:text-brutal-gray"
              placeholder="••••••••"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brutal-gray hover:text-brutal-black transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-brutal w-full py-3 text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin mr-3"></div>
              {type === 'login' ? 'LOGGING IN...' : 'CREATING...'}
            </span>
          ) : (
            type === 'login' ? 'LOGIN' : 'JOIN NOW'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        {type === 'login' ? (
          <p className="text-brutal-gray font-bold">
            NEW TO DELITUBE?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-black transition-colors font-mono uppercase">
              JOIN NOW
            </Link>
          </p>
        ) : (
          <p className="text-brutal-gray font-bold">
            ALREADY HAVE ACCOUNT?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-black transition-colors font-mono uppercase">
              LOGIN
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;