import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { ShoppingBag, Eye, X } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders/admin/all/');
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  const statusStyles = {
    pending:   'bg-yellow-50 text-yellow-700',
    confirmed: 'bg-blue-50 text-blue-700',
    shipped:   'bg-purple-50 text-purple-700',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-600',
  };

  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <p className="text-gray-500 text-sm mt-1">View all orders across every shop</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {statuses.map(s => (
          <div key={s} className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-xs text-gray-500 capitalize">{s}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {orders.filter(o => o.status === s).length}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', ...statuses].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filterStatus === s
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No orders found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Order</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Items</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Total</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length} items</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ₹{order.total_price}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelected(order)}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Order #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium text-gray-900">{selected.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{selected.delivery_phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selected.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Delivery address</p>
                  <p className="font-medium text-gray-900">{selected.delivery_address}</p>
                </div>
                {selected.note && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Note</p>
                    <p className="font-medium text-gray-900">{selected.note}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Order items</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {selected.items?.map((item, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 text-sm ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
                      <div>
                        <p className="font-medium text-gray-900">{item.product?.name}</p>
                        <p className="text-gray-400 text-xs">
                          Qty: {item.quantity}
                          {item.size ? ` · Size: ${item.size}` : ''}
                          {item.color ? ` · Color: ${item.color}` : ''}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">₹{item.subtotal}</p>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <p className="font-medium text-gray-900">Total</p>
                    <p className="font-bold text-gray-900">₹{selected.total_price}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}