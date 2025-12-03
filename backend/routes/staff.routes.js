const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all staff route - Update to populate department
router.get('/', auth, authorize('admin', 'supervisor', 'clerk'), async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff', isActive: true })
      .select('-password')
      .populate('supervisor', 'firstName lastName')
      .populate('department', 'name code') // Add this line to populate department
      .sort({ firstName: 1 });
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff profile
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('supervisor', 'firstName lastName')
      .populate('qualifications');
    
    if (!user) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Check permissions
    if (req.user.role === 'staff' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update staff profile
router.put('/profile/:id', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const updates = req.body;
    
    if (req.file) {
      updates.profileImage = `/uploads/${req.file.filename}`;
    }

    // Staff can only update their own profile
    if (req.user.role === 'staff' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add qualification
router.post('/qualifications/:id', auth, upload.single('certificate'), async (req, res) => {
  try {
    const { qualification, institution, yearObtained } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    const qual = {
      qualification,
      institution,
      yearObtained,
      certificateFile: req.file ? `/uploads/${req.file.filename}` : null
    };

    user.qualifications.push(qual);
    await user.save();

    res.status(201).json(user.qualifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
