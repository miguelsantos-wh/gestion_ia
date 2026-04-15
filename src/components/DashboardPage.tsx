import { BarChart3, Users, Star, TrendingUp, TrendingDown, ChevronUp } from 'lucide-react';
import { EMPLOYEES, BOX_CONFIGS } from '../data/mockData';
import { useEvaluationStore } from '../context/EvaluationContext';

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-xs font-medium text-gray-500">{label}</div>
        <div className="text-2xl font-bold text-gray-900 mt-0.5">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { percepcion, autoPercepcion } = useEvaluationStore();

  const total = EMPLOYEES.length;
  const departments = Array.from(new Set(EMPLOYEES.map((e) => e.department)));

  const estrellas = EMPLOYEES.filter((e) => e.performanceLevel === 'high' && e.potentialLevel === 'high').length;
  const altoValores = EMPLOYEES.filter((e) => e.potentialLevel === 'high').length;
  const altoResultados = EMPLOYEES.filter((e) => e.performanceLevel === 'high').length;
  const bajoRendimiento = EMPLOYEES.filter((e) => e.performanceLevel === 'low' && e.potentialLevel === 'low').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<Users size={18} />} label="Total Colaboradores" value={total} sub="registrados en el sistema" color="#2563eb" />
        <StatCard icon={<Star size={18} />} label="Estrellas" value={estrellas} sub="alto potencial · alto rendimiento" color="#d97706" />
        <StatCard icon={<ChevronUp size={18} />} label="Alto Valores" value={altoValores} sub="potencial alto" color="#059669" />
        <StatCard icon={<TrendingUp size={18} />} label="Alto Resultados" value={altoResultados} sub="rendimiento alto" color="#0d9488" />
        <StatCard icon={<TrendingDown size={18} />} label="Bajo Rendimiento" value={bajoRendimiento} sub="bajo potencial · bajo rendimiento" color="#dc2626" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Estado por área</h3>
          <div className="space-y-3">
            {departments.map((dept) => {
              const emps = EMPLOYEES.filter((e) => e.department === dept);
              const evaluated = emps.filter(
                (e) => (percepcion[e.id]?.length ?? 0) > 0 || !!autoPercepcion[e.id]
              ).length;
              const pct = emps.length > 0 ? (evaluated / emps.length) * 100 : 0;
              return (
                <div key={dept} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{dept.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-28 shrink-0">{dept}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : pct > 0 ? '#2563eb' : '#e5e7eb' }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-10 text-right">{evaluated}/{emps.length}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Colaboradores</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {EMPLOYEES.map((e) => {
              const hasPerc = (percepcion[e.id]?.length ?? 0) > 0;
              const hasAuto = !!autoPercepcion[e.id];
              return (
                <div key={e.id} className="flex items-center gap-3 py-1.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {e.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{e.name}</div>
                    <div className="text-xs text-gray-400 truncate">{e.position}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {hasPerc ? (
                      <span className="text-xs bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-2 py-0.5 font-medium">
                        {percepcion[e.id].length} perc.
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-50 text-gray-400 border border-gray-100 rounded-full px-2 py-0.5">sin perc.</span>
                    )}
                    {hasAuto ? (
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2 py-0.5 font-medium">auto</span>
                    ) : (
                      <span className="text-xs bg-gray-50 text-gray-400 border border-gray-100 rounded-full px-2 py-0.5">sin auto</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Definición de Cuadrantes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BOX_CONFIGS.map((cfg) => (
            <div
              key={cfg.id}
              className="rounded-xl p-4 border"
              style={{ backgroundColor: cfg.bgColor, borderColor: `${cfg.color}30` }}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="text-lg font-black" style={{ color: cfg.textColor }}>{cfg.code}</span>
                <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.label}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">{cfg.description}</p>
              <ul className="text-xs text-gray-700 leading-relaxed mb-2 list-disc pl-4 space-y-0.5">
                {cfg.detailBullets.map((line, i) => (
                  <li key={`${cfg.id}-b${i}`}>{line}</li>
                ))}
              </ul>
              <p className="text-xs font-medium" style={{ color: cfg.textColor }}>{cfg.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
