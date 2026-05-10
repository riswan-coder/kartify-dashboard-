import { useEffect, useState } from 'react';
import { getAllShops, createShop } from '../../api/shops';
import toast from 'react-hot-toast';
import { Plus, Store, X, Check, Ban, Trash2 } from 'lucide-react';
import API from '../../api/axios';

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
  name: '', description: '', address: '',
  city: '', phone: '', email: '',
  owner_id: '', category: 'both'
});

  useEffect(() => {
    fetchShops();
    fetchShopOwners();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await getAllShops();
      setShops(res.data);
    } catch {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const fetchShopOwners = async () => {
    try {
      const res = await API.get('/auth/users/?role=shop_owner');
      setUsers(res.data);
    } catch {
      console.log('Could not load users');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
        const payload = {
          name: form.name,
          description: form.description,
          address: form.address,
          city: form.city,
          phone: form.phone,
          email: form.email,
          category: form.category,
        };
        if (form.owner_id) {
          payload.owner_id = parseInt(form.owner_id);
        }
        // Only add owner_id if selected
        if (form.owner_id) {
        payload.owner_id = parseInt(form.owner_id);
        }
        await createShop(payload);
        toast.success('Shop created successfully!');
        setShowForm(false);
        setForm({
        name: '', description: '', address: '',
        city: '', phone: '', email: '', owner_id: ''
        });
        fetchShops();
    } catch (err) {
      console.log('Error details:', err.response?.data);
      const errorMsg =
        err.response?.data?.owner_id?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to create shop.';
      toast.error(errorMsg);
}
    };

  const toggleShopStatus = async (shop) => {
    try {
      await API.patch(`/shops/${shop.id}/`, { is_active: !shop.is_active });
      toast.success(`Shop ${shop.is_active ? 'deactivated' : 'activated'}`);
      fetchShops();
    } catch {
      toast.error('Failed to update shop status');
    }
  };

  const deleteShop = async (shop) => {
    if (!window.confirm(
      `Are you sure you want to delete "${shop.name}"?\n\nThis will permanently delete the shop and all its products. This cannot be undone.`
    )) return;
    try {
      await API.delete(`/shops/${shop.id}/delete/`);
      toast.success(`${shop.name} deleted`);
      fetchShops();
    } catch {
      toast.error('Failed to delete shop');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Local Shops</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all registered shops on EasyFind</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Shop
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total shops</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{shops.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active shops</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {shops.filter(s => s.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Inactive shops</p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            {shops.filter(s => !s.is_active).length}
          </p>
        </div>
      </div>

      {/* Shops table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading shops...</div>
        ) : shops.length === 0 ? (
          <div className="p-12 text-center">
            <Store size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No shops yet</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add Shop" to register the first local shop</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Shop</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Owner</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">City</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Products</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shops.map(shop => (
                <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Store size={16} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{shop.name}</p>
                        <p className="text-xs text-gray-400">{shop.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {shop.owner?.username || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{shop.city}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{shop.product_count}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shop.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {shop.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleShopStatus(shop)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        shop.is_active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {shop.is_active ? <><Ban size={12} /> Deactivate</> : <><Check size={12} /> Activate</>}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleShopStatus(shop)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          shop.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {shop.is_active
                          ? <><Ban size={12} /> Deactivate</>
                          : <><Check size={12} /> Activate</>
                        }
                      </button>
                      <button
                        onClick={() => deleteShop(shop)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Shop Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Add New Shop</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
  
                {/* Row 1 - Shop name and City */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shop name
                    </label>
                    <input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g. Style Hub"
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
                        placeholder="e.g. Kochi"
                    />
                    </div>
                </div>

                {/* Row 2 - Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                    </label>
                    <input
                    required
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Full shop address"
                    />
                </div>

                {/* Row 3 - Phone and Email */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                    </label>
                    <input
                        required
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Phone number"
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
                        placeholder="Shop email (optional)"
                    />
                    </div>
                </div>

                {/* Row 4 - Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                    </label>
                    <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={2}
                    placeholder="Short description of the shop"
                    />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shop category
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">— Select category —</option>
                    <option value="men_clothes">Men Clothes</option>
                    <option value="men_shoes">Men Shoes</option>
                    <option value="women_clothes">Women Clothes</option>
                    <option value="women_shoes">Women Shoes</option>
                    <option value="kids_clothes">Kids Clothes</option>
                    <option value="kids_shoes">Kids Shoes</option>
                  </select>
                </div>

                {/* Row 5 - Assign owner */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign shop owner (optional)
                    </label>
                    <select
                    value={form.owner_id}
                    onChange={e => setForm({ ...form, owner_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                    <option value="">— Select a shop owner —</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>
                        {u.username} ({u.email})
                        </option>
                    ))}
                    </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                    Cancel
                    </button>
                    <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                    >
                    Create Shop
                    </button>
                </div>

                </form>
          </div>
        </div>
      )}
    </div>
  );
}