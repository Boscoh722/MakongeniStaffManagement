import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import {
  UserGroupIcon,
  ChartBarIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const StaffOverview = () => {
  const { user } = useSelector((state) => state.auth);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchSupervisedStaff();
  }, []);

  const fetchSupervisedStaff = async () => {
    try {
      const response = await staffService.getStaff();
      const supervisedStaff = response.data.filter(s => 
        s.supervisor?._id === user._id || s.supervisor === user._id
      );
      setStaff(supervisedStaff);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (staffId) => {
    // Mock attendance data
    return Math.random() > 0.3 ? 'present' : 'absent';
  };

  const getStatusColor = (status) => {
    return status === 'present' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const getStatusIcon = (status) => {
    return status === 'present' 
      ? <CheckCircleIcon className="h-5 w-5" />
      : <XCircleIcon className="h-5 w-5" />;
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage staff under your supervision ({staff.length} members)
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Team</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{staff.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {staff.filter(s => getAttendanceStatus(s._id) === 'present').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-4">
              <CalendarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Leave</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {staff.filter(s => getAttendanceStatus(s._id) === 'leave').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 mr-4">
              <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {staff.filter(s => getAttendanceStatus(s._id) === 'absent').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => {
          const attendanceStatus = getAttendanceStatus(member._id);
          
          return (
            <div key={member._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                    <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                      {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.position}</p>
                  </div>
                </div>
                <div className={`p-2 rounded-full ${getStatusColor(attendanceStatus)}`}>
                  {getStatusIcon(attendanceStatus)}
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  {member.email}
                </div>
                {member.phoneNumber && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {member.phoneNumber}
                  </div>
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Employee ID: {member.employeeId}
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedStaff(member);
                    setShowDetails(true);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View
                </button>
                <button className="flex-1 px-3 py-2 bg-dark-green-600 text-white rounded text-sm font-medium hover:bg-dark-green-700 flex items-center justify-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Message
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Details Modal */}
      {showDetails && selectedStaff && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Staff Details
            </h3>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="flex items-start">
                <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-6">
                  <span className="text-2xl font-medium text-gray-600 dark:text-gray-300">
                    {selectedStaff.firstName.charAt(0)}{selectedStaff.lastName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedStaff.firstName} {selectedStaff.lastName}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedStaff.position}</p>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
                      <p className="font-medium">{selectedStaff.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                      <p className="font-medium">{selectedStaff.department}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Contact Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium">{selectedStaff.email}</p>
                  </div>
                  {selectedStaff.phoneNumber && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium">{selectedStaff.phoneNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date Joined</p>
                    <p className="font-medium">
                      {new Date(selectedStaff.dateOfJoining).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedStaff.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {selectedStaff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              {selectedStaff.qualifications && selectedStaff.qualifications.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Qualifications</h5>
                  <div className="space-y-2">
                    {selectedStaff.qualifications.map((qual, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <p className="font-medium">{qual.qualification}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {qual.institution} • {qual.yearObtained}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedStaff(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOverview;