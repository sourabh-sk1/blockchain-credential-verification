import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineClipboardCopy,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineQrcode,
  HiOutlineCalendar,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';
import { QRCodeSVG } from 'qrcode.react';
import { credentialAPI } from '../services/api';

export default function StudentPortal() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await credentialAPI.listStudentCredentials();
      setCredentials(response.data.credentials || []);
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

  const copyCredentialId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success('Credential ID copied to clipboard!');
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
            <HiOutlineAcademicCap className="text-blue-600" />
            My Verified Credentials
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Immutable, blockchain-verified academic credentials issued to your account
          </p>
        </div>

        <button
          onClick={fetchCredentials}
          className="btn-secondary flex items-center gap-2 self-start sm:self-auto text-sm"
          disabled={loading}
        >
          <HiOutlineRefresh className={loading ? 'animate-spin' : ''} size={18} />
          Refresh
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="card text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your credentials from blockchain ledger...</p>
        </div>
      ) : credentials.length === 0 ? (
        <div className="card text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-gray-800 text-blue-600 mx-auto flex items-center justify-center">
            <HiOutlineAcademicCap size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">No Credentials Found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
            You do not have any issued credentials yet. Ask your university or institution to issue a credential to your registered email.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((cred) => (
            <div
              key={cred.credentialId}
              className="card hover:shadow-xl transition-all duration-200 border-t-4 border-blue-600 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {cred.type || 'CREDENTIAL'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    cred.status === 'ISSUED'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    <HiOutlineCheckCircle size={14} />
                    {cred.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">
                  {cred.degree || 'Degree Credential'}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-0.5">
                  {cred.major}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <HiOutlineOfficeBuilding size={16} className="text-gray-400" />
                    <span>Issuer: <strong>{cred.issuer || 'Authorized Institution'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineCalendar size={16} className="text-gray-400" />
                    <span>Issued: {cred.issueDate ? new Date(cred.issueDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                  onClick={() => handleViewDetails(cred.credentialId)}
                  disabled={detailsLoading}
                >
                  <HiOutlineQrcode size={16} />
                  View Details & QR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal with QR Code and Full Details */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <HiOutlineAcademicCap className="text-blue-600" /> Credential Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            {/* QR Code Block */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-2xl flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <QRCodeSVG
                  value={JSON.stringify({
                    credentialId: selected.credentialId,
                    studentEmail: selected.studentEmail,
                    issuer: selected.issuer,
                    type: selected.credentialType,
                    status: selected.status
                  })}
                  size={150}
                  level="H"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Scan this QR code to verify authenticity instantly
              </p>
            </div>

            {/* Credential ID copy banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800/40 flex items-center justify-between gap-2">
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
                  Credential ID
                </span>
                <span className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 truncate block">
                  {selected.credentialId}
                </span>
              </div>
              <button
                onClick={() => copyCredentialId(selected.credentialId)}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shrink-0"
              >
                {copiedId ? <HiOutlineCheck size={14} /> : <HiOutlineClipboardCopy size={14} />}
                {copiedId ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Details Table */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Student:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selected.studentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selected.studentEmail}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Issuer Institution:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selected.issuer}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Degree:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selected.degree || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Major:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selected.major || 'N/A'}</span>
              </div>
              {selected.gpa !== undefined && (
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">GPA:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{selected.gpa}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Issue Date:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {selected.issueDate ? new Date(selected.issueDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 dark:text-gray-400">Verification Status:</span>
                <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <HiOutlineCheckCircle size={16} /> {selected.status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                className="btn-secondary text-sm px-5"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
