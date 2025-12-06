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
      case 'open': return 'bg-scarlet-100 text-scarlet-800 dark:bg-scarlet-900/50 dark:text-scarlet-300';
      case 'under-review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'resolved': return 'bg-mustard-100 text-mustard-800 dark:bg-mustard-900/50 dark:text-mustard-300';
      case 'appealed': return 'bg-royal-100 text-royal-800 dark:bg-royal-900/50 dark:text-royal-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300';
    }
  };

  const getInfractionColor = (type) => {
    switch (type) {
      case 'minor': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'major': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'severe': return 'bg-scarlet-100 text-scarlet-800 dark:bg-scarlet-900/50 dark:text-scarlet-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300';
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
    <div className="space-y-6 p-6 bg-gradient-to-br from-royal-50 via-mustard-50 to-scarlet-50 dark:from-neutral-900 dark:via-royal-900 dark:to-scarlet-900 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Disciplinary Management</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage staff disciplinary cases and sanctions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-scarlet-500 to-scarlet-600 text-white rounded-xl text-sm font-medium hover:from-scarlet-600 hover:to-scarlet-700 flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            New Case
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-scarlet-100 dark:border-scarlet-900/30">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-scarlet-100 dark:bg-scarlet-900/50 mr-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-scarlet-600 dark:text-scarlet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Open Cases</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {cases.filter(c => c.status === 'open').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-yellow-100 dark:border-yellow-900/30">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/50 mr-4">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Under Review</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {cases.filter(c => c.status === 'under-review').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-mustard-100 dark:border-mustard-900/30">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-mustard-100 dark:bg-mustard-900/50 mr-4">
              <CheckCircleIcon className="h-6 w-6 text-mustard-600 dark:text-mustard-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Resolved</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {cases.filter(c => c.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-royal-100 dark:border-royal-900/30">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-royal-100 dark:bg-royal-900/50 mr-4">
              <DocumentTextIcon className="h-6 w-6 text-royal-600 dark:text-royal-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Cases</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {cases.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-mustard-100 dark:border-mustard-900/30">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-3 border border-mustard-200 rounded-xl focus:ring-2 focus:ring-mustard-500 focus:border-transparent dark:bg-neutral-900/70 dark:border-mustard-800 dark:text-white transition-all duration-200 hover:border-mustard-300 dark:hover:border-mustard-700 placeholder-royal-400 dark:placeholder-royal-500"
                placeholder="Search cases..."
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-3 border border-mustard-200 rounded-xl focus:ring-2 focus:ring-mustard-500 focus:border-transparent dark:bg-neutral-900/70 dark:border-mustard-800 dark:text-white transition-all duration-200 hover:border-mustard-300 dark:hover:border-mustard-700"
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
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Infraction Type
            </label>
            <select
              value={filters.infractionType}
              onChange={(e) => setFilters({ ...filters, infractionType: e.target.value })}
              className="w-full px-4 py-3 border border-mustard-200 rounded-xl focus:ring-2 focus:ring-mustard-500 focus:border-transparent dark:bg-neutral-900/70 dark:border-mustard-800 dark:text-white transition-all duration-200 hover:border-mustard-300 dark:hover:border-mustard-700"
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
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              From Date
            </label>
            <DatePicker
              selected={filters.startDate ? new Date(filters.startDate) : null}
              onChange={(date) => setFilters({ ...filters, startDate: date ? date.toISOString() : '' })}
              className="w-full px-4 py-3 border border-mustard-200 rounded-xl focus:ring-2 focus:ring-mustard-500 focus:border-transparent dark:bg-neutral-900/70 dark:border-mustard-800 dark:text-white transition-all duration-200 hover:border-mustard-300 dark:hover:border-mustard-700"
              placeholderText="Select date"
              isClearable
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              To Date
            </label>
            <DatePicker
              selected={filters.endDate ? new Date(filters.endDate) : null}
              onChange={(date) => setFilters({ ...filters, endDate: date ? date.toISOString() : '' })}
              className="w-full px-4 py-3 border border-mustard-200 rounded-xl focus:ring-2 focus:ring-mustard-500 focus:border-transparent dark:bg-neutral-900/70 dark:border-mustard-800 dark:text-white transition-all duration-200 hover:border-mustard-300 dark:hover:border-mustard-700"
              placeholderText="Select date"
              isClearable
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Showing {filteredCases.length} of {cases.length} disciplinary cases
          </div>
          <button
            onClick={() => setFilters({ search: '', status: '', infractionType: '', startDate: '', endDate: '' })}
            className="text-sm text-mustard-600 hover:text-mustard-700 dark:text-mustard-400 transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-mustard-100 dark:border-mustard-900/30">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mustard-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-mustard-200 dark:divide-mustard-900/30">
              <thead className="bg-gradient-to-r from-mustard-50 to-mustard-100/50 dark:from-mustard-900/30 dark:to-mustard-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                    Case Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                    Infraction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mustard-200 dark:divide-mustard-900/30">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem._id} className="hover:bg-mustard-50/50 dark:hover:bg-mustard-900/20 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {caseItem.description.substring(0, 60)}...
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        Reported by: {caseItem.reportedBy?.firstName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-mustard-100 to-royal-100 dark:from-mustard-900/50 dark:to-royal-900/50 flex items-center justify-center">
                            <span className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                              {caseItem.staff.firstName.charAt(0)}{caseItem.staff.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {caseItem.staff.firstName} {caseItem.staff.lastName}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            {caseItem.staff.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getInfractionColor(caseItem.infractionType)}`}>
                        {caseItem.infractionType.toUpperCase()}
                      </span>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {caseItem.sanction || 'No sanction'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-300">
                      {new Date(caseItem.dateOfInfraction).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCase(caseItem);
                            setShowDetailsModal(true);
                          }}
                          className="text-royal-600 hover:text-royal-700 dark:text-royal-400 dark:hover:text-royal-300 transition-colors duration-200"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCase(caseItem);
                            // Edit functionality
                          }}
                          className="text-mustard-600 hover:text-mustard-700 dark:text-mustard-400 dark:hover:text-mustard-300 transition-colors duration-200"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        {caseItem.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolveCase(caseItem._id)}
                            className="text-mustard-600 hover:text-mustard-700 dark:text-mustard-400 dark:hover:text-mustard-300 transition-colors duration-200"
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
        <div className="fixed inset-0 bg-neutral-900/75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-mustard-100 dark:border-mustard-900/30 shadow-2xl">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
              Disciplinary Case Details
            </h3>

            <div className="space-y-6">
              {/* Case Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-mustard-50 to-mustard-100/50 dark:from-mustard-900/30 dark:to-mustard-900/20 p-4 rounded-xl border border-mustard-200 dark:border-mustard-800">
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Case Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Case ID</p>
                      <p className="font-medium text-neutral-900 dark:text-white">{selectedCase._id.substring(0, 8)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Status</p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCase.status)}`}>
                        {selectedCase.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Infraction Type</p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getInfractionColor(selectedCase.infractionType)}`}>
                        {selectedCase.infractionType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-royal-50 to-royal-100/50 dark:from-royal-900/30 dark:to-royal-900/20 p-4 rounded-xl border border-royal-200 dark:border-royal-800">
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Dates</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Date of Infraction</p>
                      <p className="font-medium text-neutral-900 dark:text-white">{new Date(selectedCase.dateOfInfraction).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Reported On</p>
                      <p className="font-medium text-neutral-900 dark:text-white">{new Date(selectedCase.createdAt).toLocaleDateString()}</p>
                    </div>
                    {selectedCase.sanctionDate && (
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Sanction Date</p>
                        <p className="font-medium text-neutral-900 dark:text-white">{new Date(selectedCase.sanctionDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Staff Information */}
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Staff Information</h4>
                <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-mustard-100 to-royal-100 dark:from-mustard-900/50 dark:to-royal-900/50 flex items-center justify-center mr-4">
                      <span className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                        {selectedCase.staff.firstName.charAt(0)}{selectedCase.staff.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {selectedCase.staff.firstName} {selectedCase.staff.lastName}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {selectedCase.staff.employeeId} • {selectedCase.staff.department}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Description</h4>
                <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl">
                  <p className="text-neutral-700 dark:text-neutral-300">{selectedCase.description}</p>
                </div>
              </div>

              {/* Sanctions & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Sanctions</h4>
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl">
                    {selectedCase.sanction ? (
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{selectedCase.sanction}</p>
                        {selectedCase.sanctionDetails && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {selectedCase.sanctionDetails}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-neutral-500 dark:text-neutral-400">No sanctions applied yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Remedial Measures</h4>
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl">
                    {selectedCase.remedialMeasures ? (
                      <p className="text-neutral-700 dark:text-neutral-300">{selectedCase.remedialMeasures}</p>
                    ) : (
                      <p className="text-neutral-500 dark:text-neutral-400">No remedial measures specified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Staff Response */}
              {selectedCase.staffResponse && (
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Staff Response</h4>
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl">
                    <p className="text-neutral-700 dark:text-neutral-300">{selectedCase.staffResponse}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                      Submitted on: {new Date(selectedCase.responseDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Appeal Information */}
              {selectedCase.appeal?.hasAppealed && (
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Appeal Information</h4>
                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl">
                    <p className="text-neutral-700 dark:text-neutral-300">{selectedCase.appeal.appealDetails}</p>
                    <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
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
                className="px-4 py-2 border border-mustard-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-mustard-50 dark:border-mustard-600 dark:text-neutral-300 dark:hover:bg-mustard-900/30 transition-all duration-200"
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
                  className="px-4 py-2 bg-gradient-to-r from-mustard-500 to-mustard-600 text-white rounded-xl text-sm font-medium hover:from-mustard-600 hover:to-mustard-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Case Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-neutral-900/75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-mustard-100 dark:border-mustard-900/30 shadow-2xl">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
              Create New Disciplinary Case
            </h3>
            {/* Add form for new case */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-mustard-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-mustard-50 dark:border-mustard-600 dark:text-neutral-300 dark:hover:bg-mustard-900/30 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Submit new case
                  setShowAddModal(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-scarlet-500 to-scarlet-600 text-white rounded-xl text-sm font-medium hover:from-scarlet-600 hover:to-scarlet-700 shadow-lg hover:shadow-xl transition-all duration-200"
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