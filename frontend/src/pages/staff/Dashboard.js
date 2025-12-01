import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StaffDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    attendance: {},
    leaves: {},
    disciplinary: 0,
    upcomingLeaves: [],
  });

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

  const attendanceData = {
    labels: ['Present', 'Absent', 'Leave', 'Off Duty'],
    datasets: [
      {
        label: 'Attendance Summary (Last 30 Days)',
        data: [
          stats.attendance.present || 0,
          stats.attendance.absent || 0,
          stats.attendance.leave || 0,
          stats.attendance.offDuty || 0,
        ],
        backgroundColor: [
          'rgba(56, 146, 56, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
      },
    ],
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Employee ID: {user?.employeeId} | Department: {user?.department}
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

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Attendance Overview
          </h3>
          <Bar data={attendanceData} />
        </div>

        {/* Upcoming Leaves */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Leaves
          </h3>
          <div className="space-y-4">
            {stats.upcomingLeaves.length > 0 ? (
              stats.upcomingLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{leave.leaveType}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(leave.startDate).toLocaleDateString()} -{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    {leave.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming leaves</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-dark-green-600 text-white rounded-lg hover:bg-dark-green-700">
            Apply for Leave
          </button>
          <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View Attendance
          </button>
          <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Submit Appeal
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;