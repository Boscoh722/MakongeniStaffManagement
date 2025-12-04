import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const SendNotices = () => {
  const { user } = useSelector((state) => state.auth);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    type: 'general',
    priority: 'normal'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getStaff();
      
      // Filter: Supervisor oversees all non-admin staff
      const allStaff = response.data.filter(employee => 
        employee.role !== 'admin' && employee.role !== 'supervisor'
      );
      
      setStaff(allStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedStaff.length === staff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(staff.map(s => s._id));
    }
  };

  const handleSelectStaff = (staffId) => {
    setSelectedStaff(prev => {
      if (prev.includes(staffId)) {
        return prev.filter(id => id !== staffId);
      } else {
        return [...prev, staffId];
      }
    });
  };

  const handleSendNotice = async () => {
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    if (selectedStaff.length === 0) {
      toast.error('Please select at least one staff member');
      return;
    }

    try {
      setSending(true);
      
      // Prepare notice data
      const noticeData = {
        subject: formData.subject,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        recipients: selectedStaff,
        senderId: user._id,
        senderName: `${user.firstName} ${user.lastName}`
      };

      // In a real app, you would call an API endpoint
      // For now, simulate sending
      console.log('Sending notice:', noticeData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Notice sent to ${selectedStaff.length} staff members`);
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
        type: 'general',
        priority: 'normal'
      });
      setSelectedStaff([]);
      
    } catch (error) {
      console.error('Error sending notice:', error);
      toast.error('Failed to send notice');
    } finally {
      setSending(false);
    }
  };

  const getSelectedStaffNames = () => {
    return selectedStaff.map(id => {
      const staffMember = staff.find(s => s._id === id);
      return staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : '';
    }).filter(name => name);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-green-600 to-dark-green-800 rounded-lg shadow p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Send Notices</h1>
            <p className="mt-2 opacity-90">
              Send announcements, reminders, and important information to your team
            </p>
          </div>
          <DocumentTextIcon className="h-10 w-10 opacity-80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Staff Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Recipients
            </h3>
            
            <div className="mb-4">
              <button
                onClick={handleSelectAll}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                {selectedStaff.length === staff.length ? 'Deselect All' : 'Select All'}
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                {selectedStaff.length} of {staff.length} selected
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-green-600"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {staff.map(employee => (
                  <div
                    key={employee._id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedStaff.includes(employee._id)
                        ? 'border-dark-green-500 bg-dark-green-50 dark:bg-dark-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                    onClick={() => handleSelectStaff(employee._id)}
                  >
                    <div className="flex items-center">
                      <div className={`h-4 w-4 rounded border mr-3 flex items-center justify-center ${
                        selectedStaff.includes(employee._id)
                          ? 'bg-dark-green-600 border-dark-green-600'
                          : 'border-gray-400'
                      }`}>
                        {selectedStaff.includes(employee._id) && (
                          <CheckCircleIcon className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {employee.position} • {employee.department?.name || employee.department}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notice Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notice Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Compose Notice
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notice Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  >
                    <option value="general">General Announcement</option>
                    <option value="reminder">Reminder</option>
                    <option value="urgent">Urgent Notice</option>
                    <option value="meeting">Meeting Notice</option>
                    <option value="policy">Policy Update</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter notice subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your notice message here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {getSelectedStaffNames().length > 0 && (
                    <div>
                      <p className="font-medium">Recipients:</p>
                      <p className="truncate">{getSelectedStaffNames().join(', ')}</p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSendNotice}
                  disabled={sending || selectedStaff.length === 0}
                  className={`px-6 py-3 rounded-lg font-medium text-white flex items-center ${
                    sending || selectedStaff.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-dark-green-600 hover:bg-dark-green-700'
                  }`}
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                      Send Notice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Meeting Reminder',
                  template: 'Team meeting tomorrow at 10 AM in the conference room.'
                },
                {
                  title: 'Deadline Reminder',
                  template: 'Project deadline approaching. Please submit your reports by Friday.'
                },
                {
                  title: 'Policy Update',
                  template: 'Important policy update regarding attendance. Please review the new guidelines.'
                },
                {
                  title: 'Welcome Notice',
                  template: 'Welcome to the team! Please complete your onboarding documents.'
                }
              ].map((template, index) => (
                <button
                  key={index}
                  onClick={() => setFormData({
                    ...formData,
                    subject: template.title,
                    message: template.template
                  })}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 text-left"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{template.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                    {template.template}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNotices;