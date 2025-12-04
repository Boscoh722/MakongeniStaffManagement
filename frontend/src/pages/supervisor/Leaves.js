import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const SupervisorLeaves = () => {
  const { user } = useSelector((state) => state.auth);
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionData, setActionData] = useState({
    status: '',
    rejectionReason: ''
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    leaveType: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await staffService.getAllLeaves();
      
      // Handle both response formats
      const leavesData = response.data?.leaves || response.data || [];
      
      // Get staff under supervisor
      const staffResponse = await staffService.getStaff();
      const supervisedStaff = staffResponse.data.filter(s => 
        s.role !== 'admin' && s.role !== 'supervisor'
      );
      
      // Filter leaves for supervised staff
      const supervisedLeaves = leavesData.filter(leave => 
        supervisedStaff.some(staff => 
          staff._id === leave.staff?._id || staff._id === leave.staff
        )
      );
      
      setLeaves(supervisedLeaves);
      setFilteredLeaves(supervisedLeaves);
      
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leave applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, leaves]);

  const applyFilters = () => {
    let filtered = [...leaves];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(leave => {
        const staffName = `${leave.staff?.firstName || ''} ${leave.staff?.lastName || ''}`.toLowerCase();
        return (
          staffName.includes(searchLower) ||
          leave.staff?.employeeId?.toLowerCase().includes(searchLower) ||
          leave.leaveType?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(leave => leave.status === filters.status);
    }

    // Leave type filter
    if (filters.leaveType) {
      filtered = filtered.filter(leave => leave.leaveType === filters.leaveType);
    }

    // Date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(leave => new Date(leave.startDate) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(leave => new Date(leave.endDate) <= endDate);
    }

    setFilteredLeaves(filtered);
  };

  const handleUpdateStatus = async () => {
    if (!selectedLeave) return;

    try {
      setUpdating(true);
      
      await staffService.updateLeaveStatus(selectedLeave._id, {
        status: actionData.status,
        rejectionReason: actionData.status === 'rejected' ? actionData.rejectionReason : ''
      });
      
      toast.success(`Leave ${actionData.status} successfully`);
      setShowActionModal(false);
      setSelectedLeave(null);
      setActionData({ status: '', rejectionReason: '' });
      fetchLeaves(); // Refresh data
      
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error('Failed to update leave status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getUniqueLeaveTypes = () => {
    const types = new Set();
    leaves.forEach(leave => {
      if (leave.leaveType) types.add(leave.leaveType);
    });
    return Array.from(types);
  };

  const getStats = () => {
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const openActionModal = (leave, action) => {
    setSelectedLeave(leave);
    setActionData({
      status: action,
      rejectionReason: ''
    });
    setShowActionModal(true);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      leaveType: '',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-green-600 to-dark-green-800 rounded-lg shadow p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Leave Management</h1>
            <p className="mt-2 opacity-90">
              Review and manage leave applications from your team
            </p>
          </div>
          <CalendarIcon className="h-10 w-10 opacity-80" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leaves</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetFilters}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Reset
            </button>
            <FunnelIcon className="h-5 w-5 text-gray-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-dark-green-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-dark-green-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Leave Type
            </label>
            <select
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-dark-green-500 focus:border-transparent"
              value={filters.leaveType}
              onChange={(e) => setFilters({...filters, leaveType: e.target.value})}
            >
              <option value="">All Types</option>
              {getUniqueLeaveTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Date
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-dark-green-500 focus:border-transparent"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Date
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-dark-green-500 focus:border-transparent"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Leave Applications</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dark-green-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading leaves...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">No leave applications found</p>
          </div>
        ) : (
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
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {leave.staff?.firstName} {leave.staff?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {leave.staff?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {calculateDays(leave.startDate, leave.endDate)} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        <span className="ml-1 capitalize">{leave.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {leave.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openActionModal(leave, 'approved')}
                            className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(leave, 'rejected')}
                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {leave.status !== 'pending' && (
                        <span className="text-gray-500 dark:text-gray-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {actionData.status === 'approved' ? 'Approve Leave' : 'Reject Leave'}
              </h3>
              
              {selectedLeave && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="font-medium">{selectedLeave.staff?.firstName} {selectedLeave.staff?.lastName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedLeave.leaveType} - {calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)}
                  </p>
                  {selectedLeave.reason && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span className="font-medium">Reason:</span> {selectedLeave.reason}
                    </p>
                  )}
                </div>
              )}

              {actionData.status === 'rejected' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rejection Reason (Optional)
                  </label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-dark-green-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter reason for rejection..."
                    value={actionData.rejectionReason}
                    onChange={(e) => setActionData({...actionData, rejectionReason: e.target.value})}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedLeave(null);
                    setActionData({ status: '', rejectionReason: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                    actionData.status === 'approved' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  disabled={updating}
                >
                  {updating ? 'Processing...' : actionData.status === 'approved' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorLeaves;