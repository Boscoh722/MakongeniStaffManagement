const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Mark attendance (Clerk/Supervisor/Admin)
router.post('/mark', auth, authorize('clerk', 'supervisor', 'admin'), async (req, res) => {
  try {
    const { staffId, date, status, checkInTime, checkOutTime, remarks } = req.body;
    
    // Validate date is not in future
    const attendanceDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (attendanceDate > today) {
      return res.status(400).json({ error: 'Cannot mark attendance for future dates' });
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      staff: staffId,
      date: {
        $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
        $lt: new Date(attendanceDate.setHours(23, 59, 59, 999))
      }
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.checkInTime = checkInTime || existingAttendance.checkInTime;
      existingAttendance.checkOutTime = checkOutTime || existingAttendance.checkOutTime;
      existingAttendance.remarks = remarks;
      existingAttendance.markedBy = req.user._id;
      
      // Calculate hours worked
      if (checkInTime && checkOutTime) {
        const hours = (new Date(checkOutTime) - new Date(checkInTime)) / (1000 * 60 * 60);
        existingAttendance.hoursWorked = hours;
      }
      
      await existingAttendance.save();
      return res.json(existingAttendance);
    }

    // Create new attendance
    const attendance = new Attendance({
      staff: staffId,
      date: attendanceDate,
      status,
      checkInTime,
      checkOutTime,
      remarks,
      markedBy: req.user._id
    });

    // Calculate hours worked
    if (checkInTime && checkOutTime) {
      const hours = (new Date(checkOutTime) - new Date(checkInTime)) / (1000 * 60 * 60);
      attendance.hoursWorked = hours;
    }

    await attendance.save();
    
    // Add audit trail
    await createAuditLog(req.user, 'attendance', 'create', {
      staffId,
      date: attendanceDate,
      status
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bulk mark attendance
router.post('/bulk', auth, authorize('clerk', 'admin'), async (req, res) => {
  try {
    const { date, attendanceData } = req.body;
    const results = [];
    const errors = [];

    for (const data of attendanceData) {
      try {
        const attendance = await Attendance.findOneAndUpdate(
          {
            staff: data.staffId,
            date: new Date(date)
          },
          {
            status: data.status,
            remarks: data.remarks,
            markedBy: req.user._id
          },
          { upsert: true, new: true }
        );
        results.push(attendance);
      } catch (error) {
        errors.push({ staffId: data.staffId, error: error.message });
      }
    }

    res.json({
      success: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get attendance for staff (Staff)
router.get('/my-attendance', auth, authorize('staff'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { staff: req.user._id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.date = { $gte: thirtyDaysAgo };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('markedBy', 'firstName lastName');
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance for all staff (Admin/Supervisor/Clerk)
router.get('/', auth, authorize('admin', 'supervisor', 'clerk'), async (req, res) => {
  try {
    const { date, staffId, department } = req.query;
    
    const query = {};
    
    // Filter by date (default to today)
    const filterDate = date ? new Date(date) : new Date();
    filterDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    query.date = {
      $gte: filterDate,
      $lt: nextDay
    };

    // Filter by staff
    if (staffId) {
      query.staff = staffId;
    } else if (req.user.role === 'supervisor') {
      // Get staff under supervisor
      const supervisedStaff = await User.find({ 
        supervisor: req.user._id 
      }).select('_id');
      
      const staffIds = supervisedStaff.map(staff => staff._id);
      query.staff = { $in: staffIds };
    } else if (department) {
      // Filter by department
      const staffInDept = await User.find({ department }).select('_id');
      const staffIds = staffInDept.map(staff => staff._id);
      query.staff = { $in: staffIds };
    }

    const attendance = await Attendance.find(query)
      .populate('staff', 'firstName lastName employeeId department')
      .populate('markedBy', 'firstName lastName')
      .sort({ 'staff.firstName': 1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate, staffId } = req.query;
    
    const query = {};
    const staffIdToUse = staffId || (req.user.role === 'staff' ? req.user._id : null);
    
    if (staffIdToUse) {
      query.staff = staffIdToUse;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      query.date = {
        $gte: firstDay,
        $lte: lastDay
      };
    }

    const attendance = await Attendance.find(query);
    
    const stats = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      leave: attendance.filter(a => a.status === 'leave').length,
      offDuty: attendance.filter(a => a.status === 'off-duty').length,
      late: attendance.filter(a => a.status === 'late').length,
      averageHours: 0
    };

    // Calculate average hours worked
    const presentDays = attendance.filter(a => a.hoursWorked);
    if (presentDays.length > 0) {
      const totalHours = presentDays.reduce((sum, a) => sum + a.hoursWorked, 0);
      stats.averageHours = (totalHours / presentDays.length).toFixed(2);
    }

    // Calculate attendance percentage
    const workingDays = attendance.filter(a => 
      ['present', 'late', 'leave', 'off-duty'].includes(a.status)
    ).length;
    stats.attendancePercentage = attendance.length > 0 
      ? ((workingDays / attendance.length) * 100).toFixed(2) 
      : 0;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly summary
router.get('/monthly-summary', auth, async (req, res) => {
  try {
    const { year, month, staffId } = req.query;
    
    const query = { staff: staffId || req.user._id };
    
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);
    
    query.date = {
      $gte: startDate,
      $lte: endDate
    };

    const attendance = await Attendance.find(query)
      .sort({ date: 1 });

    // Create calendar view
    const daysInMonth = endDate.getDate();
    const calendar = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth - 1, day);
      const attendanceForDay = attendance.find(a => 
        a.date.getDate() === day
      );
      
      calendar.push({
        date,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        attendance: attendanceForDay || { status: 'not-marked' },
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }

    res.json({
      year: targetYear,
      month: targetMonth,
      calendar,
      summary: await calculateMonthlyStats(attendance)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update attendance (Admin/Clerk)
router.put('/:id', auth, authorize('admin', 'clerk'), async (req, res) => {
  try {
    const updates = req.body;
    updates.markedBy = req.user._id;
    
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('staff', 'firstName lastName employeeId');
    
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    // Add audit trail
    await createAuditLog(req.user, 'attendance', 'update', {
      attendanceId: attendance._id,
      staffId: attendance.staff._id,
      date: attendance.date
    });

    res.json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper functions
async function calculateMonthlyStats(attendance) {
  const stats = {
    workingDays: attendance.length,
    present: 0,
    absent: 0,
    leave: 0,
    offDuty: 0,
    late: 0,
    totalHours: 0
  };

  attendance.forEach(record => {
    stats[record.status]++;
    if (record.hoursWorked) {
      stats.totalHours += record.hoursWorked;
    }
  });

  return stats;
}

async function createAuditLog(user, action, entity, details) {
  const AuditLog = require('../models/AuditLog');
  
  const log = new AuditLog({
    user: user._id,
    action,
    entity,
    details,
    timestamp: new Date()
  });
  
  await log.save();
}

module.exports = router;