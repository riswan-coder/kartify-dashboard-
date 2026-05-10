import { useEffect, useState } from 'react';
import { getShopOrders, updateOrderStatus } from '../../api/orders';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { ShoppingBag, Eye, X, ChevronRight } from 'lucide-react';

export default function ShopOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getShopOrders();
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
      setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please enter a cancellation reason');
      return;
    }
    setUpdating(true);
    try {
      await API.post(`/orders/shop/${cancellingOrder.id}/cancel/`, {
        reason: cancelReason
      });
      toast.success('Order cancelled');
      setShowCancelModal(false);
      setCancelReason('');
      setCancellingOrder(null);
      setSelected(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const nextStatus = {
    pending: 'confirmed',
    confirmed: 'shipped',
    shipped: 'delivered',
  };

  const nextStatusLabel = {
    pending: 'Confirm Order',
    confirmed: 'Mark as Shipped',
    shipped: 'Mark as Delivered',
  };

  const statusStyles = {
    pending: 'bg-yellow-50 text-yellow-700',
    confirmed: 'bg-blue-50 text-blue-700',
    shipped: 'bg-purple-50 text-purple-700',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-600',
  };

  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  const filteredOrders = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your shop orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-500 mt-1">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Shipped</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {orders.filter(o => o.status === 'shipped').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
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
            <p className="text-gray-500 font-medium">No orders yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Order</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Pincode</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Total</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.delivery_pincode || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ₹{order.total_price}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[order.status]}`}>
                      {order.status}
                    </span>
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

              {/* Status flow */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                {statuses.slice(0, 4).map((s, i) => (
                  <div key={s} className="flex items-center gap-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                        selected.status === s
                          ? 'bg-primary-600 text-white'
                          : statuses.indexOf(selected.status) > i
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {statuses.indexOf(selected.status) > i ? '✓' : i + 1}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{s}</p>
                    </div>
                    {i < 3 && <ChevronRight size={14} className="text-gray-300 mb-4" />}
                  </div>
                ))}
              </div>

              {/* Cancelled reason */}
              {selected.status === 'cancelled' && selected.cancel_reason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-red-700 mb-1">Cancellation reason</p>
                  <p className="text-sm text-red-600">{selected.cancel_reason}</p>
                </div>
              )}

              {/* Customer info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium text-gray-900">{selected.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{selected.delivery_phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pincode</p>
                  <p className="font-medium text-gray-900">
                    {selected.delivery_pincode || '—'}
                  </p>
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
                    <p className="text-gray-500">Customer note</p>
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

              {/* Action buttons */}
              <div className="flex gap-3">
                {nextStatus[selected.status] && (
                  <button
                    onClick={() => handleStatusUpdate(selected.id, nextStatus[selected.status])}
                    disabled={updating}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {updating ? 'Updating...' : nextStatusLabel[selected.status]}
                  </button>
                )}

                {/* Cancel button */}
                {['pending', 'confirmed'].includes(selected.status) && (
                  <button
                    onClick={() => {
                      setCancellingOrder(selected);
                      setShowCancelModal(true);
                    }}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              {selected.status === 'delivered' && (
                <div className="text-center py-2 text-green-600 text-sm font-medium">
                  Order completed successfully
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Cancel reason modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Cancel Order #{cancellingOrder?.id}</h2>
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Please provide a reason for cancelling this order.
                The customer will see this reason.
              </p>

              {/* Quick reason buttons */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Out of stock',
                  'Item unavailable',
                  'Cannot deliver to this area',
                  'Customer requested cancellation',
                  'Wrong order details',
                  'Other reason',
                ].map(reason => (
                  <button
                    key={reason}
                    onClick={() => setCancelReason(reason)}
                    className={`text-xs px-3 py-2 rounded-lg border text-left transition-colors ${
                      cancelReason === reason
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or write your own reason
                </label>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  rows={3}
                  placeholder="Enter cancellation reason..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Go back
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={updating || !cancelReason.trim()}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                >
                  {updating ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}