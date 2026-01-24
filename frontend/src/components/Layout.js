import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX
} from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: HiOutlineHome,
      path: user?.role === 'UNIVERSITY_ISSUER' ? '/university-dashboard' :
            user?.role === 'STUDENT' ? '/student-portal' :
            user?.role === 'VERIFIER' ? '/verifier-portal' :
            user?.role === 'ADMIN' ? '/admin-dashboard' : '/',
      roles: ['UNIVERSITY_ISSUER', 'STUDENT', 'VERIFIER', 'ADMIN']
    },
    {
      name: 'Profile',
      icon: HiOutlineUser,
      path: '/profile',
      roles: ['UNIVERSITY_ISSUER', 'STUDENT', 'VERIFIER', 'ADMIN']
    },
    {
      name: 'Credentials',
      icon: HiOutlineDocumentText,
      path: '/credentials',
      roles: ['UNIVERSITY_ISSUER', 'STUDENT']
    },
    {
      name: 'Verification',
      icon: HiOutlineShieldCheck,
      path: '/verification',
      roles: ['VERIFIER']
    },
    {
      name: 'Admin',
      icon: HiOutlineCog,
      path: '/admin',
      roles: ['ADMIN']
    }
  ];

  const filteredNavItems = navigationItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">
            Credential Verify
          </h1>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-gray-600 text-sm">Secure Blockchain Credentials</p>
            <ThemeToggle />
          </div>
        </div>

        {/* User info */}
        <div className="glass-card p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <HiOutlineUser size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-900 font-medium text-sm dark:text-gray-100">{user?.name}</p>
              <p className="text-gray-500 text-xs capitalize dark:text-gray-400">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <div
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="nav-item w-full justify-center text-red-600 hover:bg-red-50"
          >
            <HiOutlineLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
