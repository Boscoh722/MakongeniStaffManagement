import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import toast from 'react-hot-toast';

const MarkAttendance = () => {
  const { user } = useSelector((state) => state.auth);
  const [staff, setStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getStaff();
      const staffData = response.data || [];
      
      // Initialize attendance data for each staff member
      const initialAttendance = {};
      
      staffData.forEach(employee => {
        initialAttendance[employee._id] = {
          status: 'present', // Default status
          remarks: '',
          staffId: employee._id, // Make sure this is included
          employeeName: `${employee.firstName} ${employee.lastName}`,
          department: employee.department?.name || employee.department || 'Unknown'
        };
      });
      
      setStaff(staffData);
      setAttendanceData(initialAttendance);
      
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      setSaving(true);
      
      // Prepare data for bulk endpoint
      const attendanceArray = Object.values(attendanceData).map(data => ({
        staffId: data.staffId,
        status: data.status,
        remarks: data.remarks || ''
      }));

       console.log('Sending bulk attendance data for', attendanceArray.length, 'staff members');

      // Use bulk endpoint for marking multiple staff at once
      const response = await staffService.markAttendance({
        date: selectedDate.toISOString().split('T')[0],
        attendanceData: attendanceArray
      });
      
      console.log('Response:', response);
      toast.success(`Attendance marked for ${attendanceArray.length} staff members`);
      
      // Reset remarks after saving
      const resetAttendance = { ...attendanceData };
      Object.keys(resetAttendance).forEach(key => {
        resetAttendance[key].remarks = '';
      });
      setAttendanceData(resetAttendance);
      
    } catch (error) {
    console.error('Mark attendance error:', error);
    console.error('Error details:', error.response?.data);
      
      // More specific error messages
      if (error.response?.data?.error?.includes('Missing required fields')) {
      toast.error('Error: Some staff members are missing required data. Please check all entries.');
    } else {
      toast.error(error.response?.data?.error || 'Failed to mark attendance');
    }
  } finally {
    setSaving(false);
  }
};

  const updateAttendance = (staffId, field, value) => {
    setAttendanceData(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: value
      }
    }));
  };

  const handleMarkAll = (status) => {
    const updatedData = { ...attendanceData };
    Object.keys(updatedData).forEach(staffId => {
      updatedData[staffId].status = status;
    });
    setAttendanceData(updatedData);
    toast.success(`All staff marked as ${status}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Mark attendance for all staff members
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              max={new Date().toISOString().split('T')[0]} // Can't mark future dates
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleMarkAll('present')}
              className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-green-600"></div>
        </div>
      ) : (
        <>
          {/* Attendance Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Marked
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {staff.map((employee) => (
                    <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {employee.profileImage ? (
                              <img className="h-10 w-10 rounded-full" src={employee.profileImage} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                                  {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {employee.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {employee.department?.name || employee.department || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={attendanceData[employee._id]?.status || 'present'}
                          onChange={(e) => updateAttendance(employee._id, 'status', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white w-full"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="leave">On Leave</option>
                          <option value="off-duty">Off Duty</option>
                          <option value="sick">Sick Leave</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={attendanceData[employee._id]?.remarks || ''}
                          onChange={(e) => updateAttendance(employee._id, 'remarks', e.target.value)}
                          placeholder="Add remarks..."
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white w-full"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {/* You could fetch and display last attendance date here */}
                        Not available
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={fetchStaff}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              disabled={saving}
            >
              Refresh List
            </button>
            <button
              onClick={handleMarkAttendance}
              disabled={saving}
              className={`px-6 py-2 rounded-lg text-sm font-medium text-white flex items-center ${
                saving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-dark-green-600 hover:bg-dark-green-700'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Attendance'
              )}
            </button>
          </div>

          {/* Stats Summary */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.values(attendanceData).filter(a => a.status === 'present').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Present</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.values(attendanceData).filter(a => a.status === 'absent').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Absent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.values(attendanceData).filter(a => a.status === 'late').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Late</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.values(attendanceData).filter(a => a.status === 'leave').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">On Leave</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MarkAttendance;