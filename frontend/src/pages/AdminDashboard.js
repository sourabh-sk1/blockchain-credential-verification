import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI, verificationAPI } from '../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await verificationAPI.getVerificationStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await authAPI.verifyUser(userId, { isVerified: true });
      toast.success('User verified successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to verify user');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'stats'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Statistics
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Organization</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Verified</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{user.organization}</td>
                      <td className="px-6 py-4">
                        <span className={user.isVerified ? 'text-green-600' : 'text-red-600'}>
                          {user.isVerified ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {!user.isVerified && (
                          <button
                            onClick={() => handleVerifyUser(user.userId)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Verifications</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.totalVerifications}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Valid Credentials</p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.validCredentials}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Invalid Credentials</p>
            <p className="text-4xl font-bold text-red-600 dark:text-red-400">{stats.invalidCredentials}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Verification Methods</p>
            <div className="text-sm mt-2 space-y-1">
              {Object.entries(stats.byMethod || {}).map(([method, count]) => (
                <div key={method} className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>{method}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
