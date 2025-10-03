import React, { useState } from 'react';
import { FiDownload, FiCalendar, FiFileText, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';

const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('animales');
  const [dateRange, setDateRange] = useState({
    inicio: '2025-10-01',
    fin: '2025-10-03'
  });

  const reportTypes = [
    {
      id: 'animales',
      title: 'Reporte de Animales',
      description: 'Información detallada del ganado',
      icon: FiBarChart2,
      color: 'blue'
    },
    {
      id: 'alertas',
      title: 'Reporte de Alertas',
      description: 'Historial de alertas y eventos',
      icon: FiTrendingUp,
      color: 'red'
    },
    {
      id: 'actividad',
      title: 'Reporte de Actividad',
      description: 'Patrones de movimiento y comportamiento',
      icon: FiPieChart,
      color: 'green'
    },
    {
      id: 'telemetria',
      title: 'Reporte de Telemetría',
      description: 'Datos técnicos de sensores',
      icon: FiFileText,
      color: 'purple'
    }
  ];

  const generatedReports = [
    {
      id: 1,
      nombre: 'Reporte Mensual de Animales - Octubre 2025',
      tipo: 'animales',
      fechaGeneracion: '2025-10-03 14:30',
      tamaño: '2.4 MB',
      formato: 'PDF'
    },
    {
      id: 2,
      nombre: 'Alertas Críticas - Semana 40',
      tipo: 'alertas',
      fechaGeneracion: '2025-10-02 10:15',
      tamaño: '1.8 MB',
      formato: 'CSV'
    },
    {
      id: 3,
      nombre: 'Análisis de Actividad - Septiembre 2025',
      tipo: 'actividad',
      fechaGeneracion: '2025-10-01 16:45',
      tamaño: '3.2 MB',
      formato: 'PDF'
    }
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  };

  const handleGenerateReport = () => {
    console.log('Generando reporte:', selectedReport, dateRange);
    // Aquí iría la lógica para generar el reporte
  };

  const handleDownloadReport = (reportId: number) => {
    console.log('Descargando reporte:', reportId);
    // Aquí iría la lógica para descargar el reporte
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes e Informes</h1>
        <p className="text-gray-600">Genera y descarga reportes del sistema</p>
      </div>

      {/* Generador de reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuración del reporte */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Generar Nuevo Reporte</h3>
            </div>
            <div className="card-body space-y-6">
              {/* Tipos de reporte */}
              <div>
                <label className="form-label">Tipo de Reporte</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedReport(type.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          selectedReport === type.id
                            ? 'border-primary-color bg-primary-light'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colorClasses[type.color]}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{type.title}</h4>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rango de fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Fecha de Inicio</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      className="form-input pl-10"
                      value={dateRange.inicio}
                      onChange={(e) => setDateRange({ ...dateRange, inicio: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Fecha de Fin</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      className="form-input pl-10"
                      value={dateRange.fin}
                      onChange={(e) => setDateRange({ ...dateRange, fin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Opciones adicionales */}
              <div>
                <label className="form-label">Formato de Exportación</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="formato" value="pdf" defaultChecked />
                    <FiFileText className="w-5 h-5 text-red-600" />
                    <span>PDF</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="formato" value="csv" />
                    <FiBarChart2 className="w-5 h-5 text-green-600" />
                    <span>CSV</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="formato" value="excel" />
                    <FiFileText className="w-5 h-5 text-blue-600" />
                    <span>Excel</span>
                  </label>
                </div>
              </div>

              {/* Botón de generación */}
              <button 
                onClick={handleGenerateReport}
                className="btn btn-primary w-full btn-lg"
              >
                <FiDownload className="w-5 h-5" />
                Generar y Descargar Reporte
              </button>
            </div>
          </div>
        </div>

        {/* Vista previa y estadísticas */}
        <div className="space-y-6">
          {/* Vista previa */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Vista Previa</h3>
            </div>
            <div className="card-body">
              <div className="text-center py-8">
                <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Selecciona los parámetros para generar la vista previa
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Estadísticas del Período</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Animales:</span>
                <span className="font-medium">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alertas Generadas:</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Datos de Telemetría:</span>
                <span className="font-medium">15,632</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Eventos Registrados:</span>
                <span className="font-medium">1,234</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reportes generados anteriormente */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-900">Reportes Generados</h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre del Reporte</th>
                  <th>Tipo</th>
                  <th>Fecha de Generación</th>
                  <th>Tamaño</th>
                  <th>Formato</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {generatedReports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <div className="font-medium text-gray-900">{report.nombre}</div>
                    </td>
                    <td>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {report.tipo.charAt(0).toUpperCase() + report.tipo.slice(1)}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">{report.fechaGeneracion}</td>
                    <td className="text-sm text-gray-600">{report.tamaño}</td>
                    <td>
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                        {report.formato}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        className="btn btn-sm btn-secondary"
                      >
                        <FiDownload className="w-4 h-4" />
                        Descargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Tipos de Datos Disponibles</h3>
          </div>
          <div className="card-body">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Información de animales y collares</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Historial de alertas y eventos</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Datos de ubicación y movimiento</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Métricas de rendimiento del sistema</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Programación Automática</h3>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-600 mb-4">
              Configura la generación automática de reportes periódicos.
            </p>
            <button className="btn btn-secondary w-full">
              Configurar Reportes Automáticos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;