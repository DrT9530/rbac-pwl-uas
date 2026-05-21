import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  KeyRound,
  GraduationCap,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import Badge from './ui/Badge';
import { getPrimaryRole, getInitials } from '../utils/permissions';

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const { isAdmin, isSuperAdmin, isITSupport } = usePermission();
  const location = useLocation();
  const primaryRole = getPrimaryRole(user);

  const getMenuItems = () => {
    const items = [];

    items.push({
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    });

    if (isAdmin()) {
      items.push({
        to: '/admin/users',
        icon: Users,
        label: 'Users',
      });
    }

    if (isITSupport()) {
      items.push({
        to: '/admin/users',
        icon: KeyRound,
        label: 'Reset Password',
      });
    }

    items.push({
      to: '/courses',
      icon: BookOpen,
      label: isAdmin() ? 'All Courses' : 'My Courses',
    });

    if (isSuperAdmin()) {
      items.push({
        to: '/settings',
        icon: Settings,
        label: 'System',
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-sidebar z-50 flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-64'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent-500 shadow-lg shadow-accent-500/30">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Edlink
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Learning System
            </p>
          </div>
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg hover:bg-white/5 text-gray-500 lg:hidden"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-4 py-2 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
            Menu
          </p>
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/dashboard' &&
                location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to + item.label}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle?.();
                }}
                className={`sidebar-item ${
                  isActive ? 'sidebar-item-active' : ''
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-500" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-500/20 text-accent-400 text-sm font-bold flex-shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <Badge role={primaryRole} size="xs" />
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
