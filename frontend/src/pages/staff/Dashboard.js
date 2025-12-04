import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    attendance: {},
    leaves: {},
    disciplinary: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/staff/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const statCards = [
    {
      title: 'Days Present',
      value: stats.attendance.present || 0,
      icon: CalendarDaysIcon,
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Pending Leaves',
      value: stats.leaves.pending || 0,
      icon: ClockIcon,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      title: 'Leave Days Taken',
      value: stats.leaves.taken || 0,
      icon: UserGroupIcon,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Active Cases',
      value: stats.disciplinary || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-100 text-red-800',
    },
  ];

  // Helper: format department
    const departmentName =
      user?.department?.name ||
      user?.department ||
      "No Department";


  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Employee ID: {user?.employeeId}
          {user?.department?.name && (
            <> | Department: {user.department.name}</>
          )}
        </p>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <button
            onClick={() => navigate('/staff/apply-leave')}
            className="px-4 py-3 bg-dark-green-600 text-white rounded-lg hover:bg-dark-green-700"
          >
            Apply for Leave
          </button>

          <button
            onClick={() => navigate('/staff/attendance')}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Attendance
          </button>

          <button
            onClick={() => navigate('/staff/disciplinary-appeal')}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Submit Appeal
          </button>

        </div>
      </div>

    </div>
  );
};

export default StaffDashboard;
