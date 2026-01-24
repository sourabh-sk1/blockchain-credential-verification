import React, { useState } from 'react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';
import { HiOutlineDocumentText, HiOutlineAcademicCap, HiOutlineChartBar, HiOutlineSparkles } from 'react-icons/hi';
import { credentialAPI } from '../services/api';

export default function UniversityDashboard() {
  const [loading, setLoading] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    credentialType: 'DEGREE',
    degree: '',
    major: '',
    gpa: '',
    issueDate: '',
    expiryDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIssueCredential = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        gpa: parseFloat(formData.gpa),
      };
      const token = localStorage.getItem('token');
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const url = `${base}/credentials/issue`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      };
      console.log('ISSUE CREDENTIAL REQUEST', { url, method: 'POST', headers, body: payload });

      const response = await credentialAPI.issueCredential(payload);
      console.log('ISSUE CREDENTIAL RESPONSE', response.data);

      setGeneratedQR(response.data.credential);
      toast.success('Credential issued successfully!');
      setFormData({
        studentId: '',
        credentialType: 'DEGREE',
        degree: '',
        major: '',
        gpa: '',
        issueDate: '',
        expiryDate: '',
      });
    } catch (error) {
      console.log('ISSUE CREDENTIAL FAILED', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.response?.data?.error || 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            University Control Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Issue and manage blockchain-verified credentials</p>
        </div>
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <HiOutlineSparkles size={24} />
          <span className="text-sm font-medium">Secure Network Active</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="stats-card">
          <HiOutlineDocumentText size={32} className="text-blue-600 dark:text-blue-400 mb-4" />
          <h3>1,247</h3>
          <p>Credentials Issued</p>
        </div>
        <div className="stats-card">
          <HiOutlineAcademicCap size={32} className="text-green-600 dark:text-green-400 mb-4" />
          <h3>892</h3>
          <p>Active Students</p>
        </div>
        <div className="stats-card">
          <HiOutlineChartBar size={32} className="text-blue-600 dark:text-blue-400 mb-4" />
          <h3>99.8%</h3>
          <p>Verification Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Credential Issuance Form */}
        <div className="page-container">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <HiOutlineDocumentText size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Issue New Credential</h2>
          </div>

          <form onSubmit={handleIssueCredential} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student Email</label>
                <input
                  type="email"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="student@university.edu"
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Credential Type</label>
                <select
                  name="credentialType"
                  value={formData.credentialType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="DEGREE">Degree</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="TRANSCRIPT">Transcript</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="Bachelor of Science"
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Major</label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GPA</label>
                <input
                  type="number"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  placeholder="3.85"
                  className="input-field"
                  step="0.01"
                  min="0"
                  max="4.0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issue Date</label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Issuing Credential...</span>
                </>
              ) : (
                <>
                  <HiOutlineSparkles size={20} />
                  <span>Issue Blockchain Credential</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* QR Code Display */}
        {generatedQR && (
          <div className="page-container flex flex-col items-center justify-center text-center">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <HiOutlineSparkles size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Credential Generated</h2>
            </div>

            <div className="glass-card p-6 mb-6 bg-white dark:bg-white">
              <QRCode
                value={JSON.stringify({
                  credentialId: generatedQR.credentialId,
                  hash: generatedQR.credentialHash,
                  transactionId: generatedQR.transactionId,
                })}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#0F172A"
                bgColor="transparent"
              />
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center glass-card px-4 py-2">
                <span className="text-gray-600 dark:text-gray-400">Credential ID:</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">{generatedQR.credentialId}</span>
              </div>
              <div className="flex justify-between items-center glass-card px-4 py-2">
                <span className="text-gray-600 dark:text-gray-400">Transaction:</span>
                <span className="text-green-600 dark:text-green-400 font-mono">{generatedQR.transactionId}</span>
              </div>
              <div className="flex justify-between items-center glass-card px-4 py-2">
                <span className="text-gray-600 dark:text-gray-400">Issued:</span>
                <span className="text-gray-900 dark:text-white">{generatedQR.issuedAt}</span>
              </div>
            </div>

            <div className="mt-6 p-4 glass-card border-blue-200 dark:border-blue-800">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This QR code contains the blockchain-verified credential data.
                Students can share this for instant verification.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
