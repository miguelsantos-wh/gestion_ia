import { useMemo, useState } from 'react';
import { EMPLOYEES } from '../data/mockData';
import {
  DEFAULT_360_TEMPLATE_ID,
  EVALUATION_360_TEMPLATES,
  getTemplateById,
} from '../data/evaluation360Template';
import { useEvaluationStore } from '../context/EvaluationContext';
import {
  deriveBoxFrom360,
  deriveMetrikaBox,
} from '../utils/evaluationDerivation';
import { ChevronDown, ChevronUp, Copy, Link2, Trash2, ClipboardList, Eye, User, BarChart2 } from 'lucide-react';
import PercepcionResultsView from './PercepcionResultsView';

function buildHashLink(path: string, params: Record<string, string>): string {
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${window.location.pathname}#${path}?${q}`;
}

type TabId = 'enlaces' | 'resultados' | 'plantilla';

export default function Evaluation360View() {
  const { threeSixty, resetAll } = useEvaluationStore();
  const template = getTemplateById(DEFAULT_360_TEMPLATE_ID)!;
  const [openTpl, setOpenTpl] = useState(false);
  const [selEmp, setSelEmp] = useState(EMPLOYEES[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<TabId>('enlaces');

  const selfLink360 = useMemo(
    () => buildHashLink('/eval-360', { employeeId: selEmp, mode: 'self' }),
    [selEmp]
  );
  const peerLink360 = useMemo(
    () => buildHashLink('/eval-360', { employeeId: selEmp, mode: 'peer' }),
    [selEmp]
  );
  const percLink = useMemo(() => buildHashLink('/eval-percepcion', { employeeId: selEmp }), [selEmp]);
  const autoPercLink = useMemo(() => buildHashLink('/eval-autopercepcion', { employeeId: selEmp }), [selEmp]);
  const misResultadosLink = useMemo(() => buildHashLink('/mis-resultados', { employeeId: selEmp }), [selEmp]);

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
  };

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'enlaces', label: 'Generar enlaces', icon: <Link2 size={14} /> },
    { id: 'resultados', label: 'Resultados percepción', icon: <Eye size={14} /> },
    { id: 'plantilla', label: 'Plantilla 360', icon: <ClipboardList size={14} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={15} className="text-slate-600" />
            <h3 className="text-sm font-bold text-gray-900">Metrika (360)</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Combina el resultado de la <strong>evaluación 360</strong> (cuestionario completo de 11 ítems) con{' '}
            <strong>KPI histórico</strong>. Enlace de autoevaluación y evaluador.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={15} className="text-teal-600" />
            <h3 className="text-sm font-bold text-gray-900">Percepción externa</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Se envía solo la <strong>matriz 9-Box</strong>. Cada persona indica en qué casilla cree que está el colaborador.
            Sin cuestionario, solo un clic.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <User size={15} className="text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Autoevaluación</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            El colaborador se ubica en la <strong>matriz 9-Box</strong> según su propia percepción, sin cuestionario.
            Un enlace personal y privado.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'enlaces' && (
          <div className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selEmp}
                onChange={(e) => setSelEmp(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EMPLOYEES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.position}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Evaluación 360 (cuestionario)</p>

              <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 shrink-0">
                  <Link2 size={14} className="text-slate-600" />
                  <span className="text-xs font-semibold text-gray-700 w-40">Autoevaluación 360</span>
                </div>
                <code className="flex-1 text-[10px] sm:text-xs text-gray-600 break-all bg-white px-2 py-1.5 rounded-lg border border-gray-100">
                  {selfLink360}
                </code>
                <button
                  type="button"
                  onClick={() => copy(selfLink360)}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold"
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 shrink-0">
                  <Link2 size={14} className="text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700 w-40">Evaluador 360</span>
                </div>
                <code className="flex-1 text-[10px] sm:text-xs text-gray-600 break-all bg-white px-2 py-1.5 rounded-lg border border-gray-100">
                  {peerLink360}
                </code>
                <button
                  type="button"
                  onClick={() => copy(peerLink360)}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-600 text-white text-xs font-semibold"
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Percepción 9-Box (sin cuestionario)</p>

              <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 rounded-xl bg-teal-50 border border-teal-100">
                <div className="flex items-center gap-2 shrink-0">
                  <Eye size={14} className="text-teal-600" />
                  <span className="text-xs font-semibold text-gray-700 w-40">Percepción externa</span>
                </div>
                <code className="flex-1 text-[10px] sm:text-xs text-gray-600 break-all bg-white px-2 py-1.5 rounded-lg border border-teal-100">
                  {percLink}
                </code>
                <button
                  type="button"
                  onClick={() => copy(percLink)}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold"
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 shrink-0">
                  <User size={14} className="text-blue-600" />
                  <span className="text-xs font-semibold text-gray-700 w-40">Autoevaluación 9-Box</span>
                </div>
                <code className="flex-1 text-[10px] sm:text-xs text-gray-600 break-all bg-white px-2 py-1.5 rounded-lg border border-blue-100">
                  {autoPercLink}
                </code>
                <button
                  type="button"
                  onClick={() => copy(autoPercLink)}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Enlace personal del colaborador</p>
              <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2 shrink-0">
                  <BarChart2 size={14} className="text-amber-600" />
                  <span className="text-xs font-semibold text-gray-700 w-40">Ver mis resultados</span>
                </div>
                <code className="flex-1 text-[10px] sm:text-xs text-gray-600 break-all bg-white px-2 py-1.5 rounded-lg border border-amber-100">
                  {misResultadosLink}
                </code>
                <button
                  type="button"
                  onClick={() => copy(misResultadosLink)}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold"
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Comparte este enlace con el colaborador para que pueda ver cómo lo perciben otros y cómo se ve a sí mismo.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'resultados' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div />
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Borrar todas las evaluaciones y percepciones de este navegador?')) resetAll();
                }}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} /> Limpiar datos
              </button>
            </div>
            <PercepcionResultsView />

            {Object.keys(threeSixty).length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Evaluaciones 360 (cuestionario)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-2 pr-3">Colaborador</th>
                        <th className="pb-2 pr-3">360 auto</th>
                        <th className="pb-2 pr-3">360 evaluadores</th>
                        <th className="pb-2">Metrika (aprox.)</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {EMPLOYEES.filter((emp) => threeSixty[emp.id]).map((emp) => {
                        const d = threeSixty[emp.id];
                        const selfBox = deriveBoxFrom360(d, 'self');
                        const allBox = deriveBoxFrom360(d, 'all');
                        const meta = deriveMetrikaBox(emp, d);
                        return (
                          <tr key={emp.id} className="border-b border-gray-50">
                            <td className="py-2 pr-3 font-medium">{emp.name}</td>
                            <td className="py-2 pr-3">
                              {selfBox ? (
                                <span>D {selfBox.performance.toFixed(1)} / P {selfBox.potential.toFixed(1)}</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-2 pr-3">
                              {d && d.peers.length > 0 ? (
                                <span>{d.peers.length} respuesta(s)</span>
                              ) : (
                                <span className="text-gray-400">0</span>
                              )}
                              {allBox && (d?.self || (d?.peers?.length ?? 0) > 0) && (
                                <div className="text-[10px] text-gray-500">
                                  prom. D {allBox.performance.toFixed(1)} / P {allBox.potential.toFixed(1)}
                                </div>
                              )}
                            </td>
                            <td className="py-2">
                              {meta.performanceLevel}/{meta.potentialLevel}
                              <div className="text-[10px] text-gray-500">
                                D {meta.performance.toFixed(1)} · P {meta.potential.toFixed(1)}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plantilla' && (
          <div className="p-5">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-gray-800">{template.name}</h4>
                <button
                  type="button"
                  onClick={() => setOpenTpl(!openTpl)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  {openTpl ? <><ChevronUp size={14} /> Colapsar</> : <><ChevronDown size={14} /> Expandir</>}
                </button>
              </div>
              <p className="text-xs text-gray-500">{template.description}</p>
              <p className="text-xs text-blue-700 font-medium mt-1">Aplicable a: {template.applicableTo}</p>
              <p className="text-xs text-gray-400 mt-1">{EVALUATION_360_TEMPLATES.length} plantilla(s) disponible(s)</p>
            </div>
            {openTpl && (
              <ol className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {template.items.map((it) => (
                  <li key={it.id} className="text-xs text-gray-700 border border-gray-100 rounded-xl p-3 bg-gray-50/80">
                    <span className="font-semibold text-gray-900">
                      {it.order}. {it.statement}
                    </span>
                    <ul className="mt-2 space-y-1 text-gray-500 list-disc list-inside">
                      {it.options.map((o) => (
                        <li key={o.value}>
                          {o.value}) {o.text}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
