import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import {
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  UsersIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ClerkDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [todayStats, setTodayStats] = useState({
    totalStaff: 0,
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0
  });

  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [attendanceResponse, leavesResponse] = await Promise.all([
        staffService.getAttendance({
          date: new Date().toISOString().split('T')[0]
        }),
        staffService.getAllLeaves({ status: 'pending' })
      ]);

      const attendance = attendanceResponse.data;

      setTodayStats({
        totalStaff: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        onLeave: attendance.filter(a => a.status === 'leave').length
      });

      setPendingLeaves(leavesResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Staff Today',
      value: todayStats.totalStaff,
      icon: UserGroupIcon,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    },
    {
      title: 'Present',
      value: todayStats.present,
      icon: CheckCircleIcon,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    },
    {
      title: 'Absent',
      value: todayStats.absent,
      icon: XCircleIcon,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    },
    {
      title: 'On Leave',
      value: todayStats.onLeave,
      icon: CalendarIcon,
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
  ];

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
      icon: UserGroupIcon,
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
      icon: DocumentTextIcon,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{stat.title}</p>
                <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{action.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Leave Applications
            </h3>
            <Link
              to="/clerk/leaves"
              className="text-sm text-dark-green-600 hover:text-dark-green-700 dark:text-dark-green-400 flex items-center"
            >
              View all
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                No pending leave applications
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {leave.staff.firstName} {leave.staff.lastName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} •{' '}
                        {leave.numberOfDays} days
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {leave.reason.substring(0, 60)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Today's Attendance Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard label="Present" value={todayStats.present} color="blue" />
          <SummaryCard label="Absent" value={todayStats.absent} color="red" />
          <SummaryCard label="Late" value={todayStats.late} color="yellow" />
          <SummaryCard label="On Leave" value={todayStats.onLeave} color="green" />
          <SummaryCard label="Total" value={todayStats.totalStaff} color="gray" />
        </div>

        <div className="mt-6">
          <Link
            to="/clerk/attendance"
            className="inline-flex items-center px-4 py-2 bg-dark-green-600 text-white rounded-lg text-sm font-medium hover:bg-dark-green-700"
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Mark Today's Attendance
          </Link>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, color }) => (
  <div className={`text-center p-4 bg-${color}-50 dark:bg-${color}-900/30 rounded-lg`}>
    <div className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>
      {value}
    </div>
    <div className={`text-sm text-${color}-800 dark:text-${color}-300`}>
      {label}
    </div>
  </div>
);

export default ClerkDashboard;
