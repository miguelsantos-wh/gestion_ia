import { useState } from 'react';
import { Clock, Eye, X } from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import { useUser } from '../context/UserContext';
import PendingAciertosDesaciertos from './PendingAciertosDesaciertos';

type AciertosTab = 'pendientes' | 'resultados';

function AciertosProfileView({ employeeId, onClose, canEdit }: { employeeId: string; onClose?: () => void; canEdit: boolean }) {
  const employee = EMPLOYEES.find(e => e.id === employeeId);
  if (!employee) return null;

  const [activeTab, setActiveTab] = useState<AciertosTab>('pendientes');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
            {employee.avatar}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{employee.name}</h2>
            <p className="text-sm text-gray-600">{employee.position} · {employee.department}</p>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
          <div className="text-xs font-semibold text-orange-600 mb-1">Estado Aciertos</div>
          <div className="text-lg font-bold text-orange-900">Pendiente</div>
        </div>
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
          <div className="text-xs font-semibold text-amber-600 mb-1">Estado Desaciertos</div>
          <div className="text-lg font-bold text-amber-900">Pendiente</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex items-center overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('pendientes')}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${
                  activeTab === 'pendientes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Clock size={16} />
              Pendientes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resultados')}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${
                  activeTab === 'resultados'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Eye size={16} />
              Resultados
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'pendientes' && <PendingAciertosDesaciertos />}
          {activeTab === 'resultados' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Eye size={28} className="text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-gray-700 mb-2">Resultados Aciertos y Desaciertos</h3>
              <p className="text-sm text-gray-400 max-w-xs">Los resultados se mostrarán aquí una vez completadas las evaluaciones.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AciertosDesaciertosPage() {
  const { currentEmployee, isAdmin } = useUser();

  if (currentEmployee) {
    return <AciertosProfileView employeeId={currentEmployee.id} canEdit={isAdmin} />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-gray-500">No hay empleado asignado a tu cuenta.</p>
    </div>
  );
}
