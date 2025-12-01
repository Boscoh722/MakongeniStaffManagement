import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: `/${user?.role}`, icon: HomeIcon },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseNav,
        { name: 'Staff Management', href: '/admin/staff', icon: UserGroupIcon },
        { name: 'Leave Management', href: '/admin/leaves', icon: CalendarIcon },
        { name: 'Attendance', href: '/admin/attendance', icon: ChartBarIcon },
        { name: 'Disciplinary', href: '/admin/disciplinary', icon: DocumentTextIcon },
      ];
    } else if (user?.role === 'supervisor') {
      return [
        ...baseNav,
        { name: 'Staff Overview', href: '/supervisor/staff', icon: UserGroupIcon },
        { name: 'Leave Approval', href: '/supervisor/leaves', icon: CalendarIcon },
      ];
    } else if (user?.role === 'staff') {
      return [
        ...baseNav,
        { name: 'Profile', href: '/staff/profile', icon: UserGroupIcon },
        { name: 'Apply Leave', href: '/staff/apply-leave', icon: CalendarIcon },
        { name: 'My Attendance', href: '/staff/attendance', icon: ChartBarIcon },
      ];
    } else if (user?.role === 'clerk') {
      return [
        ...baseNav,
        { name: 'Mark Attendance', href: '/clerk/attendance', icon: ChartBarIcon },
      ];
    }

    return baseNav;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-dark-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold">Makongeni Ward Staff Management</h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  {getNavigation().map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-dark-green-700"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                {user?.firstName} {user?.lastName} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-dark-green-700"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark-green-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm">
            Makongeni Ward Staff Management System © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
