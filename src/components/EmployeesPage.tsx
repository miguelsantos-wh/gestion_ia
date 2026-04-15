import { useState } from 'react';
import { Search, X, Mail, Phone, Briefcase, Calendar, MapPin } from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar: string;
  performanceLevel: 'high' | 'medium' | 'low';
  potentialLevel: 'high' | 'medium' | 'low';
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  const departments = Array.from(new Set(EMPLOYEES.map((e) => e.department)));

  const filteredEmployees = EMPLOYEES.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || e.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const getPerformanceColor = (level: string): string => {
    if (level === 'high') return 'bg-green-50 text-green-700 border-green-200';
    if (level === 'medium') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getPerformanceLabel = (level: string): string => {
    if (level === 'high') return 'Alto';
    if (level === 'medium') return 'Medio';
    return 'Bajo';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Listado de Empleados</h2>

            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o puesto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => setDepartmentFilter('')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    !departmentFilter
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Todos
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setDepartmentFilter(dept)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      departmentFilter === dept
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredEmployees.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => setSelectedEmployee(employee)}
                className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${
                  selectedEmployee?.id === employee.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                    {employee.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{employee.name}</div>
                    <div className="text-xs text-gray-500">{employee.position}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getPerformanceColor(employee.performanceLevel)}`}>
                      {getPerformanceLabel(employee.performanceLevel)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        {selectedEmployee ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
            <div className="border-b border-gray-100 bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-6 relative">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-4 right-4 p-1 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-600" />
              </button>
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600 mb-3">
                {selectedEmployee.avatar}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{selectedEmployee.name}</h3>
              <p className="text-sm text-gray-600">{selectedEmployee.position}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Información</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Briefcase size={16} className="text-gray-400 shrink-0" />
                    <span>{selectedEmployee.department}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <MapPin size={16} className="text-gray-400 shrink-0" />
                    <span>{selectedEmployee.position}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Desempeño</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Rendimiento</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPerformanceColor(selectedEmployee.performanceLevel)}`}>
                      {getPerformanceLabel(selectedEmployee.performanceLevel)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Potencial</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getPerformanceColor(selectedEmployee.potentialLevel)}`}>
                      {getPerformanceLabel(selectedEmployee.potentialLevel)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</label>
                <button
                  type="button"
                  className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Ver Perfil Completo
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Asignar Evaluaciones
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center sticky top-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Selecciona un empleado para ver sus detalles</p>
          </div>
        )}
      </div>
    </div>
  );
}
