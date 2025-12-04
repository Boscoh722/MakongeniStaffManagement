import React, { useState } from 'react';
import { staffService } from '../../services/staffService';
import toast from 'react-hot-toast';
import {
  DocumentArrowDownIcon,
  CalendarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ClerkGenerateReports = () => {
  const [reportType, setReportType] = useState('attendance');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Mock departments - replace with API call
  const mockDepartments = [
    { _id: 'env', name: 'ENVIRONMENT' },
    { _id: 'str', name: 'STORES' },
    { _id: 'log', name: 'LOGISTICS' },
    { _id: 'wpg', name: 'WELLNESS AND PERSONAL GROWTH' },
    { _id: 'pr', name: 'PUBLIC RELATIONS' }
  ];

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
      
      if (department) {
        params.department = department;
      }
      
      let response;
      switch (reportType) {
        case 'attendance':
          response = await staffService.generateReport('attendance', params);
          break;
        case 'leaves':
          response = await staffService.generateReport('leaves', params);
          break;
        case 'staff':
          response = await staffService.generateReport('staff-list', params);
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      // For now, just show success message
      // In production, this would download a file
      toast.success(`${reportType} report generated successfully`);
      console.log('Report data:', response.data);
      
      // Mock download - replace with actual file download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Generate report error:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate various reports for staff management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Configuration
            </h3>
            
            <div className="space-y-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Report Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'attendance', label: 'Attendance Report', icon: ChartBarIcon },
                    { id: 'leaves', label: 'Leave Report', icon: CalendarIcon },
                    { id: 'staff', label: 'Staff List', icon: UsersIcon }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setReportType(type.id)}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center ${
                        reportType === type.id
                          ? 'border-dark-green-500 bg-dark-green-50 dark:bg-dark-green-900/20'
                          : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                    >
                      <type.icon className={`h-8 w-8 mb-2 ${
                        reportType === type.id 
                          ? 'text-dark-green-600 dark:text-dark-green-400' 
                          : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        reportType === type.id
                          ? 'text-dark-green-700 dark:text-dark-green-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department (Optional)
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                >
                  <option value="">All Departments</option>
                  {mockDepartments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Generate */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Preview
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Report Type:</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {reportType}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date Range:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Department:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {department 
                    ? mockDepartments.find(d => d._id === department)?.name || department
                    : 'All Departments'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-dark-green-600 hover:bg-dark-green-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  Generate & Download Report
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              Report will be downloaded in JSON format
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClerkGenerateReports;
