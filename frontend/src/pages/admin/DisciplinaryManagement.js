import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import {
  ExclamationTriangleIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DisciplinaryManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    infractionType: '',
    startDate: '',
    endDate: ''
  });
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchCases();
    fetchStats();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await staffService.getDisciplinaryCases();
      setCases(response.data);
    } catch (error) {
      toast.error('Failed to fetch disciplinary cases');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await staffService.getDisciplinaryStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleResolveCase = async (caseId) => {
    try {
      await staffService.updateDisciplinaryCase(caseId, { status: 'resolved' });
      toast.success('Case marked as resolved');
      fetchCases();
    } catch (error) {
      toast.error('Failed to update case');
    }
  };

  const handleAddSanction = async (caseId, sanction) => {
    try {
      await staffService.addSanction(caseId, sanction);
      toast.success('Sanction added');
      fetchCases();
    } catch (error) {
      toast.error('Failed to add sanction');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'under-review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'appealed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getInfractionColor = (type) => {
    switch (type) {
      case 'minor': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'major': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'severe': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = 
      caseItem.staff.firstName.toLowerCase().includes(searchLower) ||
      caseItem.staff.lastName.toLowerCase().includes(searchLower) ||
      caseItem.staff.employeeId.toLowerCase().includes(searchLower) ||
      caseItem.description.toLowerCase().includes(searchLower);

    const matchesStatus = !filters.status || caseItem.status === filters.status;
    const matchesInfraction = !filters.infractionType || caseItem.infractionType === filters.infractionType;
    
    const matchesDate = (!filters.startDate || new Date(caseItem.dateOfInfraction) >= new Date(filters.startDate)) &&
                       (!filters.endDate || new Date(caseItem.dateOfInfraction) <= new Date(filters.endDate));

    return matchesSearch && matchesStatus && matchesInfraction && matchesDate;
  });

  const infractionTypes = ['minor', 'major', 'severe'];
  const statuses = ['open', 'under-review', 'resolved', 'appealed'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disciplinary Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage staff disciplinary cases and sanctions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-dark-green-600 text-white rounded-lg text-sm font-medium hover:bg-dark-green-700 flex items-center"
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            New Case
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 mr-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Cases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {cases.filter(c => c.status === 'open').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-4">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Under Review</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {cases.filter(c => c.status === 'under-review').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {cases.filter(c => c.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
              <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {cases.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                placeholder="Search cases..."
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
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Infraction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Infraction Type
            </label>
            <select
              value={filters.infractionType}
              onChange={(e) => setFilters({ ...filters, infractionType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Types</option>
              {infractionTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Date
            </label>
            <DatePicker
              selected={filters.startDate ? new Date(filters.startDate) : null}
              onChange={(date) => setFilters({ ...filters, startDate: date ? date.toISOString() : '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              placeholderText="Select date"
              isClearable
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Date
            </label>
            <DatePicker
              selected={filters.endDate ? new Date(filters.endDate) : null}
              onChange={(date) => setFilters({ ...filters, endDate: date ? date.toISOString() : '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              placeholderText="Select date"
              isClearable
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCases.length} of {cases.length} disciplinary cases
          </div>
          <button
            onClick={() => setFilters({ search: '', status: '', infractionType: '', startDate: '', endDate: '' })}
            className="text-sm text-dark-green-600 hover:text-dark-green-700 dark:text-dark-green-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Cases Table */}
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
                    Case Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Infraction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {caseItem.description.substring(0, 60)}...
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Reported by: {caseItem.reportedBy?.firstName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                              {caseItem.staff.firstName.charAt(0)}{caseItem.staff.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {caseItem.staff.firstName} {caseItem.staff.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {caseItem.staff.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getInfractionColor(caseItem.infractionType)}`}>
                        {caseItem.infractionType.toUpperCase()}
                      </span>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {caseItem.sanction || 'No sanction'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(caseItem.dateOfInfraction).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCase(caseItem);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCase(caseItem);
                            // Edit functionality
                          }}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        {caseItem.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolveCase(caseItem._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Mark Resolved"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
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

      {/* Case Details Modal */}
      {showDetailsModal && selectedCase && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Disciplinary Case Details
            </h3>
            
            <div className="space-y-6">
              {/* Case Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Case Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Case ID</p>
                      <p className="font-medium">{selectedCase._id.substring(0, 8)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedCase.status)}`}>
                        {selectedCase.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Infraction Type</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getInfractionColor(selectedCase.infractionType)}`}>
                        {selectedCase.infractionType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Dates</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date of Infraction</p>
                      <p className="font-medium">{new Date(selectedCase.dateOfInfraction).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reported On</p>
                      <p className="font-medium">{new Date(selectedCase.createdAt).toLocaleDateString()}</p>
                    </div>
                    {selectedCase.sanctionDate && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sanction Date</p>
                        <p className="font-medium">{new Date(selectedCase.sanctionDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Staff Information */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Staff Information</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                      <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                        {selectedCase.staff.firstName.charAt(0)}{selectedCase.staff.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedCase.staff.firstName} {selectedCase.staff.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCase.staff.employeeId} • {selectedCase.staff.department}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">{selectedCase.description}</p>
                </div>
              </div>

              {/* Sanctions & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sanctions</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    {selectedCase.sanction ? (
                      <div>
                        <p className="font-medium">{selectedCase.sanction}</p>
                        {selectedCase.sanctionDetails && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {selectedCase.sanctionDetails}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No sanctions applied yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Remedial Measures</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    {selectedCase.remedialMeasures ? (
                      <p className="text-gray-700 dark:text-gray-300">{selectedCase.remedialMeasures}</p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No remedial measures specified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Staff Response */}
              {selectedCase.staffResponse && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Staff Response</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">{selectedCase.staffResponse}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Submitted on: {new Date(selectedCase.responseDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Appeal Information */}
              {selectedCase.appeal?.hasAppealed && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Appeal Information</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">{selectedCase.appeal.appealDetails}</p>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <p>Appealed on: {new Date(selectedCase.appeal.appealDate).toLocaleDateString()}</p>
                      {selectedCase.appeal.appealDecision && (
                        <p>Decision: {selectedCase.appeal.appealDecision}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCase(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedCase.status !== 'resolved' && (
                <button
                  onClick={() => {
                    handleResolveCase(selectedCase._id);
                    setShowDetailsModal(false);
                    setSelectedCase(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Case Modal (similar structure to other modals) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Disciplinary Case
            </h3>
            {/* Add form for new case */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Submit new case
                  setShowAddModal(false);
                }}
                className="px-4 py-2 bg-dark-green-600 text-white rounded-lg text-sm font-medium hover:bg-dark-green-700"
              >
                Create Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisciplinaryManagement;