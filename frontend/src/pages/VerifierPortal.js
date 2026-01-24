import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { verificationAPI } from '../services/api';

export default function VerifierPortal() {
  const [verificationMethod, setVerificationMethod] = useState('hash');
  const [hash, setHash] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerifyHash = async (e) => {
    e.preventDefault();
    if (!hash) {
      toast.error('Please enter a hash');
      return;
    }

    setLoading(true);
    try {
      const response = await verificationAPI.verifyCredentialHash({ credentialHash: hash });
      setResult(response.data);
      toast.success(response.data.isValid ? 'Credential verified!' : 'Credential verification failed');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyById = async (e) => {
    e.preventDefault();
    if (!credentialId) {
      toast.error('Please enter a credential ID');
      return;
    }

    setLoading(true);
    try {
      const response = await verificationAPI.verifyCredentialById(credentialId);
      setResult(response.data);
      toast.success(response.data.isValid ? 'Credential verified!' : 'Credential verification failed');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Verification failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Credential Verification</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Form */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Verify Credential</h2>

          <div className="flex gap-4 mb-6">
            <label className="flex items-center">
              <input
                type="radio"
                value="hash"
                checked={verificationMethod === 'hash'}
                onChange={(e) => setVerificationMethod(e.target.value)}
                className="mr-2"
              />
              <span>By Hash</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="id"
                checked={verificationMethod === 'id'}
                onChange={(e) => setVerificationMethod(e.target.value)}
                className="mr-2"
              />
              <span>By Credential ID</span>
            </label>
          </div>

          {verificationMethod === 'hash' ? (
            <form onSubmit={handleVerifyHash} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Credential Hash (SHA-256)
                </label>
                <input
                  type="text"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  className="input-field font-mono text-sm"
                  placeholder="Enter 64-character hex hash"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Hash'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyById} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Credential ID
                </label>
                <input
                  type="text"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  className="input-field"
                  placeholder="Enter credential ID"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Credential'}
              </button>
            </form>
          )}
        </div>

        {/* Verification Result */}
        {result && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Verification Result</h2>

            <div className={`p-4 rounded-lg mb-4 ${result.isValid ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <p className={`text-2xl font-bold ${result.isValid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {result.isValid ? '✓ Valid' : '✗ Invalid'}
              </p>
            </div>

            {result.credentialId && (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Credential ID:</span>
                  <p className="font-mono font-semibold text-gray-900 dark:text-gray-100">{result.credentialId}</p>
                </div>

                {result.student && (
                  <>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Student:</span>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{result.student.name}</p>
                    </div>
                  </>
                )}

                {result.credentialType && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{result.credentialType}</p>
                  </div>
                )}

                {result.degree && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Degree:</span>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{result.degree}</p>
                  </div>
                )}

                {result.details && (
                  <div className="mt-4 space-y-2 p-3 bg-gray-100 dark:bg-gray-700/50 rounded">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Validation Details:</p>
                    <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Hash Match:</span>
                        <span className={result.details.hashMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{result.details.hashMatch ? '✓' : '✗'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Signature Valid:</span>
                        <span className={result.details.signatureValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{result.details.signatureValid ? '✓' : '✗'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Not Revoked:</span>
                        <span className={result.details.notRevoked ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{result.details.notRevoked ? '✓' : '✗'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Not Expired:</span>
                        <span className={result.details.notExpired ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{result.details.notExpired ? '✓' : '✗'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
