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
  deriveBoxFromPerceptions,
  deriveMetrikaBox,
} from '../utils/evaluationDerivation';
import { ChevronDown, ChevronUp, Copy, Link2, Trash2, ClipboardList, Eye } from 'lucide-react';

function buildHashLink(path: string, params: Record<string, string>): string {
  const q = new URLSearchParams(params).toString();
  return `${window.location.origin}${window.location.pathname}#${path}?${q}`;
}

export default function Evaluation360View() {
  const { threeSixty, percepcion, resetAll } = useEvaluationStore();
  const template = getTemplateById(DEFAULT_360_TEMPLATE_ID)!;
  const [openTpl, setOpenTpl] = useState(true);
  const [selEmp, setSelEmp] = useState(EMPLOYEES[0]?.id ?? '');

  const selfLink = useMemo(
    () => buildHashLink('/eval-360', { employeeId: selEmp, mode: 'self' }),
    [selEmp]
  );
  const peerLink = useMemo(
    () => buildHashLink('/eval-360', { employeeId: selEmp, mode: 'peer' }),
    [selEmp]
  );
  const percLink = useMemo(() => buildHashLink('/eval-percepcion', { employeeId: selEmp }), [selEmp]);

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Metrika</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Combina el resultado de la <strong>evaluación 360</strong> (autoevaluación + evaluadores) con{' '}
            <strong>KPI</strong>. Los KPI se integrarán después; por ahora se usa el score histórico del colaborador
            como sustituto.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Por percepción</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Se envía solo la <strong>matriz 9-Box</strong> (ejes valores y resultados). Cada persona indica en qué
            casilla cree que estás. Es una percepción rápida, sin ítems de encuesta.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Autoevaluación</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            El colaborador completa la misma plantilla 360 sobre sí mismo (vía enlace). Esa respuesta alimenta la vista
            &quot;Autoevaluación&quot; en Individual.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenTpl(!openTpl)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <ClipboardList size={18} className="text-indigo-700" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-gray-900">Plantillas 360</h3>
              <p className="text-xs text-gray-500">{EVALUATION_360_TEMPLATES.length} plantilla(s) · reutilizable por perfil</p>
            </div>
          </div>
          {openTpl ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>
        {openTpl && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-800">{template.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{template.description}</p>
              <p className="text-xs text-indigo-700 font-medium mt-2">Aplicable a: {template.applicableTo}</p>
            </div>
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
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Enlaces de evaluación</h3>
        <p className="text-xs text-gray-500 mb-4">
          Elige colaborador y copia el enlace. En esta demo los datos se guardan en el navegador (localStorage).
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
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

        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2 shrink-0">
              <Link2 size={14} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-700 w-36">Autoevaluación 360</span>
            </div>
            <code className="flex-1 text-[10px] sm:text-xs text-gray-600 break-all bg-white px-2 py-1.5 rounded-lg border border-gray-100">
              {selfLink}
            </code>
            <button
              type="button"
              onClick={() => copy(selfLink)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
            >
              <Copy size={12} /> Copiar
            </button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2 shrink-0">
              <Link2 size={14} className="text-violet-600" />
              <span className="text-xs font-semibold text-gray-700 w-36">Evaluador 360</span>
            </div>
            <code className="flex-1 text-[10px] sm:text-xs text-gray-600 break-all bg-white px-2 py-1.5 rounded-lg border border-gray-100">
              {peerLink}
            </code>
            <button
              type="button"
              onClick={() => copy(peerLink)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold"
            >
              <Copy size={12} /> Copiar
            </button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2 shrink-0">
              <Eye size={14} className="text-teal-600" />
              <span className="text-xs font-semibold text-gray-700 w-36">Percepción 9-Box</span>
            </div>
            <code className="flex-1 text-[10px] sm:text-xs text-gray-600 break-all bg-white px-2 py-1.5 rounded-lg border border-gray-100">
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
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">Resultados guardados (demo)</h3>
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
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 pr-3">Colaborador</th>
                <th className="pb-2 pr-3">360 auto</th>
                <th className="pb-2 pr-3">360 evaluadores</th>
                <th className="pb-2 pr-3">Metrika (aprox.)</th>
                <th className="pb-2">Percepciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {EMPLOYEES.map((emp) => {
                const d = threeSixty[emp.id];
                const p = percepcion[emp.id];
                const selfBox = deriveBoxFrom360(d, 'self');
                const allBox = deriveBoxFrom360(d, 'all');
                const meta = deriveMetrikaBox(emp, d);
                const percBox = deriveBoxFromPerceptions(p);
                return (
                  <tr key={emp.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3 font-medium">{emp.name}</td>
                    <td className="py-2 pr-3">
                      {selfBox ? (
                        <span>
                          D {selfBox.performance.toFixed(1)} / P {selfBox.potential.toFixed(1)}
                        </span>
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
                    <td className="py-2 pr-3">
                      {meta.performanceLevel}/{meta.potentialLevel}
                      <div className="text-[10px] text-gray-500">
                        D {meta.performance.toFixed(1)} · P {meta.potential.toFixed(1)}
                      </div>
                    </td>
                    <td className="py-2">
                      {p?.length ? (
                        <span>
                          {p.length} · {percBox ? `${percBox.performanceLevel}/${percBox.potentialLevel}` : '—'}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
