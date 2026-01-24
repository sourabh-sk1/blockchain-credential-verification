import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { credentialAPI } from '../services/api';

export default function StudentPortal() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await credentialAPI.listStudentCredentials();
      setCredentials(response.data.credentials);
    } catch (error) {
      toast.error('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (credentialId) => {
    try {
      setDetailsLoading(true);
      const response = await credentialAPI.getCredential(credentialId);
      setSelected(response.data.credential);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load credential details');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">My Credentials</h1>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : credentials.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No credentials found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((cred) => (
            <div key={cred.credentialId} className="card">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">{cred.degree}</h3>
                <p className="text-gray-600 dark:text-gray-400">{cred.major}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Issued by: {cred.issuer}</p>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-semibold">{cred.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Issue Date:</span>
                  <span className="font-semibold">{new Date(cred.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-semibold ${cred.status === 'ISSUED' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {cred.status}
                  </span>
                </div>
              </div>

              <button
                className="btn-primary w-full text-sm"
                onClick={() => handleViewDetails(cred.credentialId)}
                disabled={detailsLoading}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Credential Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Credential ID:</span>
                <span className="font-mono font-semibold dark:text-gray-200">{selected.credentialId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Student:</span>
                <span className="font-semibold dark:text-gray-200">{selected.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-semibold dark:text-gray-200">{selected.studentEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Issuer:</span>
                <span className="font-semibold dark:text-gray-200">{selected.issuer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-semibold dark:text-gray-200">{selected.credentialType}</span>
              </div>
              {selected.degree && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Degree:</span>
                  <span className="font-semibold dark:text-gray-200">{selected.degree}</span>
                </div>
              )}
              {selected.major && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Major:</span>
                  <span className="font-semibold dark:text-gray-200">{selected.major}</span>
                </div>
              )}
              {typeof selected.gpa !== 'undefined' && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">GPA:</span>
                  <span className="font-semibold dark:text-gray-200">{selected.gpa}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Issue Date:</span>
                <span className="font-semibold dark:text-gray-200">{new Date(selected.issueDate).toLocaleDateString()}</span>
              </div>
              {selected.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Expiry Date:</span>
                  <span className="font-semibold dark:text-gray-200">{new Date(selected.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`font-semibold ${selected.status === 'ISSUED' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{selected.status}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="btn-secondary mr-2" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
