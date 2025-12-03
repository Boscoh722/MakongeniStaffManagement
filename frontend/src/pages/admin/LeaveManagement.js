import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const LeaveManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    leaveType: '',
    startDate: '',
    endDate: ''
  });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    rejectionReason: ''
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
      
      // Ensure it's an array
      if (Array.isArray(leavesData)) {
        setLeaves(leavesData);
      } else {
        console.error('Leaves data is not an array:', leavesData);
        setLeaves([]);
        toast.error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to fetch leaves');
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  // Safe filtering function
  const filteredLeaves = Array.isArray(leaves) ? leaves.filter(leave => {
    if (!leave) return false;
    
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = 
      (leave.staff?.firstName?.toLowerCase() || '').includes(searchLower) ||
      (leave.staff?.lastName?.toLowerCase() || '').includes(searchLower) ||
      (leave.staff?.employeeId?.toLowerCase() || '').includes(searchLower);

    const matchesStatus = !filters.status || leave.status === filters.status;
    const matchesType = !filters.leaveType || leave.leaveType === filters.leaveType;

    // Date filtering
    let matchesDate = true;
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      const leaveStartDate = new Date(leave.startDate);
      matchesDate = matchesDate && leaveStartDate >= startDate;
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      const leaveEndDate = new Date(leave.endDate);
      matchesDate = matchesDate && leaveEndDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  }) : [];

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
      case 'approved': return <CheckCircleIcon className="h-5 w-5" />;
      case 'rejected': return <XCircleIcon className="h-5 w-5" />;
      case 'pending': return <ClockIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const handleStatusUpdate = async () => {
    try {
      if (!selectedLeave) return;
      
      await staffService.updateLeaveStatus(selectedLeave._id, statusUpdate);
      toast.success(`Leave ${statusUpdate.status} successfully`);
      setShowStatusModal(false);
      setSelectedLeave(null);
      setStatusUpdate({ status: '', rejectionReason: '' });
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to update leave status');
    }
  };

  const leaveTypes = [...new Set(leaves.map(leave => leave.leaveType).filter(Boolean))];
  const statusOptions = ['pending', 'approved', 'rejected', 'cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and approve staff leave applications
          </p>
        </div>
        <button
          onClick={fetchLeaves}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                placeholder="Search by name or employee ID..."
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Leave Type
            </label>
            <select
              value={filters.leaveType}
              onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Types</option>
              {leaveTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <DatePicker
              selected={filters.startDate ? new Date(filters.startDate) : null}
              onChange={(date) => setFilters({ ...filters, startDate: date ? date.toISOString() : '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              placeholderText="From date"
              isClearable
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredLeaves.length} of {leaves.length} leave applications
          </div>
          <button
            onClick={() => setFilters({
              search: '',
              status: '',
              leaveType: '',
              startDate: '',
              endDate: ''
            })}
            className="text-sm text-dark-green-600 hover:text-dark-green-700 dark:text-dark-green-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Leave Applications Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-green-600"></div>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <ClockIcon className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No leave applications found</p>
            <button
              onClick={fetchLeaves}
              className="mt-4 px-4 py-2 bg-dark-green-600 text-white rounded-lg hover:bg-dark-green-700"
            >
              Refresh Data
            </button>
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
                    Leave Details
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {leave.staff?.profileImage ? (
                            <img className="h-10 w-10 rounded-full" src={leave.staff.profileImage} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
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
                            {leave.staff?.employeeId || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {leave.staff?.department || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {leave.leaveType}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {leave.numberOfDays} day(s)
                      </div>
                      {leave.reason && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {leave.reason.substring(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(leave.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        to
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(leave.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                          <span className="mr-1">
                            {getStatusIcon(leave.status)}
                          </span>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </div>
                      {leave.approvedBy && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          By: {leave.approvedBy?.firstName || 'Admin'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(leave.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(leave.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {leave.status === 'pending' && (user.role === 'admin' || user.role === 'supervisor') && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedLeave(leave);
                                setStatusUpdate({ status: 'approved', rejectionReason: '' });
                                setShowStatusModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Approve"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeave(leave);
                                setStatusUpdate({ status: 'rejected', rejectionReason: '' });
                                setShowStatusModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Reject"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedLeave && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {statusUpdate.status === 'approved' ? 'Approve' : 'Reject'} Leave Application
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                You are about to <span className="font-semibold">{statusUpdate.status}</span> the leave application for:
              </p>
              <p className="font-medium text-gray-900 dark:text-white mt-2">
                {selectedLeave.staff?.firstName} {selectedLeave.staff?.lastName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedLeave.leaveType} - {selectedLeave.numberOfDays} day(s)
              </p>
            </div>

            {statusUpdate.status === 'rejected' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={statusUpdate.rejectionReason}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, rejectionReason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="Provide reason for rejection..."
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedLeave(null);
                  setStatusUpdate({ status: '', rejectionReason: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                  statusUpdate.status === 'approved' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {statusUpdate.status === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;