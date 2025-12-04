import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const ClerkProcessLeave = () => {
  const { user } = useSelector((state) => state.auth);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [action, setAction] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await staffService.getAllLeaves();
      // Get only pending leaves for clerk
      const pendingLeaves = (response.data?.leaves || response.data || [])
        .filter(leave => leave.status === 'pending');
      setLeaves(pendingLeaves);
    } catch (error) {
      toast.error('Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async () => {
    if (!selectedLeave) return;
    
    try {
      await staffService.updateLeaveStatus(selectedLeave._id, { 
        status: action,
        rejectionReason: action === 'rejected' ? 'Rejected by clerk' : ''
      });
      toast.success(`Leave ${action} successfully`);
      setShowActionModal(false);
      setSelectedLeave(null);
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to process leave');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Process Leave Applications</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Review and process pending leave applications
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-green-600"></div>
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Pending Leaves
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are no pending leave applications to process.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leaves.map((leave) => (
            <div key={leave._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {leave.staff?.firstName} {leave.staff?.lastName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                    {leave.staff?.employeeId} • {leave.staff?.department?.name || leave.staff?.department}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leave.status)}`}>
                  {leave.status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Leave Type</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {leave.leaveType}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dates</p>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ({leave.numberOfDays} days)
                    </span>
                  </div>
                </div>

                {leave.reason && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reason</p>
                    <p className="text-gray-900 dark:text-white">{leave.reason}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Applied On</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(leave.createdAt).toLocaleDateString()} at {new Date(leave.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedLeave(leave);
                        setAction('approved');
                        setShowActionModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLeave(leave);
                        setAction('rejected');
                        setShowActionModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedLeave && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {action === 'approved' ? 'Approve' : 'Reject'} Leave
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {action} the leave application for{' '}
              <span className="font-semibold">
                {selectedLeave.staff?.firstName} {selectedLeave.staff?.lastName}
              </span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedLeave(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveAction}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                  action === 'approved' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClerkProcessLeave;
