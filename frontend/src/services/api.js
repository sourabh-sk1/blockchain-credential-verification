import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  try {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('API REQUEST', {
      url: fullUrl,
      method: config.method,
      headers: config.headers,
      body: config.data
    });
  } catch (_) {}
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const cfg = error.config || {};
      const fullUrl = cfg.baseURL && cfg.url ? `${cfg.baseURL}${cfg.url}` : cfg.url;
      console.log('API ERROR', {
        url: fullUrl,
        method: cfg.method,
        headers: cfg.headers,
        body: cfg.data,
        status: error.response?.status,
        response: error.response?.data
      });
    } catch (_) {}
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
  getAllUsers: () => apiClient.get('/auth/users'),
  verifyUser: (userId, data) => apiClient.patch(`/auth/users/${userId}/verify`, data),
};

// Credential APIs
export const credentialAPI = {
  issueCredential: (data) => apiClient.post('/credentials/issue', data),
  getCredential: (credentialId) => apiClient.get(`/credentials/${credentialId}`),
  listStudentCredentials: () => apiClient.get('/credentials/student/list'),
  revokeCredential: (credentialId, data) => apiClient.post(`/credentials/${credentialId}/revoke`, data),
  getAuditTrail: (credentialId) => apiClient.get(`/credentials/${credentialId}/audit`),
};

// Verification APIs
export const verificationAPI = {
  verifyCredentialHash: (data) => apiClient.post('/verify/verify-hash', data),
  verifyCredentialById: (credentialId) => apiClient.get(`/verify/${credentialId}/verify`),
  getVerificationHistory: (credentialId) => apiClient.get(`/verify/${credentialId}/history`),
  getVerificationStats: () => apiClient.get('/verify/stats'),
};

export default apiClient;
