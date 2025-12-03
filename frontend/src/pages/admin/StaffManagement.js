import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import { departmentService } from '../../services/departmentService';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const StaffManagement = () => {
  const { user } = useSelector((s) => s.auth || {});
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    dateOfJoining: ''
  });

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await staffService.getStaff();
      setStaff(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const res = await departmentService.getDepartmentOptions();
      setDepartments(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const filteredStaff = staff.filter((employee = {}) => {
    const searchLower = (filters.search || '').toLowerCase();
    const first = (employee.firstName || '').toLowerCase();
    const last = (employee.lastName || '').toLowerCase();
    const empId = (employee.employeeId || '').toLowerCase();
    const email = (employee.email || '').toLowerCase();

    const matchesSearch =
      !searchLower ||
      first.includes(searchLower) ||
      last.includes(searchLower) ||
      empId.includes(searchLower) ||
      email.includes(searchLower);

    const employeeDeptId = employee.department
      ? typeof employee.department === 'string'
        ? employee.department
        : employee.department._id || employee.department.id
      : '';

    const matchesDepartment = !filters.department || employeeDeptId === filters.department;

    const matchesStatus =
      !filters.status ||
      (filters.status === 'active' ? employee.isActive === true : employee.isActive === false);

    const matchesJoiningDate =
      !filters.dateOfJoining ||
      (employee.dateOfJoining && new Date(employee.dateOfJoining) >= new Date(filters.dateOfJoining));

    return matchesSearch && matchesDepartment && matchesStatus && matchesJoiningDate;
  });

  const handleAddStaff = async (staffData) => {
    try {
      await staffService.createUser(staffData);
      toast.success('Staff member added');
      fetchStaff();
      setShowAddModal(false);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to add staff member';
      toast.error(msg);
    }
  };

  const handleUpdateStaff = async (staffId, updates) => {
    try {
      await staffService.updateUser(staffId, updates);
      toast.success('Staff member updated');
      fetchStaff();
      setShowEditModal(false);
      setSelectedStaff(null);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to update staff member';
      toast.error(msg);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      await staffService.updateUserStatus(staffId, { isActive: false });
      toast.success('Staff member deactivated');
      fetchStaff();
      setShowDeleteModal(false);
      setSelectedStaff(null);
    } catch (err) {
      toast.error('Failed to deactivate staff member');
    }
  };

  const handleActivateStaff = async (staffId) => {
    try {
      await staffService.updateUserStatus(staffId, { isActive: true });
      toast.success('Staff member activated');
      fetchStaff();
    } catch (err) {
      toast.error('Failed to activate staff member');
    }
  };

  const handleExport = () => {
    toast('Export not implemented yet');
  };

  const handleImport = () => {
    toast('Import not implemented yet');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all staff members in the system</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleImport}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Import
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-dark-green-600 text-white rounded-lg text-sm font-medium hover:bg-dark-green-700 flex items-center"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Add Staff
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} {dept.code ? `(${dept.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Joined After</label>
            <DatePicker
              selected={filters.dateOfJoining ? new Date(filters.dateOfJoining) : null}
              onChange={(date) => setFilters({ ...filters, dateOfJoining: date ? date.toISOString() : '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              placeholderText="Select date"
              isClearable
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredStaff.length} of {staff.length} staff members
          </div>
          <button
            onClick={() => setFilters({ search: '', department: '', status: '', dateOfJoining: '' })}
            className="text-sm text-dark-green-600 hover:text-dark-green-700 dark:text-dark-green-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-green-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID & Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStaff.map((employee = {}) => (
                  <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {employee.profileImage ? (
                            <img className="h-10 w-10 rounded-full" src={employee.profileImage} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                                {(employee.firstName?.charAt(0) || '') + (employee.lastName?.charAt(0) || '')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{employee.position}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{employee.employeeId || '—'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{employee.email || '—'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{employee.phoneNumber || 'N/A'}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {typeof employee.department === 'string'
                          ? departments.find((d) => d._id === employee.department)?.name || employee.department
                          : employee.department?.name || '—'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Supervisor: {employee.supervisor?.firstName ? `${employee.supervisor.firstName} ${employee.supervisor.lastName || ''}` : 'None'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : '—'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedStaff(employee)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStaff(employee);
                            setShowEditModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>

                        {employee.isActive ? (
                          <button
                            onClick={() => {
                              setSelectedStaff(employee);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Deactivate"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateStaff(employee._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Activate"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
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

      {showAddModal && (
        <AddStaffModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStaff}
          departments={departments}
          loadingDepartments={loadingDepartments}
        />
      )}

      {showEditModal && selectedStaff && (
        <EditStaffModal
          staff={selectedStaff}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStaff(null);
          }}
          onSubmit={handleUpdateStaff}
          departments={departments}
          loadingDepartments={loadingDepartments}
        />
      )}

      {showDeleteModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deactivate Staff Member</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to deactivate {selectedStaff.firstName} {selectedStaff.lastName}? They will no longer be able to access the system.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStaff(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStaff(selectedStaff._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AddStaffModal = ({ onClose, onSubmit, departments = [], loadingDepartments = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'staff',
    department: '',
    position: '',
    phoneNumber: '',
    supervisor: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Staff Member</h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              >
                <option value="staff">Staff</option>
                <option value="supervisor">Supervisor</option>
                <option value="clerk">Clerk</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department *</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                disabled={loadingDepartments}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} {dept.code ? `(${dept.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position *</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-dark-green-600 text-white rounded-lg text-sm font-medium hover:bg-dark-green-700">
              Add Staff Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditStaffModal = ({ staff = {}, onClose, onSubmit, departments = [], loadingDepartments = false }) => {
  const [formData, setFormData] = useState({
    firstName: staff.firstName || '',
    lastName: staff.lastName || '',
    email: staff.email || '',
    role: staff.role || 'staff',
    department: staff.department ? (typeof staff.department === 'string' ? staff.department : staff.department._id) : '',
    position: staff.position || '',
    phoneNumber: staff.phoneNumber || '',
    supervisor: staff.supervisor ? staff.supervisor._id : ''
  });

  useEffect(() => {
    setFormData({
      firstName: staff.firstName || '',
      lastName: staff.lastName || '',
      email: staff.email || '',
      role: staff.role || 'staff',
      department: staff.department ? (typeof staff.department === 'string' ? staff.department : staff.department._id) : '',
      position: staff.position || '',
      phoneNumber: staff.phoneNumber || '',
      supervisor: staff.supervisor ? staff.supervisor._id : ''
    });
  }, [staff]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(staff._id, formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Staff Member</h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              >
                <option value="staff">Staff</option>
                <option value="supervisor">Supervisor</option>
                <option value="clerk">Clerk</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department *</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                disabled={loadingDepartments}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} {dept.code ? `(${dept.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position *</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-dark-green-600 text-white rounded-lg text-sm font-medium hover:bg-dark-green-700">
              Update Staff Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffManagement;

