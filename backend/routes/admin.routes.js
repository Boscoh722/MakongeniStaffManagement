const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Disciplinary = require('../models/Disciplinary');
const EmailTemplate = require('../models/EmailTemplate');
const { sendEmail } = require('../utils/emailService');

// Dashboard statistics
router.get('/dashboard/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const [
      totalStaff,
      activeStaff,
      pendingLeaves,
      todayAttendance,
      openCases,
      recentActivities
    ] = await Promise.all([
      User.countDocuments({ role: 'staff' }),
      User.countDocuments({ role: 'staff', isActive: true }),
      Leave.countDocuments({ status: 'pending' }),
      Attendance.countDocuments({ 
        date: { 
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        }
      }),
      Disciplinary.countDocuments({ status: { $in: ['open', 'under-review'] } }),
      // Get recent activities from audit log
      getRecentActivities()
    ]);

    // Get attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendanceToday = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('staff', 'firstName lastName department');

    const attendanceStats = {
      present: attendanceToday.filter(a => a.status === 'present').length,
      absent: attendanceToday.filter(a => a.status === 'absent').length,
      leave: attendanceToday.filter(a => a.status === 'leave').length,
      offDuty: attendanceToday.filter(a => a.status === 'off-duty').length
    };

    // Get monthly trends
    const monthlyTrends = await getMonthlyTrends();

    res.json({
      totalStaff,
      activeStaff,
      pendingLeaves,
      todayAttendance,
      openCases,
      attendanceStats,
      monthlyTrends,
      recentActivities: recentActivities || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User management
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { role, department, isActive } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .populate('supervisor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update user
router.post('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const userData = req.body;
    
    // Generate employee ID if not provided
    if (!userData.employeeId && userData.role === 'staff') {
      userData.employeeId = await generateEmployeeId();
    }

    let user;
    if (userData._id) {
      // Update existing user
      user = await User.findByIdAndUpdate(
        userData._id,
        userData,
        { new: true, runValidators: true }
      ).select('-password');
    } else {
      // Create new user
      user = new User(userData);
      await user.save();
      user = user.toObject();
      delete user.password;
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deactivate/Activate user
router.put('/users/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Manage email templates
router.get('/email-templates', auth, authorize('admin'), async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ name: 1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/email-templates', auth, authorize('admin'), async (req, res) => {
  try {
    const template = new EmailTemplate(req.body);
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/email-templates/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Send bulk emails
router.post('/send-bulk-emails', auth, authorize('admin'), async (req, res) => {
  try {
    const { templateId, staffIds, additionalVariables } = req.body;
    
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const staff = await User.find({ _id: { $in: staffIds } });
    const results = [];

    for (const staffMember of staff) {
      try {
        const result = await sendEmail(
          staffMember.email,
          template.subject,
          template.body,
          []
        );
        results.push({
          staffId: staffMember._id,
          email: staffMember.email,
          success: result.success,
          message: result.success ? 'Email sent' : result.error
        });
      } catch (error) {
        results.push({
          staffId: staffMember._id,
          email: staffMember.email,
          success: false,
          message: error.message
        });
      }
    }

    res.json({
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// System settings
router.get('/settings', auth, authorize('admin'), async (req, res) => {
  try {
    const settings = {
      leavePolicies: {
        annual: 21,
        maternity: 90,
        paternity: 14,
        sick: 30,
        compassionate: 7,
        study: 30
      },
      workingHours: {
        start: '08:00',
        end: '17:00',
        breakDuration: 60
      },
      notificationSettings: {
        emailNotifications: true,
        leaveReminders: true,
        attendanceAlerts: true
      }
    };

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Backup database
router.post('/backup', auth, authorize('admin'), async (req, res) => {
  try {
    const backupData = {
      timestamp: new Date(),
      users: await User.find().select('-password'),
      attendance: await Attendance.find().limit(1000),
      leaves: await Leave.find().limit(1000),
      disciplinary: await Disciplinary.find().limit(1000)
    };

    // In production, you would save this to a file or cloud storage
    const backupId = `backup_${Date.now()}`;
    
    // Save backup metadata to database
    const Backup = require('../models/Backup');
    const backup = new Backup({
      backupId,
      data: backupData,
      createdBy: req.user._id
    });
    
    await backup.save();

    res.json({
      message: 'Backup created successfully',
      backupId,
      timestamp: backup.timestamp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
async function generateEmployeeId() {
  const year = new Date().getFullYear().toString().slice(-2);
  const lastStaff = await User.findOne({ role: 'staff' })
    .sort({ employeeId: -1 });
  
  let sequence = 1;
  if (lastStaff && lastStaff.employeeId) {
    const lastSequence = parseInt(lastStaff.employeeId.slice(-3));
    sequence = lastSequence + 1;
  }
  
  return `EMP${year}${sequence.toString().padStart(3, '0')}`;
}

async function getMonthlyTrends() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const trends = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const [attendanceCount, leaveCount, disciplinaryCount] = await Promise.all([
      Attendance.countDocuments({
        date: { $gte: startDate, $lte: endDate }
      }),
      Leave.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      Disciplinary.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      })
    ]);
    
    trends.push({
      month: date.toLocaleString('default', { month: 'short' }),
      year,
      attendance: attendanceCount,
      leaves: leaveCount,
      disciplinary: disciplinaryCount
    });
  }
  
  return trends;
}

async function getRecentActivities() {
  try {
    const AuditLog = require('../models/AuditLog');
    return await AuditLog.find()
      .populate('user', 'firstName lastName role')
      .sort({ timestamp: -1 })
      .limit(10);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

module.exports = router;