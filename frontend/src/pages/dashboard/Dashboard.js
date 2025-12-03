import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    monthlyLeaves: [],
    recentLeaves: [],
    attendanceStats: {}
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await staffService.getDashboardStats();
      const stats = statsResponse.data || {};
      
      // Process monthly leave data for chart
      const monthlyLeaves = processMonthlyLeaveData(stats.monthlyLeaves || []);
      
      setDashboardData({
        stats,
        monthlyLeaves,
        recentLeaves: stats.recentLeaves || [],
        attendanceStats: stats.attendanceStats || {}
      });

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyLeaveData = (monthlyData) => {
    // Ensure we have data for the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i)); // Start from 30 days ago
      return date.toISOString().split('T')[0];
    });

    // Create a map of date to data
    const dataMap = {};
    monthlyData.forEach(item => {
      dataMap[item.date] = item;
    });

    // Fill in missing days
    return last30Days.map(date => ({
      date,
      approved: dataMap[date]?.approved || 0,
      pending: dataMap[date]?.pending || 0,
      rejected: dataMap[date]?.rejected || 0,
      total: dataMap[date]?.total || 0
    }));
  };

  // Chart data for monthly leaves
  const leaveChartData = {
    labels: dashboardData.monthlyLeaves.map(item => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Approved',
        data: dashboardData.monthlyLeaves.map(item => item.approved),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      },
      {
        label: 'Pending',
        data: dashboardData.monthlyLeaves.map(item => item.pending),
        backgroundColor: 'rgba(251, 191, 36, 0.6)',
        borderColor: 'rgb(251, 191, 36)',
        borderWidth: 1
      },
      {
        label: 'Rejected',
        data: dashboardData.monthlyLeaves.map(item => item.rejected),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }
    ]
  };

  // Attendance chart data
  const attendanceChartData = {
    labels: ['Present', 'Late', 'Absent', 'On Leave'],
    datasets: [
      {
        data: [
          dashboardData.stats.todayPresent || 0,
          dashboardData.stats.todayLate || 0,
          dashboardData.stats.todayAbsent || 0,
          dashboardData.stats.todayOnLeave || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(251, 191, 36, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(59, 130, 246, 0.7)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Leave Applications - Last 30 Days'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user?.firstName}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Staff */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Staff
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {dashboardData.stats.totalStaff || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="text-green-600 dark:text-green-400">
                  +{dashboardData.stats.recentHires || 0} this month
                </span>
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Active Leaves Today */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Leaves
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {dashboardData.stats.activeLeaves || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="text-yellow-600 dark:text-yellow-400">
                  {dashboardData.stats.pendingLeaves || 0} pending
                </span>
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today's Attendance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {dashboardData.stats.todayPresent || 0}/{dashboardData.stats.totalStaff || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="text-red-600 dark:text-red-400">
                  {dashboardData.stats.todayAbsent || 0} absent
                </span>
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Monthly Leave Applications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Applications
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {dashboardData.monthlyLeaves.reduce((sum, day) => sum + day.total, 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="text-blue-600 dark:text-blue-400">
                  {dashboardData.stats.approvalRate || 0}% approval rate
                </span>
              </p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Applications Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Leave Applications Trend (30 Days)
          </h3>
          <div className="h-80">
            <Bar data={leaveChartData} options={chartOptions} />
          </div>
        </div>

        {/* Today's Attendance Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Attendance Overview
          </h3>
          <div className="h-80">
            <Doughnut 
              data={attendanceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Leave Applications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Leave Applications
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Last 7 days
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1 text-sm bg-dark-green-600 text-white rounded hover:bg-dark-green-700"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Applied On
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.recentLeaves && dashboardData.recentLeaves.length > 0 ? (
                dashboardData.recentLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {leave.staff?.profileImage ? (
                            <img className="h-10 w-10 rounded-full" src={leave.staff.profileImage} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {leave.staff?.firstName?.charAt(0)}{leave.staff?.lastName?.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {leave.staff?.firstName} {leave.staff?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {leave.staff?.position}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">
                        {leave.leaveType}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {leave.numberOfDays} day(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        leave.status === 'approved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : leave.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(leave.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(leave.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-gray-500 dark:text-gray-400">
                        No recent leave applications
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;