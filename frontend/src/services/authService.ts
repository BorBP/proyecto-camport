import { User, LoginForm } from '../types';
import { apiService } from './apiService';

interface LoginResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', {
        email,
        password
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: {
    nombre: string;
    email: string;
    password: string;
    rol: string;
  }): Promise<User> {
    try {
      const response = await apiService.post<User>('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<User>('/auth/profile');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiService.put<User>('/auth/profile', userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiService.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await apiService.post('/auth/forgot-password', { email });
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiService.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('camport_token');
  }
}

export const authService = new AuthService();