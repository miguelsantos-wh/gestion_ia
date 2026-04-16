import { useState } from 'react';
import { BarChart3, Users, Grid3x3, Eye, BarChart2, User, CheckCircle2, Clock, UserX } from 'lucide-react';
import { EMPLOYEES, BOX_CONFIGS } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { useEvaluationStore } from '../context/EvaluationContext';
import { deriveBoxFromPerceptions, deriveBoxFromAutoPercepcion } from '../utils/evaluationDerivation';
import OverviewView from './OverviewView';
import EmployeeAdminPanel from './EmployeeAdminPanel';
import IndividualView from './IndividualView';
import type { PerceptionPlacement } from '../types/evaluation';

type EmpleadoATab = 'resumen' | 'colaboradores' | 'matriz' | 'resultados';

const ADMIN_TABS: { id: EmpleadoATab; label: string; icon: React.ReactNode }[] = [
  { id: 'resumen', label: 'Resumen', icon: <BarChart3 size={16} /> },
  { id: 'colaboradores', label: 'Colaboradores', icon: <Users size={16} /> },
  { id: 'matriz', label: 'Matriz 9-Box', icon: <Grid3x3 size={16} /> },
  { id: 'resultados', label: 'Resultados', icon: <Eye size={16} /> },
];

const PERF_ORDER = ['low', 'medium', 'high'] as const;
const POT_ORDER = ['high', 'medium', 'low'] as const;

function PercepcionRespondentsList({ employeeId }: { employeeId: string }) {
  const { percepcion, autoPercepcion, eval360Assignments, threeSixty } = useEvaluationStore();
  const percList: PerceptionPlacement[] = percepcion[employeeId] ?? [];
  const autoPerc = autoPercepcion[employeeId];
  const assignments360 = eval360Assignments.filter(a => a.targetEmployeeId === employeeId);
  const peers360 = threeSixty[employeeId]?.peers ?? [];
  const hasSelf360 = !!threeSixty[employeeId]?.self;

  const hasAnyData = percList.length > 0 || autoPerc || assignments360.length > 0 || peers360.length > 0;

  if (!hasAnyData) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
        <Users size={24} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-400">Sin respuestas aún</p>
        <p className="text-xs text-gray-400 mt-1">Las encuestas contestadas aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {percList.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-teal-50 border-b border-teal-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-teal-600" />
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">Percepción externa</span>
            </div>
            <span className="text-[10px] font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
              {percList.length} respuesta{percList.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {percList.map((p, idx) => {
              const isAnon = !p.evaluatorName || p.evaluatorName === 'Anónimo';
              const emp = EMPLOYEES.find(e => e.name === p.evaluatorName);
              const boxCfg = BOX_CONFIGS.find(b => b.performanceLevel === p.performanceLevel && b.potentialLevel === p.potentialLevel);
              return (
                <div key={idx} className="px-4 py-3 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: isAnon ? '#94a3b8' : '#0d9488' }}
                  >
                    {isAnon ? <UserX size={12} /> : (emp?.avatar ?? p.evaluatorName.charAt(0).toUpperCase())}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {isAnon ? 'Anónimo' : p.evaluatorName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(p.at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {boxCfg && (
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
                      style={{ backgroundColor: boxCfg.bgColor, color: boxCfg.textColor }}
                    >
                      {boxCfg.code}
                    </span>
                  )}
                  <CheckCircle2 size={14} className="text-teal-500 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {autoPerc && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={14} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Autoevaluación 9-Box</span>
            </div>
            <CheckCircle2 size={13} className="text-blue-500" />
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <User size={12} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800">Yo (autoevaluación)</p>
              <p className="text-[10px] text-gray-400">
                {new Date(autoPerc.at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            {(() => {
              const boxCfg = BOX_CONFIGS.find(b => b.performanceLevel === autoPerc.performanceLevel && b.potentialLevel === autoPerc.potentialLevel);
              return boxCfg ? (
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
                  style={{ backgroundColor: boxCfg.bgColor, color: boxCfg.textColor }}
                >
                  {boxCfg.code}
                </span>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {assignments360.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 size={14} className="text-slate-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Evaluación 360</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {assignments360.filter(a => a.completedAt).length}/{assignments360.length} completadas
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {assignments360.map((a) => {
              const emp = EMPLOYEES.find(e => e.id === a.evaluatorEmployeeId);
              const isAnon = a.isAnonymous;
              const completed = !!a.completedAt;
              return (
                <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: isAnon ? '#94a3b8' : completed ? '#059669' : '#d97706' }}
                  >
                    {isAnon ? <UserX size={12} /> : (emp?.avatar ?? a.evaluatorName.charAt(0).toUpperCase())}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {isAnon ? 'Anónimo' : a.evaluatorName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {completed
                        ? `Completada el ${new Date(a.completedAt!).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : `Asignada el ${new Date(a.assignedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                  {completed ? (
                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  ) : (
                    <Clock size={14} className="text-amber-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
          {hasSelf360 && (
            <div className="border-t border-gray-50 px-4 py-3 flex items-center gap-3 bg-blue-50/40">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <User size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800">Autoevaluación 360</p>
                <p className="text-[10px] text-gray-400">Cuestionario completo</p>
              </div>
              <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MyResultsView({ employeeId }: { employeeId: string }) {
  const { percepcion, autoPercepcion } = useEvaluationStore();
  const percList: PerceptionPlacement[] = percepcion[employeeId] ?? [];
  const autoPerc = autoPercepcion[employeeId];
  const derived = deriveBoxFromPerceptions(percList);
  const derivedAuto = deriveBoxFromAutoPercepcion(autoPerc);
  const cfg = derived
    ? BOX_CONFIGS.find((b) => b.performanceLevel === derived.performanceLevel && b.potentialLevel === derived.potentialLevel)
    : null;
  const cfgAuto = derivedAuto
    ? BOX_CONFIGS.find((b) => b.performanceLevel === derivedAuto.performanceLevel && b.potentialLevel === derivedAuto.potentialLevel)
    : null;

  const [activeSection, setActiveSection] = useState<'resumen' | 'respuestas'>('resumen');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveSection('resumen')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSection === 'resumen' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <BarChart2 size={13} />
          Resumen
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('respuestas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSection === 'respuestas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={13} />
          Quién contestó
        </button>
      </div>

      {activeSection === 'resumen' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Percepciones recibidas</p>
              <p className="text-3xl font-black text-gray-900">{percList.length}</p>
            </div>
            <div
              className="rounded-2xl border-2 p-4 text-center"
              style={{
                backgroundColor: cfg ? cfg.bgColor : '#f0fdfa',
                borderColor: cfg ? cfg.color : '#99f6e4',
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: cfg?.color ?? '#0d9488' }}>Percepción externa</p>
              {cfg && derived ? (
                <>
                  <p className="text-2xl font-black" style={{ color: cfg.color }}>{cfg.code}</p>
                  <p className="text-xs mt-0.5" style={{ color: cfg.textColor }}>{cfg.label}</p>
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">Sin datos</p>
              )}
            </div>
            <div
              className="rounded-2xl border-2 p-4 text-center"
              style={{
                backgroundColor: cfgAuto ? cfgAuto.bgColor : '#eff6ff',
                borderColor: cfgAuto ? cfgAuto.color : '#bfdbfe',
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: cfgAuto?.color ?? '#2563eb' }}>Mi autoevaluación</p>
              {cfgAuto && derivedAuto ? (
                <>
                  <p className="text-2xl font-black" style={{ color: cfgAuto.color }}>{cfgAuto.code}</p>
                  <p className="text-xs mt-0.5" style={{ color: cfgAuto.textColor }}>{cfgAuto.label}</p>
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">No completada</p>
              )}
            </div>
          </div>

          {percList.length === 0 && !autoPerc ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BarChart2 size={24} className="text-gray-300" />
              </div>
              <h4 className="text-sm font-semibold text-gray-500">Sin evaluaciones aún</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Tus resultados aparecerán aquí una vez que recibas percepciones o completes tu autoevaluación.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Distribución de votos en la matriz</p>
                <div className="flex items-stretch gap-2">
                  <div className="flex flex-col items-center justify-center w-5 shrink-0">
                    <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                      <span className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase">Valores</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex gap-1">
                      <div className="flex flex-col justify-between w-10 shrink-0 text-right pr-1.5">
                        <span className="text-[9px] font-medium text-gray-400 py-1">Alto</span>
                        <span className="text-[9px] font-medium text-gray-400 py-1">Medio</span>
                        <span className="text-[9px] font-medium text-gray-400 py-1">Bajo</span>
                      </div>
                      <div className="flex-1 grid grid-rows-3 gap-1">
                        {POT_ORDER.map((pot) => (
                          <div key={pot} className="grid grid-cols-3 gap-1">
                            {PERF_ORDER.map((perf) => {
                              const boxCfg = BOX_CONFIGS.find((b) => b.performanceLevel === perf && b.potentialLevel === pot)!;
                              const percsHere = percList.filter((p) => p.performanceLevel === perf && p.potentialLevel === pot);
                              const autoHere = autoPerc && autoPerc.performanceLevel === perf && autoPerc.potentialLevel === pot;
                              const hasVotes = percsHere.length > 0 || autoHere;
                              return (
                                <div
                                  key={`${perf}-${pot}`}
                                  className="rounded-xl border-2 p-2 flex flex-col justify-between"
                                  style={{
                                    backgroundColor: hasVotes ? boxCfg.bgColor : '#f9fafb',
                                    borderColor: hasVotes ? boxCfg.color : '#e5e7eb',
                                    minHeight: '80px',
                                  }}
                                >
                                  <div>
                                    <span className="font-black text-sm" style={{ color: hasVotes ? boxCfg.textColor : '#d1d5db' }}>
                                      {boxCfg.code}
                                    </span>
                                    <span className="text-[9px] font-bold ml-1" style={{ color: hasVotes ? boxCfg.textColor : '#d1d5db' }}>
                                      {boxCfg.label}
                                    </span>
                                  </div>
                                  {hasVotes && (
                                    <div className="flex flex-wrap gap-0.5 mt-1">
                                      {percsHere.map((p, i) => (
                                        <div
                                          key={i}
                                          title={p.evaluatorName || 'Anónimo'}
                                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-white"
                                          style={{ backgroundColor: boxCfg.color }}
                                        >
                                          {p.evaluatorName ? p.evaluatorName[0] : '?'}
                                        </div>
                                      ))}
                                      {autoHere && (
                                        <div
                                          title="Mi autoevaluación"
                                          className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-600 border border-white"
                                        >
                                          <User size={9} className="text-white" />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex ml-10 gap-1 mt-1">
                      <div className="flex-1 grid grid-cols-3 gap-1 text-center">
                        <span className="text-[9px] font-medium text-gray-400">Bajo</span>
                        <span className="text-[9px] font-medium text-gray-400">Medio</span>
                        <span className="text-[9px] font-medium text-gray-400">Alto</span>
                      </div>
                    </div>
                    <div className="flex justify-center ml-10 mt-0.5">
                      <span className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase">Resultados</span>
                    </div>
                  </div>
                </div>
              </div>

              {cfg && cfgAuto && (
                <div className={`rounded-xl p-4 ${cfg.code === cfgAuto.code ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                  <p className={`text-sm font-bold mb-1 ${cfg.code === cfgAuto.code ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {cfg.code === cfgAuto.code ? 'Coincidencia total' : 'Brecha de percepción'}
                  </p>
                  <p className={`text-xs leading-relaxed ${cfg.code === cfgAuto.code ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {cfg.code === cfgAuto.code
                      ? 'Tu autoevaluación coincide con cómo te perciben los demás.'
                      : `Los demás te ubican en ${cfg.code} (${cfg.label}), mientras que tú te ubicaste en ${cfgAuto.code} (${cfgAuto.label}).`}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeSection === 'respuestas' && (
        <PercepcionRespondentsList employeeId={employeeId} />
      )}
    </div>
  );
}

export default function EmpleadoAPage() {
  const { currentEmployee, isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState<EmpleadoATab>('resumen');

  if (!currentEmployee) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500">No hay empleado asignado a tu cuenta.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex items-center overflow-x-auto">
            {ADMIN_TABS.filter((t) => isAdmin || (t.id !== 'colaboradores' && t.id !== 'matriz')).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                  ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}
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
          {isAdmin && activeTab === 'colaboradores' && <EmployeeAdminPanel view="empleados" />}
          {isAdmin && activeTab === 'matriz' && <IndividualView employees={EMPLOYEES} />}
          {activeTab === 'resultados' && <MyResultsView employeeId={currentEmployee.id} />}
        </div>
      </div>
    </div>
  );
}
