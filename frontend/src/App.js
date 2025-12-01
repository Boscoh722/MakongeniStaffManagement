import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import store from './store/store';

// Layout Components
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';

// Admin Pages
import Dashboard from './pages/dashboard/Dashboard';
import StaffManagement from './pages/admin/StaffManagement';
import LeaveManagement from './pages/admin/LeaveManagement';
import AttendanceTracking from './pages/admin/AttendanceTracking';
import DisciplinaryManagement from './pages/admin/DisciplinaryManagement';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/Dashboard';
import StaffOverview from './pages/supervisor/StaffOverview';
import LeaveApproval from './pages/supervisor/LeaveApproval';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';
import Profile from './pages/staff/Profile';
import ApplyLeave from './pages/staff/ApplyLeave';
import MyAttendance from './pages/staff/MyAttendance';

// Clerk Pages
import ClerkDashboard from './pages/clerk/Dashboard';
import MarkAttendance from './pages/clerk/MarkAttendance';

// Shared Components
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="leaves" element={<LeaveManagement />} />
                <Route path="attendance" element={<AttendanceTracking />} />
                <Route path="disciplinary" element={<DisciplinaryManagement />} />
              </Route>
            </Route>

            {/* Supervisor Routes */}
            <Route path="/supervisor" element={<PrivateRoute allowedRoles={['supervisor']} />}>
              <Route element={<Layout />}>
                <Route index element={<SupervisorDashboard />} />
                <Route path="staff" element={<StaffOverview />} />
                <Route path="leaves" element={<LeaveApproval />} />
              </Route>
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={<PrivateRoute allowedRoles={['staff']} />}>
              <Route element={<Layout />}>
                <Route index element={<StaffDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="apply-leave" element={<ApplyLeave />} />
                <Route path="attendance" element={<MyAttendance />} />
              </Route>
            </Route>

            {/* Clerk Routes */}
            <Route path="/clerk" element={<PrivateRoute allowedRoles={['clerk']} />}>
              <Route element={<Layout />}>
                <Route index element={<ClerkDashboard />} />
                <Route path="attendance" element={<MarkAttendance />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
