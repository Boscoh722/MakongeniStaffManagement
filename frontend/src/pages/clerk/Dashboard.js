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
import useDocumentTitle from '../../hooks/useDocumentTitle';

const ClerkDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  useDocumentTitle('Dashboard');

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
      color: 'from-mustard-500 to-mustard-600',
      hoverColor: 'from-mustard-600 to-mustard-700',
      link: '/clerk/attendance'
    },
    {
      title: 'View Staff',
      description: 'Browse all staff members',
      icon: UsersIcon,
      color: 'from-royal-500 to-royal-600',
      hoverColor: 'from-royal-600 to-royal-700',
      link: '/clerk/viewstaff'
    },
    {
      title: 'Process Leaves',
      description: 'Review leave applications',
      icon: CalendarIcon,
      color: 'from-scarlet-500 to-scarlet-600',
      hoverColor: 'from-scarlet-600 to-scarlet-700',
      link: '/clerk/processleave'
    },
    {
      title: 'Generate Reports',
      description: 'Create attendance reports',
      icon: DocumentArrowDownIcon,
      color: 'from-mustard-500 via-scarlet-500 to-royal-500',
      hoverColor: 'from-mustard-600 via-scarlet-600 to-royal-600',
      link: '/clerk/generatereports'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-royal-50 via-mustard-50 to-scarlet-50 dark:from-neutral-900 dark:via-royal-900 dark:to-scarlet-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mustard-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-royal-50 via-mustard-50 to-scarlet-50 dark:from-neutral-900 dark:via-royal-900 dark:to-scarlet-900 min-h-screen font-sans">

      {/* Header */}
      <div className="bg-gradient-to-r from-mustard-500 via-scarlet-500 to-royal-500 rounded-2xl shadow-xl p-6 text-white">
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

      {/* Today's Attendance Summary */}
      <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-mustard-100 dark:border-mustard-900/30">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Today's Attendance Summary
          </h3>
          <button
            onClick={fetchDashboardData}
            className="text-sm text-mustard-600 hover:text-mustard-700 dark:text-mustard-400 dark:hover:text-mustard-300 flex items-center transition-colors duration-200"
          >
            Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard label="Present" value={todayStats.present} color="mustard" />
          <SummaryCard label="Absent" value={todayStats.absent} color="scarlet" />
          <SummaryCard label="Late" value={todayStats.late} color="yellow" />
          <SummaryCard label="On Leave" value={todayStats.onLeave} color="royal" />
          <SummaryCard label="Off Duty" value={todayStats.offDuty} color="purple" />
          <SummaryCard label="Total Staff" value={todayStats.totalStaff} color="neutral" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/clerk/mark-attendance"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-mustard-500 to-mustard-600 text-white rounded-xl text-sm font-medium hover:from-mustard-600 hover:to-mustard-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Mark Today's Attendance
          </Link>

          <Link
            to="/clerk/generate-reports"
            className="inline-flex items-center px-4 py-2 border border-mustard-300 text-neutral-700 rounded-xl text-sm font-medium hover:bg-mustard-50 dark:border-mustard-600 dark:text-neutral-300 dark:hover:bg-mustard-900/30 transition-all duration-200"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Generate Report
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-mustard-100 dark:border-mustard-900/30">
        <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className={`p-4 bg-gradient-to-r ${action.color} hover:${action.hoverColor} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-white/20 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200">
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold">{action.title}</p>
                <p className="text-sm opacity-90 mt-1">{action.description}</p>
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
    mustard: 'bg-mustard-100 dark:bg-mustard-900/50 text-mustard-800 dark:text-mustard-300 border-mustard-200 dark:border-mustard-800',
    scarlet: 'bg-scarlet-100 dark:bg-scarlet-900/50 text-scarlet-800 dark:text-scarlet-300 border-scarlet-200 dark:border-scarlet-800',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    royal: 'bg-royal-100 dark:bg-royal-900/50 text-royal-800 dark:text-royal-300 border-royal-200 dark:border-royal-800',
    purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    neutral: 'bg-neutral-100 dark:bg-neutral-900/50 text-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800'
  };

  return (
    <div className={`p-4 rounded-xl border text-center transition-all duration-200 hover:shadow-md ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm mt-1">{label}</div>
    </div>
  );
};

export default ClerkDashboard;
