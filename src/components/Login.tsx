import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginProps {
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: window.location.origin + '/admin'
        }
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Login</h2>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded mb-6">
            Check your email for the login link!
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label 
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>

            <p className="text-sm text-gray-400 mt-4">
              A magic link will be sent to your email address.
              Click the link to log in to the admin dashboard.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;