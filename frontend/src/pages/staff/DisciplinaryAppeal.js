import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { staffService } from '../../services/staffService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DisciplinaryAppeal = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    caseId: '',
    appealReason: '',
    supportingDocuments: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await staffService.fileAppeal(formData.caseId, {
        reason: formData.appealReason,
        documents: formData.supportingDocuments
      });
      toast.success('Appeal submitted successfully');
      navigate('/staff');
    } catch (error) {
      toast.error('Failed to submit appeal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Submit Appeal</h1>
        <p className="text-gray-600">Appeal against disciplinary decisions</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-2">Case ID</label>
          <input
            type="text"
            value={formData.caseId}
            onChange={(e) => setFormData({...formData, caseId: e.target.value})}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Appeal Reason</label>
          <textarea
            value={formData.appealReason}
            onChange={(e) => setFormData({...formData, appealReason: e.target.value})}
            className="w-full px-3 py-2 border rounded"
            rows={4}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          {loading ? 'Submitting...' : 'Submit Appeal'}
        </button>
      </form>
    </div>
  );
};

export default DisciplinaryAppeal;
