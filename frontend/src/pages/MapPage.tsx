import React, { useState, useEffect } from 'react';
import { FiMapPin, FiUsers, FiAlertTriangle, FiLayers } from 'react-icons/fi';

// Simulación simple de mapa sin Leaflet por el momento
const MapComponent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div 
      className="h-full w-full rounded-lg bg-gray-200 flex items-center justify-center relative"
      style={{ minHeight: '600px' }}
    >
      <div className="text-center">
        <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Mapa Interactivo</p>
        <p className="text-sm text-gray-500">Integración con Leaflet pendiente</p>
      </div>
      {children}
    </div>
  );
};

const MapPage: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState('animales');
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);

  // Datos de ejemplo
  const animals = [
    {
      id: 1,
      nombre: 'Vaca #001',
      position: [-33.4489, -70.6693] as [number, number],
      estado: 'activo',
      collarId: 'COL001',
      nivelBateria: 85
    },
    {
      id: 2,
      nombre: 'Toro #045',
      position: [-33.4510, -70.6700] as [number, number],
      estado: 'activo',
      collarId: 'COL045',
      nivelBateria: 72
    },
    {
      id: 3,
      nombre: 'Vaca #127',
      position: [-33.4530, -70.6680] as [number, number],
      estado: 'alerta',
      collarId: 'COL127',
      nivelBateria: 23
    }
  ];

  const potreros = [
    {
      id: 1,
      nombre: 'Potrero Norte',
      coordinates: [
        [-33.4470, -70.6670],
        [-33.4470, -70.6720],
        [-33.4520, -70.6720],
        [-33.4520, -70.6670]
      ] as [number, number][],
      area: 12.5,
      capacidad: 50
    },
    {
      id: 2,
      nombre: 'Potrero Sur',
      coordinates: [
        [-33.4520, -70.6670],
        [-33.4520, -70.6720],
        [-33.4570, -70.6720],
        [-33.4570, -70.6670]
      ] as [number, number][],
      area: 15.2,
      capacidad: 60
    }
  ];

  const alertas = [
    {
      id: 1,
      position: [-33.4530, -70.6680] as [number, number],
      tipo: 'Salida de geocerca',
      animal: 'Vaca #127',
      severidad: 'alta'
    }
  ];

  // Iconos personalizados (simplificado)
  const animalMarkers = animals.map((animal) => (
    <div key={animal.id} className="absolute" style={{
      left: `${20 + animal.id * 50}px`,
      top: `${100 + animal.id * 30}px`,
      transform: 'translate(-50%, -50%)'
    }}>
      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
        {animal.nombre}
      </div>
    </div>
  ));

  const alertMarkers = alertas.map((alerta) => (
    <div key={alerta.id} className="absolute" style={{
      left: `${200 + alerta.id * 40}px`,
      top: `${150 + alerta.id * 35}px`,
      transform: 'translate(-50%, -50%)'
    }}>
      <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
        {alerta.tipo}
      </div>
    </div>
  ));

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mapa en Tiempo Real</h1>
          <p className="text-gray-600">Ubicación y monitoreo del ganado</p>
        </div>
        
        {/* Controles de capas */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveLayer('animales')}
            className={`btn ${activeLayer === 'animales' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FiUsers className="w-4 h-4" />
            Animales
          </button>
          <button
            onClick={() => setActiveLayer('potreros')}
            className={`btn ${activeLayer === 'potreros' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FiLayers className="w-4 h-4" />
            Potreros
          </button>
          <button
            onClick={() => setActiveLayer('alertas')}
            className={`btn ${activeLayer === 'alertas' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FiAlertTriangle className="w-4 h-4" />
            Alertas
          </button>
        </div>
      </div>

      {/* Estadísticas del mapa */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <FiUsers className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-lg font-bold text-green-600">98</div>
              <div className="text-sm text-gray-600">Animales Monitoreados</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <FiMapPin className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-lg font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Potreros Activos</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-lg font-bold text-red-600">7</div>
              <div className="text-sm text-gray-600">Alertas Activas</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <FiLayers className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-lg font-bold text-purple-600">95%</div>
              <div className="text-sm text-gray-600">Cobertura GPS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa principal */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-3">
          <div className="card h-full">
            <div className="card-body p-0 h-full min-h-[600px]">
              <MapComponent>
                {/* Mostrar animales */}
                {(activeLayer === 'animales') && animalMarkers}
                
                {/* Mostrar alertas */}
                {(activeLayer === 'alertas') && alertMarkers}
                
                {/* Mostrar potreros como áreas */}
                {(activeLayer === 'potreros' || activeLayer === 'animales') && potreros.map((potrero) => (
                  <div key={potrero.id} className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-30 rounded" style={{
                    left: `${50 + potrero.id * 100}px`,
                    top: `${50 + potrero.id * 80}px`,
                    width: '150px',
                    height: '100px'
                  }}>
                    <div className="p-2 text-xs bg-white rounded shadow m-1">
                      <strong>{potrero.nombre}</strong>
                      <br />Área: {potrero.area} ha
                      <br />Cap: {potrero.capacidad}
                    </div>
                  </div>
                ))}
              </MapComponent>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Controles */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Controles</h3>
            </div>
            <div className="card-body space-y-3">
              <button className="btn btn-secondary w-full">
                <FiMapPin className="w-4 h-4" />
                Centrar en Granja
              </button>
              <button className="btn btn-secondary w-full">
                Actualizar Ubicaciones
              </button>
              <button className="btn btn-secondary w-full">
                Modo Satélite
              </button>
            </div>
          </div>

          {/* Leyenda */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Leyenda</h3>
            </div>
            <div className="card-body space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Animales Activos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Alertas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-500"></div>
                <span className="text-sm">Geocercas</span>
              </div>
            </div>
          </div>

          {/* Estado del sistema */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Estado del Sistema</h3>
            </div>
            <div className="card-body space-y-2">
              <div className="flex justify-between text-sm">
                <span>GPS:</span>
                <span className="text-green-600 font-medium">Activo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Collares:</span>
                <span className="text-green-600 font-medium">98/100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Última actualización:</span>
                <span className="text-gray-600">Hace 30s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;