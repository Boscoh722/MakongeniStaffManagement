import api from './api';

export const staffService = {
  // Staff
  getStaff: () => api.get('/staff'),
  getProfile: (id) => api.get(`/staff/profile/${id}`),
  updateProfile: (id, data) => api.put(`/staff/profile/${id}`, data),
  addQualification: (id, data) => api.post(`/staff/qualifications/${id}`, data),
  
  // Attendance
  getAttendance: (params) => api.get('/attendance', { params }),
  markAttendance: (data) => api.post('/attendance/mark', data),
  getMyAttendance: (params) => api.get('/attendance/my-attendance', { params }),
  getAttendanceStats: (params) => api.get('/attendance/stats', { params }),
  getMonthlySummary: (params) => api.get('/attendance/monthly-summary', { params }),
  
  // Leaves
  applyLeave: (data) => api.post('/leaves/apply', data),
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  getAllLeaves: (params) => api.get('/leaves', { params }),
  updateLeaveStatus: (id, data) => api.put(`/leaves/${id}/status`, data),
  getLeaveStats: (staffId) => api.get(`/leaves/stats/${staffId}`),
  cancelLeave: (id) => api.put(`/leaves/${id}/cancel`),
  
  // Disciplinary
  getDisciplinaryCases: () => api.get('/disciplinary'),
  getMyCases: () => api.get('/disciplinary/my-cases'),
  createCase: (data) => api.post('/disciplinary', data),
  addResponse: (id, data) => api.post(`/disciplinary/${id}/response`, data),
  fileAppeal: (id, data) => api.post(`/disciplinary/${id}/appeal`, data),
  
  // Admin
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  getEmailTemplates: () => api.get('/admin/email-templates'),
  sendBulkEmails: (data) => api.post('/admin/send-bulk-emails', data),
  
  // Reports
  generateReport: (type, params) => api.get(`/reports/${type}`, { params }),
  
  // Audit
  getAuditLogs: (params) => api.get('/audit/logs', { params })
};
