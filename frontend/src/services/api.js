import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const healthCheck = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export const uploadContext = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/prepare/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const processVoiceBrief = async (sessionId, context) => {
  const response = await api.post(`/api/prepare/brief?session_id=${sessionId}`, context);
  return response.data;
};

export const getSession = async (sessionId) => {
  const response = await api.get(`/api/session/${sessionId}`);
  return response.data;
};

export const configureAutoPilot = async (sessionId, config) => {
  const response = await api.post(`/api/session/${sessionId}/autopilot`, config);
  return response.data;
};

export default api;
