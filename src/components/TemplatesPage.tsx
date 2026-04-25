import { useState, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, ChevronRight, ChevronLeft, X, GripVertical,
  FileText, BookOpen, CheckCircle2, AlertCircle, Copy, Search,
} from 'lucide-react';
import { useEvaluationStore } from '../context/EvaluationContext';
import { EVALUATION_360_TEMPLATES } from '../data/evaluation360Template';
import type { CompetencyItem, EvaluationTemplate, ScaleOption } from '../types/evaluation';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function uid() {
  return `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeBlankItem(order: number): CompetencyItem {
  return {
    id: uid(),
    order,
    valueName: '',
    valueDescription: '',
    statement: '',
    options: [
      { value: 1, text: '' },
      { value: 2, text: '' },
      { value: 3, text: '' },
      { value: 4, text: '' },
      { value: 5, text: '' },
    ],
  };
}

function makeBlankTemplate(): EvaluationTemplate {
  return {
    id: uid(),
    name: '',
    description: '',
    applicableTo: '',
    items: [makeBlankItem(1)],
  };
}

/* ─── Validation ───────────────────────────────────────────────────────────── */
function validateTemplate(t: EvaluationTemplate): string[] {
  const errs: string[] = [];
  if (!t.name.trim()) errs.push('El nombre de la plantilla es requerido.');
  if (t.items.length === 0) errs.push('La plantilla debe tener al menos una pregunta.');
  t.items.forEach((item, i) => {
    if (!item.valueName.trim()) errs.push(`Pregunta ${i + 1}: falta el nombre de la competencia.`);
    if (!item.statement.trim()) errs.push(`Pregunta ${i + 1}: falta el enunciado de la pregunta.`);
    item.options.forEach((opt, oi) => {
      if (!opt.text.trim()) errs.push(`Pregunta ${i + 1}, respuesta ${oi + 1}: falta el texto.`);
    });
  });
  return errs;
}

/* ─── TemplateCard (list view) ─────────────────────────────────────────────── */
function TemplateCard({
  template,
  isBuiltin,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  template: EvaluationTemplate;
  isBuiltin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group overflow-hidden">
      {/* Color bar */}
      <div className={`h-1 w-full ${isBuiltin ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} />
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isBuiltin ? 'bg-blue-50' : 'bg-emerald-50'}`}>
            <BookOpen size={18} className={isBuiltin ? 'text-blue-500' : 'text-emerald-500'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 leading-snug">{template.name}</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                isBuiltin ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {isBuiltin ? 'Incorporada' : 'Personalizada'}
              </span>
            </div>
            {template.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{template.description}</p>
            )}
            {template.applicableTo && (
              <p className="text-[11px] text-gray-400 mt-1.5 italic">Aplica a: {template.applicableTo}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <FileText size={12} />
            <span>{template.items.length} {template.items.length === 1 ? 'pregunta' : 'preguntas'}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onDuplicate}
              title="Duplicar"
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Copy size={14} />
            </button>
            {!isBuiltin && (
              <>
                <button
                  type="button"
                  onClick={onEdit}
                  title="Editar"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  title="Eliminar"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
            {isBuiltin && (
              <button
                type="button"
                onClick={onEdit}
                title="Ver detalle"
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── OptionRow ─────────────────────────────────────────────────────────────── */
function OptionRow({
  opt,
  onChange,
}: {
  opt: ScaleOption;
  onChange: (text: string) => void;
}) {
  const colors: Record<number, { dot: string; label: string }> = {
    1: { dot: '#ef4444', label: 'Nunca / Muy bajo' },
    2: { dot: '#f97316', label: 'Pocas veces / Bajo' },
    3: { dot: '#eab308', label: 'A veces / Aceptable' },
    4: { dot: '#22c55e', label: 'Frecuentemente / Alto' },
    5: { dot: '#3b82f6', label: 'Siempre / Sobresaliente' },
  };
  const cfg = colors[opt.value];
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0"
        style={{ background: cfg.dot }}
      >
        {opt.value}
      </div>
      <span className="text-[10px] text-gray-400 w-32 shrink-0">{cfg.label}</span>
      <input
        type="text"
        value={opt.text}
        onChange={e => onChange(e.target.value)}
        placeholder={`Texto para nivel ${opt.value}…`}
        className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all bg-gray-50"
      />
    </div>
  );
}

/* ─── ItemEditor ────────────────────────────────────────────────────────────── */
function ItemEditor({
  item,
  index,
  total,
  readonly,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  item: CompetencyItem;
  index: number;
  total: number;
  readonly: boolean;
  onChange: (updated: CompetencyItem) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const updateOpt = (optValue: number, text: string) => {
    onChange({
      ...item,
      options: item.options.map(o => o.value === optValue ? { ...o, text } : o),
    });
  };

  return (
    <div className="rounded-2xl border-2 border-gray-200 overflow-hidden transition-all">
      {/* Item header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        {!readonly && (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-0.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
            >
              <ChevronLeft size={12} className="rotate-90" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="p-0.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors"
            >
              <ChevronRight size={12} className="rotate-90" />
            </button>
          </div>
        )}
        <GripVertical size={14} className="text-gray-300 shrink-0" />
        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 text-[10px] font-black flex items-center justify-center shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">
            {item.valueName || <span className="text-gray-400 font-normal italic">Sin competencia</span>}
          </p>
          <p className="text-[10px] text-gray-400 truncate">
            {item.statement || <span className="italic">Sin enunciado</span>}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!readonly && total > 1 && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight size={13} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Item body */}
      {expanded && (
        <div className="p-4 space-y-4 bg-white">
          {/* Competencia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Nombre de la competencia <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={item.valueName}
                onChange={e => onChange({ ...item, valueName: e.target.value })}
                placeholder="Ej. Liderazgo"
                disabled={readonly}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Descripción de la competencia
              </label>
              <input
                type="text"
                value={item.valueDescription}
                onChange={e => onChange({ ...item, valueDescription: e.target.value })}
                placeholder="Breve descripción de qué mide esta competencia…"
                disabled={readonly}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Pregunta */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Enunciado de la pregunta <span className="text-red-400">*</span>
            </label>
            <textarea
              value={item.statement}
              onChange={e => onChange({ ...item, statement: e.target.value })}
              placeholder="Ej. Logra contagiar entusiasmo y motivar a los demás para dar lo mejor de sí."
              rows={2}
              disabled={readonly}
              className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Respuestas */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
              Respuestas de la escala 1–5 <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {item.options.map(opt => (
                <OptionRow
                  key={opt.value}
                  opt={opt}
                  onChange={text => !readonly && updateOpt(opt.value, text)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── TemplateEditor ────────────────────────────────────────────────────────── */
function TemplateEditor({
  initial,
  readonly,
  onSave,
  onBack,
}: {
  initial: EvaluationTemplate;
  readonly: boolean;
  onSave: (t: EvaluationTemplate) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<EvaluationTemplate>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const updateItem = useCallback((idx: number, updated: CompetencyItem) => {
    setDraft(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? updated : it),
    }));
  }, []);

  const addItem = () => {
    setDraft(prev => ({
      ...prev,
      items: [...prev.items, makeBlankItem(prev.items.length + 1)],
    }));
  };

  const removeItem = (idx: number) => {
    setDraft(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, order: i + 1 })),
    }));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= draft.items.length) return;
    const items = [...draft.items];
    [items[idx], items[target]] = [items[target], items[idx]];
    setDraft(prev => ({ ...prev, items: items.map((it, i) => ({ ...it, order: i + 1 })) }));
  };

  const handleSave = () => {
    const errs = validateTemplate(draft);
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Volver al listado
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <BookOpen size={16} className="text-blue-500" />
          </div>
          <h2 className="text-base font-bold text-gray-900">
            {readonly ? 'Vista de plantilla' : initial.name ? 'Editar plantilla' : 'Nueva plantilla'}
          </h2>
          {readonly && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">Incorporada (solo lectura)</span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Nombre de la plantilla <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={draft.name}
              onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej. Competencias de liderazgo avanzado"
              disabled={readonly}
              className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Descripción
            </label>
            <textarea
              value={draft.description}
              onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
              placeholder="¿Para qué sirve esta plantilla? ¿Qué tipo de evaluación contempla?"
              rows={2}
              disabled={readonly}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Aplica a
            </label>
            <input
              type="text"
              value={draft.applicableTo}
              onChange={e => setDraft(prev => ({ ...prev, applicableTo: e.target.value }))}
              placeholder="Ej. Colaboradores con roles de equipo y líderes intermedios"
              disabled={readonly}
              className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={15} className="text-red-500 shrink-0" />
            <p className="text-xs font-bold text-red-700">Corrige los siguientes errores antes de guardar:</p>
          </div>
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-red-600 pl-5">• {e}</p>
          ))}
        </div>
      )}

      {/* Questions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">
            Preguntas <span className="text-gray-400 font-normal">({draft.items.length})</span>
          </h3>
          {!readonly && (
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
            >
              <Plus size={13} /> Agregar pregunta
            </button>
          )}
        </div>
        <div className="space-y-3">
          {draft.items.map((item, idx) => (
            <ItemEditor
              key={item.id}
              item={item}
              index={idx}
              total={draft.items.length}
              readonly={readonly}
              onChange={updated => updateItem(idx, updated)}
              onRemove={() => removeItem(idx)}
              onMoveUp={() => moveItem(idx, -1)}
              onMoveDown={() => moveItem(idx, 1)}
            />
          ))}
        </div>
      </div>

      {/* Footer actions */}
      {!readonly && (
        <div className="flex items-center justify-between pt-2 pb-6">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {saved ? <><CheckCircle2 size={15} /> Guardada</> : 'Guardar plantilla'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main TemplatesPage ─────────────────────────────────────────────────────── */
type ViewState =
  | { mode: 'list' }
  | { mode: 'new' }
  | { mode: 'edit'; template: EvaluationTemplate; readonly: boolean };

export default function TemplatesPage() {
  const { customTemplates, saveCustomTemplate, removeCustomTemplate } = useEvaluationStore();
  const [view, setView] = useState<ViewState>({ mode: 'list' });
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const allBuiltin = EVALUATION_360_TEMPLATES;
  const allCustom = customTemplates;

  const filteredBuiltin = search
    ? allBuiltin.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : allBuiltin;
  const filteredCustom = search
    ? allCustom.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : allCustom;

  const handleSave = (template: EvaluationTemplate) => {
    saveCustomTemplate(template);
    setView({ mode: 'list' });
  };

  const handleDuplicate = (template: EvaluationTemplate) => {
    const copy: EvaluationTemplate = {
      ...template,
      id: uid(),
      name: `${template.name} (copia)`,
      items: template.items.map(it => ({ ...it, id: uid() })),
    };
    saveCustomTemplate(copy);
  };

  const handleDelete = (id: string) => {
    removeCustomTemplate(id);
    setConfirmDeleteId(null);
  };

  if (view.mode === 'new') {
    return (
      <div className="max-w-3xl mx-auto">
        <TemplateEditor
          initial={makeBlankTemplate()}
          readonly={false}
          onSave={handleSave}
          onBack={() => setView({ mode: 'list' })}
        />
      </div>
    );
  }

  if (view.mode === 'edit') {
    return (
      <div className="max-w-3xl mx-auto">
        <TemplateEditor
          initial={view.template}
          readonly={view.readonly}
          onSave={handleSave}
          onBack={() => setView({ mode: 'list' })}
        />
      </div>
    );
  }

  /* ── List view ── */
  const totalCount = allBuiltin.length + allCustom.length;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 mt-0.5">{totalCount} {totalCount === 1 ? 'plantilla disponible' : 'plantillas disponibles'}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar plantilla…"
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all w-48"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setView({ mode: 'new' })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={15} /> Nueva plantilla
          </button>
        </div>
      </div>

      {/* Custom templates */}
      {filteredCustom.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Plantillas personalizadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCustom.map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                isBuiltin={false}
                onEdit={() => setView({ mode: 'edit', template: t, readonly: false })}
                onDelete={() => setConfirmDeleteId(t.id)}
                onDuplicate={() => handleDuplicate(t)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty custom state */}
      {allCustom.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200 p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <FileText size={22} className="text-blue-500" />
          </div>
          <p className="text-sm font-semibold text-blue-800 mb-1">Aún no tienes plantillas personalizadas</p>
          <p className="text-xs text-blue-600 mb-4">Crea una desde cero o duplica una de las plantillas incorporadas para comenzar.</p>
          <button
            type="button"
            onClick={() => setView({ mode: 'new' })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
          >
            <Plus size={14} /> Crear mi primera plantilla
          </button>
        </div>
      )}

      {/* Built-in templates */}
      <section>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Plantillas incorporadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBuiltin.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              isBuiltin={true}
              onEdit={() => setView({ mode: 'edit', template: t, readonly: true })}
              onDelete={() => {}}
              onDuplicate={() => handleDuplicate(t)}
            />
          ))}
        </div>
        {filteredBuiltin.length === 0 && search && (
          <p className="text-sm text-gray-400 text-center py-6">Sin resultados para "{search}"</p>
        )}
      </section>

      {/* Delete confirm modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-4">
              <Trash2 size={18} className="text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Eliminar plantilla</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Esta acción es permanente. Las sesiones que ya usaban esta plantilla no se verán afectadas.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
