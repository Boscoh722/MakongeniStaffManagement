import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  BellIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon
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

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-gradient-to-r from-scarlet-100 to-scarlet-200 text-scarlet-800 dark:from-scarlet-900/50 dark:to-scarlet-800/50 dark:text-scarlet-300';
      case 'high': return 'bg-gradient-to-r from-mustard-100 to-mustard-200 text-mustard-800 dark:from-mustard-900/50 dark:to-mustard-800/50 dark:text-mustard-300';
      default: return 'bg-gradient-to-r from-royal-100 to-royal-200 text-royal-800 dark:from-royal-900/50 dark:to-royal-800/50 dark:text-royal-300';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'urgent': return <ExclamationCircleIcon className="h-4 w-4" />;
      case 'reminder': return <ClockIcon className="h-4 w-4" />;
      case 'meeting': return <UserGroupIcon className="h-4 w-4" />;
      default: return <BellIcon className="h-4 w-4" />;
    }
  };

  const handleRefresh = async () => {
    await fetchStaff();
    toast.success('Staff list refreshed');
  };

  const handleUseTemplate = (template) => {
    setFormData({
      ...formData,
      subject: template.title,
      message: template.template,
      type: template.type || 'general',
      priority: template.priority || 'normal'
    });
    toast.success(`Template "${template.title}" applied`);
  };

  const quickTemplates = [
    {
      title: 'Meeting Reminder',
      template: 'Team meeting tomorrow at 10 AM in the conference room. Please bring your progress reports.',
      type: 'meeting',
      priority: 'normal'
    },
    {
      title: 'Deadline Reminder',
      template: 'Project deadline approaching. Please submit your reports by Friday EOD.',
      type: 'reminder',
      priority: 'high'
    },
    {
      title: 'Policy Update',
      template: 'Important policy update regarding attendance. Please review the new guidelines in the staff portal.',
      type: 'policy',
      priority: 'normal'
    },
    {
      title: 'Urgent Task',
      template: 'URGENT: Please complete the assigned tasks by today. Contact supervisor if any issues.',
      type: 'urgent',
      priority: 'urgent'
    }
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-royal-50 via-mustard-50 to-scarlet-50 dark:from-neutral-900 dark:via-royal-900 dark:to-scarlet-900 min-h-screen font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-mustard-500 via-scarlet-500 to-royal-500 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Send Notices</h1>
            <p className="mt-2 opacity-90">
              Send announcements, reminders, and important information to your team
            </p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-2" />
                {staff.length} team members
              </span>
              <span className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Send notices to your entire team
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            <DocumentTextIcon className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Staff Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-mustard-100 dark:border-mustard-900/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Select Recipients
              </h3>
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                selectedStaff.length > 0 
                  ? 'bg-gradient-to-r from-mustard-100 to-mustard-200 text-mustard-800 dark:from-mustard-900/50 dark:to-mustard-800/50 dark:text-mustard-300'
                  : 'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-800 dark:from-neutral-900/50 dark:to-neutral-800/50 dark:text-neutral-300'
              }`}>
                {selectedStaff.length} selected
              </span>
            </div>
            
            <div className="mb-6">
              <button
                onClick={handleSelectAll}
                className="w-full px-4 py-3 bg-gradient-to-r from-royal-50 to-royal-100/50 dark:from-royal-900/20 dark:to-royal-900/10 text-royal-700 dark:text-royal-300 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center border border-royal-200 dark:border-royal-800"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                {selectedStaff.length === staff.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-mustard-600 mb-4"></div>
                <p className="text-neutral-600 dark:text-neutral-400">Loading team members...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {staff.map(employee => (
                  <div
                    key={employee._id}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedStaff.includes(employee._id)
                        ? 'border-mustard-500 bg-gradient-to-r from-mustard-50 to-mustard-100/50 dark:from-mustard-900/20 dark:to-mustard-900/10 shadow-md'
                        : 'border-mustard-200 dark:border-mustard-800 hover:bg-gradient-to-r from-royal-50 to-royal-100/50 dark:hover:from-royal-900/10 dark:hover:to-royal-900/5 hover:border-royal-300 dark:hover:border-royal-700'
                    }`}
                    onClick={() => handleSelectStaff(employee._id)}
                  >
                    <div className="flex items-center">
                      <div className={`h-5 w-5 rounded-lg border mr-3 flex items-center justify-center transition-all duration-200 ${
                        selectedStaff.includes(employee._id)
                          ? 'bg-gradient-to-r from-mustard-500 to-mustard-600 border-mustard-600'
                          : 'border-mustard-400 dark:border-mustard-600'
                      }`}>
                        {selectedStaff.includes(employee._id) && (
                          <CheckCircleIcon className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-white truncate">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm text-royal-600 dark:text-royal-400 truncate">
                            {employee.position}
                          </p>
                          <span className="text-xs text-neutral-500">•</span>
                          <p className="text-xs text-neutral-500 dark:text-neutral-500 truncate">
                            {employee.department?.name || employee.department}
                          </p>
                        </div>
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
          <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-mustard-100 dark:border-mustard-900/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Compose Notice
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1.5 text-xs rounded-full font-medium ${getPriorityColor(formData.priority)} flex items-center`}>
                  {getTypeIcon(formData.type)}
                  <span className="ml-1.5">{formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority</span>
                </span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Notice Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-mustard-200 dark:border-mustard-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500 focus:border-transparent bg-white/70 dark:bg-neutral-900/70 text-neutral-900 dark:text-white transition-all duration-200 hover:border-mustard-300 dark:hover:border-mustard-700"
                  >
                    <option value="general">General Announcement</option>
                    <option value="reminder">Reminder</option>
                    <option value="urgent">Urgent Notice</option>
                    <option value="meeting">Meeting Notice</option>
                    <option value="policy">Policy Update</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 border border-mustard-200 dark:border-mustard-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500 focus:border-transparent bg-white/70 dark:bg-neutral-900/70 text-neutral-900 dark:text-white transition-all duration-200 hover:border-mustard-300 dark:hover:border-mustard-700"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter notice subject"
                  className="w-full px-4 py-2.5 border border-mustard-200 dark:border-mustard-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500 focus:border-transparent bg-white/70 dark:bg-neutral-900/70 text-neutral-900 dark:text-white placeholder-royal-400 dark:placeholder-royal-500 transition-all duration-200 hover:border-mustard-300 dark:hover:border-mustard-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Message Content
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your notice message here..."
                  rows={8}
                  className="w-full px-4 py-3 border border-mustard-200 dark:border-mustard-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-mustard-500 focus:border-transparent bg-white/70 dark:bg-neutral-900/70 text-neutral-900 dark:text-white placeholder-royal-400 dark:placeholder-royal-500 transition-all duration-200 hover:border-mustard-300 dark:hover:border-mustard-700"
                />
                <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                  Character count: {formData.message.length}
                </div>
              </div>

              <div className="pt-6 border-t border-mustard-100 dark:border-mustard-900/30">
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    {selectedStaff.length > 0 && (
                      <div className="bg-gradient-to-r from-mustard-50 to-mustard-100/50 dark:from-mustard-900/20 dark:to-mustard-900/10 p-3 rounded-xl border border-mustard-200 dark:border-mustard-800">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                          Recipients ({selectedStaff.length})
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                          {getSelectedStaffNames().slice(0, 3).join(', ')}
                          {getSelectedStaffNames().length > 3 && ` and ${getSelectedStaffNames().length - 3} more...`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSendNotice}
                    disabled={sending || selectedStaff.length === 0}
                    className={`ml-4 px-6 py-3 rounded-xl font-medium text-white flex items-center shadow-lg hover:shadow-xl transition-all duration-200 ${
                      sending || selectedStaff.length === 0
                        ? 'bg-gradient-to-r from-neutral-400 to-neutral-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-royal-500 to-royal-600 hover:from-royal-600 hover:to-royal-700'
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
          </div>

          {/* Quick Templates */}
          <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-mustard-100 dark:border-mustard-900/30">
            <div className="flex items-center mb-4">
              <DocumentDuplicateIcon className="h-5 w-5 text-mustard-500 mr-2" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Quick Templates
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleUseTemplate(template)}
                  className="p-4 border border-mustard-200 dark:border-mustard-800 rounded-xl hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white/50 to-white/30 dark:from-neutral-900/30 dark:to-neutral-800/30 hover:scale-[1.02] text-left"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-neutral-900 dark:text-white">{template.title}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(template.priority)}`}>
                      {template.priority}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {template.template}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="text-center pt-4">
        <a
          href="https://makongeniwelfare.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-royal-600 hover:text-royal-700 dark:text-royal-400 dark:hover:text-royal-300"
        >
          Community Welfare Portal
          <svg className="ml-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default SendNotices;