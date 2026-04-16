import { Target, Handshake, ClipboardCheck, CheckCircle, Clock, CreditCard as Edit2, User, Building2 } from 'lucide-react';
import type { AciertosSession, Compromiso } from '../../types/aciertos';
import { EMPLOYEES } from '../../data/mockData';

function SectionHeader({ color, title, icon: Icon }: { color: string; title: string; icon: React.ElementType }) {
  return (
    <div className="text-white text-center py-2.5 px-4 rounded-t-2xl" style={{ backgroundColor: color }}>
      <p className="text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
        <Icon size={13} />
        {title}
      </p>
    </div>
  );
}

function BulletList({ items, color, emptyText }: { items: string[]; color: string; emptyText: string }) {
  if (items.length === 0) return <p className="text-xs text-gray-400 italic">{emptyText}</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5" style={{ backgroundColor: color }}>
            {i + 1}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
        </li>
      ))}
    </ul>
  );
}

function CompromisoTable({ tipo, compromisos }: { tipo: 'colaborador' | 'empresa'; compromisos: Compromiso[] }) {
  const color = tipo === 'colaborador' ? '#0d9488' : '#2563eb';
  const label = tipo === 'colaborador' ? 'Colaborador' : 'Empresa';
  const Icon = tipo === 'colaborador' ? User : Building2;
  const filtered = compromisos.filter((c) => c.tipo === tipo);

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
          <Icon size={12} className="text-white" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{label}</p>
      </div>
      {filtered.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Sin compromisos registrados</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((c, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-3">
              <p className="text-sm text-gray-700 leading-relaxed mb-1.5">{c.descripcion}</p>
              {c.fecha && (
                <p className="text-[11px] font-semibold" style={{ color }}>
                  Fecha compromiso: {new Date(c.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface AciertosSessionViewProps {
  session: AciertosSession;
  onEdit?: () => void;
}

export default function AciertosSessionView({ session, onEdit }: AciertosSessionViewProps) {
  const evaluator = EMPLOYEES.find((e) => e.id === session.evaluator_employee_id);
  const target = EMPLOYEES.find((e) => e.id === session.target_employee_id);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={session.status === 'completed'
                ? { backgroundColor: '#d1fae5', color: '#065f46' }
                : { backgroundColor: '#fef3c7', color: '#92400e' }}
            >
              {session.status === 'completed' ? <CheckCircle size={11} /> : <Clock size={11} />}
              {session.status === 'completed' ? 'Completada' : 'Borrador'}
            </span>
            <span className="text-sm font-bold text-gray-800">{session.period}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {target && `Colaborador: ${target.name}`}
            {evaluator && ` · Evaluador: ${evaluator.name}`}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {new Date(session.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {onEdit && session.status !== 'completed' && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            <Edit2 size={12} />
            Editar
          </button>
        )}
      </div>

      <div className="rounded-2xl border-2 border-blue-100 overflow-hidden">
        <SectionHeader color="#2563eb" title="Resultados" icon={Target} />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50">
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Resultado Actual</p>
            <p className="text-sm text-gray-800 leading-relaxed bg-white rounded-xl p-3 border border-blue-100">{session.resultado_actual || <span className="text-gray-300 italic">Sin datos</span>}</p>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-700 font-black text-[10px]">VS</span>
              </div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Objetivo</p>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed bg-white rounded-xl p-3 border border-blue-100 flex-1">{session.resultado_objetivo || <span className="text-gray-300 italic">Sin datos</span>}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-teal-100 overflow-hidden">
        <SectionHeader color="#0d9488" title="Escucha y Compromisos" icon={Handshake} />
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-teal-100 bg-teal-50">
          <div className="p-5 space-y-5">
            <div>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-3">Aciertos · Colaborador</p>
              <BulletList items={session.aciertos_colaborador} color="#0d9488" emptyText="Sin aciertos registrados" />
            </div>
            <div className="border-t border-teal-100 pt-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-3">Desaciertos · Colaborador</p>
              <BulletList items={session.desaciertos_colaborador} color="#b45309" emptyText="Sin desaciertos registrados" />
            </div>
          </div>
          <div className="p-5">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">Retroalimentación · Empresa</p>
            <BulletList items={session.retroalimentacion_empresa} color="#2563eb" emptyText="Sin retroalimentación registrada" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-amber-100 overflow-hidden">
        <SectionHeader color="#d97706" title="Compromisos de Ambas Partes" icon={ClipboardCheck} />
        <div className="p-5 bg-amber-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CompromisoTable tipo="colaborador" compromisos={session.compromisos} />
            <CompromisoTable tipo="empresa" compromisos={session.compromisos} />
          </div>
        </div>
      </div>
    </div>
  );
}
