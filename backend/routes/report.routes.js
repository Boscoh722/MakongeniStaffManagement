const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Disciplinary = require('../models/Disciplinary');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Generate attendance report
router.get('/attendance', auth, authorize('admin', 'supervisor', 'clerk'), async (req, res) => {
  try {
    const { startDate, endDate, department, format = 'json', staffId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // Apply filters
    if (staffId) {
      query.staff = staffId;
    } else if (department && req.user.role !== 'staff') {
      const staffInDept = await User.find({ department }).select('_id');
      query.staff = { $in: staffInDept.map(s => s._id) };
    } else if (req.user.role === 'supervisor') {
      const supervisedStaff = await User.find({ supervisor: req.user._id }).select('_id');
      query.staff = { $in: supervisedStaff.map(s => s._id) };
    }

    const attendance = await Attendance.find(query)
      .populate('staff', 'firstName lastName employeeId department position')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: 1, 'staff.firstName': 1 });

    // Calculate summary statistics
    const summary = await calculateAttendanceSummary(query, startDate, endDate);

    if (format === 'pdf') {
      return generateAttendancePDF(res, attendance, summary, startDate, endDate);
    } else if (format === 'excel') {
      return generateAttendanceExcel(res, attendance, summary, startDate, endDate);
    }

    res.json({
      period: { startDate, endDate },
      summary,
      attendance,
      totalRecords: attendance.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate leave report
router.get('/leaves', auth, authorize('admin', 'supervisor', 'clerk'), async (req, res) => {
  try {
    const { startDate, endDate, department, leaveType, status, format = 'json' } = req.query;
    
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (leaveType) query.leaveType = leaveType;
    if (status) query.status = status;

    // Apply department filter
    if (department) {
      const staffInDept = await User.find({ department }).select('_id');
      query.staff = { $in: staffInDept.map(s => s._id) };
    }

    const leaves = await Leave.find(query)
      .populate('staff', 'firstName lastName employeeId department')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate leave statistics
    const stats = await calculateLeaveStatistics(query);

    if (format === 'pdf') {
      return generateLeavePDF(res, leaves, stats, req.query);
    } else if (format === 'excel') {
      return generateLeaveExcel(res, leaves, stats, req.query);
    }

    res.json({
      filters: req.query,
      statistics: stats,
      leaves,
      totalRecords: leaves.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate disciplinary report
router.get('/disciplinary', auth, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const { startDate, endDate, department, infractionType, status, format = 'json' } = req.query;
    
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (infractionType) query.infractionType = infractionType;
    if (status) query.status = status;

    // Apply department filter
    if (department) {
      const staffInDept = await User.find({ department }).select('_id');
      query.staff = { $in: staffInDept.map(s => s._id) };
    }

    const cases = await Disciplinary.find(query)
      .populate('staff', 'firstName lastName employeeId department')
      .populate('reportedBy', 'firstName lastName')
      .populate('actionTakenBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate disciplinary statistics
    const stats = await calculateDisciplinaryStatistics(query);

    if (format === 'pdf') {
      return generateDisciplinaryPDF(res, cases, stats, req.query);
    } else if (format === 'excel') {
      return generateDisciplinaryExcel(res, cases, stats, req.query);
    }

    res.json({
      filters: req.query,
      statistics: stats,
      cases,
      totalRecords: cases.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate staff performance report
router.get('/performance', auth, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const { department, period = 'month', format = 'json' } = req.query;
    
    const query = { role: 'staff', isActive: true };
    if (department) query.department = department;

    const staff = await User.find(query)
      .select('firstName lastName employeeId department position dateOfJoining')
      .populate('supervisor', 'firstName lastName');

    const performanceData = [];

    for (const employee of staff) {
      const performance = await calculateStaffPerformance(employee._id, period);
      performanceData.push({
        staff: employee,
        performance
      });
    }

    // Sort by performance score
    performanceData.sort((a, b) => b.performance.score - a.performance.score);

    if (format === 'pdf') {
      return generatePerformancePDF(res, performanceData, period, department);
    } else if (format === 'excel') {
      return generatePerformanceExcel(res, performanceData, period, department);
    }

    res.json({
      period,
      department: department || 'All',
      totalStaff: performanceData.length,
      data: performanceData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate comprehensive dashboard report
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    const { period = 'month', format = 'json' } = req.query;
    
    const dashboardData = await generateDashboardData(period);

    if (format === 'pdf') {
      return generateDashboardPDF(res, dashboardData, period);
    } else if (format === 'excel') {
      return generateDashboardExcel(res, dashboardData, period);
    }

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate staff individual report
router.get('/staff/:id', auth, async (req, res) => {
  try {
    const staffId = req.params.id;
    const { period = 'year', format = 'json' } = req.query;

    // Check permissions
    if (req.user.role === 'staff' && req.user._id.toString() !== staffId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const staff = await User.findById(staffId)
      .select('-password')
      .populate('supervisor', 'firstName lastName')
      .populate('qualifications');

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Get comprehensive data for the staff
    const reportData = await generateStaffReportData(staffId, period);

    if (format === 'pdf') {
      return generateStaffPDF(res, staff, reportData, period);
    } else if (format === 'excel') {
      return generateStaffExcel(res, staff, reportData, period);
    }

    res.json({
      staffInfo: staff,
      period,
      reportData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate department-wise report
router.get('/department', auth, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const { department, format = 'json' } = req.query;
    
    const departments = department ? [department] : await getDistinctDepartments();

    const departmentReports = [];

    for (const dept of departments) {
      const report = await generateDepartmentReport(dept);
      departmentReports.push(report);
    }

    if (format === 'pdf') {
      return generateDepartmentPDF(res, departmentReports);
    } else if (format === 'excel') {
      return generateDepartmentExcel(res, departmentReports);
    }

    res.json({
      generatedAt: new Date(),
      reports: departmentReports
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate leave balance report
router.get('/leave-balance', auth, authorize('admin', 'supervisor', 'clerk'), async (req, res) => {
  try {
    const { department, format = 'json' } = req.query;
    
    const query = { role: 'staff', isActive: true };
    if (department) query.department = department;

    const staff = await User.find(query)
      .select('firstName lastName employeeId department position leaveBalance')
      .sort('department lastName');

    const leaveBalanceData = staff.map(employee => ({
      employee: {
        name: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        department: employee.department,
        position: employee.position
      },
      leaveBalance: employee.leaveBalance || {}
    }));

    if (format === 'pdf') {
      return generateLeaveBalancePDF(res, leaveBalanceData, department);
    } else if (format === 'excel') {
      return generateLeaveBalanceExcel(res, leaveBalanceData, department);
    }

    res.json({
      generatedAt: new Date(),
      department: department || 'All Departments',
      totalStaff: leaveBalanceData.length,
      data: leaveBalanceData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper Functions

async function calculateAttendanceSummary(query, startDate, endDate) {
  const attendance = await Attendance.find(query)
    .populate('staff', 'department');

  const summary = {
    totalDays: attendance.length,
    present: 0,
    absent: 0,
    leave: 0,
    offDuty: 0,
    late: 0,
    byDepartment: {},
    averageAttendance: 0
  };

  attendance.forEach(record => {
    summary[record.status]++;
    
    if (record.staff && record.staff.department) {
      if (!summary.byDepartment[record.staff.department]) {
        summary.byDepartment[record.staff.department] = {
          present: 0,
          absent: 0,
          leave: 0,
          total: 0
        };
      }
      summary.byDepartment[record.staff.department][record.status]++;
      summary.byDepartment[record.staff.department].total++;
    }
  });

  // Calculate average attendance percentage
  const workingDays = summary.present + summary.late + summary.leave + summary.offDuty;
  summary.averageAttendance = summary.totalDays > 0 
    ? ((workingDays / summary.totalDays) * 100).toFixed(2) 
    : 0;

  return summary;
}

async function calculateLeaveStatistics(query) {
  const leaves = await Leave.find(query);
  
  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
    pending: leaves.filter(l => l.status === 'pending').length,
    cancelled: leaves.filter(l => l.status === 'cancelled').length,
    byType: {},
    byMonth: {}
  };

  leaves.forEach(leave => {
    // By type
    if (!stats.byType[leave.leaveType]) {
      stats.byType[leave.leaveType] = {
        total: 0,
        approved: 0,
        days: 0
      };
    }
    stats.byType[leave.leaveType].total++;
    if (leave.status === 'approved') {
      stats.byType[leave.leaveType].approved++;
      stats.byType[leave.leaveType].days += leave.numberOfDays;
    }

    // By month
    const month = leave.startDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!stats.byMonth[month]) {
      stats.byMonth[month] = 0;
    }
    stats.byMonth[month]++;
  });

  // Calculate approval rate
  stats.approvalRate = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(2) : 0;

  return stats;
}

async function calculateDisciplinaryStatistics(query) {
  const cases = await Disciplinary.find(query);
  
  const stats = {
    total: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    underReview: cases.filter(c => c.status === 'under-review').length,
    resolved: cases.filter(c => c.status === 'resolved').length,
    appealed: cases.filter(c => c.status === 'appealed').length,
    byInfractionType: {},
    bySanction: {},
    byDepartment: {}
  };

  cases.forEach(caseItem => {
    // By infraction type
    if (!stats.byInfractionType[caseItem.infractionType]) {
      stats.byInfractionType[caseItem.infractionType] = 0;
    }
    stats.byInfractionType[caseItem.infractionType]++;

    // By sanction
    const sanction = caseItem.sanction || 'none';
    if (!stats.bySanction[sanction]) {
      stats.bySanction[sanction] = 0;
    }
    stats.bySanction[sanction]++;
  });

  // Calculate resolution rate
  stats.resolutionRate = stats.total > 0 
    ? (((stats.resolved) / stats.total) * 100).toFixed(2) 
    : 0;

  return stats;
}

async function calculateStaffPerformance(staffId, period) {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'quarter':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  const [attendance, leaves, disciplinary] = await Promise.all([
    Attendance.find({
      staff: staffId,
      date: { $gte: startDate }
    }),
    Leave.find({
      staff: staffId,
      status: 'approved',
      startDate: { $gte: startDate }
    }),
    Disciplinary.find({
      staff: staffId,
      status: { $in: ['open', 'under-review'] },
      createdAt: { $gte: startDate }
    })
  ]);

  const presentDays = attendance.filter(a => a.status === 'present').length;
  const totalDays = attendance.length;
  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  const performance = {
    period,
    startDate,
    endDate: new Date(),
    attendance: {
      totalDays,
      presentDays,
      attendanceRate: attendanceRate.toFixed(2),
      leavesTaken: leaves.reduce((sum, leave) => sum + leave.numberOfDays, 0),
      disciplinaryCases: disciplinary.length
    },
    score: calculatePerformanceScore(attendanceRate, leaves.length, disciplinary.length)
  };

  return performance;
}

function calculatePerformanceScore(attendanceRate, leavesTaken, disciplinaryCases) {
  let score = 100;
  
  // Attendance component (60%)
  score *= (attendanceRate / 100) * 0.6;
  
  // Leave component (30%)
  const leavePenalty = Math.min(leavesTaken * 2, 30); // Max 30% penalty
  score -= leavePenalty;
  
  // Disciplinary component (10% penalty per case)
  score -= disciplinaryCases * 10;
  
  return Math.max(0, Math.min(100, score)).toFixed(2);
}

async function generateDashboardData(period) {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'quarter':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  const [
    totalStaff,
    activeStaff,
    todayAttendance,
    pendingLeaves,
    openDisciplinary,
    attendanceTrend,
    leaveTrend,
    departmentStats
  ] = await Promise.all([
    User.countDocuments({ role: 'staff' }),
    User.countDocuments({ role: 'staff', isActive: true }),
    Attendance.countDocuments({
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    }),
    Leave.countDocuments({ status: 'pending' }),
    Disciplinary.countDocuments({ status: { $in: ['open', 'under-review'] } }),
    getAttendanceTrend(startDate),
    getLeaveTrend(startDate),
    getDepartmentStatistics()
  ]);

  return {
    period,
    startDate,
    endDate: new Date(),
    summary: {
      totalStaff,
      activeStaff,
      todayAttendance,
      pendingLeaves,
      openDisciplinary,
      attendanceRate: await getOverallAttendanceRate(startDate)
    },
    trends: {
      attendance: attendanceTrend,
      leaves: leaveTrend
    },
    departmentStats,
    generatedAt: new Date()
  };
}

async function getAttendanceTrend(startDate) {
  const trend = [];
  const currentDate = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const attendance = await Attendance.countDocuments({
      date: { $gte: startOfDay, $lt: endOfDay },
      status: 'present'
    });
    
    const totalStaff = await User.countDocuments({ role: 'staff', isActive: true });
    const rate = totalStaff > 0 ? (attendance / totalStaff) * 100 : 0;
    
    trend.push({
      date: startOfDay.toLocaleDateString(),
      attendance,
      rate: rate.toFixed(2)
    });
  }
  
  return trend;
}

async function getLeaveTrend(startDate) {
  const trend = [];
  const months = 6;
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    
    const leaves = await Leave.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });
    
    trend.push({
      month: date.toLocaleString('default', { month: 'short' }),
      year,
      leaves
    });
  }
  
  return trend;
}

async function getDepartmentStatistics() {
  const departments = await getDistinctDepartments();
  const stats = [];
  
  for (const dept of departments) {
    const staffCount = await User.countDocuments({ 
      department: dept, 
      role: 'staff', 
      isActive: true 
    });
    
    const attendance = await Attendance.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'staff',
          foreignField: '_id',
          as: 'staffInfo'
        }
      },
      { $unwind: '$staffInfo' },
      { $match: { 'staffInfo.department': dept } },
      { $match: { status: 'present' } },
      { $count: 'presentCount' }
    ]);
    
    const presentCount = attendance[0]?.presentCount || 0;
    const attendanceRate = staffCount > 0 ? (presentCount / (staffCount * 20)) * 100 : 0; // Assuming 20 working days
    
    stats.push({
      department: dept,
      staffCount,
      attendanceRate: attendanceRate.toFixed(2),
      leaves: await Leave.countDocuments({ 
        'staff.department': dept,
        status: 'approved',
        startDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
      })
    });
  }
  
  return stats;
}

async function getOverallAttendanceRate(startDate) {
  const totalAttendanceDays = await Attendance.countDocuments({
    date: { $gte: startDate },
    status: 'present'
  });
  
  const totalStaff = await User.countDocuments({ role: 'staff', isActive: true });
  const workingDays = calculateWorkingDays(startDate, new Date());
  
  const expectedAttendance = totalStaff * workingDays;
  return expectedAttendance > 0 ? ((totalAttendanceDays / expectedAttendance) * 100).toFixed(2) : 0;
}

function calculateWorkingDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Skip weekends
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

async function getDistinctDepartments() {
  const departments = await User.distinct('department', { 
    role: 'staff', 
    isActive: true,
    department: { $ne: null, $ne: '' }
  });
  return departments.sort();
}

async function generateStaffReportData(staffId, period) {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'quarter':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
  }

  const [attendance, leaves, disciplinary, qualifications] = await Promise.all([
    Attendance.find({
      staff: staffId,
      date: { $gte: startDate }
    }).sort({ date: -1 }),
    Leave.find({
      staff: staffId,
      createdAt: { $gte: startDate }
    }).sort({ startDate: -1 }),
    Disciplinary.find({
      staff: staffId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 }),
    User.findById(staffId).select('qualifications')
  ]);

  return {
    period: { startDate, endDate: new Date() },
    attendance: {
      records: attendance,
      summary: calculateAttendanceSummaryForStaff(attendance),
      totalDays: attendance.length
    },
    leaves: {
      records: leaves,
      summary: calculateLeaveSummaryForStaff(leaves),
      totalLeaves: leaves.length
    },
    disciplinary: {
      records: disciplinary,
      summary: calculateDisciplinarySummaryForStaff(disciplinary),
      totalCases: disciplinary.length
    },
    qualifications: qualifications?.qualifications || []
  };
}

function calculateAttendanceSummaryForStaff(attendance) {
  const summary = {
    present: 0,
    absent: 0,
    leave: 0,
    offDuty: 0,
    late: 0
  };

  attendance.forEach(record => {
    summary[record.status]++;
  });

  return summary;
}

function calculateLeaveSummaryForStaff(leaves) {
  const summary = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
    pending: leaves.filter(l => l.status === 'pending').length,
    byType: {}
  };

  leaves.forEach(leave => {
    if (!summary.byType[leave.leaveType]) {
      summary.byType[leave.leaveType] = {
        count: 0,
        days: 0
      };
    }
    summary.byType[leave.leaveType].count++;
    summary.byType[leave.leaveType].days += leave.numberOfDays;
  });

  return summary;
}

function calculateDisciplinarySummaryForStaff(disciplinary) {
  const summary = {
    total: disciplinary.length,
    open: disciplinary.filter(d => d.status === 'open').length,
    resolved: disciplinary.filter(d => d.status === 'resolved').length,
    appealed: disciplinary.filter(d => d.status === 'appealed').length,
    byInfractionType: {}
  };

  disciplinary.forEach(caseItem => {
    if (!summary.byInfractionType[caseItem.infractionType]) {
      summary.byInfractionType[caseItem.infractionType] = 0;
    }
    summary.byInfractionType[caseItem.infractionType]++;
  });

  return summary;
}

async function generateDepartmentReport(department) {
  const staff = await User.find({ 
    department, 
    role: 'staff', 
    isActive: true 
  }).select('firstName lastName employeeId position dateOfJoining');

  const attendance = await Attendance.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'staff',
        foreignField: '_id',
        as: 'staffInfo'
      }
    },
    { $unwind: '$staffInfo' },
    { $match: { 'staffInfo.department': department } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const leaves = await Leave.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'staff',
        foreignField: '_id',
        as: 'staffInfo'
      }
    },
    { $unwind: '$staffInfo' },
    { $match: { 'staffInfo.department': department } },
    {
      $group: {
        _id: { type: '$leaveType', status: '$status' },
        count: { $sum: 1 },
        totalDays: { $sum: '$numberOfDays' }
      }
    }
  ]);

  const disciplinary = await Disciplinary.countDocuments({
    'staff.department': department,
    createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
  });

  return {
    department,
    staffCount: staff.length,
    attendance: attendance.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    leaves: leaves.reduce((acc, curr) => {
      if (!acc[curr._id.type]) {
        acc[curr._id.type] = { approved: 0, pending: 0, totalDays: 0 };
      }
      acc[curr._id.type][curr._id.status] = curr.count;
      acc[curr._id.type].totalDays += curr.totalDays;
      return acc;
    }, {}),
    disciplinaryCases: disciplinary,
    reportDate: new Date()
  };
}

// PDF Generation Functions

async function generateAttendancePDF(res, attendance, summary, startDate, endDate) {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `attendance_report_${Date.now()}.pdf`;
  const filepath = path.join(reportsDir, filename);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  // Header
  doc.fontSize(20).text('MAKONGENI WARD STAFF MANAGEMENT', { align: 'center' });
  doc.fontSize(16).text('Attendance Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  // Summary
  doc.fontSize(14).text('Summary Statistics', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Total Records: ${summary.totalDays}`);
  doc.text(`Present: ${summary.present} (${((summary.present/summary.totalDays)*100).toFixed(2)}%)`);
  doc.text(`Absent: ${summary.absent} (${((summary.absent/summary.totalDays)*100).toFixed(2)}%)`);
  doc.text(`Leave: ${summary.leave} (${((summary.leave/summary.totalDays)*100).toFixed(2)}%)`);
  doc.text(`Average Attendance: ${summary.averageAttendance}%`);
  doc.moveDown();

  // Detailed Records
  if (attendance.length > 0) {
    doc.addPage();
    doc.fontSize(14).text('Detailed Attendance Records', { underline: true });
    doc.moveDown(0.5);

    attendance.forEach((record, index) => {
      if (index > 0 && index % 25 === 0) {
        doc.addPage();
      }
      
      doc.fontSize(10)
        .text(`${index + 1}. ${record.staff.firstName} ${record.staff.lastName}`, { continued: true })
        .text(` - ${new Date(record.date).toLocaleDateString()}`, { continued: true })
        .text(` - ${record.status}`, { continued: true })
        .text(` - ${record.remarks || 'No remarks'}`, { align: 'right' });
    });
  }

  doc.end();
}

async function generateAttendanceExcel(res, attendance, summary, startDate, endDate) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');

  // Add headers
  worksheet.columns = [
    { header: 'Employee ID', key: 'employeeId', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Check In', key: 'checkIn', width: 15 },
    { header: 'Check Out', key: 'checkOut', width: 15 },
    { header: 'Hours Worked', key: 'hours', width: 15 },
    { header: 'Remarks', key: 'remarks', width: 30 }
  ];

  // Add data
  attendance.forEach(record => {
    worksheet.addRow({
      employeeId: record.staff.employeeId,
      name: `${record.staff.firstName} ${record.staff.lastName}`,
      department: record.staff.department,
      date: new Date(record.date).toLocaleDateString(),
      status: record.status,
      checkIn: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : 'N/A',
      checkOut: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'N/A',
      hours: record.hoursWorked || 'N/A',
      remarks: record.remarks || ''
    });
  });

  // Add summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 20 }
  ];

  summarySheet.addRow({ metric: 'Total Records', value: summary.totalDays });
  summarySheet.addRow({ metric: 'Present Days', value: summary.present });
  summarySheet.addRow({ metric: 'Absent Days', value: summary.absent });
  summarySheet.addRow({ metric: 'Leave Days', value: summary.leave });
  summarySheet.addRow({ metric: 'Average Attendance', value: `${summary.averageAttendance}%` });

  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${Date.now()}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
}

// Similar functions for other report types (Leave, Disciplinary, etc.)
// Due to space constraints, I'll provide a generic structure for one more:

async function generateLeavePDF(res, leaves, stats, filters) {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `leave_report_${Date.now()}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  // Header
  doc.fontSize(20).text('MAKONGENI WARD STAFF MANAGEMENT', { align: 'center' });
  doc.fontSize(16).text('Leave Report', { align: 'center' });
  doc.moveDown();
  
  // Filters
  if (filters.startDate && filters.endDate) {
    doc.fontSize(12).text(`Period: ${new Date(filters.startDate).toLocaleDateString()} to ${new Date(filters.endDate).toLocaleDateString()}`);
  }
  if (filters.leaveType) {
    doc.text(`Leave Type: ${filters.leaveType}`);
  }
  if (filters.status) {
    doc.text(`Status: ${filters.status}`);
  }
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  // Statistics
  doc.fontSize(14).text('Statistics', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Total Leaves: ${stats.total}`);
  doc.text(`Approved: ${stats.approved} (${stats.approvalRate}%)`);
  doc.text(`Rejected: ${stats.rejected}`);
  doc.text(`Pending: ${stats.pending}`);
  doc.text(`Cancelled: ${stats.cancelled}`);
  doc.moveDown();

  // By type
  doc.fontSize(12).text('Breakdown by Leave Type:');
  Object.entries(stats.byType).forEach(([type, data]) => {
    doc.text(`  ${type}: ${data.total} leaves (${data.approved} approved, ${data.days} total days)`);
  });

  doc.end();
}

// Add similar functions for other report types...

module.exports = router;
