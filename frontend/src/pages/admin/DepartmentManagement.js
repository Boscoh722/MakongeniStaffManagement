import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { staffService } from '../../services/staffService';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedDept, setSelectedDept] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    manager: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    budgetCode: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getDepartments();
      setDepartments(response.data);
    } catch {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await staffService.getStaff();
      setManagers(response.data);
    } catch {
      toast.error('Failed to load managers');
    }
  };

  const handleCreateDepartment = async () => {
    try {
      await departmentService.createDepartment(formData);
      toast.success('Department created successfully');
      setShowAddModal(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create department');
    }
  };

  const handleUpdateDepartment = async () => {
    try {
      await departmentService.updateDepartment(selectedDept._id, formData);
      toast.success('Department updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update department');
    }
  };

  const handleDeleteDepartment = async () => {
    try {
      await departmentService.deleteDepartment(selectedDept._id);
      toast.success('Department deactivated successfully');
      setShowDeleteModal(false);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to deactivate department');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      manager: '',
      location: '',
      contactEmail: '',
      contactPhone: '',
      budgetCode: '',
      color: '#3b82f6'
    });
    setSelectedDept(null);
  };

  const openEditModal = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      manager: dept.manager?._id || '',
      location: dept.location || '',
      contactEmail: dept.contactEmail || '',
      contactPhone: dept.contactPhone || '',
      budgetCode: dept.budgetCode || '',
      color: dept.color || '#3b82f6'
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
          Department Management
        </h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Department
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Manager</th>
              <th className="p-3 text-left">Color</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center">Loading…</td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No departments found
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept._id} className="border-b">
                  <td className="p-3">{dept.name}</td>
                  <td className="p-3">{dept.code}</td>
                  <td className="p-3">
                    {dept.manager
                      ? `${dept.manager.firstName} ${dept.manager.lastName}`
                      : '—'}
                  </td>
                  <td className="p-3">
                    <span
                      className="px-3 py-1 rounded-md text-white text-xs"
                      style={{ backgroundColor: dept.color }}
                    >
                      {dept.color}
                    </span>
                  </td>
                  <td className="p-3">
                    {dept.isActive ? (
                      <span className="text-green-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Inactive</span>
                    )}
                  </td>
                  <td className="p-3 text-right flex justify-end gap-3">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => openEditModal(dept)}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>

                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => {
                        setSelectedDept(dept);
                        setShowDeleteModal(true);
                      }}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {showAddModal || showEditModal ? (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-4">
            <h2 className="text-lg font-bold">
              {showEditModal ? 'Edit Department' : 'Add Department'}
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <input
                type="text"
                placeholder="Department Name"
                className="w-full px-3 py-2 border rounded"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              {/* Code */}
              <input
                type="text"
                placeholder="Code (e.g., HR, FIN, ICT)"
                className="w-full px-3 py-2 border rounded"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />

              {/* Manager */}
              <select
                className="w-full px-3 py-2 border rounded"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              >
                <option value="">Select Manager (Optional)</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>

              {/* Description */}
              <textarea
                placeholder="Department Description"
                className="w-full px-3 py-2 border rounded"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              {/* Color */}
              <div>
                <label className="block mb-1 font-medium">Color</label>
                <input
                  type="color"
                  className="h-10 w-20 border rounded cursor-pointer"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={showEditModal ? handleUpdateDepartment : handleCreateDepartment}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {showEditModal ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">Deactivate Department</h2>
            <p>
              Are you sure you want to deactivate{' '}
              <strong>{selectedDept?.name}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteDepartment}
                className="px-4 py-2 bg-red-600 text-white rounded"
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

export default DepartmentManagement;

