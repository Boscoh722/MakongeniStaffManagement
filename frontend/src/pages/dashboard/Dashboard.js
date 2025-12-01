import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import { reportService } from '../../services/reportService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    summary: {},
    attendanceTrend: [],
    leaveTrend: [],
    departmentStats: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardStats, recentActivities] = await Promise.all([
        staffService.getDashboardStats(),
        reportService.getRecentActivities()
      ]);
      
      setStats({
        summary: dashboardStats.data.summary,
        attendanceTrend: dashboardStats.data.trends?.attendance || [],
        leaveTrend: dashboardStats.data.trends?.leaves || [],
        departmentStats: dashboardStats.data.departmentStats || [],
        recentActivities: recentActivities.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Staff',
      value: stats.summary.totalStaff || 0,
      icon: UserGroupIcon,
      color: 'bg-blue-100 text-blue-800',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Active Today',
      value: stats.summary.todayAttendance || 0,
      icon: ChartBarIcon,
      color: 'bg-green-100 text-green-800',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Pending Leaves',
      value: stats.summary.pendingLeaves || 0,
      icon: CalendarIcon,
      color: 'bg-yellow-100 text-yellow-800',
      trend: '-3%',
      trendUp: false
    },
    {
      title: 'Open Cases',
      value: stats.summary.openDisciplinary || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-100 text-red-800',
      trend: '+2',
      trendUp: false
    }
  ];

  const attendanceData = {
    labels: stats.attendanceTrend.map(item => item.date),
    datasets: [
      {
        label: 'Attendance Rate %',
        data: stats.attendanceTrend.map(item => item.rate),
        borderColor: 'rgb(56, 146, 56)',
        backgroundColor: 'rgba(56, 146, 56, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const leaveData = {
    labels: stats.leaveTrend.map(item => `${item.month} ${item.year}`),
    datasets: [
      {
        label: 'Leave Applications',
        data: stats.leaveTrend.map(item => item.leaves),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  const departmentData = {
    labels: stats.departmentStats.map(dept => dept.department),
    datasets: [
      {
        label: 'Staff Count',
        data: stats.departmentStats.map(dept => dept.staffCount),
        backgroundColor: [
          'rgba(56, 146, 56, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ]
      }
    ]
  };

  const quickActions = [
    {
      title: 'Manage Staff',
      description: 'Add, edit, or remove staff members',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      link: '/admin/staff'
    },
    {
      title: 'View Reports',
      description: 'Generate system reports',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      link: '/reports'
    },
    {
      title: 'Process Leaves',
      description: 'Approve or reject leave applications',
      icon: CalendarIcon,
      color: 'bg-yellow-500',
      link: '/admin/leaves'
    },
    {
      title: 'Track Attendance',
      description: 'View attendance records',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      link: '/admin/attendance'
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
        <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
        <p className="mt-2 opacity-90">
          Here's what's happening with your staff management system today.
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            <span>Overall Attendance: {stats.summary.attendanceRate || '0'}%</span>
          </div>
        </div>
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
                <div className="flex items-center mt-2">
                  {stat.trendUp ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend} from last month
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Attendance Trend (Last 7 Days)
          </h3>
          <Line data={attendanceData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              }
            }
          }} />
        </div>

        {/* Leave Applications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Leave Applications (Last 6 Months)
          </h3>
          <Bar data={leaveData} />
        </div>
      </div>

      {/* Department Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Department Distribution
          </h3>
          <div className="h-64">
            <Pie data={departmentData} options={{
              responsive: true,
              maintainAspectRatio: false
            }} />
          </div>
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
          Recent Activities
        </h3>
        <div className="space-y-4">
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity) => (
              <div key={activity._id} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-900 mr-3">
                    <UserGroupIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.user?.firstName} {activity.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {activity.action} {activity.entity} • {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;