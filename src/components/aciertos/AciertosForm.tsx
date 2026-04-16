import { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft, Save, Send, Target, Handshake, ClipboardCheck, AlertCircle } from 'lucide-react';
import type { Employee } from '../../types';
import type { AciertosSession, Compromiso } from '../../types/aciertos';
import { createSession, updateSession } from '../../lib/aciertosService';

interface AciertosFormProps {
  evaluator: Employee;
  target: Employee;
  existingSession?: AciertosSession;
  onSaved: (session: AciertosSession) => void;
  onCancel: () => void;
}

type Step = 1 | 2 | 3;

const STEP_CONFIG = [
  { step: 1 as Step, label: 'Resultados', icon: Target, color: '#0369a1' },
  { step: 2 as Step, label: 'Escucha y Compromisos', icon: Handshake, color: '#0d9488' },
  { step: 3 as Step, label: 'Compromisos Finales', icon: ClipboardCheck, color: '#d97706' },
];

function ListEditor({
  label,
  hint,
  items,
  onChange,
  color,
  placeholder,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  color: string;
  placeholder: string;
}) {
  const add = () => onChange([...items, '']);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) => onChange(items.map((item, idx) => (idx === i ? val : item)));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{label}</p>
          {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white transition-all hover:opacity-90"
          style={{ backgroundColor: color }}
        >
          <Plus size={11} />
          Agregar
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <div
            className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:opacity-80 transition-opacity"
            style={{ borderColor: `${color}40` }}
            onClick={add}
          >
            <p className="text-xs text-gray-400">Haz clic para agregar el primer elemento</p>
          </div>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-2"
              style={{ backgroundColor: color }}
            >
              {i + 1}
            </div>
            <textarea
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              rows={2}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': `${color}60` } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="mt-2 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompromisoRow({
  compromiso,
  index,
  onChange,
  onRemove,
}: {
  compromiso: Compromiso;
  index: number;
  onChange: (c: Compromiso) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_140px_auto] gap-2 items-start">
      <textarea
        value={compromiso.descripcion}
        onChange={(e) => onChange({ ...compromiso, descripcion: e.target.value })}
        placeholder="Describe el compromiso..."
        rows={2}
        className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
      />
      <input
        type="date"
        value={compromiso.fecha}
        onChange={(e) => onChange({ ...compromiso, fecha: e.target.value })}
        className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 h-10"
      />
      <button
        type="button"
        onClick={onRemove}
        className="mt-1 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export default function AciertosForm({ evaluator, target, existingSession, onSaved, onCancel }: AciertosFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState(existingSession?.period ?? '');
  const [resultadoActual, setResultadoActual] = useState(existingSession?.resultado_actual ?? '');
  const [resultadoObjetivo, setResultadoObjetivo] = useState(existingSession?.resultado_objetivo ?? '');
  const [aciertos, setAciertos] = useState<string[]>(existingSession?.aciertos_colaborador ?? []);
  const [desaciertos, setDesaciertos] = useState<string[]>(existingSession?.desaciertos_colaborador ?? []);
  const [retroEmpresa, setRetroEmpresa] = useState<string[]>(existingSession?.retroalimentacion_empresa ?? []);
  const [comprColaborador, setComprColaborador] = useState<Compromiso[]>(
    existingSession?.compromisos.filter((c) => c.tipo === 'colaborador') ?? []
  );
  const [comprEmpresa, setComprEmpresa] = useState<Compromiso[]>(
    existingSession?.compromisos.filter((c) => c.tipo === 'empresa') ?? []
  );

  const addCompromiso = (tipo: 'colaborador' | 'empresa') => {
    const c: Compromiso = { tipo, descripcion: '', fecha: '' };
    if (tipo === 'colaborador') setComprColaborador((prev) => [...prev, c]);
    else setComprEmpresa((prev) => [...prev, c]);
  };

  const updateCompromiso = (tipo: 'colaborador' | 'empresa', idx: number, c: Compromiso) => {
    if (tipo === 'colaborador') setComprColaborador((prev) => prev.map((x, i) => (i === idx ? c : x)));
    else setComprEmpresa((prev) => prev.map((x, i) => (i === idx ? c : x)));
  };

  const removeCompromiso = (tipo: 'colaborador' | 'empresa', idx: number) => {
    if (tipo === 'colaborador') setComprColaborador((prev) => prev.filter((_, i) => i !== idx));
    else setComprEmpresa((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildPayload = (status: 'draft' | 'completed') => ({
    evaluator_employee_id: evaluator.id,
    target_employee_id: target.id,
    period,
    status,
    resultado_actual: resultadoActual,
    resultado_objetivo: resultadoObjetivo,
    aciertos_colaborador: aciertos,
    desaciertos_colaborador: desaciertos,
    retroalimentacion_empresa: retroEmpresa,
    compromisos: [...comprColaborador, ...comprEmpresa],
    ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
  });

  const save = async (status: 'draft' | 'completed') => {
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload(status);
      let session: AciertosSession;
      if (existingSession) {
        session = await updateSession(existingSession.id, payload);
      } else {
        session = await createSession(payload);
      }
      onSaved(session);
    } catch (e) {
      setError('Ocurrió un error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const canAdvance = () => {
    if (step === 1) return period.trim().length > 0 && resultadoActual.trim().length > 0 && resultadoObjetivo.trim().length > 0;
    if (step === 2) return true;
    return true;
  };

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
            {target.avatar}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Evaluación: {target.name}</h3>
            <p className="text-xs text-gray-500">{target.position} · Evaluador: {evaluator.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {STEP_CONFIG.map(({ step: s, label, icon: Icon, color }, idx) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <button
                type="button"
                onClick={() => step > s || canAdvance() ? setStep(s) : undefined}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex-1 ${
                  step === s ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                style={step === s ? { backgroundColor: color } : {}}
              >
                <Icon size={12} />
                <span className="hidden sm:inline truncate">{label}</span>
                <span className="sm:hidden font-bold">{idx + 1}</span>
              </button>
              {idx < STEP_CONFIG.length - 1 && (
                <ChevronRight size={12} className="text-gray-300 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {step === 1 && (
          <>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Periodo de evaluación
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Ej: Q1 2025, Marzo 2025, Trimestre 1..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="rounded-2xl border-2 border-blue-100 bg-blue-50 overflow-hidden">
              <div className="bg-blue-600 text-white text-center py-2.5 px-4">
                <p className="text-xs font-bold uppercase tracking-widest">Empieza por los resultados</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-xs font-bold text-blue-700 uppercase tracking-wide mb-1.5">
                      Resultado Actual
                    </label>
                    <textarea
                      value={resultadoActual}
                      onChange={(e) => setResultadoActual(e.target.value)}
                      placeholder="Ej: INCREMENTO 4% MENSUAL"
                      rows={4}
                      className="w-full text-sm border border-blue-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center md:pt-5">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                      <span className="text-amber-700 font-black text-xs">VS</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-700 uppercase tracking-wide mb-1.5">
                    Objetivo
                  </label>
                  <textarea
                    value={resultadoObjetivo}
                    onChange={(e) => setResultadoObjetivo(e.target.value)}
                    placeholder="Ej: INCREMENTO 14% VENTAS TRIMESTRAL"
                    rows={4}
                    className="w-full text-sm border border-blue-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="rounded-2xl border-2 border-teal-100 bg-teal-50 overflow-hidden">
            <div className="bg-teal-600 text-white text-center py-2.5 px-4">
              <p className="text-xs font-bold uppercase tracking-widest">Escucha y genera compromisos</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-teal-100">
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-xs font-bold text-teal-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-black">C</span>
                    Aciertos y Desaciertos · Colaborador
                  </p>
                  <ListEditor
                    label="Aciertos"
                    hint="Lo que el colaborador logró bien"
                    items={aciertos}
                    onChange={setAciertos}
                    color="#0d9488"
                    placeholder="Ej: Logramos implementar las estrategias promocionales..."
                  />
                </div>
                <div className="border-t border-teal-100 pt-4">
                  <ListEditor
                    label="Desaciertos"
                    hint="Áreas de mejora identificadas"
                    items={desaciertos}
                    onChange={setDesaciertos}
                    color="#b45309"
                    placeholder="Ej: La sucursal Sur no alcanzó la cuota establecida..."
                  />
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs font-bold text-teal-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">E</span>
                  Retroalimentación · Empresa
                </p>
                <ListEditor
                  label="Retroalimentación"
                  hint="Lo que la empresa comunica al colaborador"
                  items={retroEmpresa}
                  onChange={setRetroEmpresa}
                  color="#2563eb"
                  placeholder="Ej: Reconozco el esfuerzo que has puesto en las promociones..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl border-2 border-amber-100 bg-amber-50 overflow-hidden">
            <div className="bg-amber-500 text-white text-center py-2.5 px-4">
              <p className="text-xs font-bold uppercase tracking-widest">Cuales son los compromisos de ambos</p>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-black">C</span>
                    Compromisos del Colaborador
                  </p>
                  <button
                    type="button"
                    onClick={() => addCompromiso('colaborador')}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                  >
                    <Plus size={11} />
                    Agregar
                  </button>
                </div>
                {comprColaborador.length === 0 && (
                  <div
                    className="border-2 border-dashed border-teal-200 rounded-xl p-4 text-center cursor-pointer hover:border-teal-400 transition-colors"
                    onClick={() => addCompromiso('colaborador')}
                  >
                    <p className="text-xs text-gray-400">Sin compromisos aún. Haz clic para agregar.</p>
                  </div>
                )}
                <div className="space-y-2">
                  {comprColaborador.map((c, i) => (
                    <CompromisoRow
                      key={i}
                      compromiso={c}
                      index={i}
                      onChange={(updated) => updateCompromiso('colaborador', i, updated)}
                      onRemove={() => removeCompromiso('colaborador', i)}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-amber-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">E</span>
                    Compromisos de la Empresa
                  </p>
                  <button
                    type="button"
                    onClick={() => addCompromiso('empresa')}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={11} />
                    Agregar
                  </button>
                </div>
                {comprEmpresa.length === 0 && (
                  <div
                    className="border-2 border-dashed border-blue-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => addCompromiso('empresa')}
                  >
                    <p className="text-xs text-gray-400">Sin compromisos aún. Haz clic para agregar.</p>
                  </div>
                )}
                <div className="space-y-2">
                  {comprEmpresa.map((c, i) => (
                    <CompromisoRow
                      key={i}
                      compromiso={c}
                      index={i}
                      onChange={(updated) => updateCompromiso('empresa', i, updated)}
                      onRemove={() => removeCompromiso('empresa', i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </div>

      <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>

        <div className="flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
          )}

          <button
            type="button"
            onClick={() => save('draft')}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            Guardar borrador
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => canAdvance() && setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-40"
            >
              Siguiente
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => save('completed')}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Send size={14} />
              {saving ? 'Enviando...' : 'Completar evaluación'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
