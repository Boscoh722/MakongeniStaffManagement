import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const ClerkViewStaff = () => {
  const { user } = useSelector((state) => state.auth);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getStaff();
      setStaff(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(employee => {
    const searchLower = search.toLowerCase();
    return (
      employee.firstName?.toLowerCase().includes(searchLower) ||
      employee.lastName?.toLowerCase().includes(searchLower) ||
      employee.employeeId?.toLowerCase().includes(searchLower) ||
      employee.department?.name?.toLowerCase().includes(searchLower) ||
      employee.position?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">View Staff</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all staff members and their details
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            placeholder="Search staff by name, ID, department, or position..."
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((employee) => (
            <div key={employee._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {employee.profileImage ? (
                    <img src={employee.profileImage} alt="" className="h-16 w-16 rounded-full" />
                  ) : (
                    <span className="text-2xl font-medium text-gray-600 dark:text-gray-300">
                      {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{employee.position}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{employee.employeeId}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      {employee.department?.name || employee.department || 'No department'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {employee.email}
                    </div>
                    {employee.phoneNumber && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        {employee.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    employee.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClerkViewStaff;
