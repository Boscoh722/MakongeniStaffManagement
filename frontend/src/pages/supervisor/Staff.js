import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import toast from 'react-hot-toast';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const SupervisorStaff = () => {
  const { user } = useSelector((state) => state.auth);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    role: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getStaff();
      
      // Supervisor oversees all non-admin staff
      const allStaff = response.data.filter(employee => 
        employee.role !== 'admin' && employee.role !== 'supervisor'
      );
      
      setStaff(allStaff);
      setFilteredStaff(allStaff);
      
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters, staff]);

  const applyFilters = () => {
    let filtered = [...staff];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.firstName?.toLowerCase().includes(searchLower) ||
        employee.lastName?.toLowerCase().includes(searchLower) ||
        employee.employeeId?.toLowerCase().includes(searchLower) ||
        employee.email?.toLowerCase().includes(searchLower)
      );
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(employee =>
        employee.department === filters.department ||
        employee.department?.name === filters.department
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(employee =>
        (filters.status === 'active' && employee.isActive) ||
        (filters.status === 'inactive' && !employee.isActive)
      );
    }

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(employee => employee.role === filters.role);
    }

    setFilteredStaff(filtered);
  };

  const getUniqueDepartments = () => {
    const departments = new Set();
    staff.forEach(employee => {
      if (employee.department) {
        if (typeof employee.department === 'object') {
          departments.add(employee.department.name);
        } else {
          departments.add(employee.department);
        }
      }
    });
    return Array.from(departments);
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'clerk': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'staff': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 text-xs rounded-full flex items-center w-fit ${
        isActive 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      }`}>
        {isActive ? (
          <>
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Active
          </>
        ) : (
          <>
            <XCircleIcon className="h-3 w-3 mr-1" />
            Inactive
          </>
        )}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-green-600 to-dark-green-800 rounded-lg shadow p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Team Management</h1>
            <p className="mt-2 opacity-90">
              Manage all staff members under your supervision including clerks
            </p>
          </div>
          <UserGroupIcon className="h-10 w-10 opacity-80" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                placeholder="Search staff..."
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Departments</option>
              {getUniqueDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="staff">Staff</option>
              <option value="clerk">Clerk</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredStaff.length} of {staff.length} staff members
          </div>
          <button
            onClick={() => setFilters({ search: '', department: '', status: '', role: '' })}
            className="text-sm text-dark-green-600 hover:text-dark-green-700 dark:text-dark-green-400 flex items-center"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-green-600"></div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Staff Members Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStaff.map((employee) => (
            <div key={employee._id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
              {/* Employee Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {employee.profileImage ? (
                      <img
                        src={employee.profileImage}
                        alt={`${employee.firstName} ${employee.lastName}`}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-medium text-gray-600 dark:text-gray-300">
                        {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {employee.position}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      {getStatusBadge(employee.isActive)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(employee.role)}`}>
                        {employee.role?.charAt(0).toUpperCase() + employee.role?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Details */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                      <p className="text-gray-900 dark:text-white truncate">
                        {employee.department?.name || employee.department || 'No department'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white truncate">
                        {employee.email}
                      </p>
                    </div>
                  </div>

                  {employee.phoneNumber && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-gray-900 dark:text-white truncate">
                          {employee.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Joined</p>
                      <p className="text-gray-900 dark:text-white">
                        {employee.dateOfJoining 
                          ? new Date(employee.dateOfJoining).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employee ID */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Employee ID</p>
                  <p className="font-mono text-gray-900 dark:text-white">
                    {employee.employeeId}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Team Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {staff.filter(s => s.isActive).length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Active Staff</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {staff.filter(s => s.role === 'clerk').length}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Clerks</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {staff.filter(s => s.role === 'staff').length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Regular Staff</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {getUniqueDepartments().length}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Departments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorStaff;