import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, Megaphone, Trash2, Check, Ban } from 'lucide-react';

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    shop_id: '',
    slot: 'slot_1',
    is_active: true,
  });

  useEffect(() => {
    fetchAds();
    fetchShops();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await API.get('/ads/');
      setAds(res.data);
    } catch {
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const res = await API.get('/shops/admin/all/');
      setShops(res.data);
    } catch {}
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please upload an image');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('shop_id', form.shop_id);
      formData.append('slot', form.slot);
      formData.append('image', imageFile);
      formData.append('is_active', form.is_active);
      await API.post('/ads/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Ad created!');
      setShowForm(false);
      setForm({ shop_id: '', slot: 'slot_1', is_active: true });
      setImageFile(null);
      setImagePreview(null);
      fetchAds();
    } catch (err) {
      console.log(err.response?.data);
      toast.error('Failed to create ad');
    }
  };

  const toggleAd = async (ad) => {
    try {
      await API.patch(`/ads/${ad.id}/`, { is_active: !ad.is_active });
      toast.success(`Ad ${ad.is_active ? 'deactivated' : 'activated'}`);
      fetchAds();
    } catch {
      toast.error('Failed to update');
    }
  };

  const deleteAd = async (id) => {
    if (!window.confirm('Delete this ad?')) return;
    try {
      await API.delete(`/ads/${id}/`);
      toast.success('Ad deleted');
      fetchAds();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const slot1Ads = ads.filter(a => a.slot === 'slot_1');
  const slot2Ads = ads.filter(a => a.slot === 'slot_2');

  const AdCard = ({ ad }) => (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
      <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {ad.image_url ? (
          <img src={ad.image_url} alt="Ad" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Megaphone size={18} className="text-gray-300" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">{ad.shop?.name}</p>
        <p className="text-xs text-gray-500">{ad.shop?.city}</p>
        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
          ad.is_active
            ? 'bg-green-50 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {ad.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => toggleAd(ad)}
          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg ${
            ad.is_active
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          {ad.is_active ? <><Ban size={11} /> Off</> : <><Check size={11} /> On</>}
        </button>
        <button
          onClick={() => deleteAd(ad.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisements</h1>
          <p className="text-gray-500 text-sm mt-1">
            Two ad slots — popup and banner
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Create Ad
        </button>
      </div>

      {/* Two slot sections */}
      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* Slot 1 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Megaphone size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Slot 1 — Popup Ad</p>
              <p className="text-xs text-gray-500">Shows when customer opens app</p>
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : slot1Ads.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-400 text-sm">No popup ad</p>
              <button
                onClick={() => { setForm({ ...form, slot: 'slot_1' }); setShowForm(true); }}
                className="mt-2 text-xs text-primary-600 font-medium hover:underline"
              >
                + Add popup ad
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {slot1Ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>
          )}
        </div>

        {/* Slot 2 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Megaphone size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Slot 2 — Banner Ads</p>
              <p className="text-xs text-gray-500">Scrolling banner in home screen</p>
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : slot2Ads.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-400 text-sm">No banner ads</p>
              <button
                onClick={() => { setForm({ ...form, slot: 'slot_2' }); setShowForm(true); }}
                className="mt-2 text-xs text-primary-600 font-medium hover:underline"
              >
                + Add banner ad
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {slot2Ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>
          )}
        </div>

      </div>

      {/* Create Ad Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Create Ad</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Slot selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad slot
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, slot: 'slot_1' })}
                    className={`p-3 rounded-xl border-2 text-left transition-colors ${
                      form.slot === 'slot_1'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">Slot 1</p>
                    <p className="text-xs text-gray-500 mt-0.5">Popup on app open</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, slot: 'slot_2' })}
                    className={`p-3 rounded-xl border-2 text-left transition-colors ${
                      form.slot === 'slot_2'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">Slot 2</p>
                    <p className="text-xs text-gray-500 mt-0.5">Banner in home screen</p>
                  </button>
                </div>
              </div>

              {/* Shop */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select shop
                </label>
                <select
                  required
                  value={form.shop_id}
                  onChange={e => setForm({ ...form, shop_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">— Choose a shop —</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name} — {shop.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad image
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <span className="text-sm text-gray-500">
                    {imageFile ? imageFile.name : 'Click to upload image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="mt-3 relative">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="h-40 w-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >×</button>
                  </div>
                )}
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Make active immediately
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >Cancel</button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >Create Ad</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}