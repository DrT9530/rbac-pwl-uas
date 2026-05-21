import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Badge from './ui/Badge';
import { getPrimaryRole, getInitials } from '../utils/permissions';

export default function Header({ title, subtitle, onMenuToggle }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const primaryRole = getPrimaryRole(user);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-gray-50 rounded-xl border border-gray-100 w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full" />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white text-xs font-bold">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-scale-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  <div className="mt-2">
                    <Badge role={primaryRole} size="xs" />
                  </div>
                </div>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
