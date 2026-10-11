import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlineKey,
  HiOutlineIdentification,
  HiOutlineClipboardCopy,
  HiOutlineCheck,
  HiOutlineShieldCheck,
  HiOutlineCalendar
} from 'react-icons/hi';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedDid, setCopiedDid] = useState(false);

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      toast.error('Failed to load profile details');
      // Fallback to authUser if available
      if (authUser) {
        setProfile(authUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'did') {
      setCopiedDid(true);
      setTimeout(() => setCopiedDid(false), 2000);
      toast.success('DID copied to clipboard');
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      toast.success('Public Key copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const currentUser = profile || authUser;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="card bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-extrabold">{currentUser?.name || 'User Profile'}</h1>
            <p className="text-blue-100 mt-1">{currentUser?.email}</p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30 tracking-wider uppercase">
                {currentUser?.role?.replace('_', ' ') || 'USER'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/30 text-green-100 border border-green-300/40 flex items-center gap-1">
                <HiOutlineShieldCheck className="inline" /> Verified Blockchain Identity
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Details */}
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <HiOutlineUser className="text-blue-600" /> Account Details
          </h2>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <HiOutlineIdentification size={18} /> User ID
              </span>
              <span className="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">
                {currentUser?.userId || 'N/A'}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <HiOutlineMail size={18} /> Email
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {currentUser?.email || 'N/A'}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <HiOutlineOfficeBuilding size={18} /> Organization
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {currentUser?.organization || 'N/A'}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <HiOutlineCalendar size={18} /> Member Since
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Decentralized Identity (DID) */}
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <HiOutlineShieldCheck className="text-blue-600" /> Decentralized Identifier (DID)
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your unique, cryptographically anchored W3C-compliant decentralized identifier on the ledger.
          </p>

          <div className="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-mono break-all text-gray-700 dark:text-gray-300">
              {currentUser?.did || 'Generating DID...'}
            </div>
            <button
              onClick={() => copyToClipboard(currentUser?.did, 'did')}
              className="mt-3 btn-secondary text-xs w-full flex items-center justify-center gap-2"
              disabled={!currentUser?.did}
            >
              {copiedDid ? <HiOutlineCheck size={16} className="text-green-500" /> : <HiOutlineClipboardCopy size={16} />}
              {copiedDid ? 'Copied DID' : 'Copy DID String'}
            </button>
          </div>
        </div>
      </div>

      {/* Public Key Card */}
      {currentUser?.publicKey && (
        <div className="card space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <HiOutlineKey className="text-blue-600" /> Cryptographic Public Key
            </h2>
            <button
              onClick={() => copyToClipboard(currentUser?.publicKey, 'key')}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              {copiedKey ? <HiOutlineCheck size={16} className="text-green-500" /> : <HiOutlineClipboardCopy size={16} />}
              {copiedKey ? 'Copied' : 'Copy Key'}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Used to verify tamper-proof digital signatures and encrypt verifiable credentials.
          </p>
          <pre className="p-4 bg-gray-900 text-green-400 rounded-xl text-xs font-mono overflow-x-auto max-h-48 border border-gray-800">
            {currentUser?.publicKey}
          </pre>
        </div>
      )}
    </div>
  );
}
