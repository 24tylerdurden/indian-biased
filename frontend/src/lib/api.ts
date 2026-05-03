import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  signup: async (email: string, password: string, name: string) => {
    const response = await api.post<AuthResponse>('/auth/signup', {
      email,
      password,
      name,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  googleLogin: async () => {
    const response = await api.post<{ auth_url: string }>('/auth/google');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<{ access_token: string; refresh_token: string }>(
      '/auth/refresh',
      { refresh_token: refreshToken }
    );
    return response.data;
  },

  logout: async (refreshToken: string) => {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  getMe: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

export default api;
