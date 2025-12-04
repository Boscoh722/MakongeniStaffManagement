import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import {
  CheckCircleIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ClerkDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [todayStats, setTodayStats] = useState({
    totalStaff: 0,
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
    offDuty: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const attendanceResponse = await staffService.getAttendance({
        date: new Date().toISOString().split('T')[0]
      });

      const attendance = attendanceResponse.data || [];

      setTodayStats({
        totalStaff: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        onLeave: attendance.filter(a => a.status === 'leave').length,
        offDuty: attendance.filter(a => a.status === 'off-duty').length
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Mark attendance for today',
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      link: '/clerk/attendance'
    },
    {
      title: 'View Staff',
      description: 'Browse all staff members',
      icon: UsersIcon,
      color: 'bg-blue-500',
      link: '/clerk/viewstaff'
    },
    {
      title: 'Process Leaves',
      description: 'Review leave applications',
      icon: CalendarIcon,
      color: 'bg-yellow-500',
      link: '/clerk/processleave'
    },
    {
      title: 'Generate Reports',
      description: 'Create attendance reports',
      icon: DocumentArrowDownIcon,
      color: 'bg-purple-500',
      link: '/clerk/generatereports'
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

      {/* Header */}
      <div className="bg-gradient-to-r from-dark-green-600 to-dark-green-800 rounded-lg shadow p-6 text-white">
        <h1 className="text-2xl font-bold">Clerk Dashboard</h1>
        <p className="mt-2 opacity-90">
          Welcome, {user?.firstName}. Manage daily attendance and administrative tasks.
        </p>
        <div className="mt-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          <span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Today's Attendance Summary — moved to top */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Attendance Summary
          </h3>
          <button
            onClick={fetchDashboardData}
            className="text-sm text-dark-green-600 hover:text-dark-green-700 dark:text-dark-green-400 flex items-center"
          >
            Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard label="Present" value={todayStats.present} color="green" />
          <SummaryCard label="Absent" value={todayStats.absent} color="red" />
          <SummaryCard label="Late" value={todayStats.late} color="yellow" />
          <SummaryCard label="On Leave" value={todayStats.onLeave} color="blue" />
          <SummaryCard label="Off Duty" value={todayStats.offDuty} color="purple" />
          <SummaryCard label="Total Staff" value={todayStats.totalStaff} color="gray" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/clerk/mark-attendance"
            className="inline-flex items-center px-4 py-2 bg-dark-green-600 text-white rounded-lg text-sm font-medium hover:bg-dark-green-700"
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Mark Today's Attendance
          </Link>

          <Link
            to="/clerk/generate-reports"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Generate Report
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${action.color} mr-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{action.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

const SummaryCard = ({ label, value, color }) => {
  const colors = {
    green: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    gray: 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
  };

  return (
    <div className={`p-4 rounded-lg border text-center ${colors[color]}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-sm mt-1">{label}</div>
    </div>
  );
};

export default ClerkDashboard;
