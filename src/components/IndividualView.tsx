import { useMemo, useState } from 'react';
import { Employee } from '../types';
import type { EvaluationLens } from '../types/evaluation';
import { BOX_CONFIGS } from '../data/mockData';
import NineBoxGrid from './NineBoxGrid';
import EmployeeDetail from './EmployeeDetail';
import { Search, Filter, Layers } from 'lucide-react';
import { useEvaluationStore } from '../context/EvaluationContext';
import { employeeForLens } from '../utils/evaluationDerivation';

interface IndividualViewProps {
  employees: Employee[];
}

const LENS_OPTIONS: { id: EvaluationLens; label: string; hint: string }[] = [
  {
    id: 'metrika',
    label: 'Metrika',
    hint: 'Combina 360 (auto + evaluadores) con KPI; los KPI definitivos se añadirán después — por ahora se mezcla con el score histórico del colaborador.',
  },
  {
    id: 'percepcion',
    label: 'Por percepción',
    hint: 'Promedio de las casillas 9-Box que otros eligieron (enlace de percepción). Si aún no hay respuestas, ves la posición del ciclo oficial.',
  },
  {
    id: 'autoevaluacion',
    label: 'Autoevaluación',
    hint: 'Solo la encuesta 360 que el colaborador completó sobre sí mismo. Si no la ha enviado, se muestra la posición del ciclo oficial.',
  },
];

function lensLabelText(lens: EvaluationLens): string {
  if (lens === 'metrika') return 'Vista: Metrika';
  if (lens === 'percepcion') return 'Vista: Percepción';
  return 'Vista: Autoevaluación';
}

export default function IndividualView({ employees }: IndividualViewProps) {
  const { threeSixty, percepcion } = useEvaluationStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [evaluationLens, setEvaluationLens] = useState<EvaluationLens>('metrika');

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const baseFiltered = useMemo(
    () =>
      employees.filter((e) => {
        const matchSearch =
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.position.toLowerCase().includes(search.toLowerCase());
        const matchDept = filterDept === 'all' || e.department === filterDept;
        return matchSearch && matchDept;
      }),
    [employees, search, filterDept]
  );

  const displayEmployees = useMemo(
    () =>
      baseFiltered.map((e) => employeeForLens(e, evaluationLens, threeSixty, percepcion)),
    [baseFiltered, evaluationLens, threeSixty, percepcion]
  );

  const selectedBase = selectedId ? employees.find((e) => e.id === selectedId) ?? null : null;
  const selectedDisplay = selectedBase
    ? employeeForLens(selectedBase, evaluationLens, threeSixty, percepcion)
    : null;

  const lensHint = LENS_OPTIONS.find((o) => o.id === evaluationLens)?.hint ?? '';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col gap-3 mb-4">
            <h3 className="text-sm font-bold text-gray-700">Matriz 9-Box (valores × resultados)</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{lensHint}</p>
          </div>
          <NineBoxGrid
            employees={displayEmployees}
            onEmployeeClick={(emp) => setSelectedId(selectedId === emp.id ? null : emp.id)}
            selectedEmployee={selectedDisplay}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col lg:flex-row gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empleado o posición..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative min-w-[180px]">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="all">Todos los departamentos</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative min-w-[220px] flex-1">
              <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={evaluationLens}
                onChange={(e) => setEvaluationLens(e.target.value as EvaluationLens)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                {LENS_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    Tipo: {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {displayEmployees.map((emp) => {
              const cfg = BOX_CONFIGS.find(
                (b) => b.potentialLevel === emp.potentialLevel && b.performanceLevel === emp.performanceLevel
              );
              const isSelected = selectedId === emp.id;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setSelectedId(isSelected ? null : emp.id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
                    ${isSelected ? 'ring-2 ring-blue-500 shadow-sm' : 'hover:bg-gray-50'}
                  `}
                  style={{ backgroundColor: isSelected ? cfg?.bgColor : '' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: cfg?.color }}
                  >
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{emp.name}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {emp.position} · {emp.department}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:block"
                      style={{ backgroundColor: cfg?.bgColor, color: cfg?.textColor }}
                    >
                      {cfg ? `${cfg.code} · ${cfg.label}` : ''}
                    </span>
                    <div className="text-right">
                      <div className="flex gap-2">
                        <div>
                          <div className="text-xs font-bold text-gray-700">{emp.performance.toFixed(1)}</div>
                          <div className="text-xs text-gray-400">result.</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-700">{emp.potential.toFixed(1)}</div>
                          <div className="text-xs text-gray-400">valor.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {displayEmployees.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">No se encontraron empleados</div>
            )}
          </div>
        </div>
      </div>

      <div className="xl:col-span-1">
        {selectedDisplay ? (
          <EmployeeDetail
            employee={selectedDisplay}
            onClose={() => setSelectedId(null)}
            lensLabel={lensLabelText(evaluationLens)}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Search size={24} className="text-gray-300" />
            </div>
            <h4 className="text-sm font-semibold text-gray-500">Selecciona un empleado</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Haz clic en un empleado de la matriz o de la lista para ver su evaluacion detallada.
            </p>
          </div>
        )}

        {!selectedDisplay && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Leyenda</h4>
            <div className="space-y-2">
              {BOX_CONFIGS.map((cfg) => (
                <div key={cfg.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: cfg.color }} />
                  <div>
                    <span className="text-xs font-semibold text-gray-700">
                      <span className="font-black">{cfg.code}</span> {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400"> — {cfg.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
