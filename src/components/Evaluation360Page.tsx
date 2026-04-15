import { useState } from 'react';
import { BarChart3, Eye, Clock, X } from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import Evaluation360View from './Evaluation360View';
import Evaluation360Results from './Evaluation360Results';
import PendingEvaluations360 from './PendingEvaluations360';

type Eval360Tab = 'asignar' | 'resultados' | 'pendientes';

function Eval360ProfileView({ employeeId, onClose }: { employeeId: string; onClose: () => void }) {
  const employee = EMPLOYEES.find(e => e.id === employeeId);
  if (!employee) return null;

  const [activeTab, setActiveTab] = useState<Eval360Tab>('asignar');

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
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
          <div className="text-xs font-semibold text-blue-600 mb-1">Estado</div>
          <div className="text-lg font-bold text-blue-900">Pendiente</div>
        </div>
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
          <div className="text-xs font-semibold text-purple-600 mb-1">Evaluadores</div>
          <div className="text-lg font-bold text-purple-900">3</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex items-center overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('asignar')}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${
                  activeTab === 'asignar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <BarChart3 size={16} />
              Asignar
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
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'asignar' && <Evaluation360View />}
          {activeTab === 'resultados' && <Evaluation360Results />}
          {activeTab === 'pendientes' && <PendingEvaluations360 />}
        </div>
      </div>
    </div>
  );
}

function Eval360Summary() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
        <h3 className="text-sm font-bold text-blue-900 mb-1">Evaluación 360</h3>
        <p className="text-sm text-blue-800">Selecciona un colaborador para asignar evaluaciones, ver resultados y seguimiento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EMPLOYEES.map((employee) => (
          <a
            key={employee.id}
            href={`#eval360-${employee.id}`}
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
              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium group-hover:bg-blue-200">
                Estado: Pendiente
              </span>
              <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium group-hover:bg-purple-200">
                3 Evaluadores
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Evaluation360Page() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  if (selectedEmployeeId) {
    return <Eval360ProfileView employeeId={selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} />;
  }

  return (
    <div className="space-y-6">
      <Eval360Summary />
    </div>
  );
}
