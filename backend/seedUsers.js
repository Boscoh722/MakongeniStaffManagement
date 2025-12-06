const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const departments = {
  ENVIRONMENT: '69346433348fb462a797adf5',
  STORES: '69346433348fb462a797adf6',
  LOGISTICS: '69346433348fb462a797adf7',
  WELLNESS_AND_PERSONAL_GROWTH: '69346434348fb462a797adf8',
  PUBLIC_RELATIONS: '69346434348fb462a797adf9',
  WELFARE: '69346434348fb462a797adfa',
};

const defaultLeave = {
  annual: { total: 28, taken: 0, remaining: 28, pending: 0 },
  maternity: { total: 90, taken: 0, remaining: 90, pending: 0 },
  paternity: { total: 14, taken: 0, remaining: 14, pending: 0 },
  sick: { total: 30, taken: 0, remaining: 30, pending: 0 },
  compassionate: { total: 7, taken: 0, remaining: 7, pending: 0 },
  study: { total: 30, taken: 0, remaining: 30, pending: 0 },
};

const usersData = [
  { employeeId: '20230000000', firstName: 'Makongeni', lastName: 'Admin', email: 'admin@makongeni.com', password: 'admin16494344', role: 'admin', department: departments.ENVIRONMENT, position: 'System Administrator' },
  { employeeId: '20230236536', firstName: 'Boscoh', lastName: 'Otieno', email: 'boscobrilli8@gmail.com', password: '0715640443', role: 'supervisor', department: departments.ENVIRONMENT, position: 'Environment officer' },
  { employeeId: '20230218350', firstName: 'Felix', lastName: 'Peter', email: 'felix123@gmail.com', password: '0703468256', role: 'clerk', department: departments.ENVIRONMENT, position: 'clerk' },
  { employeeId: '20230255849', firstName: 'Agnes', lastName: 'Waruguru', email: 'agnes123@gmail.com', password: 'agnes123', role: 'staff', department: departments.ENVIRONMENT, position: 'support staff' },

];

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany({});

    const createdUsers = [];

    for (const u of usersData) {
      const user = new User({
        ...u,
        password: u.password
      });
      await user.save();
    }


    const admin = createdUsers.find(u => u.role === 'admin');

    for (const user of createdUsers) {
      if (user.role !== 'admin') {
        user.supervisor = admin._id;
        await user.save();
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedUsers();

