// seedUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path as needed
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const seedUsers = async () => {
  try {
    // Clear existing users (optional - be careful in production!)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users...');

    const users = [
      // ==================== ADMIN USERS ====================
      {
        employeeId: 'ADM001',
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'admin@makongeni.com',
        password: 'Admin@123', // Will be hashed automatically
        role: 'admin',
        department: 'Executive Management',
        position: 'System Administrator',
        phoneNumber: '+1234567890',
        address: '123 Executive Blvd, Corporate City',
        profileImage: '',
        isActive: true,
        qualifications: [
          {
            qualification: 'Master of Business Administration',
            institution: 'Harvard Business School',
            yearObtained: 2015,
          },
          {
            qualification: 'Certified Information Systems Auditor',
            institution: 'ISACA',
            yearObtained: 2018,
          },
        ],
        leaveBalance: {
          annual: { total: 25, taken: 2, remaining: 23, pending: 0 },
          maternity: { total: 90, taken: 0, remaining: 90, pending: 0 },
          paternity: { total: 14, taken: 0, remaining: 14, pending: 0 },
          sick: { total: 30, taken: 1, remaining: 29, pending: 0 },
          compassionate: { total: 7, taken: 0, remaining: 7, pending: 0 },
          study: { total: 30, taken: 0, remaining: 30, pending: 0 },
        },
        dateOfJoining: new Date('2018-03-15'),
      },

      // ==================== SUPERVISOR USERS ====================
      {
        employeeId: 'SUP001',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.w@company.com',
        password: 'Supervisor@123',
        role: 'supervisor',
        department: 'Operations',
        position: 'Operations Supervisor',
        phoneNumber: '+1234567891',
        address: '456 Operations Ave, Metro City',
        profileImage: '',
        isActive: true,
        qualifications: [
          {
            qualification: 'Bachelor of Engineering',
            institution: 'Stanford University',
            yearObtained: 2016,
          },
          {
            qualification: 'Project Management Professional',
            institution: 'PMI',
            yearObtained: 2019,
          },
        ],
        leaveBalance: {
          annual: { total: 22, taken: 5, remaining: 17, pending: 2 },
          maternity: { total: 90, taken: 0, remaining: 90, pending: 0 },
          paternity: { total: 14, taken: 0, remaining: 14, pending: 0 },
          sick: { total: 30, taken: 3, remaining: 27, pending: 0 },
          compassionate: { total: 7, taken: 0, remaining: 7, pending: 0 },
          study: { total: 30, taken: 0, remaining: 30, pending: 0 },
        },
        dateOfJoining: new Date('2019-06-10'),
      },

      {
        employeeId: 'SUP002',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.c@company.com',
        password: 'Supervisor@123',
        role: 'supervisor',
        department: 'IT Department',
        position: 'IT Team Lead',
        phoneNumber: '+1234567892',
        address: '789 Tech Street, Silicon Valley',
        profileImage: '',
        isActive: true,
        supervisor: null, // Admin supervises supervisors
        qualifications: [
          {
            qualification: 'Master of Computer Science',
            institution: 'MIT',
            yearObtained: 2017,
          },
          {
            qualification: 'AWS Solutions Architect',
            institution: 'Amazon Web Services',
            yearObtained: 2020,
          },
        ],
        leaveBalance: {
          annual: { total: 22, taken: 8, remaining: 14, pending: 1 },
          maternity: { total: 90, taken: 0, remaining: 90, pending: 0 },
          paternity: { total: 14, taken: 0, remaining: 14, pending: 0 },
          sick: { total: 30, taken: 2, remaining: 28, pending: 0 },
          compassionate: { total: 7, taken: 1, remaining: 6, pending: 0 },
          study: { total: 30, taken: 10, remaining: 20, pending: 0 },
        },
        dateOfJoining: new Date('2020-01-20'),
      },

      // ==================== STAFF USERS ====================
      {
        employeeId: 'STF001',
        firstName: 'Jennifer',
        lastName: 'Davis',
        email: 'jennifer.d@company.com',
        password: 'Staff@123',
        role: 'staff',
        department: 'Operations',
        position: 'Operations Specialist',
        phoneNumber: '+1234567893',
        address: '321 Work Lane, Business District',
        profileImage: '',
        isActive: true,
        supervisor: null, // Will be set after supervisor creation
        qualifications: [
          {
            qualification: 'Bachelor of Business Administration',
            institution: 'University of Texas',
            yearObtained: 2019,
          },
        ],
        leaveBalance: {
          annual: { total: 21, taken: 10, remaining: 11, pending: 3 },
          maternity: { total: 90, taken: 0, remaining: 90, pending: 0 },
          paternity: { total: 14, taken: 0, remaining: 14, pending: 0 },
          sick: { total: 30, taken: 4, remaining: 26, pending: 1 },
          compassionate: { total: 7, taken: 0, remaining: 7, pending: 0 },
          study: { total: 30, taken: 0, remaining: 30, pending: 0 },
        },
        dateOfJoining: new Date('2021-03-15'),
      },

      {
        employeeId: 'STF002',
        firstName: 'Robert',
        lastName: 'Garcia',
        email: 'robert.g@company.com',
        password: 'Staff@123',
        role: 'staff',
        department: 'IT Department',
        position: 'Software Developer',
        phoneNumber: '+1234567894',
        address: '654 Code Road, Tech Park',
        profileImage: '',
        isActive: true,
        supervisor: null, // Will be set after supervisor creation
        qualifications: [
          {
            qualification: 'Bachelor of Computer Science',
            institution: 'UC Berkeley',
            yearObtained: 2020,
          },
          {
            qualification: 'React Developer Certification',
            institution: 'Meta',
            yearObtained: 2021,
          },
        ],
        leaveBalance: {
          annual: { total: 21, taken: 5, remaining: 16, pending: 0 },
          maternity: { total: 90, taken: 0, remaining: 90, pending: 0 },
          paternity: { total: 14, taken: 0, remaining: 14, pending: 0 },
          sick: { total: 30, taken: 2, remaining: 28, pending: 0 },
          compassionate: { total: 7, taken: 0, remaining: 7, pending: 0 },
          study: { total: 30, taken: 15, remaining: 15, pending: 0 },
        },
        dateOfJoining: new Date('2021-08-10'),
      },

      {
        employeeId: 'STF003',
        firstName: 'Lisa',
        lastName: 'Martinez',
        email: 'lisa.m@company.com',
        password: 'Staff@123',
        role: 'staff',
        department: 'Operations',
        position: 'Quality Assurance Analyst',
        phoneNumber: '+1234567895',
        address: '987 Quality Circle, Process Town',
        profileImage: '',
        isActive: true,
        supervisor: null, // Will be set after supervisor creation
        qualifications: [
          {
            qualification: 'Bachelor of Science in Quality Management',
            institution: 'Penn State University',
            yearObtained: 2020,
          },
        ],
        leaveBalance: {
          annual: { total: 21, taken: 7, remaining: 14, pending: 0 },
          maternity: { total: 90, taken: 0, remaining: 90, pending: 0 },
          paternity: { total: 14, taken: 0, remaining: 14, pending: 0 },
          sick: { total: 30, taken: 6, remaining: 24, pending: 0 },
          compassionate: { total: 7, taken: 3, remaining: 4, pending: 0 },
          study: { total: 30, taken: 0, remaining: 30, pending: 0 },
        },
        dateOfJoining: new Date('2022-01-15'),
      },

      // ==================== CLERK USERS ====================
      {
        employeeId: 'CLK001',
        firstName: 'Thomas',
        lastName: 'Wilson',
        email: 'thomas.w@company.com',
        password: 'Clerk@123',
        role: 'clerk',
        department: 'Administration',
        position: 'Administrative Clerk',
        phoneNumber: '+1234567896',
        address: '147 Admin Street, Office Park',
        profileImage: '',
        isActive: true,
        supervisor: null, // Will be set after supervisor creation
        qualifications: [
          {
            qualification: 'Diploma in Office Administration',
            institution: 'Community College',
            yearObtained: 2021,
          },
        ],
        leaveBalance: {
          annual: { total: 21, taken: 0, remaining: 21, pending: 0 },
          maternity: { total: 90, taken: 0, remaining: 90, pending: 0 },
          paternity: { total: 14, taken: 0, remaining: 14, pending: 0 },
          sick: { total: 30, taken: 1, remaining: 29, pending: 0 },
          compassionate: { total: 7, taken: 0, remaining: 7, pending: 0 },
          study: { total: 30, taken: 0, remaining: 30, pending: 0 },
        },
        dateOfJoining: new Date('2022-06-01'),
      },

      {
        employeeId: 'CLK002',
        firstName: 'Emily',
        lastName: 'Brown',
        email: 'emily.b@company.com',
        password: 'Clerk@123',
        role: 'clerk',
        department: 'Finance',
        position: 'Accounts Clerk',
        phoneNumber: '+1234567897',
        address: '258 Finance Road, Capital City',
        profileImage: '',
        isActive: true,
        supervisor: null, // Will be set after supervisor creation
        qualifications: [
          {
            qualification: 'Certificate in Bookkeeping',
            institution: 'Accounting Institute',
            yearObtained: 2022,
          },
        ],
        leaveBalance: {
          annual: { total: 21, taken: 3, remaining: 18, pending: 1 },
          maternity: { total: 90, taken: 0, remaining: 90, pending: 0 },
          paternity: { total: 14, taken: 0, remaining: 14, pending: 0 },
          sick: { total: 30, taken: 2, remaining: 28, pending: 0 },
          compassionate: { total: 7, taken: 0, remaining: 7, pending: 0 },
          study: { total: 30, taken: 0, remaining: 30, pending: 0 },
        },
        dateOfJoining: new Date('2023-02-15'),
      },

      {
        employeeId: 'CLK003',
        firstName: 'David',
        lastName: 'Taylor',
        email: 'david.t@company.com',
        password: 'Clerk@123',
        role: 'clerk',
        department: 'HR Department',
        position: 'HR Assistant',
        phoneNumber: '+1234567898',
        address: '369 HR Boulevard, Personnel City',
        profileImage: '',
        isActive: true,
        supervisor: null, // Will be set after supervisor creation
        qualifications: [
          {
            qualification: 'Diploma in Human Resources',
            institution: 'HR Academy',
            yearObtained: 2022,
          },
        ],
        leaveBalance: {
          annual: { total: 21, taken: 12, remaining: 9, pending: 0 },
          maternity: { total: 90, taken: 0, remaining: 90, pending: 0 },
          paternity: { total: 14, taken: 0, remaining: 14, pending: 0 },
          sick: { total: 30, taken: 5, remaining: 25, pending: 0 },
          compassionate: { total: 7, taken: 2, remaining: 5, pending: 0 },
          study: { total: 30, taken: 0, remaining: 30, pending: 0 },
        },
        dateOfJoining: new Date('2023-09-10'),
      },
    ];

    // First, create all users
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    // Now set up supervisor relationships
    const admin = createdUsers.find(u => u.role === 'admin');
    const supervisor1 = createdUsers.find(u => u.employeeId === 'SUP001');
    const supervisor2 = createdUsers.find(u => u.employeeId === 'SUP002');

    // Set admin as supervisor for supervisors
    supervisor1.supervisor = admin._id;
    supervisor2.supervisor = admin._id;
    await supervisor1.save();
    await supervisor2.save();

    // Set supervisors for staff and clerks
    const operationsStaff = createdUsers.filter(u => 
      u.department === 'Operations' && (u.role === 'staff' || u.role === 'clerk')
    );
    const itStaff = createdUsers.filter(u => 
      u.department === 'IT Department' && (u.role === 'staff' || u.role === 'clerk')
    );
    const adminClerks = createdUsers.filter(u => 
      u.department === 'Administration' && u.role === 'clerk'
    );
    const financeClerks = createdUsers.filter(u => 
      u.department === 'Finance' && u.role === 'clerk'
    );
    const hrClerks = createdUsers.filter(u => 
      u.department === 'HR Department' && u.role === 'clerk'
    );

    // Assign supervisors
    for (const staff of operationsStaff) {
      staff.supervisor = supervisor1._id;
      await staff.save();
    }

    for (const staff of itStaff) {
      staff.supervisor = supervisor2._id;
      await staff.save();
    }

    // For other departments, assign to appropriate supervisors
    for (const clerk of adminClerks) {
      clerk.supervisor = supervisor1._id;
      await clerk.save();
    }

    for (const clerk of financeClerks) {
      clerk.supervisor = supervisor1._id;
      await clerk.save();
    }

    for (const clerk of hrClerks) {
      clerk.supervisor = supervisor1._id;
      await clerk.save();
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👑 Admin: 1 user`);
    console.log(`   👨‍💼 Supervisors: 2 users`);
    console.log(`   👨‍💻 Staff: 3 users`);
    console.log(`   📝 Clerks: 3 users`);
    console.log('\n🔗 Supervisor relationships established.');
    console.log('\n🔐 Default passwords:');
    console.log('   Admin: Admin@123');
    console.log('   Supervisors: Supervisor@123');
    console.log('   Staff: Staff@123');
    console.log('   Clerks: Clerk@123');
    console.log('\n⚠️  IMPORTANT: Change these passwords in production!');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeder
seedUsers();
