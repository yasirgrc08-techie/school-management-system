import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email) => {
    setEmail(email);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">School Management System</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="you@school.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick login buttons for demo */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Demo Login:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => quickLogin('admin@school.com')}
              className="px-3 py-2 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => quickLogin('teacher1@school.com')}
              className="px-3 py-2 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Teacher
            </button>
            <button
              onClick={() => quickLogin('student1@school.com')}
              className="px-3 py-2 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              Student
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Password: password123</p>
        </div>
      </div>
    </div>
  );
}
