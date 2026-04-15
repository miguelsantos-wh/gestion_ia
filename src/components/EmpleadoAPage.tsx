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
  const { currentEmployee, isAdmin } = useUser();

  if (currentEmployee) {
    return <EmployeeProfile employeeId={currentEmployee.id} canEdit={isAdmin} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-gray-500">No hay empleado asignado a tu cuenta.</p>
    </div>
  );
}
