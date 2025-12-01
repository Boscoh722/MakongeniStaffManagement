import api from './api';

export const reportService = {
  // Generate attendance report
  generateAttendanceReport: (params) => {
    return api.get('/reports/attendance', { 
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json'
    });
  },

  // Generate leave report
  generateLeaveReport: (params) => {
    return api.get('/reports/leaves', { 
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json'
    });
  },

  // Generate disciplinary report
  generateDisciplinaryReport: (params) => {
    return api.get('/reports/disciplinary', { 
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json'
    });
  },

  // Generate performance report
  generatePerformanceReport: (params) => {
    return api.get('/reports/performance', { 
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json'
    });
  },

  // Generate dashboard report
  generateDashboardReport: (params) => {
    return api.get('/reports/dashboard', { 
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json'
    });
  },

  // Generate staff report
  generateStaffReport: (staffId, params) => {
    return api.get(`/reports/staff/${staffId}`, { 
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json'
    });
  },

  // Generate department report
  generateDepartmentReport: (params) => {
    return api.get('/reports/department', { 
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json'
    });
  },

  // Generate leave balance report
  generateLeaveBalanceReport: (params) => {
    return api.get('/reports/leave-balance', { 
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json'
    });
  },

  // Generate comprehensive report
  generateComprehensiveReport: (params) => {
    return api.get('/reports/comprehensive', { 
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json'
    });
  },

  // Get available report types
  getReportTypes: () => api.get('/reports/types'),

  // Get report templates
  getReportTemplates: (params) => api.get('/reports/templates', { params }),

  // Save report config
  saveReportConfig: (data) => api.post('/reports/config', data),

  // Saved reports
  getSavedReports: () => api.get('/reports/saved'),
  runSavedReport: (id, params) =>
    api.get(`/reports/saved/${id}`, { params, responseType: 'blob' }),
  deleteSavedReport: (id) => api.delete(`/reports/saved/${id}`),

  // Stats
  getReportStats: () => api.get('/reports/stats'),

  // Unified report generator
  generateReport: async (type, filters, format = 'pdf') => {
    try {
      const params = { ...filters, format };
      let response;

      switch (type) {
        case 'attendance':
          response = await reportService.generateAttendanceReport(params);
          break;
        case 'leaves':
          response = await reportService.generateLeaveReport(params);
          break;
        case 'disciplinary':
          response = await reportService.generateDisciplinaryReport(params);
          break;
        case 'performance':
          response = await reportService.generatePerformanceReport(params);
          break;
        case 'dashboard':
          response = await reportService.generateDashboardReport(params);
          break;
        case 'department':
          response = await reportService.generateDepartmentReport(params);
          break;
        case 'leave-balance':
          response = await reportService.generateLeaveBalanceReport(params);
          break;
        case 'comprehensive':
          response = await reportService.generateComprehensiveReport(params);
          break;
        default:
          throw new Error('Invalid report type');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download blob file
  handleBlobResponse: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Preview = JSON only
  getReportPreview: (type, filters) =>
    reportService.generateReport(type, { ...filters, format: 'json' }),

  // Export report
  exportReportData: async (type, filters, format = 'excel') => {
    try {
      const data = await reportService.generateReport(type, filters, format);

      let filename;

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        filename = `${type}_report_${Date.now()}.json`;
        reportService.handleBlobResponse(blob, filename);
      } else {
        filename = `${type}_report_${Date.now()}.${format}`;
        reportService.handleBlobResponse(data, filename);
      }

      return { success: true, filename };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// ------------------------
// Report Types
// ------------------------

export const reportTypes = {
  attendance: {
    name: 'Attendance Report',
    description: 'Generate attendance report for selected period',
    icon: '📊',
    availableFormats: ['pdf', 'excel', 'csv', 'json'],
    filters: ['startDate', 'endDate', 'department', 'status'],
  },
  leaves: {
    name: 'Leave Report',
    description: 'Generate leave application and approval report',
    icon: '📅',
    availableFormats: ['pdf', 'excel', 'csv', 'json'],
    filters: ['startDate', 'endDate', 'leaveType', 'status', 'department'],
  },
  disciplinary: {
    name: 'Disciplinary Report',
    description: 'Generate disciplinary cases report',
    icon: '⚖️',
    availableFormats: ['pdf', 'excel', 'csv', 'json'],
    filters: ['startDate', 'endDate', 'infractionType', 'status', 'department'],
  },
  performance: {
    name: 'Performance Report',
    description: 'Generate staff performance evaluation report',
    icon: '📈',
    availableFormats: ['pdf', 'excel', 'json'],
    filters: ['period', 'department'],
  },
  dashboard: {
    name: 'Dashboard Report',
    description: 'Generate comprehensive system dashboard report',
    icon: '🏠',
    availableFormats: ['pdf', 'excel', 'json'],
    filters: ['period'],
  },
  department: {
    name: 'Department Report',
    description: 'Generate department-wise analysis report',
    icon: '🏢',
    availableFormats: ['pdf', 'excel', 'csv', 'json'],
    filters: ['department'],
  },
  'leave-balance': {
    name: 'Leave Balance Report',
    description: 'Generate staff leave balance report',
    icon: '⚖️',
    availableFormats: ['pdf', 'excel', 'csv', 'json'],
    filters: ['department'],
  },
  comprehensive: {
    name: 'Comprehensive Report',
    description: 'Generate all-in-one comprehensive report',
    icon: '📋',
    availableFormats: ['pdf', 'excel'],
    filters: ['startDate', 'endDate', 'department'],
  },
};

// ------------------------
// Helper Functions
// ------------------------

export const reportHelpers = {
  formatDate: (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatDateRange: (start, end) =>
    !start || !end ? 'N/A' : `${reportHelpers.formatDate(start)} to ${reportHelpers.formatDate(end)}`,

  calculatePercentage: (value, total) =>
    total === 0 ? '0%' : `${((value / total) * 100).toFixed(2)}%`,

  formatDuration: (days) => (days === 1 ? '1 day' : `${days} days`),

  getStatusColor: (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      leave: 'bg-blue-100 text-blue-800',
      'off-duty': 'bg-gray-100 text-gray-800',
      open: 'bg-red-100 text-red-800',
      resolved: 'bg-green-100 text-green-800',
      'under-review': 'bg-yellow-100 text-yellow-800',
      appealed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },

  getInfractionLabel: (type) => {
    const labels = {
      minor: 'Minor Infraction',
      major: 'Major Infraction',
      severe: 'Severe Infraction',
    };
    return labels[type] || type;
  },

  getLeaveTypeLabel: (type) => {
    const labels = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      compassionate: 'Compassionate Leave',
      study: 'Study Leave',
    };
    return labels[type] || type;
  },

  formatCurrency: (amount) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount),

  generateFilename: (reportType, format, timestamp = Date.now()) => {
    const date = new Date().toISOString().split('T')[0];
    return `makongeni_${reportType}_${date}_${timestamp}.${format}`;
  },

  prepareFiltersForDisplay: (filters) => {
    const displayFilters = {};

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        switch (key) {
          case 'startDate':
          case 'endDate':
            displayFilters[key] = reportHelpers.formatDate(filters[key]);
            break;
          case 'leaveType':
            displayFilters[key] = reportHelpers.getLeaveTypeLabel(filters[key]);
            break;
          case 'infractionType':
            displayFilters[key] = reportHelpers.getInfractionLabel(filters[key]);
            break;
          case 'status':
            displayFilters[key] =
              filters[key].charAt(0).toUpperCase() + filters[key].slice(1);
            break;
          default:
            displayFilters[key] = filters[key];
        }
      }
    });

    return displayFilters;
  },
};

export default reportService;
