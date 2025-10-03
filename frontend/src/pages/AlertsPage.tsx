import React, { useState } from 'react';
import { FiAlertTriangle, FiCheck, FiX, FiClock, FiFilter, FiMapPin } from 'react-icons/fi';

const AlertsPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState('todas');
  const [selectedSeverity, setSelectedSeverity] = useState('todas');

  const alertas = [
    {
      id: 1,
      tipo: 'Salida de geocerca',
      titulo: 'Animal fuera de zona permitida',
      descripcion: 'Vaca #127 ha salido del Potrero Norte',
      severidad: 'alta',
      estado: 'nueva',
      animal: 'Vaca #127',
      fechaCreacion: '2025-10-03 14:30',
      ubicacion: { latitud: -33.4530, longitud: -70.6680 }
    },
    {
      id: 2,
      tipo: 'bateria_baja',
      titulo: 'Batería baja en collar',
      descripcion: 'El collar COL045 tiene nivel de batería crítico (15%)',
      severidad: 'media',
      estado: 'en_proceso',
      animal: 'Toro #045',
      fechaCreacion: '2025-10-03 13:15',
      fechaAtencion: '2025-10-03 13:45'
    },
    {
      id: 3,
      tipo: 'inactividad',
      titulo: 'Inactividad prolongada',
      descripcion: 'Vaca #089 sin movimiento por más de 4 horas',
      severidad: 'baja',
      estado: 'nueva',
      animal: 'Vaca #089',
      fechaCreacion: '2025-10-03 12:00'
    },
    {
      id: 4,
      tipo: 'temperatura',
      titulo: 'Temperatura corporal alta',
      descripcion: 'Vaca #056 presenta temperatura de 40.5°C',
      severidad: 'critica',
      estado: 'atendida',
      animal: 'Vaca #056',
      fechaCreacion: '2025-10-03 10:30',
      fechaAtencion: '2025-10-03 11:00'
    }
  ];

  const filteredAlertas = alertas.filter(alerta => {
    const matchesStatus = selectedStatus === 'todas' || alerta.estado === selectedStatus;
    const matchesSeverity = selectedSeverity === 'todas' || alerta.severidad === selectedSeverity;
    return matchesStatus && matchesSeverity;
  });

  const getSeverityConfig = (severidad: string): { color: string; icon: string } => {
    switch (severidad) {
      case 'critica':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: 'text-red-600' };
      case 'alta':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: 'text-orange-600' };
      case 'media':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: 'text-yellow-600' };
      case 'baja':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'text-blue-600' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: 'text-gray-600' };
    }
  };

  const getStatusConfig = (estado: string): { color: string; icon: any } => {
    switch (estado) {
      case 'nueva':
        return { color: 'bg-red-100 text-red-800', icon: FiAlertTriangle };
      case 'en_proceso':
        return { color: 'bg-yellow-100 text-yellow-800', icon: FiClock };
      case 'atendida':
        return { color: 'bg-green-100 text-green-800', icon: FiCheck };
      case 'descartada':
        return { color: 'bg-gray-100 text-gray-800', icon: FiX };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FiClock };
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'fuga':
      case 'Salida de geocerca':
        return 'Salida de Zona';
      case 'bateria_baja':
        return 'Batería Baja';
      case 'inactividad':
        return 'Inactividad';
      case 'temperatura':
        return 'Temperatura';
      case 'velocidad':
        return 'Velocidad Anómala';
      default:
        return tipo;
    }
  };

  const handleStatusChange = (alertaId: number, nuevoEstado: string) => {
    // Aquí iría la lógica para actualizar el estado de la alerta
    console.log(`Cambiando estado de alerta ${alertaId} a ${nuevoEstado}`);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Alertas</h1>
          <p className="text-gray-600">Monitorea y gestiona las alertas del sistema</p>
        </div>
        <button className="btn btn-primary">
          Marcar Todas como Leídas
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-lg font-bold text-red-600">7</div>
              <div className="text-sm text-gray-600">Alertas Nuevas</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <FiClock className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="text-lg font-bold text-yellow-600">3</div>
              <div className="text-sm text-gray-600">En Proceso</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <FiCheck className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-lg font-bold text-green-600">15</div>
              <div className="text-sm text-gray-600">Resueltas Hoy</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-lg font-bold text-orange-600">2</div>
              <div className="text-sm text-gray-600">Críticas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="form-label">Estado</label>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="form-input pl-10"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="todas">Todas las alertas</option>
                  <option value="nueva">Nuevas</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="atendida">Atendidas</option>
                  <option value="descartada">Descartadas</option>
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label className="form-label">Severidad</label>
              <div className="relative">
                <FiAlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="form-input pl-10"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                >
                  <option value="todas">Todas las severidades</option>
                  <option value="critica">Crítica</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-4">
        {filteredAlertas.map((alerta) => {
          const severityConfig = getSeverityConfig(alerta.severidad);
          const statusConfig = getStatusConfig(alerta.estado);
          const StatusIcon = statusConfig.icon;

          return (
            <div key={alerta.id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FiAlertTriangle className={`w-5 h-5 ${severityConfig.icon}`} />
                      <h3 className="font-semibold text-gray-900">{alerta.titulo}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severityConfig.color}`}>
                        {alerta.severidad.charAt(0).toUpperCase() + alerta.severidad.slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {alerta.estado.replace('_', ' ').charAt(0).toUpperCase() + alerta.estado.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{alerta.descripcion}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Tipo:</span>
                        <span>{getTipoLabel(alerta.tipo)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Animal:</span>
                        <span>{alerta.animal}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Fecha:</span>
                        <span>{alerta.fechaCreacion}</span>
                      </div>
                      {alerta.ubicacion && (
                        <div className="flex items-center gap-1">
                          <FiMapPin className="w-4 h-4" />
                          <span>{alerta.ubicacion.latitud.toFixed(4)}, {alerta.ubicacion.longitud.toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {alerta.estado === 'nueva' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(alerta.id, 'en_proceso')}
                          className="btn btn-sm btn-secondary"
                        >
                          <FiClock className="w-4 h-4" />
                          En Proceso
                        </button>
                        <button
                          onClick={() => handleStatusChange(alerta.id, 'atendida')}
                          className="btn btn-sm btn-success"
                        >
                          <FiCheck className="w-4 h-4" />
                          Resolver
                        </button>
                      </>
                    )}
                    {alerta.estado === 'en_proceso' && (
                      <button
                        onClick={() => handleStatusChange(alerta.id, 'atendida')}
                        className="btn btn-sm btn-success"
                      >
                        <FiCheck className="w-4 h-4" />
                        Completar
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange(alerta.id, 'descartada')}
                      className="btn btn-sm btn-secondary"
                    >
                      <FiX className="w-4 h-4" />
                      Descartar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado vacío */}
      {filteredAlertas.length === 0 && (
        <div className="text-center py-12">
          <FiCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas</h3>
          <p className="text-gray-500">
            No se encontraron alertas con los filtros seleccionados
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;