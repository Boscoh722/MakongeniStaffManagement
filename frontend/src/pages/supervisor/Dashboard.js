import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import {
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SupervisorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    staffCount: 0,
    pendingLeaves: 0,
    attendanceRate: 0,
    openCases: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupervisorData();
  }, []);

  const fetchSupervisorData = async () => {
    try {
      // Fetch supervisor-specific data
      const [staffResponse, leavesResponse] = await Promise.all([
        staffService.getStaff(),
        staffService.getAllLeaves()
      ]);

      const supervisedStaff = staffResponse.data.filter(s => 
        s.supervisor?._id === user._id || s.supervisor === user._id
      );

      const pendingLeaves = leavesResponse.data.filter(l => 
        l.status === 'pending' && 
        supervisedStaff.some(s => s._id === l.staff._id)
      );

      setStats({
        staffCount: supervisedStaff.length,
        pendingLeaves: pendingLeaves.length,
        attendanceRate: 85, // Mock data
        openCases: 3, // Mock data
        recentActivities: [] // Mock data
      });
    } catch (error) {
      console.error('Error fetching supervisor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Staff Under You',
      value: stats.staffCount,
      icon: UserGroupIcon,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: CalendarIcon,
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: ChartBarIcon,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    },
    {
      title: 'Open Cases',
      value: stats.openCases,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
  ];

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Team Attendance',
        data: [85, 90, 88, 92, 87, 45, 30],
        backgroundColor: 'rgba(56, 146, 56, 0.8)'
      }
    ]
  };

  const quickActions = [
    {
      title: 'Review Leaves',
      description: 'Approve or reject leave applications',
      icon: CalendarIcon,
      color: 'bg-yellow-500',
      link: '/supervisor/leaves'
    },
    {
      title: 'View Team',
      description: 'See all staff under your supervision',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      link: '/supervisor/staff'
    },
    {
      title: 'Mark Attendance',
      description: 'Mark attendance for your team',
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      link: '/supervisor/attendance'
    },
    {
      title: 'Send Notices',
      description: 'Send notifications to your team',
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
      link: '/supervisor/notices'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-dark-green-600 to-dark-green-800 rounded-lg shadow p-6 text-white">
        <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
        <p className="mt-2 opacity-90">
          Welcome, {user?.firstName}. Manage your team effectively.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Team Attendance This Week
          </h3>
          <Bar data={chartData} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <a
                key={action.title}
                href={action.link}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {action.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Team Activities
        </h3>
        <div className="space-y-4">
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-900 mr-3">
                    <UserGroupIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Team Member Activity
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      • Just now
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  View
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No recent activities from your team</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;