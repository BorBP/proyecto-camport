import { Animal, AnimalForm, PaginatedResponse } from '../types';
import { apiService } from './apiService';

class AnimalService {
  async getAnimals(params?: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
    grupoId?: number;
  }): Promise<PaginatedResponse<Animal>> {
    try {
      const response = await apiService.get<PaginatedResponse<Animal>>('/animales', params);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAnimal(id: number): Promise<Animal> {
    try {
      const response = await apiService.get<Animal>(`/animales/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async createAnimal(animalData: AnimalForm): Promise<Animal> {
    try {
      const response = await apiService.post<Animal>('/animales', animalData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateAnimal(id: number, animalData: Partial<AnimalForm>): Promise<Animal> {
    try {
      const response = await apiService.put<Animal>(`/animales/${id}`, animalData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteAnimal(id: number): Promise<void> {
    try {
      await apiService.delete(`/animales/${id}`);
    } catch (error) {
      throw error;
    }
  }

  async assignCollar(animalId: number, collarId: number): Promise<Animal> {
    try {
      const response = await apiService.post<Animal>(`/animales/${animalId}/collar`, {
        collarId
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async removeCollar(animalId: number): Promise<Animal> {
    try {
      const response = await apiService.delete<Animal>(`/animales/${animalId}/collar`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAnimalLocation(id: number): Promise<{
    latitud: number;
    longitud: number;
    timestamp: string;
  }> {
    try {
      const response = await apiService.get<{
        latitud: number;
        longitud: number;
        timestamp: string;
      }>(`/animales/${id}/ubicacion`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAnimalHistory(id: number, params?: {
    fechaInicio?: string;
    fechaFin?: string;
    limit?: number;
  }): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`/animales/${id}/historial`, params);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const animalService = new AnimalService();