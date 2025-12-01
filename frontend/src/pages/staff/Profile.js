import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  PencilIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [newQualification, setNewQualification] = useState({
    qualification: '',
    institution: '',
    yearObtained: '',
    certificateFile: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await staffService.getProfile(user._id);
      setProfile(response.data);
      setFormData({
        phoneNumber: response.data.phoneNumber || '',
        address: response.data.address || ''
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await staffService.updateProfile(user._id, formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddQualification = async () => {
    try {
      await staffService.addQualification(user._id, newQualification);
      toast.success('Qualification added successfully');
      setShowQualificationModal(false);
      setNewQualification({
        qualification: '',
        institution: '',
        yearObtained: '',
        certificateFile: null
      });
      fetchProfile();
    } catch (error) {
      toast.error('Failed to add qualification');
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const getStatusIcon = (isActive) => {
    return isActive 
      ? <CheckCircleIcon className="h-5 w-5" />
      : <XCircleIcon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and update your personal information
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-dark-green-600 text-white rounded-lg text-sm font-medium hover:bg-dark-green-700 flex items-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                  {profile?.profileImage ? (
                    <img 
                      src={profile.profileImage} 
                      alt="Profile" 
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-32 w-32 text-gray-400" />
                  )}
                </div>
                {editing && (
                  <button className="absolute bottom-4 right-4 p-2 bg-white dark:bg-gray-900 rounded-full shadow">
                    <CameraIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{profile?.position}</p>
              
              <div className="mt-4 flex items-center">
                <div className={`p-2 rounded-full mr-2 ${getStatusColor(profile?.isActive)}`}>
                  {getStatusIcon(profile?.isActive)}
                </div>
                <span className={`text-sm font-medium ${getStatusColor(profile?.isActive)} px-2 py-1 rounded-full`}>
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Leaves Taken</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Days Present</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Employee ID
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-gray-900 dark:text-white">{profile?.employeeId}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-900 dark:text-white">{profile?.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900 dark:text-white">
                      {profile?.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Joining
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-900 dark:text-white">
                    {new Date(profile?.dateOfJoining).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-900 dark:text-white">{profile?.department}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-900 dark:text-white">{profile?.position}</p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                {editing ? (
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-gray-900 dark:text-white">
                      {profile?.address || 'Not provided'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {editing && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      phoneNumber: profile?.phoneNumber || '',
                      address: profile?.address || ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-dark-green-600 text-white rounded-lg text-sm font-medium hover:bg-dark-green-700"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Qualifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Qualifications
              </h3>
              <button
                onClick={() => setShowQualificationModal(true)}
                className="px-3 py-1 bg-dark-green-600 text-white rounded text-sm font-medium hover:bg-dark-green-700 flex items-center"
              >
                <AcademicCapIcon className="h-4 w-4 mr-2" />
                Add Qualification
              </button>
            </div>
            
            {profile?.qualifications && profile.qualifications.length > 0 ? (
              <div className="space-y-4">
                {profile.qualifications.map((qual, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {qual.qualification}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {qual.institution} • {qual.yearObtained}
                        </p>
                      </div>
                      {qual.certificateFile && (
                        <a
                          href={qual.certificateFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  No qualifications added yet
                </p>
              </div>
            )}
          </div>

          {/* Supervisor Information */}
          {profile?.supervisor && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Supervisor Information
              </h3>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                  <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                    {profile.supervisor.firstName.charAt(0)}{profile.supervisor.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {profile.supervisor.firstName} {profile.supervisor.lastName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Supervisor</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Qualification Modal */}
      {showQualificationModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Qualification
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  value={newQualification.qualification}
                  onChange={(e) => setNewQualification({ ...newQualification, qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="e.g., Bachelor of Science"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  value={newQualification.institution}
                  onChange={(e) => setNewQualification({ ...newQualification, institution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="e.g., University of Nairobi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year Obtained
                </label>
                <input
                  type="number"
                  value={newQualification.yearObtained}
                  onChange={(e) => setNewQualification({ ...newQualification, yearObtained: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="e.g., 2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certificate (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewQualification({ ...newQualification, certificateFile: e.target.files[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark-green-500 focus:border-dark-green-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowQualificationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQualification}
                className="px-4 py-2 bg-dark-green-600 text-white rounded-lg text-sm font-medium hover:bg-dark-green-700"
              >
                Add Qualification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;