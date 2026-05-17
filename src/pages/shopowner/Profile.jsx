import { useEffect, useState } from 'react';
import { getMyShop, updateMyShop } from '../../api/shops';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Store, Camera, X } from 'lucide-react';

export default function ShopProfile() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', address: '',
    city: '', phone: '', email: '',
  });

  useEffect(() => {
    fetchShop();
  }, []);
  
  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [pwSaving, setPwSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!pwForm.current_password) {
      toast.error('Enter your current password');
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (pwForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPwSaving(true);
    try {
      await API.post('/auth/change-password/', pwForm);
      toast.success('Password changed successfully!');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const fetchShop = async () => {
    try {
      const res = await getMyShop();
      setShop(res.data);
      setForm({
        name: res.data.name || '',
        description: res.data.description || '',
        address: res.data.address || '',
        city: res.data.city || '',
        phone: res.data.phone || '',
        email: res.data.email || '',
      });
    } catch {
      toast.error('Could not load shop profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be under 5MB');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save text fields first
      await updateMyShop(form);

      // Upload logo if selected
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        await API.patch('/shops/my-shop/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Logo uploaded!');
      }

      toast.success('Shop profile updated!');
      setLogoFile(null);
      setLogoPreview(null);
      fetchShop();
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-gray-400">Loading shop profile...</div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shop Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Update your shop information shown to customers
        </p>
      </div>

      {/* Shop status */}
      <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
        shop?.is_active
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      }`}>
        <Store size={20} className={shop?.is_active ? 'text-green-600' : 'text-red-500'} />
        <div>
          <p className={`text-sm font-medium ${
            shop?.is_active ? 'text-green-700' : 'text-red-600'
          }`}>
            {shop?.is_active
              ? 'Your shop is active and visible to customers'
              : 'Your shop is currently inactive'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {shop?.is_active
              ? 'Customers can browse and order from your shop'
              : 'Contact admin to activate your shop'}
          </p>
        </div>
      </div>

      {/* Share link */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Your shop link — share on Instagram, WhatsApp
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 truncate">
            {`https://kartify-website.vercel.app/shop/${shop?.id}?ref=direct`}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `https://kartify-website.vercel.app/shop/${shop?.id}?ref=direct`
              );
              toast.success('Link copied!');
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors whitespace-nowrap"
          >
            Copy Link
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Customers who open this link will see only your shop
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSave} className="space-y-5">

          {/* Logo upload section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Shop logo
            </label>
            <div className="flex items-center gap-5">

              {/* Logo preview */}
              <div className="relative">
                {logoPreview || shop?.logo ? (
                  <div className="relative">
                    <img
                      src={logoPreview || shop?.logo}
                      alt="Shop logo"
                      className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                    />
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-primary-50 rounded-xl flex items-center justify-center border border-gray-200">
                    <Store size={28} className="text-primary-400" />
                  </div>
                )}
              </div>

              {/* Upload button */}
              <div>
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg border border-primary-200 hover:bg-primary-100 transition-colors text-sm font-medium">
                    <Camera size={15} />
                    {shop?.logo ? 'Change logo' : 'Upload logo'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG up to 5MB
                </p>
                <p className="text-xs text-gray-400">
                  Recommended: 200×200px
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">

            {/* Shop name and city */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  required
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                required
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Phone and email */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tell customers about your shop..."
              />
            </div>

          </div>
          
          {/* Change password section */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <p className="text-sm font-medium text-gray-700 mb-3">Change password</p>
            <div className="space-y-3">
              <input
                type="password"
                value={pwForm.current_password}
                onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Current password"
              />
              <input
                type="password"
                value={pwForm.new_password}
                onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="New password (min 8 chars)"
              />
              <input
                type="password"
                value={pwForm.confirm_password}
                onChange={e => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={pwSaving}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

        </form>
      </div>
    </div>
  );
}