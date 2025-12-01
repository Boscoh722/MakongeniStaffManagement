import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import {
  CalendarIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';

const ApplyLeave = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
    supportingDocuments: []
  });
  const [leaveBalance, setLeaveBalance] = useState({});
  const [myLeaves, setMyLeaves] = useState([]);

  useEffect(() => {
    fetchLeaveBalance();
    fetchMyLeaves();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const response = await staffService.getLeaveStats(user._id);
      setLeaveBalance(response.data);
    } catch (error) {
      console.error('Failed to fetch leave balance:', error);
    }
  };

  const fetchMyLeaves = async () => {
    try {
      const response = await staffService.getMyLeaves();
      setMyLeaves(response.data);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const diffTime = Math.abs(formData.endDate - formData.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Inclusive of both days
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (calculateDays() <= 0) {
      toast.error('End date must be after start date');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for leave');
      return;
    }

    setLoading(true);
    try {
      const leaveData = {
        ...formData,
        numberOfDays: calculateDays(),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString()
      };

      await staffService.applyLeave(leaveData);
      toast.success('Leave application submitted successfully');
      
      // Reset form
      setFormData({
        leaveType: 'annual',
        startDate: new Date(),
        endDate: new Date(),
        reason: '',
        supportingDocuments: []
      });
      
      // Refresh data
      fetchMyLeaves();
      fetchLeaveBalance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 dark:text-green-400';
      case 'rejected': return 'text-red-600 dark:text-red-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-5 w-5" />;
      case 'rejected': return <XCircleIcon className="h-5 w-5" />;
      case 'pending': return <ClockIcon className="h-5 w-5" />;
      default: return null;
    }
  };

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave', description: 'Regular vacation leave' },
    { value: 'sick', label: 'Sick Leave', description: 'Medical leave with certificate' },
    { value: 'maternity', label: 'Maternity Leave', description: 'For expecting mothers' },
    { value: 'paternity', label: 'Paternity Leave', description: 'For new fathers' },
    { value: 'compassionate', label: 'Compassionate Leave', description: 'Bereavement leave' },
    { value: 'study', label: 'Study Leave', description: 'For educational purposes' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Apply for Leave</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Submit a leave application for approval
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Leave Balance */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Leave Balance
            </h3>
            
            <div className="space-y-4">
              {leaveTypes.map((type) => (
                <div key={type.value} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{type.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {leaveBalance[type.value]?.remaining || 0} days remaining
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-dark-green-600 dark:text-dark-green-400">
                        {leaveBalance[type.value]?.total || 0}
                      </p>
                      <p className="text-xs text-gray-500">total days</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                Important Notes
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Apply for leave at least 3 days in advance</li>
                <li>• Sick leave requires medical certificate</li>
                <li>• Maternity leave: 90 days maximum</li>
                <li>• Study leave: Proof of enrollment required</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column - Application Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Leave Application Form
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Leave Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Leave Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {leaveTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, leaveType: type.value })}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          formData.leaveType === type.value
                            ? 'border-dark-green-500 bg-dark-green-50 dark:bg-dark-green-900/30'
                            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {type.label}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {type.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <DatePicker
                      selected={formData.startDate}
                      onChange={(date) => setFormData({ ...formData, startDate: date })}
                      minDate={new Date()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <DatePicker
                      selected={formData.endDate}
                      onChange={(date) => setFormData({ ...formData, endDate: date })}
                      minDate={formData.startDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Duration Display */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Leave Days</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {calculateDays()} days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Period</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formData.startDate.toLocaleDateString()} - {formData.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Leave *
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    placeholder="Please provide a detailed reason for your leave application..."
                    required
                  />
                </div>

                {/* Supporting Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Supporting Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Drag and drop files here, or click to browse
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setFormData({ ...formData, supportingDocuments: Array.from(e.target.files) })}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      Browse Files
                    </label>
                    {formData.supportingDocuments.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Selected files:
                        </p>
                        <ul className="mt-2 space-y-1">
                          {formData.supportingDocuments.map((file, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                              • {file.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Supported formats: PDF, JPG, PNG (Max 5MB each)
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-dark-green-600 text-white rounded-lg text-sm font-medium hover:bg-dark-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Previous Applications */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Previous Leave Applications
            </h3>
            
            {myLeaves.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No previous leave applications
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Applied On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {myLeaves.slice(0, 5).map((leave) => (
                      <tr key={leave._id}>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {leave.leaveType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 dark:text-gray-300">
                            {new Date(leave.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            to {new Date(leave.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                          {leave.numberOfDays}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className={`p-1 rounded-full mr-2 ${getStatusColor(leave.status)}`}>
                              {getStatusIcon(leave.status)}
                            </div>
                            <span className={`text-sm font-medium capitalize ${getStatusColor(leave.status)}`}>
                              {leave.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                          {new Date(leave.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;