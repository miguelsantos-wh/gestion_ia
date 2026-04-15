import { useState } from 'react';
import { BarChart3, Users, Grid3x3, Eye, X } from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import { useUser } from '../context/UserContext';
import OverviewView from './OverviewView';
import EmployeeAdminPanel from './EmployeeAdminPanel';
import IndividualView from './IndividualView';

type EmpleadoATab = 'resumen' | 'colaboradores' | 'matriz' | 'resultados';

const TABS: { id: EmpleadoATab; label: string; icon: React.ReactNode }[] = [
  { id: 'resumen', label: 'Resumen', icon: <BarChart3 size={16} /> },
  { id: 'colaboradores', label: 'Colaboradores', icon: <Users size={16} /> },
  { id: 'matriz', label: 'Matriz 9-Box', icon: <Grid3x3 size={16} /> },
  { id: 'resultados', label: 'Resultados', icon: <Eye size={16} /> },
];

function EmployeeProfile({ employeeId, onClose, canEdit }: { employeeId: string; onClose?: () => void; canEdit: boolean }) {
  const employee = EMPLOYEES.find(e => e.id === employeeId);
  if (!employee) return null;

  const [activeTab, setActiveTab] = useState<EmpleadoATab>('resumen');

  const displayTabs = canEdit ? TABS : TABS.filter(t => t.id !== 'colaboradores' && t.id !== 'matriz');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
              {employee.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{employee.name}</h2>
              <p className="text-sm text-gray-600">{employee.position} · {employee.department}</p>
            </div>
          </div>
        </div>
        {canEdit && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex items-center overflow-x-auto">
            {displayTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'resumen' && <OverviewView />}
          {canEdit && activeTab === 'colaboradores' && <EmployeeAdminPanel view="empleados" />}
          {canEdit && activeTab === 'matriz' && <IndividualView employees={EMPLOYEES} />}
          {activeTab === 'resultados' && <EmployeeAdminPanel view="resultados" />}
        </div>
      </div>
    </div>
  );
}

export default function EmpleadoAPage() {
  const { isAdmin, currentEmployee } = useUser();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  if (!isAdmin && currentEmployee) {
    return <EmployeeProfile employeeId={currentEmployee.id} canEdit={false} />;
  }

  if (isAdmin && selectedEmployeeId) {
    return <EmployeeProfile employeeId={selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} canEdit={true} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 mb-4">
        <h3 className="text-sm font-bold text-blue-900 mb-1">Selecciona un Empleado</h3>
        <p className="text-sm text-blue-800">Elige un empleado para ver su resumen, colaboradores, matriz 9-Box y resultados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EMPLOYEES.map((employee) => (
          <button
            key={employee.id}
            type="button"
            onClick={() => setSelectedEmployeeId(employee.id)}
            className="text-left p-4 rounded-2xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 shrink-0">
                {employee.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-blue-700 truncate">{employee.name}</div>
                <div className="text-xs text-gray-500 truncate">{employee.position}</div>
                <div className="text-xs text-gray-400 truncate">{employee.department}</div>
              </div>
            </div>
            <div className="flex gap-2 text-xs flex-wrap">
              <span className={`px-2 py-1 rounded-full font-medium ${
                employee.performanceLevel === 'high' ? 'bg-green-100 text-green-700' :
                employee.performanceLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                Rendimiento: {employee.performanceLevel === 'high' ? 'Alto' : employee.performanceLevel === 'medium' ? 'Medio' : 'Bajo'}
              </span>
              <span className={`px-2 py-1 rounded-full font-medium ${
                employee.potentialLevel === 'high' ? 'bg-purple-100 text-purple-700' :
                employee.potentialLevel === 'medium' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                Potencial: {employee.potentialLevel === 'high' ? 'Alto' : employee.potentialLevel === 'medium' ? 'Medio' : 'Bajo'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
