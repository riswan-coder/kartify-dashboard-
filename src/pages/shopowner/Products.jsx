import { useEffect, useState } from 'react';
import { getMyProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../../api/products';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Package, X, Pencil, Trash2, Image } from 'lucide-react';

const emptyForm = {
  name: '', description: '', price: '',
  stock: '', sizes: '', colors: '',
  category_id: '', is_available: true,
};

export default function ShopProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getMyProducts();
      setProducts(res.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch {}
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setPrimaryIndex(0);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sizes: product.sizes,
      colors: product.colors,
      category_id: product.category?.id || '',
      is_available: product.is_available,
    });
    setImages([]);
    setPrimaryIndex(0);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (primaryIndex === index) setPrimaryIndex(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category_id: parseInt(form.category_id),
      };

      let productId;
      if (editing) {
        const res = await updateProduct(editing.id, payload);
        productId = editing.id;
        toast.success('Product updated!');
      } else {
        const res = await createProduct(payload);
        productId = res.data.id;
        toast.success('Product added!');
      }

      // Upload images if any selected
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const formData = new FormData();
          formData.append('image_file', images[i]);  // ← changed from 'image' to 'image_file'
          formData.append('product', productId);
          formData.append('is_primary', i === primaryIndex ? 'true' : 'false');

          console.log('Uploading image:', images[i].name, 'for product:', productId);

          try {
            const imgRes = await API.post('/products/images/', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Image uploaded:', imgRes.data);
          } catch (imgErr) {
            console.log('Image upload error:', imgErr.response?.data);
            toast.error('Product saved but image upload failed');
          }
        }
        toast.success('Images uploaded!');
      }

      setShowForm(false);
      setForm(emptyForm);
      setImages([]);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      console.log(err.response?.data);
      toast.error('Failed to save product.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const getCategoryLabel = (cat) => {
    if (!cat) return '—';
    return `${cat.gender.charAt(0).toUpperCase() + cat.gender.slice(1)} · ${cat.product_type.charAt(0).toUpperCase() + cat.product_type.slice(1)}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your shop's clothing and shoes</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Available</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {products.filter(p => p.is_available).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Hidden</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">
            {products.filter(p => !p.is_available).length}
          </p>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No products yet</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add Product" to list your first item</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Product</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Category</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Price</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Stock</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Images</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images.find(i => i.is_primary)?.image || product.images[0].image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                          <Package size={16} className="text-primary-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sizes || 'No sizes'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getCategoryLabel(product.category)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{product.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.images?.length || 0} photos
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.is_available
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.is_available ? 'Available' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Product name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Blue Denim Jacket"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  value={form.category_id}
                  onChange={e => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">— Select category —</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Sizes and Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
                  <input
                    value={form.sizes}
                    onChange={e => setForm({ ...form, sizes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="S,M,L,XL or 6,7,8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colors</label>
                  <input
                    value={form.colors}
                    onChange={e => setForm({ ...form, colors: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Red,Blue,Black"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Short product description"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product images (max 5)
                </label>

                {/* Upload button */}
                <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <Image size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* Image previews */}
                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview ${index}`}
                          className={`w-full h-16 object-cover rounded-lg border-2 cursor-pointer ${
                            primaryIndex === index
                              ? 'border-primary-500'
                              : 'border-gray-200'
                          }`}
                          onClick={() => setPrimaryIndex(index)}
                        />
                        {primaryIndex === index && (
                          <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-primary-500 text-white rounded-b-lg py-0.5">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Click an image to set it as the main photo
                  </p>
                )}
              </div>

              {/* Available toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={form.is_available}
                  onChange={e => setForm({ ...form, is_available: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="is_available" className="text-sm text-gray-700">
                  Show this product to customers
                </label>
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
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
                >
                  {uploading ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}