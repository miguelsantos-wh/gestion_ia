import { useState } from 'react';
import {
  User, Mail, Lock, Phone, Calendar, Search, MessageSquare, ChevronDown,
  Upload, AlertCircle, CheckCircle2, Info, AlertTriangle, Eye, EyeOff, Plus, X, Star,
} from 'lucide-react';

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function HelperText({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'error' | 'success' }) {
  const cls = variant === 'error' ? 'text-red-500' : variant === 'success' ? 'text-emerald-600' : 'text-gray-400';
  return <p className={`text-[11px] mt-1.5 ${cls}`}>{children}</p>;
}

export default function FormShowcasePage() {
  const [textVal, setTextVal] = useState('');
  const [emailVal, setEmailVal] = useState('');
  const [passwordVal, setPasswordVal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [textareaVal, setTextareaVal] = useState('');
  const [selectVal, setSelectVal] = useState('');
  const [checkA, setCheckA] = useState(false);
  const [checkB, setCheckB] = useState(true);
  const [checkC, setCheckC] = useState(false);
  const [radio, setRadio] = useState('option2');
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [toggle3, setToggle3] = useState(false);
  const [rangeVal, setRangeVal] = useState(60);
  const [tags, setTags] = useState<string[]>(['React', 'TypeScript']);
  const [tagInput, setTagInput] = useState('');
  const [rating, setRating] = useState(3);
  const [hoverRating, setHoverRating] = useState(0);
  const [fileVal, setFileVal] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const inputBase = 'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400';

  return (
    <div className="space-y-6">
      {/* Text inputs */}
      <Section title="Campos de texto" description="Variantes de inputs de una sola línea">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Default */}
          <div>
            <Label required>Nombre completo</Label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={textVal}
                onChange={e => setTextVal(e.target.value)}
                placeholder="Ej. Juan García"
                className={`${inputBase} border-gray-200 pl-9`}
              />
            </div>
            <HelperText>Ingresa tu nombre tal como aparece en tu identificación.</HelperText>
          </div>

          {/* Email */}
          <div>
            <Label required>Correo electrónico</Label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={emailVal}
                onChange={e => setEmailVal(e.target.value)}
                placeholder="correo@empresa.com"
                className={`${inputBase} border-gray-200 pl-9`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label required>Contraseña</Label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordVal}
                onChange={e => setPasswordVal(e.target.value)}
                placeholder="••••••••"
                className={`${inputBase} border-gray-200 pl-9 pr-9`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label>Teléfono</Label>
            <div className="relative flex">
              <span className="flex items-center gap-1.5 px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-xs font-medium text-gray-500 whitespace-nowrap">
                <Phone size={13} />
                +52
              </span>
              <input
                type="tel"
                placeholder="55 1234 5678"
                className={`${inputBase} border-gray-200 rounded-l-none flex-1`}
              />
            </div>
          </div>

          {/* Search */}
          <div>
            <Label>Buscar empleado</Label>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Nombre, área, puesto..."
                className={`${inputBase} border-gray-200 pl-9`}
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <Label>Fecha de nacimiento</Label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                className={`${inputBase} border-gray-200 pl-9`}
              />
            </div>
          </div>

          {/* Error state */}
          <div>
            <Label required>Campo con error</Label>
            <input
              type="text"
              defaultValue="valor incorrecto"
              className={`${inputBase} border-red-300 focus:ring-red-400/30 focus:border-red-400 bg-red-50/30`}
            />
            <HelperText variant="error">Este campo contiene un valor inválido.</HelperText>
          </div>

          {/* Success state */}
          <div>
            <Label>Campo validado</Label>
            <div className="relative">
              <input
                type="text"
                defaultValue="juan.garcia@empresa.com"
                className={`${inputBase} border-emerald-300 focus:ring-emerald-400/30 focus:border-emerald-400 pr-9`}
              />
              <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
            </div>
            <HelperText variant="success">Correo verificado correctamente.</HelperText>
          </div>

          {/* Disabled */}
          <div>
            <Label>Campo deshabilitado</Label>
            <input
              type="text"
              disabled
              defaultValue="No editable"
              className={`${inputBase} border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed`}
            />
            <HelperText>Este campo no puede modificarse.</HelperText>
          </div>

          {/* Read only */}
          <div>
            <Label>Solo lectura</Label>
            <input
              type="text"
              readOnly
              defaultValue="ID-00487-RRHH"
              className={`${inputBase} border-gray-200 bg-gray-50 text-gray-500 cursor-default select-all`}
            />
            <HelperText>Identificador generado automáticamente.</HelperText>
          </div>
        </div>
      </Section>

      {/* Textarea */}
      <Section title="Área de texto" description="Para entradas de texto multilínea">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <Label>Comentarios</Label>
            <div className="relative">
              <MessageSquare size={15} className="absolute left-3.5 top-3 text-gray-400" />
              <textarea
                rows={4}
                value={textareaVal}
                onChange={e => setTextareaVal(e.target.value)}
                placeholder="Escribe tus comentarios aquí..."
                className={`${inputBase} border-gray-200 pl-9 resize-none`}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <HelperText>Máximo 500 caracteres.</HelperText>
              <span className={`text-[11px] ${textareaVal.length > 480 ? 'text-red-500' : 'text-gray-400'}`}>
                {textareaVal.length}/500
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* Select & Combobox */}
      <Section title="Selectores" description="Listas desplegables y selección de opciones">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <Label required>Departamento</Label>
            <div className="relative">
              <select
                value={selectVal}
                onChange={e => setSelectVal(e.target.value)}
                className={`${inputBase} border-gray-200 appearance-none pr-8`}
              >
                <option value="">Selecciona un departamento</option>
                <option value="rrhh">Recursos Humanos</option>
                <option value="ti">Tecnología</option>
                <option value="finanzas">Finanzas</option>
                <option value="operaciones">Operaciones</option>
                <option value="ventas">Ventas</option>
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <Label>Ciclo de evaluación</Label>
            <div className="relative">
              <select className={`${inputBase} border-gray-200 appearance-none pr-8`} defaultValue="2024-2">
                <option value="2024-1">Enero–Junio 2024</option>
                <option value="2024-2">Julio–Diciembre 2024</option>
                <option value="2025-1">Enero–Junio 2025</option>
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Section>

      {/* Checkboxes */}
      <Section title="Casillas de verificación" description="Selección múltiple independiente">
        <div className="space-y-3">
          {[
            { label: 'Recibir notificaciones por correo', sub: 'Se enviará un aviso cuando haya una nueva asignación.', val: checkA, set: setCheckA },
            { label: 'Participar en evaluaciones 360', sub: 'Habilitado por defecto para todos los colaboradores.', val: checkB, set: setCheckB },
            { label: 'Mostrar resultados públicamente', sub: 'Tu posición en la matriz será visible para el equipo.', val: checkC, set: setCheckC },
          ].map(({ label, sub, val, set }) => (
            <label key={label} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${val ? 'bg-blue-50/60 border-blue-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
              <div className="mt-0.5 shrink-0">
                <div
                  className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all ${val ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                  onClick={() => set(!val)}
                >
                  {val && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 3.5L4 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${val ? 'text-blue-800' : 'text-gray-800'}`}>{label}</p>
                <p className={`text-xs mt-0.5 ${val ? 'text-blue-600' : 'text-gray-400'}`}>{sub}</p>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* Radio buttons */}
      <Section title="Botones de opción" description="Selección única de un conjunto de opciones">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'option1', label: 'Básico', desc: 'Evaluación de percepción 9-Box únicamente.' },
            { value: 'option2', label: 'Completo', desc: 'Percepción + Evaluación 360 + Aciertos.' },
            { value: 'option3', label: 'Personalizado', desc: 'Define qué módulos activar.' },
          ].map(opt => (
            <label
              key={opt.value}
              className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${radio === opt.value ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-100 hover:border-gray-200'}`}
              onClick={() => setRadio(opt.value)}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${radio === opt.value ? 'border-blue-500' : 'border-gray-300'}`}>
                  {radio === opt.value && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <span className={`text-sm font-bold ${radio === opt.value ? 'text-blue-800' : 'text-gray-800'}`}>{opt.label}</span>
              </div>
              <p className={`text-xs pl-6 leading-relaxed ${radio === opt.value ? 'text-blue-600' : 'text-gray-400'}`}>{opt.desc}</p>
            </label>
          ))}
        </div>
      </Section>

      {/* Toggles */}
      <Section title="Interruptores" description="Activar y desactivar opciones individuales">
        <div className="space-y-2">
          {[
            { label: 'Evaluaciones anónimas', sub: 'Los evaluadores no serán identificados.', val: toggle1, set: setToggle1 },
            { label: 'Notificaciones en tiempo real', sub: 'Recibe alertas inmediatas sobre cambios.', val: toggle2, set: setToggle2 },
            { label: 'Modo de revisión cerrada', sub: 'Solo administradores pueden ver resultados.', val: toggle3, set: setToggle3 },
          ].map(({ label, sub, val, set }) => (
            <div key={label} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
              <button
                type="button"
                onClick={() => set(!val)}
                className={`relative w-11 h-6 rounded-full transition-all shrink-0 ml-4 ${val ? 'bg-blue-500' : 'bg-gray-200'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${val ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Range slider */}
      <Section title="Control deslizante" description="Selección de valores dentro de un rango">
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Porcentaje de cumplimiento</Label>
              <span className="text-sm font-black text-blue-600">{rangeVal}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={rangeVal}
              onChange={e => setRangeVal(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-500 bg-gray-200"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${rangeVal}%, #e5e7eb ${rangeVal}%)`,
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">0%</span>
              <span className="text-[10px] text-gray-400">50%</span>
              <span className="text-[10px] text-gray-400">100%</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Star rating */}
      <Section title="Calificación por estrellas" description="Escala visual de valoración">
        <div className="space-y-4">
          <div>
            <Label>¿Qué tan útil fue esta evaluación?</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={28}
                    className="transition-colors"
                    fill={(hoverRating || rating) >= n ? '#f59e0b' : 'none'}
                    stroke={(hoverRating || rating) >= n ? '#f59e0b' : '#d1d5db'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm font-semibold text-gray-600">
                {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][hoverRating || rating]}
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* Tags input */}
      <Section title="Etiquetas" description="Entrada de valores múltiples con chips">
        <div>
          <Label>Competencias evaluadas</Label>
          <div className={`${inputBase} border-gray-200 min-h-[44px] flex flex-wrap gap-1.5 items-center py-2`}>
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                {tag}
                <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-blue-500 transition-colors">
                  <X size={11} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
              placeholder={tags.length === 0 ? 'Escribe y presiona Enter...' : ''}
              className="flex-1 min-w-[120px] outline-none text-sm placeholder-gray-400 bg-transparent"
            />
          </div>
          <HelperText>Presiona Enter o coma para agregar una etiqueta.</HelperText>
        </div>
      </Section>

      {/* File upload */}
      <Section title="Carga de archivos" description="Selector de archivos y zona de arrastre">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Standard file input */}
          <div>
            <Label>Adjuntar documento</Label>
            <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-all group">
              <Upload size={15} className="text-gray-400 group-hover:text-blue-500 transition-colors shrink-0" />
              <span className="text-sm text-gray-500 truncate">{fileVal ?? 'Seleccionar archivo...'}</span>
              <input
                type="file"
                className="hidden"
                onChange={e => setFileVal(e.target.files?.[0]?.name ?? null)}
              />
            </label>
            <HelperText>PDF, DOCX o XLSX. Máx. 10 MB.</HelperText>
          </div>

          {/* Drag and drop zone */}
          <div>
            <Label>Zona de arrastre</Label>
            <div
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); }}
            >
              <Upload size={20} className={dragOver ? 'text-blue-500' : 'text-gray-300'} />
              <p className={`text-xs font-semibold ${dragOver ? 'text-blue-600' : 'text-gray-400'}`}>
                {dragOver ? 'Suelta el archivo aquí' : 'Arrastra archivos o haz clic'}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Alerts / banners */}
      <Section title="Mensajes de estado" description="Alertas informativas, de éxito, advertencia y error">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-800">Información</p>
              <p className="text-xs text-blue-600 mt-0.5">El ciclo de evaluación cierra el 30 de junio. Asegúrate de completar tus formularios.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Guardado exitosamente</p>
              <p className="text-xs text-emerald-600 mt-0.5">Tu evaluación ha sido registrada y está pendiente de revisión.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">Advertencia</p>
              <p className="text-xs text-amber-600 mt-0.5">Tienes 3 evaluaciones pendientes. El plazo vence en 2 días.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">Error</p>
              <p className="text-xs text-red-600 mt-0.5">No se pudo guardar el formulario. Verifica tu conexión e intenta de nuevo.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Botones" description="Variantes de acción primaria, secundaria y destructiva">
        <div className="space-y-4">
          {/* Size variants */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tamaños</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all">Pequeño</button>
              <button type="button" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all">Mediano</button>
              <button type="button" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 active:scale-95 transition-all">Grande</button>
            </div>
          </div>

          {/* Style variants */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Estilos</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm">Primario</button>
              <button type="button" className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-sm">Secundario</button>
              <button type="button" className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 active:scale-95 transition-all">Terciario</button>
              <button type="button" className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all shadow-sm">Destructivo</button>
              <button type="button" className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 active:scale-95 transition-all">Destructivo outline</button>
              <button type="button" className="px-4 py-2 rounded-xl text-blue-600 text-sm font-semibold hover:bg-blue-50 active:scale-95 transition-all">Ghost</button>
            </div>
          </div>

          {/* With icons */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Con iconos</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
                <Plus size={15} />
                Nuevo registro
              </button>
              <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                <Upload size={15} />
                Exportar
              </button>
              <button type="button" className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
                <Plus size={16} />
              </button>
              <button type="button" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
                <Search size={16} />
              </button>
            </div>
          </div>

          {/* States */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Estados</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" disabled className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold opacity-40 cursor-not-allowed">Deshabilitado</button>
              <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold opacity-70 cursor-wait">
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Guardando...
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Badge / Pills */}
      <Section title="Etiquetas de estado (badges)" description="Indicadores visuales compactos para estados y categorías">
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Activo</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Completado</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Pendiente</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">Vencido</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Inactivo</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">En revisión</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">Archivado</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={11} />
            Aprobado
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle size={11} />
            Requiere acción
          </span>
        </div>
      </Section>
    </div>
  );
}
