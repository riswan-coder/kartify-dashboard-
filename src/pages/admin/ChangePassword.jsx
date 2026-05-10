import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';

export default function ChangePassword() {
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/change-password/', form);
      toast.success('Password changed successfully!');
      setForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
        <p className="text-gray-500 text-sm mt-1">Update your admin password</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6 p-4 bg-primary-50 rounded-xl">
          <KeyRound size={20} className="text-primary-600" />
          <div>
            <p className="text-sm font-medium text-primary-700">
              Admin password change
            </p>
            <p className="text-xs text-primary-600 mt-0.5">
              You will need to login again after changing
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current password
            </label>
            <input
              type="password"
              required
              value={form.current_password}
              onChange={e => setForm({ ...form, current_password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              type="password"
              required
              value={form.new_password}
              onChange={e => setForm({ ...form, new_password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              required
              value={form.confirm_password}
              onChange={e => setForm({ ...form, confirm_password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Repeat new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}