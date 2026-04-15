import { CheckCircle2, Clock, Users } from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';

interface EvaluationAssignment {
  id: string;
  evaluatedEmployee: string;
  evaluatedPosition: string;
  autoEvaluation: boolean;
  leaderEvaluation: string | null;
  peerEvaluation: string | null;
  collaboratorEvaluation: string | null;
  clientEvaluation: string | null;
  status: 'pending' | 'completed' | 'partial';
}

const MOCK_EVALUATIONS: EvaluationAssignment[] = [
  {
    id: '1',
    evaluatedEmployee: 'Empleado A',
    evaluatedPosition: 'Gerente de Ventas',
    autoEvaluation: true,
    leaderEvaluation: 'Juan García',
    peerEvaluation: 'María López',
    collaboratorEvaluation: null,
    clientEvaluation: 'Cliente X',
    status: 'partial',
  },
  {
    id: '2',
    evaluatedEmployee: 'Empleado B',
    evaluatedPosition: 'Asistente Administrativo',
    autoEvaluation: false,
    leaderEvaluation: 'Carlos Rodríguez',
    peerEvaluation: null,
    collaboratorEvaluation: 'Ana Martínez',
    clientEvaluation: null,
    status: 'pending',
  },
  {
    id: '3',
    evaluatedEmployee: 'Empleado C',
    evaluatedPosition: 'Especialista en Marketing',
    autoEvaluation: true,
    leaderEvaluation: 'Laura Fernández',
    peerEvaluation: 'David Sánchez',
    collaboratorEvaluation: 'Patricia Gómez',
    clientEvaluation: 'Cliente Y',
    status: 'completed',
  },
];

function getStatusColor(status: string): string {
  if (status === 'completed') return 'bg-green-50 border-green-100';
  if (status === 'partial') return 'bg-yellow-50 border-yellow-100';
  return 'bg-red-50 border-red-100';
}

function getStatusLabel(status: string): string {
  if (status === 'completed') return 'Completada';
  if (status === 'partial') return 'Parcial';
  return 'Pendiente';
}

function getStatusIcon(status: string) {
  if (status === 'completed') return <CheckCircle2 size={16} className="text-green-600" />;
  if (status === 'partial') return <Clock size={16} className="text-yellow-600" />;
  return <Clock size={16} className="text-red-600" />;
}

export default function PendingEvaluations360() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">Colaborador Evaluado</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700">Autoevaluación</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">Evaluación por Líder</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">Evaluación Colaborador</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">Evaluación Par</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700">Evaluación Cliente</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-700">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_EVALUATIONS.map((evaluation) => (
                <tr key={evaluation.id} className={`${getStatusColor(evaluation.status)} border-transparent`}>
                  <td className="px-5 py-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{evaluation.evaluatedEmployee}</div>
                      <div className="text-xs text-gray-500">{evaluation.evaluatedPosition}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {evaluation.autoEvaluation ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        <CheckCircle2 size={14} />
                        Completada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                        <Clock size={14} />
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {evaluation.leaderEvaluation ? (
                      <span className="text-sm text-gray-700">{evaluation.leaderEvaluation}</span>
                    ) : (
                      <span className="text-sm text-gray-400">No asignada</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {evaluation.collaboratorEvaluation ? (
                      <span className="text-sm text-gray-700">{evaluation.collaboratorEvaluation}</span>
                    ) : (
                      <span className="text-sm text-gray-400">No asignada</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {evaluation.peerEvaluation ? (
                      <span className="text-sm text-gray-700">{evaluation.peerEvaluation}</span>
                    ) : (
                      <span className="text-sm text-gray-400">No asignada</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {evaluation.clientEvaluation ? (
                      <span className="text-sm text-gray-700">{evaluation.clientEvaluation}</span>
                    ) : (
                      <span className="text-sm text-gray-400">No asignada</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(evaluation.status)}
                      <span className="text-xs font-medium text-gray-700">{getStatusLabel(evaluation.status)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl border border-green-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-green-900 mb-1">Completadas</div>
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-xs text-green-600 mt-0.5">Todas las evaluaciones realizadas</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-yellow-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-yellow-900 mb-1">Parciales</div>
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <div className="text-xs text-yellow-600 mt-0.5">Algunas evaluaciones pendientes</div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-red-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-red-900 mb-1">Pendientes</div>
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-xs text-red-600 mt-0.5">Todas las evaluaciones por hacer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
