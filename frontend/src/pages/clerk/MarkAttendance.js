import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';

const MarkAttendance = () => {
  const { user } = useSelector((state) => state.auth);
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    fetchStaff();
    fetchAttendance();
  }, [selectedDate]);

  const fetchStaff = async () => {
    try {
      const response = await staffService.getStaff();
      setStaff(response.data);
    } catch (error) {
      toast.error('Failed to fetch staff');
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await staffService.getAttendance({
        date: selectedDate.toISOString().split('T')[0]
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (staffId, status) => {
    try {
      await staffService.markAttendance({
        staffId,
        date: selectedDate.toISOString().split('T')[0],
        status
      });
      toast.success(`Marked as ${status}`);
      fetchAttendance();
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  const handleBulkMark = async (status) => {
    if (!window.confirm(`Mark all filtered staff as ${status}?`)) return;
    
    try {
      const filteredStaffIds = filteredStaff.map(s => s._id);
      for (const staffId of filteredStaffIds) {
        await staffService.markAttendance({
          staffId,
          date: selectedDate.toISOString().split('T')[0],
          status
        });
      }
      toast.success(`Bulk marked as ${status}`);
      fetchAttendance();
    } catch (error) {
      toast.error('Failed to bulk mark attendance');
    }
  };

  const getAttendanceStatus = (staffId) => {
    const record = attendance.find(a => a.staff._id === staffId);
    return record ? record.status : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'leave': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'off-duty': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircleIcon className="h-5 w-5" />;
      case 'absent': return <XCircleIcon className="h-5 w-5" />;
      case 'late': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'leave': return <ClockIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const filteredStaff = staff.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(staff.map(s => s.department))];

  const statusButtons = [
    { status: 'present', label: 'Present', icon: CheckCircleIcon, color: 'bg-green-600 hover:bg-green-700' },
    { status: 'absent', label: 'Absent', icon: XCircleIcon, color: 'bg-red-600 hover:bg-red-700' },
    { status: 'late', label: 'Late', icon: ExclamationTriangleIcon, color: 'bg-yellow-600 hover:bg-yellow-700' },
    { status: 'leave', label: 'Leave', icon: ClockIcon, color: 'bg-blue-600 hover:bg-blue-700' },
    { status: 'off-duty', label: 'Off Duty', icon: CalendarIcon, color: 'bg-gray-600 hover:bg-gray-700' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Mark daily attendance for staff members
          </p>
        </div>
        <button
          onClick={() => {
            // Export functionality
            toast.success('Export functionality will be implemented');
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center"
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {/* Date Selection and Bulk Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              maxDate={new Date()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Staff
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                placeholder="Search by name or ID..."
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Quick Stats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Today's Summary
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredStaff.length} staff to mark
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">
              Bulk Actions:
            </span>
            {statusButtons.map((btn) => (
              <button
                key={btn.status}
                onClick={() => handleBulkMark(btn.status)}
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center ${btn.color}`}
              >
                <btn.icon className="h-4 w-4 mr-2" />
                Mark All as {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-green-600"></div>
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
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStaff.map((employee) => {
                  const currentStatus = getAttendanceStatus(employee._id);
                  
                  return (
                    <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {employee.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currentStatus ? (
                          <div className="flex items-center">
                            <div className={`p-1 rounded-full mr-2 ${getStatusColor(currentStatus)}`}>
                              {getStatusIcon(currentStatus)}
                            </div>
                            <span className={`text-sm font-medium capitalize ${getStatusColor(currentStatus)} px-2 py-1 rounded-full`}>
                              {currentStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Not marked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {statusButtons.map((btn) => (
                            <button
                              key={btn.status}
                              onClick={() => handleMarkAttendance(employee._id, btn.status)}
                              className={`px-3 py-1 text-white rounded text-xs font-medium flex items-center ${btn.color} ${
                                currentStatus === btn.status ? 'ring-2 ring-offset-1 ring-white' : ''
                              }`}
                            >
                              <btn.icon className="h-3 w-3 mr-1" />
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {statusButtons.map((btn) => {
          const count = filteredStaff.filter(employee => 
            getAttendanceStatus(employee._id) === btn.status
          ).length;
          
          const Icon = btn.icon;
          
          return (
            <div key={btn.status} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {btn.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {count}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getStatusColor(btn.status)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                {((count / filteredStaff.length) * 100 || 0).toFixed(1)}% of staff
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Notes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Notes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              Best Practices
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Mark attendance before 10:00 AM daily</li>
              <li>• Verify with supervisors for questionable cases</li>
              <li>• Update status changes throughout the day</li>
              <li>• Document reasons for extended absences</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
              Status Guidelines
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
              <li>• <strong>Present:</strong> Staff is at work</li>
              <li>• <strong>Absent:</strong> No notification received</li>
              <li>• <strong>Late:</strong> Arrived after official start time</li>
              <li>• <strong>Leave:</strong> Approved time off</li>
              <li>• <strong>Off Duty:</strong> Scheduled day off</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;