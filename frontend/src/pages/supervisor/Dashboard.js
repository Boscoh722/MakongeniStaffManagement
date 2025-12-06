import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import attendanceService from '../../services/attendanceService'; // Fixed import
import {
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline'; // Added missing MinusIcon
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
import useDocumentTitle from '../../hooks/useDocumentTitle';

const SupervisorDashboard = () => {
  useDocumentTitle('Dashboard');
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    staffCount: 0,
    pendingLeaves: 0,
    attendanceRate: 0,
    openCases: 0,
    recentActivities: []
  });

  const [attendanceData, setAttendanceData] = useState({
    labels: [],
    datasets: []
  });

  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [supervisedStaff, setSupervisedStaff] = useState([]); // Added state for supervised staff
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  useEffect(() => {
    fetchSupervisorData();
  }, []);

  const fetchSupervisorData = async () => {
    try {
      // Fetch supervisor-specific data
      const [staffResponse, leavesResponse, casesResponse] = await Promise.all([
        staffService.getStaff(),
        staffService.getAllLeaves(),
        staffService.getDisciplinaryCases ? staffService.getDisciplinaryCases() : Promise.resolve({ data: [] })
      ]);

      const supervisedStaff = staffResponse.data.filter(s =>
        s.supervisor?._id === user._id || s.supervisor === user._id
      );

      setSupervisedStaff(supervisedStaff); // Store supervised staff

      const pendingLeaves = leavesResponse.data.filter(l =>
        l.status === 'pending' &&
        supervisedStaff.some(s => s._id === l.staff._id)
      );

      const openCases = casesResponse.data?.filter(c =>
        c.status === 'open' &&
        supervisedStaff.some(s => s._id === c.staff?._id)
      ) || [];

      // Fetch attendance data
      await fetchAttendanceData(supervisedStaff);

      // Fetch recent activities
      const recentActivities = await fetchRecentActivities(supervisedStaff);

      // Note: attendanceRate will be updated by fetchAttendanceData
      setStats(prev => ({
        ...prev,
        staffCount: supervisedStaff.length,
        pendingLeaves: pendingLeaves.length,
        openCases: openCases.length,
        recentActivities
      }));
    } catch (error) {
      console.error('Error fetching supervisor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async (supervisedStaff) => {
    try {
      const staffIds = supervisedStaff.map(staff => staff._id);
      if (staffIds.length === 0) {
        // No staff to track attendance for
        setWeeklyAttendance([]);
        setAttendanceData({
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Team Attendance',
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(255, 191, 0, 0.2)'
          }]
        });
        setStats(prev => ({ ...prev, attendanceRate: 0 }));
        return;
      }

      // Get current week dates
      const weekDates = getCurrentWeekDates();

      // Fetch attendance for the entire week with staff filter
      const response = await attendanceService.getAttendanceByDateRange(
        weekDates[0],
        weekDates[6],
        { staff: staffIds.join(',') }
      );

      const attendanceRecords = response.data || [];

      // Calculate attendance percentage for each day
      const weeklyData = weekDates.map(date => {
        const dayAttendance = attendanceRecords.filter(record => {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === date &&
            staffIds.includes(record.staff?._id || record.staff) &&
            (record.status === 'present' || record.status === 'on-duty');
        });

        if (staffIds.length === 0) return 0;
        return Math.round((dayAttendance.length / staffIds.length) * 100);
      });

      setWeeklyAttendance(weeklyData);

      // Calculate overall attendance rate
      const overallRate = weeklyData.length > 0
        ? Math.round(weeklyData.reduce((a, b) => a + b, 0) / weeklyData.length)
        : 0;

      // Update stats with real attendance rate
      setStats(prev => ({
        ...prev,
        attendanceRate: overallRate
      }));

      // Prepare chart data
      const chartLabels = weekDates.map(date =>
        new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
      );

      setAttendanceData({
        labels: chartLabels,
        datasets: [
          {
            label: 'Team Attendance (%)',
            data: weeklyData,
            backgroundColor: [
              'rgba(255, 191, 0, 0.8)',   // Monday - mustard
              'rgba(255, 0, 0, 0.8)',      // Tuesday - scarlet
              'rgba(0, 102, 255, 0.8)',    // Wednesday - royal
              'rgba(255, 191, 0, 0.8)',    // Thursday - mustard
              'rgba(255, 0, 0, 0.8)',      // Friday - scarlet
              'rgba(0, 102, 255, 0.5)',    // Saturday - royal (lighter)
              'rgba(255, 191, 0, 0.5)'     // Sunday - mustard (lighter)
            ],
            borderColor: [
              'rgba(255, 191, 0, 1)',
              'rgba(255, 0, 0, 1)',
              'rgba(0, 102, 255, 1)',
              'rgba(255, 191, 0, 1)',
              'rgba(255, 0, 0, 1)',
              'rgba(0, 102, 255, 0.8)',
              'rgba(255, 191, 0, 0.8)'
            ],
            borderWidth: 1
          }
        ]
      });

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // Fallback to empty data
      setAttendanceData({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Team Attendance',
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(255, 191, 0, 0.2)'
        }]
      });
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Helper function to get current week's dates
  const getCurrentWeekDates = () => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Start from Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }

    return dates;
  };

  // Helper function to fetch recent activities
  const fetchRecentActivities = async (supervisedStaff) => {
    try {
      // First, try to get recent attendance activities
      const attendanceResponse = await attendanceService.getRecentActivities(5);
      const attendanceActivities = attendanceResponse.data || [];

      // Filter for supervised staff
      const staffIds = supervisedStaff.map(s => s._id);
      const filteredAttendance = attendanceActivities.filter(activity =>
        staffIds.includes(activity.staff?._id || activity.staff)
      );

      // Also get recent leave applications
      const leavesResponse = await staffService.getAllLeaves({
        limit: 5,
        sortBy: 'createdAt:desc'
      });

      const recentLeaves = leavesResponse.data.filter(leave =>
        staffIds.includes(leave.staff._id)
      );

      // Combine and format activities
      const combinedActivities = [
        ...filteredAttendance.map(activity => ({
          id: activity._id,
          staffName: supervisedStaff.find(s => s._id === activity.staff?._id)?.firstName || 'Team Member',
          action: `Attendance marked: ${activity.status}`,
          details: activity.remarks || 'No remarks',
          timestamp: new Date(activity.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          type: 'attendance'
        })),
        ...recentLeaves.map(leave => ({
          id: leave._id,
          staffName: `${leave.staff.firstName} ${leave.staff.lastName}`,
          action: `Applied for ${leave.leaveType} leave`,
          details: `From ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
          timestamp: new Date(leave.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          type: 'leave'
        }))
      ];

      // Sort by timestamp and limit to 5
      return combinedActivities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);

    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  };

  const statCards = [
    {
      title: 'Staff Under You',
      value: stats.staffCount,
      icon: UserGroupIcon,
      color: 'bg-royal-100 text-royal-800 dark:bg-royal-900/50 dark:text-royal-300',
      iconColor: 'text-royal-600 dark:text-royal-400',
      trend: stats.staffCount > 0 ? 'stable' : 'none',
      description: 'Total team members'
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: CalendarIcon,
      color: 'bg-mustard-100 text-mustard-800 dark:bg-mustard-900/50 dark:text-mustard-300',
      iconColor: 'text-mustard-600 dark:text-mustard-400',
      trend: stats.pendingLeaves > 5 ? 'up' : stats.pendingLeaves === 0 ? 'none' : 'down',
      description: 'Requiring your approval'
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: ChartBarIcon,
      color: stats.attendanceRate >= 80 ? 'bg-mustard-100 text-mustard-800 dark:bg-mustard-900/50 dark:text-mustard-300' : 'bg-scarlet-100 text-scarlet-800 dark:bg-scarlet-900/50 dark:text-scarlet-300',
      iconColor: stats.attendanceRate >= 80 ? 'text-mustard-600 dark:text-mustard-400' : 'text-scarlet-600 dark:text-scarlet-400',
      trend: stats.attendanceRate >= 85 ? 'up' : stats.attendanceRate >= 75 ? 'stable' : 'down',
      description: 'This week average'
    },
    {
      title: 'Open Cases',
      value: stats.openCases,
      icon: ExclamationTriangleIcon,
      color: 'bg-scarlet-100 text-scarlet-800 dark:bg-scarlet-900/50 dark:text-scarlet-300',
      iconColor: 'text-scarlet-600 dark:text-scarlet-400',
      trend: stats.openCases > 3 ? 'up' : stats.openCases === 0 ? 'none' : 'down',
      description: 'Requiring attention'
    }
  ];

  const quickActions = [
    {
      title: 'Review Leaves',
      description: 'Approve or reject leave applications',
      icon: CalendarIcon,
      color: 'bg-mustard-500',
      link: '/supervisor/leaves',
      count: stats.pendingLeaves
    },
    {
      title: 'View Team',
      description: 'See all staff under your supervision',
      icon: UserGroupIcon,
      color: 'bg-royal-500',
      link: '/supervisor/staff',
      count: stats.staffCount
    },
    {
      title: 'Mark Attendance',
      description: 'Mark attendance for your team',
      icon: CheckCircleIcon,
      color: 'bg-mustard-500',
      link: '/supervisor/attendance',
      count: stats.attendanceRate < 80 ? 'Low' : undefined
    },
    {
      title: 'Send Notices',
      description: 'Send notifications to your team',
      icon: DocumentTextIcon,
      color: 'bg-scarlet-500',
      link: '/supervisor/notices'
    }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: '#374151',
          font: {
            family: "'Neulis Sans', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: "'Neulis Sans', sans-serif"
        },
        bodyFont: {
          family: "'Neulis Sans', sans-serif"
        },
        callbacks: {
          label: (context) => `Attendance: ${context.raw}%`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#6B7280',
          font: {
            family: "'Neulis Sans', sans-serif",
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#6B7280',
          font: {
            family: "'Neulis Sans', sans-serif",
            size: 12
          },
          callback: (value) => `${value}%`
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-royal-50 via-mustard-50 to-scarlet-50 dark:from-neutral-900 dark:via-royal-900 dark:to-scarlet-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mustard-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-royal-50 via-mustard-50 to-scarlet-50 dark:from-neutral-900 dark:via-royal-900 dark:to-scarlet-900 min-h-screen font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-mustard-500 via-scarlet-500 to-royal-500 rounded-2xl shadow-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
        <p className="mt-2 opacity-90">
          Welcome, {user?.firstName || 'Supervisor'}. Manage your team effectively.
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <span className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Last updated: {new Date().toLocaleDateString()}
          </span>
          <span className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            Week {Math.ceil(new Date().getDate() / 7)}
          </span>
          <span className="flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            {stats.staffCount} team members
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-mustard-100 dark:border-mustard-900/30 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' && (
                    <span className="flex items-center text-xs text-mustard-600 dark:text-mustard-400">
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                      {stat.description}
                    </span>
                  )}
                  {stat.trend === 'down' && (
                    <span className="flex items-center text-xs text-scarlet-600 dark:text-scarlet-400">
                      <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                      {stat.description}
                    </span>
                  )}
                  {stat.trend === 'stable' && (
                    <span className="flex items-center text-xs text-royal-600 dark:text-royal-400">
                      <MinusIcon className="h-3 w-3 mr-1" />
                      {stat.description}
                    </span>
                  )}
                  {stat.trend === 'none' && (
                    <span className="flex items-center text-xs text-neutral-500 dark:text-neutral-500">
                      {stat.description}
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-mustard-100 dark:border-mustard-900/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Team Attendance This Week
            </h3>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="h-72">
            {attendanceLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mustard-600"></div>
                <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading attendance data...</span>
              </div>
            ) : (
              <Bar data={attendanceData} options={chartOptions} />
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-mustard-100 dark:border-mustard-900/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Average attendance: <span className={`font-semibold ${stats.attendanceRate >= 80 ? 'text-mustard-600 dark:text-mustard-400' : 'text-scarlet-600 dark:text-scarlet-400'}`}>{stats.attendanceRate}%</span>
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                  Based on {stats.staffCount} staff members
                </p>
              </div>
              {stats.attendanceRate < 80 && (
                <span className="text-xs text-scarlet-600 dark:text-scarlet-400 bg-scarlet-50 dark:bg-scarlet-900/30 px-2 py-1 rounded">
                  Needs improvement
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-mustard-100 dark:border-mustard-900/30">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <a
                key={action.title}
                href={action.link}
                className="p-4 border border-mustard-200 dark:border-mustard-800 rounded-xl hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-white/50 to-white/30 dark:from-neutral-900/30 dark:to-neutral-800/30 hover:scale-[1.02] relative group"
              >
                {action.count !== undefined && (
                  <span className={`absolute -top-2 -right-2 text-xs px-2 py-1 rounded-full ${action.title === 'Mark Attendance' && action.count === 'Low'
                    ? 'bg-scarlet-100 text-scarlet-800 dark:bg-scarlet-900/50 dark:text-scarlet-300'
                    : 'bg-mustard-100 text-mustard-800 dark:bg-mustard-900/50 dark:text-mustard-300'
                    }`}>
                    {action.count}
                  </span>
                )}
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${action.color} mr-3 group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white group-hover:text-mustard-600 dark:group-hover:text-mustard-400 transition-colors duration-200">
                      {action.title}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
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
      <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-mustard-100 dark:border-mustard-900/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Recent Team Activities
          </h3>
          <span className="text-sm text-royal-600 dark:text-royal-400 hover:text-royal-700 cursor-pointer">
            View All
          </span>
        </div>
        <div className="space-y-4">
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border-b border-mustard-100 dark:border-mustard-900/30 last:border-0 hover:bg-mustard-50/50 dark:hover:bg-mustard-900/20 rounded-lg transition-all duration-200">
                <div className="flex items-center">
                  <div className={`p-2 rounded-xl mr-3 ${activity.type === 'attendance' ? 'bg-mustard-100 dark:bg-mustard-900/50' :
                    activity.type === 'leave' ? 'bg-royal-100 dark:bg-royal-900/50' :
                      'bg-scarlet-100 dark:bg-scarlet-900/50'
                    }`}>
                    {activity.type === 'attendance' && <CheckCircleIcon className="h-4 w-4 text-mustard-600 dark:text-mustard-400" />}
                    {activity.type === 'leave' && <CalendarIcon className="h-4 w-4 text-royal-600 dark:text-royal-400" />}
                    {activity.type === 'case' && <ExclamationTriangleIcon className="h-4 w-4 text-scarlet-600 dark:text-scarlet-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {activity.staffName}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {activity.action}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                      {activity.timestamp} • {activity.details}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-royal-600 dark:text-royal-400 hover:text-royal-700 cursor-pointer">
                  Details
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 bg-gradient-to-r from-mustard-100 to-scarlet-100 dark:from-mustard-900/30 dark:to-scarlet-900/30 rounded-xl flex items-center justify-center mb-4">
                <UserGroupIcon className="h-6 w-6 text-mustard-600 dark:text-mustard-400" />
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">No recent activities from your team</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Team activities will appear here</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default SupervisorDashboard;