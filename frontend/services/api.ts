import axios from 'axios';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

export const backendClient = axios.create({
  baseURL: backendUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const aiServiceClient = axios.create({
  baseURL: aiServiceUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
