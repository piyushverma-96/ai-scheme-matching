import axios from 'axios';
import { ENV } from '../config/env';
import { supabase } from '../config/supabase';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach JWT access token to requests if session exists
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Proceed without token if session check fails
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Network connection failed. Please check backend server.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.detail) {
      message = typeof error.response.data.detail === 'string'
        ? error.response.data.detail
        : JSON.stringify(error.response.data.detail);
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject({ ...error, userFriendlyMessage: message });
  }
);

/**
 * Health check service to confirm backend & Supabase connectivity
 */
export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/api/v1/health');
    return { success: true, data: response.data };
  } catch (error) {
    // Try fallback root /health
    try {
      const fallback = await apiClient.get('/health');
      return { success: true, data: fallback.data };
    } catch (fallbackError) {
      return {
        success: false,
        error: fallbackError.userFriendlyMessage || 'Could not connect to FastAPI backend at ' + ENV.API_BASE_URL,
      };
    }
  }
};
