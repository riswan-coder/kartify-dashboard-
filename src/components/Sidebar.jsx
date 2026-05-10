import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Store, Package, ShoppingBag,
  Users, LogOut, Megaphone, KeyRound
} from 'lucide-react';

export default function Sidebar() {
  const { user, logoutUser } = useAuth();

  const adminLinks = [
    { to: '/admin/shops', icon: Store, label: 'Shops' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'All Orders' },
    { to: '/admin/ads', icon: Megaphone, label: 'Advertisements' },
    { to: '/admin/change-password', icon: KeyRound, label: 'Change Password' },
  ];

  const shopOwnerLinks = [
    { to: '/shop/products', icon: Package, label: 'My Products' },
    { to: '/shop/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/shop/profile', icon: Store, label: 'Shop Profile' },
  ];

  const links = user?.role === 'admin' ? adminLinks : shopOwnerLinks;

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">k</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">kartifys</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logoutUser}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}