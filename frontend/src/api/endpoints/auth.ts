import apiClient from '../client';
import type { AuthResponse, Usuario } from '../../types';

export const login = (email: string, password: string) =>
  apiClient.post<AuthResponse>('/auth/login', { email, password });

export const getMe = () => apiClient.get<Usuario>('/auth/me');
