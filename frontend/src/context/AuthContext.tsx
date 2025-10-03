import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('camport_token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('camport_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      localStorage.setItem('camport_token', response.token);
      setUser(response.user);
      
      toast.success(`¡Bienvenido, ${response.user.nombre}!`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error de autenticación';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('camport_token');
    setUser(null);
    toast.success('Sesión cerrada correctamente');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};