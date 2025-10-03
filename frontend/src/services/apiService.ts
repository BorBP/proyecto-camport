import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token de autorización
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('camport_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas y errores
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem('camport_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP básicos
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url);
    return response.data.data;
  }

  // Método para descargar archivos
  async downloadFile(url: string, filename: string): Promise<void> {
    const response = await this.axiosInstance.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Método para subir archivos
  async uploadFile<T>(url: string, file: File, additionalData?: any): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }
}

export const apiService = new ApiService();