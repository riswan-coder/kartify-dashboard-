import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getProfile } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      const { access, refresh } = res.data;

      // Get user profile to check role
      localStorage.setItem('access_token', access);
      const profileRes = await getProfile();
      const userData = profileRes.data;

      loginUser(userData, access, refresh);
      toast.success(`Welcome back, ${userData.username}!`);

      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/shops');
      } else if (userData.role === 'shop_owner') {
        navigate('/shop/products');
      } else {
        toast.error('Access denied. Customers use the mobile app.');
      }
    } catch (err) {
      toast.error('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">k</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">kartifys</h1>
          <p className="text-gray-500 text-sm mt-1">Admin & Shop Owner Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Customers — please use the EasyFind mobile app
        </p>
      </div>
    </div>
  );
}