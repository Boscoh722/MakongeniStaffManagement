import api from './api';

export const reportService = {
  generateAttendanceReport: (params) =>
    api.get('/reports/attendance', {
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json',
    }),

  generateLeaveReport: (params) =>
    api.get('/reports/leaves', {
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json',
    }),

  generateDisciplinaryReport: (params) =>
    api.get('/reports/disciplinary', {
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json',
    }),

  generatePerformanceReport: (params) =>
    api.get('/reports/performance', {
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json',
    }),

  generateDashboardReport: (params) =>
    api.get('/reports/dashboard', {
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json',
    }),

  generateStaffReport: (staffId, params) =>
    api.get(`/reports/staff/${staffId}`, {
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json',
    }),

  generateDepartmentReport: (params) =>
    api.get('/reports/department', {
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json',
    }),

  generateLeaveBalanceReport: (params) =>
    api.get('/reports/leave-balance', {
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json',
    }),

  generateComprehensiveReport: (params) =>
    api.get('/reports/comprehensive', {
      params,
      responseType: params?.format !== 'json' ? 'blob' : 'json',
    }),

  getReportTypes: () => api.get('/reports/types'),

  getReportTemplates: (params) => api.get('/reports/templates', { params }),

  saveReportConfig: (data) => api.post('/reports/config', data),

  getSavedReports: () => api.get('/reports/saved'),

  runSavedReport: (id, params) =>
    api.get(`/reports/saved/${id}`, { params, responseType: 'blob' }),

  deleteSavedReport: (id) => api.delete(`/reports/saved/${id}`),

  getReportStats: () => api.get('/reports/stats'),

  // 🔥 FIX: Add missing function
  getRecentActivities: () => api.get('/reports/recent-activities'),

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

  getReportPreview: (type, filters) =>
    reportService.generateReport(type, { ...filters, format: 'json' }),

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

export default reportService;
