import { useState } from 'react';
import {
  Users, UserPlus, CheckCircle2, AlertCircle, BarChart2, Search,
  ChevronDown, ChevronUp, ChevronRight, X, Eye, Clock, Award,
  TrendingUp, BarChart3, User, Briefcase, Globe, UserCheck, Equal,
  Star, Target, Copy, Link2, Plus, Trash2, Settings, Shield,
  BookOpen, Zap, Menu, FileText, Layers, Building2
} from 'lucide-react';

/* ── Color helpers (same as project) ── */
function getScoreColor(s: number) {
  if (s >= 4.1) return 'text-green-600';
  if (s >= 3.1) return 'text-blue-600';
  if (s >= 2.1) return 'text-yellow-600';
  return 'text-red-600';
}
function getScoreBg(s: number) {
  if (s >= 4.1) return 'bg-green-100 text-green-700';
  if (s >= 3.1) return 'bg-blue-100 text-blue-700';
  if (s >= 2.1) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}
function getScoreBar(s: number) {
  if (s >= 4.1) return '#059669';
  if (s >= 3.1) return '#2563eb';
  if (s >= 2.1) return '#d97706';
  return '#dc2626';
}
function getClassLabel(s: number) {
  if (s >= 4.1) return 'Sobresaliente';
  if (s >= 3.1) return 'Bueno';
  if (s >= 2.1) return 'Regular';
  return 'Deficiente';
}

/* ── Section wrapper ── */
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

/* ── Code preview block ── */
function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group">
      <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto">
        <code>{children}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}

/* ── Example card: preview + code ── */
function Example({ title, description, code, children }: { title: string; description?: string; code: string; children: React.ReactNode }) {
  const [showCode, setShowCode] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          {description && <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowCode(!showCode)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${showCode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {showCode ? <><Eye size={12} /> Vista previa</> : <><FileText size={12} /> Codigo</>}
        </button>
      </div>
      <div className="p-5">
        {showCode ? <CodeBlock>{code}</CodeBlock> : children}
      </div>
    </div>
  );
}

/* ── Color swatch ── */
function Swatch({ name, bg, text, hex }: { name: string; bg: string; text: string; hex: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white">
      <div className={`w-10 h-10 rounded-xl ${bg} shrink-0`} />
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-800">{name}</p>
        <p className="text-[10px] text-gray-400 font-mono">{hex}</p>
        <p className="text-[10px] text-gray-400 font-mono">{text}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */
export default function DesignSystemPage() {
  const [navOpen, setNavOpen] = useState(false);

  const SECTIONS = [
    { id: 'colores', label: 'Colores', icon: <Layers size={14} /> },
    { id: 'tipografia', label: 'Tipografia', icon: <FileText size={14} /> },
    { id: 'botones', label: 'Botones', icon: <Zap size={14} /> },
    { id: 'badges', label: 'Badges y Pills', icon: <Star size={14} /> },
    { id: 'cards', label: 'Cards', icon: <Building2 size={14} /> },
    { id: 'inputs', label: 'Inputs y Formularios', icon: <Menu size={14} /> },
    { id: 'tablas', label: 'Tablas', icon: <BarChart3 size={14} /> },
    { id: 'progress', label: 'Barras de Progreso', icon: <TrendingUp size={14} /> },
    { id: 'tabs', label: 'Tabs y Navegacion', icon: <ChevronRight size={14} /> },
    { id: 'modals', label: 'Modales y Overlays', icon: <X size={14} /> },
    { id: 'empty', label: 'Estados Vacios', icon: <AlertCircle size={14} /> },
    { id: 'grid9', label: 'Grid 9 Box', icon: <Target size={14} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Side nav */}
      <aside className={`fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-200 overflow-y-auto z-40 transition-transform lg:translate-x-0 ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Design System</p>
              <p className="text-[10px] text-gray-400">v1.0 Documentacion</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-0.5">
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setNavOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              {s.icon}
              {s.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setNavOpen(!navOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
      >
        {navOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main content */}
      <div className="flex-1 lg:ml-56">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-5">
            <h1 className="text-2xl font-bold text-gray-900">Design System</h1>
            <p className="text-sm text-gray-600 mt-1">Documentacion visual de componentes y patrones de diseno del proyecto</p>
          </div>
        </header>

        <main className="p-6 max-w-5xl mx-auto w-full space-y-16">

          {/* ═══════════════════ COLORES ═══════════════════ */}
          <Section id="colores" title="Colores">
            <p className="text-sm text-gray-600 leading-relaxed">
              El sistema de colores esta construido sobre la paleta de Tailwind CSS con extensiones semanticas para evaluaciones, roles y estados.
            </p>

            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Paleta Primaria</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <Swatch name="Blue 600" bg="bg-blue-600" text="text-blue-600" hex="#2563eb" />
                <Swatch name="Teal 600" bg="bg-teal-600" text="text-teal-600" hex="#0d9488" />
                <Swatch name="Green 600" bg="bg-green-600" text="text-green-600" hex="#16a34a" />
                <Swatch name="Emerald 600" bg="bg-emerald-600" text="text-emerald-600" hex="#059669" />
                <Swatch name="Amber 600" bg="bg-amber-600" text="text-amber-600" hex="#d97706" />
                <Swatch name="Red 600" bg="bg-red-600" text="text-red-600" hex="#dc2626" />
                <Swatch name="Slate 800" bg="bg-slate-800" text="text-slate-800" hex="#1e293b" />
                <Swatch name="Gray 900" bg="bg-gray-900" text="text-gray-900" hex="#111827" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Colores Semanticos - Evaluacion 360</h3>
              <p className="text-xs text-gray-500 mb-3">Cada rol de evaluador tiene un color asignado consistente en toda la app.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { role: 'Autoevaluacion (self)', color: '#2563eb', bg: 'bg-blue-100', text: 'text-blue-700' },
                  { role: 'Lider (leader)', color: '#0d9488', bg: 'bg-teal-100', text: 'text-teal-700' },
                  { role: 'Par (peer)', color: '#7c3aed', bg: 'bg-purple-100', text: 'text-purple-700' },
                  { role: 'Colaborador', color: '#d97706', bg: 'bg-amber-100', text: 'text-amber-700' },
                  { role: 'Cliente', color: '#dc2626', bg: 'bg-red-100', text: 'text-red-700' },
                  { role: 'Anonimo', color: '#64748b', bg: 'bg-slate-100', text: 'text-slate-700' },
                ].map(r => (
                  <div key={r.role} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${r.color}15` }}>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: r.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{r.role}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{r.color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Colores por Departamento</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { dept: 'Tecnologia', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
                  { dept: 'Ventas', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
                  { dept: 'Marketing', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
                  { dept: 'Finanzas', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
                  { dept: 'Recursos Humanos', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
                  { dept: 'Operaciones', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
                ].map(d => (
                  <div key={d.dept} className={`flex items-center gap-3 p-3 rounded-xl border ${d.border} ${d.bg}`}>
                    <span className={`text-xs font-bold ${d.text}`}>{d.dept}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Escala de Puntaje (0-5)</h3>
              <p className="text-xs text-gray-500 mb-3">Los puntajes de evaluacion se mapean a 4 niveles con colores consistentes.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { range: '4.1 - 5.0', label: 'Sobresaliente', color: '#059669', bg: 'bg-green-100', text: 'text-green-700' },
                  { range: '3.1 - 4.0', label: 'Bueno', color: '#2563eb', bg: 'bg-blue-100', text: 'text-blue-700' },
                  { range: '2.1 - 3.0', label: 'Regular', color: '#d97706', bg: 'bg-yellow-100', text: 'text-yellow-700' },
                  { range: '1.0 - 2.0', label: 'Deficiente', color: '#dc2626', bg: 'bg-red-100', text: 'text-red-700' },
                ].map(l => (
                  <div key={l.label} className={`p-4 rounded-xl border ${l.bg}`} style={{ borderColor: `${l.color}30` }}>
                    <p className="text-[10px] text-gray-500 mb-1">{l.range}</p>
                    <p className={`text-sm font-black ${l.text}`}>{l.label}</p>
                    <div className="mt-2 w-full bg-white/60 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ backgroundColor: l.color, width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
              <CodeBlock>{`function getScoreColor(score: number) {
  if (score >= 4.1) return 'text-green-600';
  if (score >= 3.1) return 'text-blue-600';
  if (score >= 2.1) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBg(score: number) {
  if (score >= 4.1) return 'bg-green-100 text-green-700';
  if (score >= 3.1) return 'bg-blue-100 text-blue-700';
  if (score >= 2.1) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function getScoreBar(score: number) {
  if (score >= 4.1) return '#059669';
  if (score >= 3.1) return '#2563eb';
  if (score >= 2.1) return '#d97706';
  return '#dc2626';
}`}</CodeBlock>
            </div>
          </Section>

          {/* ═══════════════════ TIPOGRAFIA ═══════════════════ */}
          <Section id="tipografia" title="Tipografia">
            <p className="text-sm text-gray-600 leading-relaxed">
              El sistema tipografico usa la fuente sans-serif por defecto de Tailwind con 4 pesos principales y tamanos estandarizados.
            </p>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Tamanos de Texto</h3>
                {[
                  { cls: 'text-2xl font-bold', label: 'text-2xl font-bold', use: 'Titulos de pagina' },
                  { cls: 'text-xl font-black', label: 'text-xl font-black', use: 'Valores KPI' },
                  { cls: 'text-base font-bold', label: 'text-base font-bold', use: 'Subtitulos de seccion' },
                  { cls: 'text-sm font-semibold', label: 'text-sm font-semibold', use: 'Labels, nombres, botones' },
                  { cls: 'text-xs font-medium', label: 'text-xs font-medium', use: 'Texto secundario, metadatos' },
                  { cls: 'text-[11px] font-bold', label: 'text-[11px] font-bold', use: 'Badges, micro-labels' },
                  { cls: 'text-[10px] text-gray-400', label: 'text-[10px] text-gray-400', use: 'Micro-texto, hints' },
                ].map(t => (
                  <div key={t.label} className="flex items-baseline gap-4 border-b border-gray-50 pb-3 last:border-0">
                    <span className={t.cls + ' text-gray-900 w-48 shrink-0'}>{t.use}</span>
                    <code className="text-[10px] text-gray-400 font-mono">{t.label}</code>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Pesos de Fuente</h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { cls: 'font-medium', label: 'medium (500)' },
                    { cls: 'font-semibold', label: 'semibold (600)' },
                    { cls: 'font-bold', label: 'bold (700)' },
                    { cls: 'font-black', label: 'black (900)' },
                  ].map(w => (
                    <div key={w.label} className={`text-sm ${w.cls} text-gray-800`}>
                      {w.label} <code className="text-[10px] text-gray-400 font-mono ml-1">.{w.cls.replace('font-', '')}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Colores de Texto</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { cls: 'text-gray-900', label: 'Primario' },
                    { cls: 'text-gray-600', label: 'Secundario' },
                    { cls: 'text-gray-500', label: 'Terciario' },
                    { cls: 'text-gray-400', label: 'Placeholder' },
                    { cls: 'text-gray-300', label: 'Deshabilitado' },
                    { cls: 'text-blue-600', label: 'Enlace/Activo' },
                    { cls: 'text-green-600', label: 'Exito' },
                    { cls: 'text-red-600', label: 'Error' },
                  ].map(c => (
                    <p key={c.label} className={`text-sm font-semibold ${c.cls}`}>{c.label}</p>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* ═══════════════════ BOTONES ═══════════════════ */}
          <Section id="botones" title="Botones">
            <p className="text-sm text-gray-600 leading-relaxed">
              Los botones siguen una jerarquia visual clara: primario (oscuro), secundario (borde), icono y deshabilitado.
            </p>

            <Example
              title="Boton Primario"
              description="Accion principal. Fondo slate-800 con texto blanco."
              code={`<button className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold
  hover:bg-slate-700 transition-colors">
  Guardar cambios
</button>`}
            >
              <div className="flex flex-wrap gap-3 items-center">
                <button type="button" className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors">
                  Guardar cambios
                </button>
                <button type="button" className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2">
                  <UserPlus size={15} />
                  Asignar evaluadores
                </button>
                <button type="button" className="w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                  <UserPlus size={16} />
                  Asignar nuevo evaluador
                </button>
              </div>
            </Example>

            <Example
              title="Boton Secundario"
              description="Accion alternativa. Borde gris con fondo transparente."
              code={`<button className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm
  font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
  Cancelar
</button>`}
            >
              <div className="flex flex-wrap gap-3 items-center">
                <button type="button" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="button" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Eye size={14} />
                  Ver resultados
                </button>
              </div>
            </Example>

            <Example
              title="Boton con Icono"
              description="Boton cuadrado para acciones rapidas con solo icono."
              code={`<button className="w-8 h-8 rounded-lg flex items-center justify-center
  text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
  <Settings size={16} />
</button>`}
            >
              <div className="flex flex-wrap gap-2 items-center">
                <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <Settings size={16} />
                </button>
                <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <Copy size={16} />
                </button>
                <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <Trash2 size={16} />
                </button>
                <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </Example>

            <Example
              title="Boton Deshabilitado"
              description="Estado inactivo con opacidad reducida."
              code={`<button disabled className="px-4 py-2.5 rounded-xl bg-slate-800 text-white
  text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
  No disponible
</button>`}
            >
              <div className="flex flex-wrap gap-3 items-center">
                <button type="button" disabled className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                  No disponible
                </button>
                <button type="button" disabled className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed">
                  Cancelar
                </button>
              </div>
            </Example>

            <Example
              title="Boton de Cierre (Modal)"
              description="Boton circular para cerrar modales o paneles."
              code={`<button className="w-7 h-7 rounded-full bg-white/70 hover:bg-white
  flex items-center justify-center text-gray-500 transition-colors">
  <X size={14} />
</button>`}
            >
              <div className="flex gap-3 items-center">
                <button type="button" className="w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-500 border border-gray-200 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </Example>
          </Section>

          {/* ═══════════════════ BADGES ═══════════════════ */}
          <Section id="badges" title="Badges y Pills">
            <p className="text-sm text-gray-600 leading-relaxed">
              Los badges comunican estados, clasificaciones y conteos de forma compacta. Se usan tres variantes principales: estado, clasificacion y rol.
            </p>

            <Example
              title="Badges de Estado"
              description="Indican el estado de una evaluacion o proceso."
              code={`<span className="text-[11px] font-bold px-2.5 py-1 rounded-full
  bg-emerald-100 text-emerald-700">Completo</span>

<span className="text-[11px] font-bold px-2.5 py-1 rounded-full
  bg-blue-100 text-blue-700">En progreso</span>

<span className="text-[11px] font-bold px-2.5 py-1 rounded-full
  bg-amber-100 text-amber-700">Pendiente</span>

<span className="text-[11px] font-bold px-2.5 py-1 rounded-full
  bg-gray-100 text-gray-500">Sin asignar</span>`}
            >
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Completo</span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">En progreso</span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Pendiente</span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Sin asignar</span>
              </div>
            </Example>

            <Example
              title="Badges de Clasificacion (Puntaje)"
              description="Colores dinamicos segun el puntaje de evaluacion."
              code={`// Usando getScoreBg(score):
<span className={\`text-[11px] font-bold px-2 py-1 rounded-full
  \${getScoreBg(score)}\`}>
  {getClassificationLabel(score)}
</span>`}
            >
              <div className="flex flex-wrap gap-3 items-center">
                {[4.5, 3.5, 2.5, 1.5].map(s => (
                  <span key={s} className={`text-[11px] font-bold px-2 py-1 rounded-full ${getScoreBg(s)}`}>
                    {getClassLabel(s)} ({s})
                  </span>
                ))}
              </div>
            </Example>

            <Example
              title="Badges de Rol (Evaluacion 360)"
              description="Cada rol de evaluador tiene su color semantico."
              code={`<span className="inline-flex items-center gap-1.5 text-[10px] font-medium
  px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
  <User size={9} /> Auto
</span>`}
            >
              <div className="flex flex-wrap gap-2 items-center">
                {[
                  { label: 'Auto', icon: <User size={9} />, bg: 'bg-blue-50', text: 'text-blue-700' },
                  { label: 'Lider', icon: <Briefcase size={9} />, bg: 'bg-teal-50', text: 'text-teal-700' },
                  { label: 'Par', icon: <Equal size={9} />, bg: 'bg-purple-50', text: 'text-purple-700' },
                  { label: 'Colaborador', icon: <UserCheck size={9} />, bg: 'bg-amber-50', text: 'text-amber-700' },
                  { label: 'Cliente', icon: <Globe size={9} />, bg: 'bg-red-50', text: 'text-red-700' },
                  { label: 'Anonimo', icon: <Users size={9} />, bg: 'bg-slate-50', text: 'text-slate-700' },
                ].map(r => (
                  <span key={r.label} className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${r.bg} ${r.text}`}>
                    {r.icon} {r.label}
                  </span>
                ))}
              </div>
            </Example>

            <Example
              title="Badge de Conteo"
              description="Indicador numerico posicionado absolutamente."
              code={`<div className="relative">
  <Users size={20} />
  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full
    bg-blue-600 text-white text-[10px] font-bold
    flex items-center justify-center">3</span>
</div>`}
            >
              <div className="flex gap-4 items-center">
                {[1, 3, 5, 12].map(n => (
                  <div key={n} className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Users size={18} className="text-gray-500" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {n}
                    </span>
                  </div>
                ))}
              </div>
            </Example>
          </Section>

          {/* ═══════════════════ CARDS ═══════════════════ */}
          <Section id="cards" title="Cards">
            <p className="text-sm text-gray-600 leading-relaxed">
              Las cards son el componente contenedor mas usado. Todas comparten bordes suaves, esquinas redondeadas y sombra minima.
            </p>

            <Example
              title="Card Base"
              description="Contenedor estandar para cualquier seccion de contenido."
              code={`<div className="bg-white rounded-2xl border border-gray-100
  shadow-sm p-5">
  Contenido aqui
</div>`}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-700">Contenido de la card base. Usa <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">rounded-2xl</code> y <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">shadow-sm</code> como estandar.</p>
              </div>
            </Example>

            <Example
              title="Card KPI (Stat Card)"
              description="Muestra una metrica con icono, valor y subtexto."
              code={`<div className="bg-white rounded-2xl border border-emerald-100
  shadow-sm p-4 flex items-start gap-3">
  <div className="w-9 h-9 rounded-xl bg-emerald-50
    flex items-center justify-center shrink-0">
    <CheckCircle2 size={16} className="text-emerald-600" />
  </div>
  <div>
    <p className="text-xs text-gray-500">Completos</p>
    <p className="text-xl font-black text-gray-900">12</p>
    <p className="text-[10px] text-gray-400 mt-0.5">
      evaluaciones finalizadas
    </p>
  </div>
</div>`}
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completos</p>
                    <p className="text-xl font-black text-gray-900">12</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">evaluaciones finalizadas</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pendientes</p>
                    <p className="text-xl font-black text-gray-900">5</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">en proceso o sin responder</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <BarChart2 size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Promedio general</p>
                    <p className="text-xl font-black text-blue-600">3.85</p>
                    <span className="mt-0.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Bueno</span>
                  </div>
                </div>
              </div>
            </Example>

            <Example
              title="Card con Header"
              description="Card con seccion de encabezado diferenciada."
              code={`<div className="bg-white rounded-2xl border border-gray-100
  shadow-sm overflow-hidden">
  <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
    <p className="text-xs font-bold text-gray-700 uppercase
      tracking-wide">Titulo de seccion</p>
  </div>
  <div className="p-5">
    Contenido
  </div>
</div>`}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Titulo de seccion</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600">Contenido de la card con header separado.</p>
                </div>
              </div>
            </Example>

            <Example
              title="Card de Puntaje Global"
              description="Muestra el resultado de evaluacion con barra y clasificacion."
              code={`<div className="rounded-2xl border p-4
  bg-blue-50 border-blue-200">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs font-semibold text-gray-500">
        Puntaje global 360
      </p>
      <p className="text-xs text-gray-500">3 respuestas</p>
    </div>
    <div className="text-right">
      <div className="text-3xl font-black text-blue-600">
        3.85
      </div>
      <div className="text-[10px] text-gray-400">de 5.0</div>
    </div>
  </div>
  <div className="mt-2.5">
    <div className="w-full bg-white/60 rounded-full h-2">
      <div className="h-2 rounded-full"
        style={{ width: '77%', backgroundColor: '#2563eb' }} />
    </div>
    <span className="mt-1.5 inline-block text-[11px] font-bold
      px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
      Bueno
    </span>
  </div>
</div>`}
            >
              <div className="rounded-2xl border p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Puntaje global 360</p>
                    <p className="text-xs text-gray-500">3 respuestas</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-blue-600">3.85</div>
                    <div className="text-[10px] text-gray-400">de 5.0</div>
                  </div>
                </div>
                <div className="mt-2.5">
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: '77%', backgroundColor: '#2563eb' }} />
                  </div>
                  <span className="mt-1.5 inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Bueno</span>
                </div>
              </div>
            </Example>
          </Section>

          {/* ═══════════════════ INPUTS ═══════════════════ */}
          <Section id="inputs" title="Inputs y Formularios">
            <p className="text-sm text-gray-600 leading-relaxed">
              Los campos de formulario usan bordes suaves, esquinas redondeadas y estados de focus consistentes.
            </p>

            <Example
              title="Input de Texto"
              description="Campo de texto estandar con icono de busqueda."
              code={`<div className="relative flex-1">
  <Search size={14} className="absolute left-3 top-1/2
    -translate-y-1/2 text-gray-400 pointer-events-none" />
  <input type="text" placeholder="Buscar..."
    className="w-full pl-9 pr-3 py-2 text-sm border
      border-gray-200 rounded-xl focus:outline-none
      focus:ring-2 focus:ring-blue-500/30
      focus:border-blue-400 bg-gray-50" />
</div>`}
            >
              <div className="max-w-sm space-y-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input type="text" placeholder="Buscar colaborador..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50" />
                </div>
                <input type="text" placeholder="Campo sin icono..." className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 bg-white" />
              </div>
            </Example>

            <Example
              title="Select Dropdown"
              description="Selector personalizado con icono ChevronDown."
              code={`<div className="relative">
  <select className="appearance-none pl-3 pr-8 py-2 text-sm
    border border-gray-200 rounded-xl focus:outline-none
    focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
    bg-gray-50 text-gray-700 cursor-pointer">
    <option value="all">Todos</option>
    <option>Tecnologia</option>
  </select>
  <ChevronDown size={12}
    className="absolute right-2.5 top-1/2 -translate-y-1/2
      text-gray-400 pointer-events-none" />
</div>`}
            >
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <select className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 text-gray-700 cursor-pointer">
                    <option value="all">Todas las areas</option>
                    <option>Tecnologia</option>
                    <option>Ventas</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 text-gray-700 cursor-pointer">
                    <option value="all">Todos los equipos</option>
                    <option>Adminolt</option>
                    <option>CRMInbox</option>
                    <option>Wisphub</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 text-gray-700 cursor-pointer">
                    <option value="all">Todos los periodos</option>
                    <option>Q1 2025</option>
                    <option>Q2 2025</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </Example>

            <Example
              title="Textarea"
              description="Area de texto multilinea sin resize."
              code={`<textarea placeholder="Escribe aqui..."
  className="w-full text-sm border border-gray-200 rounded-xl
    px-3 py-2 resize-none focus:outline-none
    focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400"
  rows={3} />`}
            >
              <div className="max-w-sm">
                <textarea placeholder="Escribe aqui..." className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400" rows={3} />
              </div>
            </Example>

            <Example
              title="Label con Campo"
              description="Estructura label + input con indicador de requerido."
              code={`<div>
  <label className="block text-xs font-medium text-gray-500 mb-1.5">
    Nombre <span className="text-red-500">*</span>
  </label>
  <input type="text" placeholder="Nombre completo"
    className="w-full rounded-xl border border-gray-200
      bg-white px-3.5 py-2.5 text-sm focus:outline-none
      focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400" />
</div>`}
            >
              <div className="max-w-sm space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Nombre completo" className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                  <input type="email" placeholder="correo@ejemplo.com" className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400" />
                </div>
              </div>
            </Example>
          </Section>

          {/* ═══════════════════ TABLAS ═══════════════════ */}
          <Section id="tablas" title="Tablas">
            <p className="text-sm text-gray-600 leading-relaxed">
              Las tablas usan filas con hover, divisores sutiles y alineacion consistente. Se usan dentro de cards con header.
            </p>

            <Example
              title="Tabla con Header y Filas"
              description="Tabla estandar con columnas alineadas y estados hover."
              code={`<div className="bg-white rounded-2xl border border-gray-100
  shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50/80">
          <th className="px-5 py-3 text-left text-xs font-semibold
            text-gray-500 uppercase tracking-wide">Nombre</th>
          <th className="px-4 py-3 text-left text-xs font-semibold
            text-gray-500 uppercase tracking-wide">Estado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        <tr className="hover:bg-gray-50/60 transition-colors">
          <td className="px-5 py-3.5 text-sm">...</td>
          <td className="px-4 py-3.5">...</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>`}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Colaborador</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Area</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Puntaje</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { name: 'Ana Torres', area: 'Tecnologia', score: 4.5, status: 'Completo' },
                        { name: 'Carlos Diaz', area: 'Ventas', score: 3.2, status: 'En progreso' },
                        { name: 'Maria Lopez', area: 'Finanzas', score: null, status: 'Sin asignar' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">AT</div>
                              <span className="text-sm font-semibold text-gray-900">{row.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-gray-600">{row.area}</td>
                          <td className="px-4 py-3.5">
                            {row.score !== null ? (
                              <span className={`text-sm font-black ${getScoreColor(row.score)}`}>{row.score.toFixed(2)}</span>
                            ) : (
                              <span className="text-sm text-gray-300">--</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                              row.status === 'Completo' ? 'bg-emerald-100 text-emerald-700' :
                              row.status === 'En progreso' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>{row.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Example>

            <Example
              title="Fila Expandible"
              description="Fila de tabla que se expande para mostrar detalle inline."
              code={`<tr className="hover:bg-gray-50/60 transition-colors cursor-pointer"
  onClick={() => toggle(id)}>
  <td>...</td>
  <td>
    <div className="w-7 h-7 rounded-lg flex items-center
      justify-center transition-all">
      {isExpanded ? <ChevronUp size={14} />
        : <ChevronDown size={14} />}
    </div>
  </td>
</tr>
{isExpanded && (
  <tr className="bg-slate-50/60">
    <td colSpan={6} className="px-5 py-5">
      <div className="bg-white rounded-2xl border
        border-gray-100 shadow-sm">
        Panel de detalle
      </div>
    </td>
  </tr>
)}`}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Colaborador</th>
                        <th className="px-4 py-3 w-12" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[true, false].map((expanded, i) => (
                        <>
                          <tr key={i} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                            <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">Ejemplo {i + 1}</td>
                            <td className="px-4 py-3.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${expanded ? 'bg-slate-200 text-slate-600' : 'text-gray-300'}`}>
                                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </div>
                            </td>
                          </tr>
                          {expanded && (
                            <tr className="bg-slate-50/60">
                              <td colSpan={2} className="px-5 py-4">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                  <p className="text-xs text-gray-600">Panel de detalle expandido inline.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Example>
          </Section>

          {/* ═══════════════════ PROGRESS ═══════════════════ */}
          <Section id="progress" title="Barras de Progreso">
            <p className="text-sm text-gray-600 leading-relaxed">
              Las barras de progreso comunican avance de evaluaciones y puntajes. Usan colores semanticos segun el porcentaje o puntaje.
            </p>

            <Example
              title="Barra de Progreso Horizontal"
              description="Barra estandar para avance de evaluaciones."
              code={`<div className="flex items-center gap-2">
  <div className="w-20 bg-gray-100 rounded-full h-1.5">
    <div className="h-1.5 rounded-full transition-all"
      style={{
        width: \`\${pct}%\`,
        backgroundColor: pct === 100 ? '#059669' : '#2563eb'
      }} />
  </div>
  <span className="text-[11px] text-gray-500">
    {completed}/{total}
  </span>
</div>`}
            >
              <div className="space-y-4">
                {[
                  { pct: 100, label: '5/5', color: '#059669' },
                  { pct: 60, label: '3/5', color: '#2563eb' },
                  { pct: 20, label: '1/5', color: '#2563eb' },
                  { pct: 0, label: '0/5', color: '#2563eb' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                    </div>
                    <span className="text-[11px] text-gray-500">{p.label}</span>
                  </div>
                ))}
              </div>
            </Example>

            <Example
              title="Barra de Puntaje (0-5)"
              description="Barra que representa un puntaje sobre 5 con color dinamico."
              code={`<div className="w-full bg-gray-100 rounded-full h-2">
  <div className="h-2 rounded-full transition-all"
    style={{
      width: \`\${(score / 5) * 100}%\`,
      backgroundColor: getScoreBar(score)
    }} />
</div>`}
            >
              <div className="space-y-4">
                {[4.5, 3.5, 2.5, 1.5].map(s => (
                  <div key={s} className="flex items-center gap-3">
                    <span className={`text-sm font-black w-10 ${getScoreColor(s)}`}>{s.toFixed(1)}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${(s / 5) * 100}%`, backgroundColor: getScoreBar(s) }} />
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getScoreBg(s)}`}>{getClassLabel(s)}</span>
                  </div>
                ))}
              </div>
            </Example>

            <Example
              title="Barra de Competencia"
              description="Barra delgada con label para cada competencia evaluada."
              code={`<div className="flex items-center gap-3">
  <span className="text-[10px] font-bold text-gray-300 w-4">
    {idx + 1}
  </span>
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[11px] font-semibold text-gray-800
        truncate">Liderazgo</span>
      <span className="text-[11px] font-black text-green-600">
        4.2
      </span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-1">
      <div className="h-1 rounded-full"
        style={{ width: '84%', backgroundColor: '#059669' }} />
    </div>
  </div>
</div>`}
            >
              <div className="space-y-3 max-w-md">
                {[
                  { name: 'Liderazgo', score: 4.2 },
                  { name: 'Trabajo en equipo', score: 3.8 },
                  { name: 'Resolucion de problemas', score: 3.1 },
                  { name: 'Autoaprendizaje', score: 2.3 },
                ].map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-gray-800 truncate">{c.name}</span>
                        <span className={`text-[11px] font-black ml-2 shrink-0 ${getScoreColor(c.score)}`}>{c.score.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div className="h-1 rounded-full" style={{ width: `${(c.score / 5) * 100}%`, backgroundColor: getScoreBar(c.score) }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Example>
          </Section>

          {/* ═══════════════════ TABS ═══════════════════ */}
          <Section id="tabs" title="Tabs y Navegacion">
            <p className="text-sm text-gray-600 leading-relaxed">
              Los tabs organizan contenido en sub-vistas. Hay dos variantes: tabs tipo pill (fondo redondeado) y tabs tipo underline (linea inferior).
            </p>

            <Example
              title="Tabs tipo Pill"
              description="Tabs con fondo redondeado y sombra en el activo."
              code={`<div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
  <button className="flex items-center gap-2 px-4 py-2 rounded-lg
    text-sm font-semibold bg-white text-gray-900 shadow-sm">
    <Users size={15} /> Colaboradores
  </button>
  <button className="flex items-center gap-2 px-4 py-2 rounded-lg
    text-sm font-semibold text-gray-500 hover:text-gray-700">
    <BarChart2 size={15} /> Resultados
  </button>
</div>`}
            >
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white text-gray-900 shadow-sm">
                  <Users size={15} /> Colaboradores
                </button>
                <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700">
                  <BarChart2 size={15} /> Resultados
                </button>
              </div>
            </Example>

            <Example
              title="Tabs tipo Underline"
              description="Tabs con linea inferior en el activo."
              code={`<div className="border-b border-gray-100">
  <div className="flex items-center overflow-x-auto">
    <button className="flex items-center gap-2 px-4 py-3
      border-b-2 font-medium text-sm border-blue-500
      text-blue-600">Resumen</button>
    <button className="flex items-center gap-2 px-4 py-3
      border-b-2 font-medium text-sm border-transparent
      text-gray-600 hover:text-gray-900">Resultados</button>
  </div>
</div>`}
            >
              <div className="border-b border-gray-100">
                <div className="flex items-center overflow-x-auto">
                  <button type="button" className="flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm border-blue-500 text-blue-600">
                    <BarChart3 size={16} /> Resumen
                  </button>
                  <button type="button" className="flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm border-transparent text-gray-600 hover:text-gray-900">
                    <Eye size={16} /> Resultados
                  </button>
                  <button type="button" className="flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm border-transparent text-gray-600 hover:text-gray-900">
                    <Clock size={16} /> Seguimiento
                  </button>
                </div>
              </div>
            </Example>

            <Example
              title="Tabs tipo Panel (Interno)"
              description="Tabs compactos dentro de un panel de detalle."
              code={`<div className="flex gap-1 p-2 bg-gray-50 border-b
  border-gray-100">
  <button className="flex-1 flex items-center justify-center
    gap-1 py-1.5 rounded-lg text-xs font-semibold
    bg-white text-gray-900 shadow-sm">
    <BarChart3 size={13} /> Resumen
  </button>
  <button className="flex-1 flex items-center justify-center
    gap-1 py-1.5 rounded-lg text-xs font-semibold
    text-gray-500 hover:text-gray-700">
    <UserPlus size={13} /> Asignar
  </button>
</div>`}
            >
              <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100 rounded-t-xl">
                <button type="button" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold bg-white text-gray-900 shadow-sm">
                  <BarChart3 size={13} /> Resumen
                </button>
                <button type="button" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700">
                  <UserPlus size={13} /> Asignar
                </button>
                <button type="button" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700">
                  <Clock size={13} /> Seguimiento
                </button>
                <button type="button" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700">
                  <Eye size={13} /> Resultados
                </button>
              </div>
            </Example>
          </Section>

          {/* ═══════════════════ MODALS ═══════════════════ */}
          <Section id="modals" title="Modales y Overlays">
            <p className="text-sm text-gray-600 leading-relaxed">
              Los modales usan un overlay oscuro con blur y un dialog centrado con esquinas redondeadas.
            </p>

            <Example
              title="Overlay y Dialog"
              description="Estructura base de un modal."
              code={`{/* Overlay */}
<div className="fixed inset-0 z-50 bg-black/40
  backdrop-blur-sm flex items-center justify-center p-4">

  {/* Dialog */}
  <div className="bg-white rounded-2xl shadow-2xl
    w-full max-w-lg overflow-hidden">
    {/* Header */}
    <div className="p-5 bg-gradient-to-br from-slate-50
      to-gray-100">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-bold text-gray-900">
          Titulo del modal
        </h3>
        <button className="w-7 h-7 rounded-full bg-white/70
          hover:bg-white flex items-center justify-center
          text-gray-500">
          <X size={14} />
        </button>
      </div>
    </div>
    {/* Body */}
    <div className="p-5">Contenido</div>
  </div>
</div>`}
            >
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden" style={{ minHeight: 280 }}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-gray-100">
                      <div className="flex items-start justify-between">
                        <h3 className="text-base font-bold text-gray-900">Asignar Evaluador</h3>
                        <button type="button" className="w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-500">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-gray-600">Contenido del modal aqui.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Example>
          </Section>

          {/* ═══════════════════ EMPTY STATES ═══════════════════ */}
          <Section id="empty" title="Estados Vacios">
            <p className="text-sm text-gray-600 leading-relaxed">
              Los estados vacios guian al usuario cuando no hay datos. Usan un icono grande, titulo y descripcion.
            </p>

            <Example
              title="Estado Vacio Estandar"
              description="Para secciones sin datos."
              code={`<div className="flex flex-col items-center justify-center
  py-20 text-center">
  <div className="w-14 h-14 bg-gray-100 rounded-2xl
    flex items-center justify-center mb-4">
    <Users size={22} className="text-gray-300" />
  </div>
  <h4 className="text-sm font-semibold text-gray-400">
    Sin resultados
  </h4>
  <p className="text-xs text-gray-300 mt-1 max-w-xs
    leading-relaxed">
    No se encontraron colaboradores con los filtros actuales.
  </p>
</div>`}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Users size={22} className="text-gray-300" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-400">Sin resultados</h4>
                  <p className="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed">No se encontraron colaboradores.</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <BarChart2 size={22} className="text-gray-300" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-400">Sin datos de evaluacion</h4>
                  <p className="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed">Los resultados aparecen cuando se completen evaluaciones.</p>
                </div>
              </div>
            </Example>

            <Example
              title="Estado Vacio con Card"
              description="Estado vacio dentro de una card con accion sugerida."
              code={`<div className="bg-white rounded-2xl border border-gray-100
  shadow-sm flex flex-col items-center justify-center
  min-h-[400px] p-8 text-center">
  <div className="w-16 h-16 bg-gray-50 rounded-2xl
    flex items-center justify-center mb-4">
    <Users size={26} className="text-gray-300" />
  </div>
  <h4 className="text-sm font-semibold text-gray-500">
    Selecciona un colaborador
  </h4>
  <p className="text-xs text-gray-400 mt-1.5 max-w-xs
    leading-relaxed">
    Haz clic en una ficha para ver el resumen.
  </p>
</div>`}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 p-8 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                  <Users size={26} className="text-gray-300" />
                </div>
                <h4 className="text-sm font-semibold text-gray-500">Selecciona un colaborador</h4>
                <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">Haz clic en una ficha para ver el resumen, asignar evaluadores y ver resultados.</p>
              </div>
            </Example>
          </Section>

          {/* ═══════════════════ 9-BOX GRID ═══════════════════ */}
          <Section id="grid9" title="Grid 9 Box">
            <p className="text-sm text-gray-600 leading-relaxed">
              El grid 9-box es el componente central del Nine Box Grid. Cada celda tiene colores configurables, avatar de empleado y badge de conteo.
            </p>

            <Example
              title="Celda del 9-Box"
              description="Celda individual con color, label y avatares."
              code={`<div className="min-h-[118px] rounded-xl border-2 p-3
  relative transition-all hover:scale-[1.01]"
  style={{
    borderColor: '#065f46',
    backgroundColor: '#d1fae5'
  }}>
  <div className="flex items-center justify-between mb-2">
    <span className="text-[10px] font-black"
      style={{ color: '#065f46' }}>A</span>
    <span className="text-[10px] font-bold"
      style={{ color: '#065f46' }}>Estrella</span>
  </div>
  <p className="text-[9px] leading-tight mb-2"
    style={{ color: '#065f46' }}>
    100% VALORES / 100% RESULTADOS
  </p>
  {/* Avatars */}
  <div className="flex -space-x-1.5">
    <div className="w-7 h-7 rounded-full border-2 border-white
      flex items-center justify-center text-[10px] font-bold"
      style={{ backgroundColor: '#065f46', color: 'white' }}>
      AT
    </div>
  </div>
  {/* Count badge */}
  <span className="absolute top-1.5 right-1.5 w-5 h-5
    rounded-full flex items-center justify-center
    text-[10px] font-bold"
    style={{ backgroundColor: '#065f4620', color: '#065f46' }}>
    3
  </span>
</div>`}
            >
              <div className="grid grid-cols-3 gap-3 max-w-lg">
                {[
                  { code: 'A', label: 'Estrella', color: '#065f46', bg: '#d1fae5', desc: '100% VAL / 100% RES', count: 3 },
                  { code: 'B4', label: 'Alto Potencial', color: '#047857', bg: '#a7f3d0', desc: '100% VAL / 80% RES', count: 2 },
                  { code: 'B3', label: 'Diamante', color: '#047857', bg: '#a7f3d0', desc: '100% VAL / 40% RES', count: 1 },
                  { code: 'B2', label: 'Enigma', color: '#1d4ed8', bg: '#dbeafe', desc: '80% VAL / 80% RES', count: 2 },
                  { code: 'C', label: 'Cumplido', color: '#1d4ed8', bg: '#dbeafe', desc: '80% VAL / 40% RES', count: 4 },
                  { code: 'B1', label: 'Jugador', color: '#b45309', bg: '#fef3c7', desc: '40% VAL / 100% RES', count: 1 },
                  { code: 'D', label: 'Incognito', color: '#b45309', bg: '#fef3c7', desc: '40% VAL / 80% RES', count: 0 },
                  { code: 'E', label: 'Pregunta', color: '#b45309', bg: '#fef3c7', desc: '40% VAL / 40% RES', count: 2 },
                  { code: 'F', label: 'Riesgo', color: '#dc2626', bg: '#fee2e2', desc: '0% VAL / 0% RES', count: 1 },
                ].map(box => (
                  <div
                    key={box.code}
                    className="min-h-[100px] rounded-xl border-2 p-2.5 relative transition-all hover:scale-[1.01]"
                    style={{ borderColor: box.color, backgroundColor: box.bg }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black" style={{ color: box.color }}>{box.code}</span>
                      <span className="text-[9px] font-bold" style={{ color: box.color }}>{box.label}</span>
                    </div>
                    <p className="text-[8px] leading-tight" style={{ color: box.color, opacity: 0.7 }}>{box.desc}</p>
                    {box.count > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${box.color}20`, color: box.color }}>
                        {box.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Example>
          </Section>

          {/* ═══════════════════ SPACING REFERENCE ═══════════════════ */}
          <section id="spacing" className="scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Espaciado y Layout</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Sistema de Espaciado (8px)</h3>
                <p className="text-xs text-gray-500">El proyecto usa un sistema basado en 8px con las clases de Tailwind.</p>
                <div className="space-y-2">
                  {[
                    { px: 8, label: 'p-2', desc: 'Padding compacto (badges, chips)' },
                    { px: 12, label: 'p-3', desc: 'Padding pequeno (items de lista)' },
                    { px: 16, label: 'p-4', desc: 'Padding estandar (cards KPI)' },
                    { px: 20, label: 'p-5', desc: 'Padding generico (cards, modales)' },
                    { px: 24, label: 'p-6', desc: 'Padding amplio (secciones)' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className="w-20 shrink-0">
                        <div className="bg-blue-100 rounded" style={{ width: s.px, height: s.px }} />
                      </div>
                      <code className="text-[11px] font-mono text-gray-600 w-10">{s.label}</code>
                      <span className="text-[11px] text-gray-400">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Border Radius</h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { cls: 'rounded-lg', desc: 'Botones, inputs' },
                    { cls: 'rounded-xl', desc: 'Avatares, iconos' },
                    { cls: 'rounded-2xl', desc: 'Cards, modales' },
                    { cls: 'rounded-full', desc: 'Badges, avatares circulares' },
                  ].map(r => (
                    <div key={r.cls} className="flex items-center gap-2">
                      <div className={`w-10 h-10 bg-blue-100 border border-blue-200 ${r.cls}`} />
                      <div>
                        <code className="text-[11px] font-mono text-gray-700">{r.cls}</code>
                        <p className="text-[10px] text-gray-400">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Shadows</h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { cls: 'shadow-sm', desc: 'Cards, inputs' },
                    { cls: 'shadow-md', desc: 'Cards seleccionadas' },
                    { cls: 'shadow-lg', desc: 'Dropdowns' },
                    { cls: 'shadow-xl', desc: 'Paneles de detalle' },
                    { cls: 'shadow-2xl', desc: 'Modales' },
                  ].map(s => (
                    <div key={s.cls} className={`w-20 h-14 bg-white rounded-xl ${s.cls} flex items-center justify-center`}>
                      <code className="text-[10px] font-mono text-gray-500">{s.cls}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Grids Responsive</h3>
                <div className="space-y-2 text-xs text-gray-600 font-mono">
                  <p>grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4</p>
                  <p>grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4</p>
                  <p>grid grid-cols-3 gap-4</p>
                  <p>grid grid-cols-2 gap-2</p>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════ ICONS REFERENCE ═══════════════════ */}
          <section id="icons" className="scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Iconos (Lucide React)</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-500 mb-4">Todos los iconos usan <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">lucide-react</code>. Tamanos comunes: 12, 13, 14, 15, 16, 18, 20, 22, 26.</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {[
                  { icon: <Users size={18} />, name: 'Users' },
                  { icon: <User size={18} />, name: 'User' },
                  { icon: <UserPlus size={18} />, name: 'UserPlus' },
                  { icon: <UserCheck size={18} />, name: 'UserCheck' },
                  { icon: <CheckCircle2 size={18} />, name: 'CheckCircle2' },
                  { icon: <AlertCircle size={18} />, name: 'AlertCircle' },
                  { icon: <Search size={18} />, name: 'Search' },
                  { icon: <BarChart3 size={18} />, name: 'BarChart3' },
                  { icon: <BarChart2 size={18} />, name: 'BarChart2' },
                  { icon: <TrendingUp size={18} />, name: 'TrendingUp' },
                  { icon: <Award size={18} />, name: 'Award' },
                  { icon: <Star size={18} />, name: 'Star' },
                  { icon: <Target size={18} />, name: 'Target' },
                  { icon: <Eye size={18} />, name: 'Eye' },
                  { icon: <Clock size={18} />, name: 'Clock' },
                  { icon: <Briefcase size={18} />, name: 'Briefcase' },
                  { icon: <Globe size={18} />, name: 'Globe' },
                  { icon: <Equal size={18} />, name: 'Equal' },
                  { icon: <Link2 size={18} />, name: 'Link2' },
                  { icon: <Copy size={18} />, name: 'Copy' },
                  { icon: <Plus size={18} />, name: 'Plus' },
                  { icon: <Trash2 size={18} />, name: 'Trash2' },
                  { icon: <Settings size={18} />, name: 'Settings' },
                  { icon: <Shield size={18} />, name: 'Shield' },
                  { icon: <ChevronDown size={18} />, name: 'ChevronDown' },
                  { icon: <ChevronUp size={18} />, name: 'ChevronUp' },
                  { icon: <ChevronRight size={18} />, name: 'ChevronRight' },
                  { icon: <X size={18} />, name: 'X' },
                  { icon: <Menu size={18} />, name: 'Menu' },
                  { icon: <FileText size={18} />, name: 'FileText' },
                  { icon: <Layers size={18} />, name: 'Layers' },
                  { icon: <Building2 size={18} />, name: 'Building2' },
                  { icon: <Zap size={18} />, name: 'Zap' },
                  { icon: <BookOpen size={18} />, name: 'BookOpen' },
                ].map(ic => (
                  <div key={ic.name} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="text-gray-600">{ic.icon}</div>
                    <span className="text-[9px] text-gray-400 font-mono text-center">{ic.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
