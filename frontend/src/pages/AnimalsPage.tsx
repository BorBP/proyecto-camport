import React, { useState } from 'react';
import { FiPlus, FiSearch, FiFilter, FiMoreHorizontal, FiMapPin, FiActivity } from 'react-icons/fi';

const AnimalsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  // Datos de ejemplo
  const animals = [
    {
      id: 1,
      nombre: 'Vaca #001',
      especie: 'Bovino',
      raza: 'Holstein',
      edad: 3,
      peso: 580,
      sexo: 'hembra',
      numeroIdentificacion: 'BOV001',
      estado: 'activo',
      collarId: 'COL001',
      grupo: 'Grupo A',
      ubicacion: 'Potrero Norte',
      ultimaActividad: '2025-10-03 14:30',
      nivelBateria: 85
    },
    {
      id: 2,
      nombre: 'Toro #045',
      especie: 'Bovino',
      raza: 'Angus',
      edad: 5,
      peso: 780,
      sexo: 'macho',
      numeroIdentificacion: 'BOV045',
      estado: 'activo',
      collarId: 'COL045',
      grupo: 'Grupo B',
      ubicacion: 'Potrero Sur',
      ultimaActividad: '2025-10-03 14:25',
      nivelBateria: 72
    },
    {
      id: 3,
      nombre: 'Vaca #127',
      especie: 'Bovino',
      raza: 'Jersey',
      edad: 4,
      peso: 420,
      sexo: 'hembra',
      numeroIdentificacion: 'BOV127',
      estado: 'alerta',
      collarId: 'COL127',
      grupo: 'Grupo A',
      ubicacion: 'Fuera de geocerca',
      ultimaActividad: '2025-10-03 13:45',
      nivelBateria: 23
    }
  ];

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.numeroIdentificacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'todos' || animal.estado === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'alerta': return 'bg-red-100 text-red-800';
      case 'enfermo': return 'bg-yellow-100 text-yellow-800';
      case 'perdido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBatteryColor = (nivel: number) => {
    if (nivel > 50) return 'text-green-600';
    if (nivel > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Animales</h1>
          <p className="text-gray-600">Administra y monitorea tu ganado</p>
        </div>
        <button className="btn btn-primary">
          <FiPlus className="w-4 h-4" />
          Agregar Animal
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">127</div>
          <div className="text-sm text-gray-600">Total de Animales</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">98</div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">7</div>
          <div className="text-sm text-gray-600">En Alerta</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">22</div>
          <div className="text-sm text-gray-600">Sin Collar</div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o ID..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filtro por estado */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="form-input pl-10 min-w-[150px]"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="alerta">En Alerta</option>
                <option value="enfermo">Enfermos</option>
                <option value="perdido">Perdidos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de animales */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">
            Lista de Animales ({filteredAnimals.length})
          </h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Información</th>
                  <th>Estado</th>
                  <th>Ubicación</th>
                  <th>Collar</th>
                  <th>Batería</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">{animal.nombre}</div>
                        <div className="text-sm text-gray-500">{animal.numeroIdentificacion}</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="text-gray-900">{animal.raza}</div>
                        <div className="text-gray-500">
                          {animal.edad} años • {animal.peso}kg • {animal.sexo}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(animal.estado)}`}>
                        {animal.estado.charAt(0).toUpperCase() + animal.estado.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{animal.ubicacion}</span>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="text-gray-900">{animal.collarId}</div>
                        <div className="text-gray-500">Grupo: {animal.grupo}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <FiActivity className={`w-4 h-4 ${getBatteryColor(animal.nivelBateria)}`} />
                        <span className={`text-sm font-medium ${getBatteryColor(animal.nivelBateria)}`}>
                          {animal.nivelBateria}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                        <FiMoreHorizontal className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Estado vacío */}
      {filteredAnimals.length === 0 && (
        <div className="text-center py-12">
          <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron animales</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'No hay animales registrados'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnimalsPage;