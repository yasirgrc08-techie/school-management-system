import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, GraduationCap,
  LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navItems = {
  ADMIN: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/classes', label: 'Classes', icon: BookOpen },
    { path: '/subjects', label: 'Subjects', icon: GraduationCap },
    { path: '/attendance', label: 'Attendance', icon: ClipboardList },
  ],
  TEACHER: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/classes', label: 'My Classes', icon: BookOpen },
    { path: '/attendance', label: 'Attendance', icon: ClipboardList },
  ],
  STUDENT: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/classes', label: 'My Classes', icon: BookOpen },
    { path: '/attendance', label: 'My Attendance', icon: ClipboardList },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = navItems[user?.role] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-semibold text-indigo-600">SchoolMS</span>
        <div className="w-6" />
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-10 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">SchoolMS</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.role} Portal</p>
        </div>

        <nav className="p-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">{children}</div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-[5] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
