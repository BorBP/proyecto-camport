// Tipos principales para la aplicación Camport

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'administrador' | 'capataz';
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string;
}

export interface Animal {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  edad?: number;
  peso?: number;
  sexo: 'macho' | 'hembra';
  numeroIdentificacion: string;
  collarId?: number;
  grupoId?: number;
  estado: 'activo' | 'enfermo' | 'perdido' | 'vendido';
  fechaRegistro: string;
  ubicacionActual?: {
    latitud: number;
    longitud: number;
    timestamp: string;
  };
}

export interface Collar {
  id: number;
  numeroSerie: string;
  animalId?: number;
  nivelBateria: number;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  ultimaActividad: string;
  configuracion: {
    intervaloEnvio: number;
    umbralBateria: number;
    umbralTemperatura: number;
  };
}

export interface Grupo {
  id: number;
  nombre: string;
  descripcion?: string;
  animales: Animal[];
  potreroId?: number;
  fechaCreacion: string;
}

export interface Potrero {
  id: number;
  nombre: string;
  descripcion?: string;
  coordenadas: {
    latitud: number;
    longitud: number;
  }[];
  area: number;
  capacidad: number;
  estado: 'activo' | 'descanso' | 'mantenimiento';
  fechaCreacion: string;
}

export interface Alerta {
  id: number;
  tipo: 'fuga' | 'bateria_baja' | 'inactividad' | 'temperatura' | 'velocidad';
  titulo: string;
  descripcion: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'nueva' | 'en_proceso' | 'atendida' | 'descartada';
  animalId?: number;
  collarId?: number;
  fechaCreacion: string;
  fechaAtencion?: string;
  usuarioAtencion?: number;
  ubicacion?: {
    latitud: number;
    longitud: number;
  };
}

// Tipos para formularios
export interface LoginForm {
  email: string;
  password: string;
}

export interface AnimalForm {
  nombre: string;
  especie: string;
  raza?: string;
  edad?: number;
  peso?: number;
  sexo: 'macho' | 'hembra';
  numeroIdentificacion: string;
  grupoId?: number;
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Tipos para contextos
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Tipos para hooks
export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}