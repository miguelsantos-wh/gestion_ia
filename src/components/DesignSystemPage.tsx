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
function Swatch({ name, bg, hex }: { name: string; bg: string; hex: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white">
      <div className={`w-10 h-10 rounded-xl ${bg} shrink-0`} />
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-800">{name}</p>
        <p className="text-[10px] text-gray-400 font-mono">{hex}</p>
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
              <p className="text-[10px] text-gray-400">Bootstrap 5.1 Docs</p>
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
            <p className="text-sm text-gray-600 mt-1">Documentacion visual de componentes usando <strong>Bootstrap 5.1</strong> — equivalente a los elementos del proyecto</p>
          </div>
        </header>

        <main className="p-6 max-w-5xl mx-auto w-full space-y-16">

          {/* ═══════════════════ COLORES ═══════════════════ */}
          <Section id="colores" title="Colores">
            <p className="text-sm text-gray-600 leading-relaxed">
              El sistema de colores del proyecto se mapea a las clases de color de Bootstrap 5.1. Aqui se muestra la equivalencia entre los colores usados en la app y las clases de Bootstrap.
            </p>

            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Paleta Primaria — Equivalencia Bootstrap</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <Swatch name="primary" bg="bg-blue-600" hex="#0d6efd" />
                <Swatch name="success" bg="bg-green-600" hex="#198754" />
                <Swatch name="info / teal" bg="bg-teal-600" hex="#0dcaf0" />
                <Swatch name="warning" bg="bg-amber-600" hex="#ffc107" />
                <Swatch name="danger" bg="bg-red-600" hex="#dc3545" />
                <Swatch name="dark" bg="bg-slate-800" hex="#212529" />
                <Swatch name="secondary" bg="bg-gray-600" hex="#6c757d" />
                <Swatch name="light" bg="bg-gray-100" hex="#f8f9fa" />
              </div>
              <CodeBlock>{`<!-- Colores principales de Bootstrap 5.1 -->
<span class="text-primary">Azul primario</span>
<span class="text-success">Verde exito</span>
<span class="text-info">Teal informacion</span>
<span class="text-warning">Amarillo advertencia</span>
<span class="text-danger">Rojo peligro</span>
<span class="text-dark">Oscuro</span>
<span class="text-secondary">Secundario</span>
<span class="text-muted">Gris suave</span>

<!-- Fondos con opacidad -->
<div class="bg-primary bg-opacity-10">Fondo azul 10%</div>
<div class="bg-success bg-opacity-10">Fondo verde 10%</div>
<div class="bg-warning bg-opacity-10">Fondo amarillo 10%</div>`}</CodeBlock>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Colores Semanticos — Evaluacion 360</h3>
              <p className="text-xs text-gray-500 mb-3">Cada rol de evaluador tiene un color asignado. Con Bootstrap se usan <code>bg-opacity</code> y clases custom.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { role: 'Autoevaluacion (self)', color: '#2563eb' },
                  { role: 'Lider (leader)', color: '#0d9488' },
                  { role: 'Par (peer)', color: '#7c3aed' },
                  { role: 'Colaborador', color: '#d97706' },
                  { role: 'Cliente', color: '#dc2626' },
                  { role: 'Anonimo', color: '#64748b' },
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
              <CodeBlock>{`<!-- Colores de rol con CSS custom properties (Bootstrap 5.1) -->
<style>
  .role-self    { --role-color: #2563eb; }
  .role-leader  { --role-color: #0d9488; }
  .role-peer    { --role-color: #7c3aed; }
  .role-collab  { --role-color: #d97706; }
  .role-client  { --role-color: #dc2626; }
  .role-anon    { --role-color: #64748b; }
  .role-badge {
    background-color: rgba(var(--role-rgb), 0.1);
    color: var(--role-color);
  }
</style>

<span class="role-badge role-self badge rounded-pill">
  Autoevaluacion
</span>`}</CodeBlock>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Escala de Puntaje (0-5)</h3>
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
              <CodeBlock>{`<!-- Badges de clasificacion con Bootstrap 5.1 -->
<span class="badge rounded-pill bg-success bg-opacity-10 text-success">
  Sobresaliente (4.1-5.0)
</span>
<span class="badge rounded-pill bg-primary bg-opacity-10 text-primary">
  Bueno (3.1-4.0)
</span>
<span class="badge rounded-pill bg-warning bg-opacity-10 text-warning">
  Regular (2.1-3.0)
</span>
<span class="badge rounded-pill bg-danger bg-opacity-10 text-danger">
  Deficiente (1.0-2.0)
</span>`}</CodeBlock>
            </div>
          </Section>

          {/* ═══════════════════ TIPOGRAFIA ═══════════════════ */}
          <Section id="tipografia" title="Tipografia">
            <p className="text-sm text-gray-600 leading-relaxed">
              Bootstrap 5.1 provee clases de tipografia que equivalen a los tamanos usados en el proyecto.
            </p>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Equivalencia de Tamanos</h3>
                {[
                  { bs: 'h2 .fs-2 fw-bold', tw: 'text-2xl font-bold', use: 'Titulos de pagina' },
                  { bs: '.fs-4 fw-bolder', tw: 'text-xl font-black', use: 'Valores KPI' },
                  { bs: 'h5 .fs-5 fw-bold', tw: 'text-base font-bold', use: 'Subtitulos' },
                  { bs: '.fs-6 fw-semibold', tw: 'text-sm font-semibold', use: 'Labels, botones' },
                  { bs: 'small .fw-medium', tw: 'text-xs font-medium', use: 'Texto secundario' },
                  { bs: 'small .fw-bold', tw: 'text-[11px] font-bold', use: 'Badges, micro-labels' },
                  { bs: 'small.text-muted', tw: 'text-[10px] text-gray-400', use: 'Micro-texto, hints' },
                ].map(t => (
                  <div key={t.bs} className="flex items-baseline gap-4 border-b border-gray-50 pb-3 last:border-0">
                    <span className={`text-gray-900 w-48 shrink-0 ${t.tw}`}>{t.use}</span>
                    <div className="text-[10px] space-y-0.5">
                      <p className="text-gray-500">Bootstrap: <code className="text-blue-600">{t.bs}</code></p>
                    </div>
                  </div>
                ))}
              </div>

              <CodeBlock>{`<!-- Tipografia Bootstrap 5.1 -->

<!-- Titulo de pagina (equiv: text-2xl font-bold) -->
<h2 class="fs-2 fw-bold">Dashboard</h2>

<!-- Valor KPI (equiv: text-xl font-black) -->
<p class="fs-4 fw-bolder">12</p>

<!-- Subtitulo (equiv: text-base font-bold) -->
<h5 class="fs-5 fw-bold">Seccion</h5>

<!-- Label / Boton (equiv: text-sm font-semibold) -->
<span class="fs-6 fw-semibold">Nombre</span>

<!-- Texto secundario (equiv: text-xs font-medium) -->
<small class="fw-medium text-muted">Departamento</small>

<!-- Micro-texto (equiv: text-[10px] text-gray-400) -->
<small class="text-muted" style="font-size: 0.625rem">Hint</small>`}</CodeBlock>
            </div>
          </Section>

          {/* ═══════════════════ BOTONES ═══════════════════ */}
          <Section id="botones" title="Botones">
            <p className="text-sm text-gray-600 leading-relaxed">
              Los botones del proyecto se replican con las clases de boton de Bootstrap 5.1, usando variantes de color, tamanos y estados.
            </p>

            <Example
              title="Boton Primario"
              description="Accion principal. Equivale a bg-slate-800 con texto blanco."
              code={`<!-- Boton primario oscuro (equiv: bg-slate-800) -->
<button class="btn btn-dark rounded-3 px-4">
  Guardar cambios
</button>

<!-- Con icono -->
<button class="btn btn-dark rounded-3 px-4">
  <i class="bi bi-person-plus me-2"></i>
  Asignar evaluadores
</button>

<!-- Ancho completo -->
<button class="btn btn-dark rounded-3 w-100 py-3">
  <i class="bi bi-person-plus me-2"></i>
  Asignar nuevo evaluador
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
              description="Accion alternativa. Equivale a border border-gray-200."
              code={`<!-- Boton secundario outline (equiv: border-gray-200) -->
<button class="btn btn-outline-secondary rounded-3 px-4">
  Cancelar
</button>

<!-- Con icono -->
<button class="btn btn-outline-secondary rounded-3 px-4">
  <i class="bi bi-eye me-2"></i>
  Ver resultados
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
              description="Boton cuadrado para acciones rapidas."
              code={`<!-- Boton solo icono (equiv: w-8 h-8 rounded-lg) -->
<button class="btn btn-sm btn-light rounded-3"
  style="width: 2rem; height: 2rem; padding: 0;
         display: inline-flex; align-items: center;
         justify-content: center;">
  <i class="bi bi-gear"></i>
</button>

<!-- Variante danger -->
<button class="btn btn-sm btn-outline-danger rounded-3"
  style="width: 2rem; height: 2rem; padding: 0;
         display: inline-flex; align-items: center;
         justify-content: center;">
  <i class="bi bi-x"></i>
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
              code={`<!-- Boton deshabilitado Bootstrap -->
<button class="btn btn-dark rounded-3 px-4" disabled>
  No disponible
</button>

<button class="btn btn-outline-secondary rounded-3 px-4" disabled>
  Cancelar
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
              description="Boton circular para cerrar modales."
              code={`<!-- Boton cierre circular (equiv: w-7 h-7 rounded-full) -->
<button class="btn btn-sm btn-light rounded-circle"
  style="width: 1.75rem; height: 1.75rem; padding: 0;
         display: inline-flex; align-items: center;
         justify-content: center;">
  <i class="bi bi-x" style="font-size: 0.875rem"></i>
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
              Los badges de Bootstrap 5.1 con <code>rounded-pill</code> replican exactamente las pills del proyecto.
            </p>

            <Example
              title="Badges de Estado"
              description="Indican el estado de una evaluacion o proceso."
              code={`<!-- Badges de estado con Bootstrap 5.1 -->
<span class="badge rounded-pill bg-success bg-opacity-10 text-success">
  Completo
</span>
<span class="badge rounded-pill bg-primary bg-opacity-10 text-primary">
  En progreso
</span>
<span class="badge rounded-pill bg-warning bg-opacity-10 text-warning">
  Pendiente
</span>
<span class="badge rounded-pill bg-secondary bg-opacity-10 text-secondary">
  Sin asignar
</span>`}
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
              code={`<!-- Badges de clasificacion Bootstrap 5.1 -->
<span class="badge rounded-pill bg-success">Sobresaliente</span>
<span class="badge rounded-pill bg-primary">Bueno</span>
<span class="badge rounded-pill bg-warning text-dark">Regular</span>
<span class="badge rounded-pill bg-danger">Deficiente</span>`}
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
              code={`<!-- Badges de rol con iconos Bootstrap -->
<span class="badge rounded-pill"
  style="background: rgba(37,99,235,0.1); color: #2563eb">
  <i class="bi bi-person me-1"></i> Auto
</span>
<span class="badge rounded-pill"
  style="background: rgba(13,148,136,0.1); color: #0d9488">
  <i class="bi bi-briefcase me-1"></i> Lider
</span>
<span class="badge rounded-pill"
  style="background: rgba(124,58,237,0.1); color: #7c3aed">
  <i class="bi bi-people me-1"></i> Par
</span>
<span class="badge rounded-pill"
  style="background: rgba(217,119,6,0.1); color: #d97706">
  <i class="bi bi-person-check me-1"></i> Colaborador
</span>
<span class="badge rounded-pill"
  style="background: rgba(220,38,38,0.1); color: #dc2626">
  <i class="bi bi-globe me-1"></i> Cliente
</span>
<span class="badge rounded-pill"
  style="background: rgba(100,116,139,0.1); color: #64748b">
  <i class="bi bi-incognito me-1"></i> Anonimo
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
              code={`<!-- Badge de conteo Bootstrap 5.1 -->
<div class="position-relative d-inline-block">
  <i class="bi bi-people fs-4"></i>
  <span class="position-absolute top-0 start-100
    translate-middle badge rounded-pill bg-primary"
    style="font-size: 0.625rem">
    3
  </span>
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
              Las cards de Bootstrap 5.1 con <code>border-0 shadow-sm</code> y bordes redondeados replican el estilo del proyecto.
            </p>

            <Example
              title="Card Base"
              description="Contenedor estandar. Equivale a rounded-2xl border shadow-sm."
              code={`<!-- Card base Bootstrap 5.1 -->
<div class="card border-0 shadow-sm" style="border-radius: 1rem">
  <div class="card-body p-4">
    Contenido aqui
  </div>
</div>`}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-700">Contenido de la card base. En Bootstrap: <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">card border-0 shadow-sm</code> con <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">border-radius: 1rem</code>.</p>
              </div>
            </Example>

            <Example
              title="Card KPI (Stat Card)"
              description="Muestra una metrica con icono, valor y subtexto."
              code={`<!-- Card KPI Bootstrap 5.1 -->
<div class="card border-0 shadow-sm"
  style="border-radius: 1rem; border-left: 3px solid #059669">
  <div class="card-body d-flex align-items-start gap-3">
    <div class="rounded-3 d-flex align-items-center
      justify-content-center"
      style="width:2.25rem; height:2.25rem;
             background: rgba(5,150,105,0.1)">
      <i class="bi bi-check-circle text-success"></i>
    </div>
    <div>
      <p class="text-muted mb-0" style="font-size:0.75rem">
        Completos
      </p>
      <p class="fw-bolder mb-0 fs-4">12</p>
      <small class="text-muted" style="font-size:0.625rem">
        evaluaciones finalizadas
      </small>
    </div>
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
              code={`<!-- Card con header Bootstrap 5.1 -->
<div class="card border-0 shadow-sm"
  style="border-radius: 1rem; overflow: hidden">
  <div class="card-header bg-light border-bottom py-3 px-4">
    <p class="text-uppercase fw-bold text-muted mb-0"
      style="font-size: 0.75rem; letter-spacing: 0.05em">
      Titulo de seccion
    </p>
  </div>
  <div class="card-body p-4">
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
              code={`<!-- Card de puntaje Bootstrap 5.1 -->
<div class="card border-0 shadow-sm"
  style="border-radius: 1rem; background: #eff6ff;
         border: 1px solid #bfdbfe">
  <div class="card-body p-4">
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <p class="text-muted fw-semibold mb-0"
          style="font-size: 0.75rem">
          Puntaje global 360
        </p>
        <small class="text-muted">3 respuestas</small>
      </div>
      <div class="text-end">
        <span class="fw-bolder text-primary"
          style="font-size: 1.875rem">3.85</span>
        <div class="text-muted" style="font-size:0.625rem">
          de 5.0
        </div>
      </div>
    </div>
    <div class="mt-2">
      <div class="progress" style="height: 0.5rem">
        <div class="progress-bar" role="progressbar"
          style="width: 77%; background-color: #2563eb">
        </div>
      </div>
      <span class="badge rounded-pill bg-primary
        bg-opacity-10 text-primary mt-2">
        Bueno
      </span>
    </div>
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
              Los formularios de Bootstrap 5.1 con clases de <code>form-control</code> y <code>form-select</code> replican los campos del proyecto.
            </p>

            <Example
              title="Input de Texto"
              description="Campo de texto estandar con icono de busqueda."
              code={`<!-- Input con icono de busqueda Bootstrap 5.1 -->
<div class="input-group">
  <span class="input-group-text bg-light border-end-0">
    <i class="bi bi-search text-muted"></i>
  </span>
  <input type="text" class="form-control border-start-0
    bg-light" placeholder="Buscar colaborador..."
    style="border-radius: 0 0.75rem 0.75rem 0">
</div>

<!-- Input sin icono -->
<input type="text" class="form-control"
  placeholder="Campo sin icono..."
  style="border-radius: 0.75rem">`}
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
              code={`<!-- Select Bootstrap 5.1 -->
<select class="form-select" style="border-radius: 0.75rem">
  <option selected>Todas las areas</option>
  <option value="1">Tecnologia</option>
  <option value="2">Ventas</option>
</select>`}
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
              </div>
            </Example>

            <Example
              title="Textarea"
              description="Area de texto multilinea."
              code={`<!-- Textarea Bootstrap 5.1 -->
<textarea class="form-control" rows="3"
  placeholder="Escribe aqui..."
  style="border-radius: 0.75rem; resize: none">
</textarea>`}
            >
              <div className="max-w-sm">
                <textarea placeholder="Escribe aqui..." className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400" rows={3} />
              </div>
            </Example>

            <Example
              title="Label con Campo"
              description="Estructura label + input con indicador de requerido."
              code={`<!-- Label + Input Bootstrap 5.1 -->
<div class="mb-3">
  <label class="form-label text-muted"
    style="font-size: 0.75rem; font-weight: 500">
    Nombre <span class="text-danger">*</span>
  </label>
  <input type="text" class="form-control"
    placeholder="Nombre completo"
    style="border-radius: 0.75rem">
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
              Las tablas de Bootstrap 5.1 con <code>table-hover</code> y <code>table-sm</code> replican el estilo del proyecto.
            </p>

            <Example
              title="Tabla con Header y Filas"
              description="Tabla estandar con columnas alineadas y estados hover."
              code={`<!-- Tabla Bootstrap 5.1 -->
<div class="card border-0 shadow-sm"
  style="border-radius: 1rem; overflow: hidden">
  <div class="table-responsive">
    <table class="table table-sm table-hover mb-0">
      <thead class="table-light">
        <tr>
          <th class="ps-4 text-uppercase fw-semibold text-muted"
            style="font-size:0.7rem; letter-spacing:0.05em">
            Colaborador
          </th>
          <th class="text-uppercase fw-semibold text-muted"
            style="font-size:0.7rem; letter-spacing:0.05em">
            Area
          </th>
          <th class="text-uppercase fw-semibold text-muted"
            style="font-size:0.7rem; letter-spacing:0.05em">
            Puntaje
          </th>
          <th class="text-uppercase fw-semibold text-muted"
            style="font-size:0.7rem; letter-spacing:0.05em">
            Estado
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="ps-4">
            <div class="d-flex align-items-center gap-2">
              <div class="rounded-3 bg-light d-flex
                align-items-center justify-content-center"
                style="width:2rem; height:2rem">
                <small class="fw-bold text-secondary">AT</small>
              </div>
              <span class="fw-semibold">Ana Torres</span>
            </div>
          </td>
          <td><small class="text-muted">Tecnologia</small></td>
          <td><span class="fw-bolder text-success">4.50</span></td>
          <td>
            <span class="badge rounded-pill bg-success
              bg-opacity-10 text-success">Completo</span>
          </td>
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
              title="Fila Expandible (Accordion)"
              description="Fila que se expande para mostrar detalle inline."
              code={`<!-- Fila expandible con Accordion Bootstrap 5.1 -->
<div class="accordion" id="tableAccordion">
  <div class="accordion-item border-0">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed py-3"
        type="button" data-bs-toggle="accordion"
        data-bs-target="#row1">
        <div class="d-flex align-items-center gap-3 w-100">
          <span class="fw-semibold">Ejemplo 1</span>
        </div>
      </button>
    </h2>
    <div id="row1" class="accordion-collapse collapse"
      data-bs-parent="#tableAccordion">
      <div class="accordion-body bg-light">
        <div class="card border-0 shadow-sm p-3">
          Panel de detalle expandido inline.
        </div>
      </div>
    </div>
  </div>
</div>`}
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
              Bootstrap 5.1 tiene el componente <code>progress</code> nativo que replica las barras del proyecto.
            </p>

            <Example
              title="Barra de Progreso Horizontal"
              description="Barra estandar para avance de evaluaciones."
              code={`<!-- Barra de progreso Bootstrap 5.1 -->
<div class="d-flex align-items-center gap-2">
  <div class="progress" style="width: 5rem; height: 0.375rem">
    <div class="progress-bar bg-success" role="progressbar"
      style="width: 100%"></div>
  </div>
  <small class="text-muted">5/5</small>
</div>

<div class="d-flex align-items-center gap-2">
  <div class="progress" style="width: 5rem; height: 0.375rem">
    <div class="progress-bar" role="progressbar"
      style="width: 60%"></div>
  </div>
  <small class="text-muted">3/5</small>
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
              code={`<!-- Barra de puntaje Bootstrap 5.1 -->
<div class="d-flex align-items-center gap-3">
  <span class="fw-bolder text-success" style="width:2.5rem">
    4.5
  </span>
  <div class="progress flex-grow-1"
    style="height: 0.5rem">
    <div class="progress-bar bg-success" role="progressbar"
      style="width: 90%"></div>
  </div>
  <span class="badge rounded-pill bg-success
    bg-opacity-10 text-success">Sobresaliente</span>
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
              code={`<!-- Barra de competencia Bootstrap 5.1 -->
<div class="d-flex align-items-center gap-2 mb-1">
  <span class="fw-bold text-muted" style="font-size:0.625rem;
    width: 1rem">1</span>
  <div class="flex-grow-1">
    <div class="d-flex justify-content-between mb-1">
      <span class="fw-semibold" style="font-size:0.7rem">
        Liderazgo
      </span>
      <span class="fw-bolder text-success"
        style="font-size:0.7rem">4.2</span>
    </div>
    <div class="progress" style="height: 0.25rem">
      <div class="progress-bar bg-success" role="progressbar"
        style="width: 84%"></div>
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
              Bootstrap 5.1 provee <code>nav-tabs</code> y <code>nav-pills</code> que replican los tabs del proyecto.
            </p>

            <Example
              title="Tabs tipo Pill"
              description="Tabs con fondo redondeado y sombra en el activo."
              code={`<!-- Tabs tipo pill Bootstrap 5.1 -->
<ul class="nav nav-pills bg-light rounded-3 p-1"
  style="width: fit-content">
  <li class="nav-item">
    <a class="nav-link active rounded-3 shadow-sm" href="#">
      <i class="bi bi-people me-1"></i> Colaboradores
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link text-muted rounded-3" href="#">
      <i class="bi bi-bar-chart me-1"></i> Resultados
    </a>
  </li>
</ul>`}
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
              code={`<!-- Tabs tipo underline Bootstrap 5.1 -->
<ul class="nav nav-tabs border-bottom">
  <li class="nav-item">
    <a class="nav-link active" href="#">
      <i class="bi bi-bar-chart me-2"></i> Resumen
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link text-muted" href="#">
      <i class="bi bi-eye me-2"></i> Resultados
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link text-muted" href="#">
      <i class="bi bi-clock me-2"></i> Seguimiento
    </a>
  </li>
</ul>`}
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
              code={`<!-- Tabs internos Bootstrap 5.1 -->
<ul class="nav nav-pills nav-fill bg-light p-2
  border-bottom">
  <li class="nav-item">
    <a class="nav-link active rounded-3 shadow-sm"
      style="font-size: 0.75rem" href="#">
      <i class="bi bi-bar-chart me-1"></i> Resumen
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link text-muted rounded-3"
      style="font-size: 0.75rem" href="#">
      <i class="bi bi-person-plus me-1"></i> Asignar
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link text-muted rounded-3"
      style="font-size: 0.75rem" href="#">
      <i class="bi bi-clock me-1"></i> Seguimiento
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link text-muted rounded-3"
      style="font-size: 0.75rem" href="#">
      <i class="bi bi-eye me-1"></i> Resultados
    </a>
  </li>
</ul>`}
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
              El componente <code>modal</code> de Bootstrap 5.1 replica exactamente los modales del proyecto.
            </p>

            <Example
              title="Modal"
              description="Estructura base de un modal con overlay y dialog."
              code={`<!-- Modal Bootstrap 5.1 -->
<div class="modal fade show" id="assignModal"
  tabindex="-1" style="display: block">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content"
      style="border: none; border-radius: 1rem;
             box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
             overflow: hidden">

      <!-- Header con gradiente -->
      <div class="modal-header border-0"
        style="background: linear-gradient(to bottom right,
               #f8fafc, #f3f4f6)">
        <h5 class="modal-title fw-bold">Asignar Evaluador</h5>
        <button type="button" class="btn-close"
          data-bs-dismiss="modal"></button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <p class="text-muted">Contenido del modal aqui.</p>
      </div>
    </div>
  </div>
</div>

<!-- Overlay (backdrop) -->
<div class="modal-backdrop show"
  style="background: rgba(0,0,0,0.4);
         backdrop-filter: blur(4px)">
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
              Los estados vacios se construyen con utilidades de flex y espaciado de Bootstrap 5.1.
            </p>

            <Example
              title="Estado Vacio Estandar"
              description="Para secciones sin datos."
              code={`<!-- Estado vacio Bootstrap 5.1 -->
<div class="d-flex flex-column align-items-center
  justify-content-center py-5 text-center">
  <div class="rounded-3 bg-light d-flex align-items-center
    justify-content-center mb-3"
    style="width: 3.5rem; height: 3.5rem">
    <i class="bi bi-people text-muted fs-4"></i>
  </div>
  <h6 class="text-muted fw-semibold"
    style="font-size: 0.875rem">Sin resultados</h6>
  <p class="text-muted mb-0"
    style="font-size: 0.75rem; max-width: 20rem">
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
              code={`<!-- Estado vacio en card Bootstrap 5.1 -->
<div class="card border-0 shadow-sm d-flex flex-column
  align-items-center justify-content-center text-center"
  style="border-radius: 1rem; min-height: 25rem; padding: 2rem">
  <div class="rounded-3 bg-light d-flex align-items-center
    justify-content-center mb-3"
    style="width: 4rem; height: 4rem">
    <i class="bi bi-people text-muted fs-2"></i>
  </div>
  <h6 class="text-muted fw-semibold"
    style="font-size: 0.875rem">
    Selecciona un colaborador
  </h6>
  <p class="text-muted mb-0"
    style="font-size: 0.75rem; max-width: 20rem">
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
              El grid 9-box se construye con el sistema de grid de Bootstrap 5.1 y CSS custom properties para los colores dinamicos.
            </p>

            <Example
              title="Celda del 9-Box"
              description="Celda individual con color, label y avatares."
              code={`<!-- 9-Box Grid Bootstrap 5.1 -->
<div class="container-fluid">
  <div class="row g-2">

    <!-- Celda: Estrella (A) -->
    <div class="col-4">
      <div class="position-relative p-3 rounded-3 border"
        style="min-height: 7.5rem;
               border-color: #065f46;
               background-color: #d1fae5;
               transition: transform 0.2s">
        <div class="d-flex justify-content-between mb-1">
          <span class="fw-black" style="font-size:0.625rem;
            color: #065f46">A</span>
          <span class="fw-bold" style="font-size:0.625rem;
            color: #065f46">Estrella</span>
        </div>
        <p style="font-size:0.5625rem; color: #065f46;
          line-height: 1.2">
          100% VALORES / 100% RESULTADOS
        </p>
        <!-- Avatares -->
        <div class="d-flex">
          <div class="rounded-circle border border-white d-flex
            align-items-center justify-content-center"
            style="width:1.75rem; height:1.75rem;
                   background: #065f46; color: white;
                   font-size:0.625rem; font-weight:700;
                   margin-right: -0.375rem">
            AT
          </div>
        </div>
        <!-- Badge de conteo -->
        <span class="position-absolute rounded-circle
          d-flex align-items-center justify-content-center"
          style="top: 0.375rem; right: 0.375rem;
                 width: 1.25rem; height: 1.25rem;
                 font-size: 0.625rem; font-weight: 700;
                 background: rgba(6,95,70,0.2);
                 color: #065f46">3</span>
      </div>
    </div>

    <!-- Repetir para B4, B3, B2, C, B1, D, E, F -->

  </div>
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
                <h3 className="text-sm font-bold text-gray-700">Equivalencia de Espaciado</h3>
                <p className="text-xs text-gray-500">El proyecto usa Tailwind; aqui la equivalencia con Bootstrap 5.1 spacing utilities.</p>
                <div className="space-y-2">
                  {[
                    { tw: 'p-2', bs: 'p-2', desc: 'Padding compacto (badges, chips)' },
                    { tw: 'p-3', bs: 'p-3', desc: 'Padding pequeno (items de lista)' },
                    { tw: 'p-4', bs: 'p-4', desc: 'Padding estandar (cards KPI)' },
                    { tw: 'p-5', bs: 'p-5', desc: 'Padding generico (cards, modales)' },
                    { tw: 'p-6', bs: 'p-6', desc: 'Padding amplio (secciones)' },
                  ].map(s => (
                    <div key={s.tw} className="flex items-center gap-3 border-b border-gray-50 pb-2 last:border-0">
                      <code className="text-[11px] font-mono text-blue-600 w-16">Tailwind: {s.tw}</code>
                      <code className="text-[11px] font-mono text-green-600 w-16">BS5: {s.bs}</code>
                      <span className="text-[11px] text-gray-400">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Border Radius</h3>
                <div className="space-y-2">
                  {[
                    { tw: 'rounded-lg', bs: 'rounded-3', desc: 'Botones, inputs' },
                    { tw: 'rounded-xl', bs: 'rounded-4', desc: 'Avatares, iconos' },
                    { tw: 'rounded-2xl', bs: 'style="border-radius: 1rem"', desc: 'Cards, modales' },
                    { tw: 'rounded-full', bs: 'rounded-circle / rounded-pill', desc: 'Badges, avatares circulares' },
                  ].map(r => (
                    <div key={r.tw} className="flex items-center gap-3 border-b border-gray-50 pb-2 last:border-0">
                      <code className="text-[11px] font-mono text-blue-600 w-24">Tailwind: {r.tw}</code>
                      <code className="text-[11px] font-mono text-green-600 w-44">BS5: {r.bs}</code>
                      <span className="text-[11px] text-gray-400">{r.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Shadows</h3>
                <div className="space-y-2">
                  {[
                    { tw: 'shadow-sm', bs: 'shadow-sm', desc: 'Cards, inputs' },
                    { tw: 'shadow-md', bs: 'shadow', desc: 'Cards seleccionadas' },
                    { tw: 'shadow-lg', bs: 'shadow-lg', desc: 'Dropdowns' },
                    { tw: 'shadow-xl', bs: 'shadow-lg', desc: 'Paneles de detalle' },
                    { tw: 'shadow-2xl', bs: 'style="box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)"', desc: 'Modales' },
                  ].map(s => (
                    <div key={s.tw} className="flex items-center gap-3 border-b border-gray-50 pb-2 last:border-0">
                      <code className="text-[11px] font-mono text-blue-600 w-24">Tailwind: {s.tw}</code>
                      <code className="text-[11px] font-mono text-green-600 break-all">BS5: {s.bs}</code>
                      <span className="text-[11px] text-gray-400 shrink-0">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Grids Responsive</h3>
                <div className="space-y-2 text-xs">
                  {[
                    { tw: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', bs: 'row g-3 > col-12 col-sm-6 col-lg-4' },
                    { tw: 'grid grid-cols-3 gap-4', bs: 'row g-3 > col-4' },
                    { tw: 'grid grid-cols-2 gap-2', bs: 'row g-2 > col-6' },
                  ].map(g => (
                    <div key={g.tw} className="border-b border-gray-50 pb-2 last:border-0">
                      <p className="font-mono text-blue-600 text-[11px]">Tailwind: {g.tw}</p>
                      <p className="font-mono text-green-600 text-[11px]">BS5: {g.bs}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════ ICONS REFERENCE ═══════════════════ */}
          <section id="icons" className="scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Iconos</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <p className="text-xs text-gray-500">
                El proyecto usa <strong>Lucide React</strong>. La equivalencia con <strong>Bootstrap Icons</strong> se muestra abajo.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { lucide: 'Users', bs: 'bi-people' },
                  { lucide: 'User', bs: 'bi-person' },
                  { lucide: 'UserPlus', bs: 'bi-person-plus' },
                  { lucide: 'UserCheck', bs: 'bi-person-check' },
                  { lucide: 'CheckCircle2', bs: 'bi-check-circle' },
                  { lucide: 'AlertCircle', bs: 'bi-exclamation-circle' },
                  { lucide: 'Search', bs: 'bi-search' },
                  { lucide: 'BarChart3', bs: 'bi-bar-chart' },
                  { lucide: 'BarChart2', bs: 'bi-bar-chart-line' },
                  { lucide: 'TrendingUp', bs: 'bi-graph-up-arrow' },
                  { lucide: 'Award', bs: 'bi-award' },
                  { lucide: 'Star', bs: 'bi-star' },
                  { lucide: 'Target', bs: 'bi-bullseye' },
                  { lucide: 'Eye', bs: 'bi-eye' },
                  { lucide: 'Clock', bs: 'bi-clock' },
                  { lucide: 'Briefcase', bs: 'bi-briefcase' },
                  { lucide: 'Globe', bs: 'bi-globe' },
                  { lucide: 'Link2', bs: 'bi-link-45deg' },
                  { lucide: 'Copy', bs: 'bi-clipboard' },
                  { lucide: 'Plus', bs: 'bi-plus' },
                  { lucide: 'Trash2', bs: 'bi-trash' },
                  { lucide: 'Settings', bs: 'bi-gear' },
                  { lucide: 'Shield', bs: 'bi-shield' },
                  { lucide: 'ChevronDown', bs: 'bi-chevron-down' },
                  { lucide: 'ChevronUp', bs: 'bi-chevron-up' },
                  { lucide: 'ChevronRight', bs: 'bi-chevron-right' },
                  { lucide: 'X', bs: 'bi-x' },
                  { lucide: 'Menu', bs: 'bi-list' },
                  { lucide: 'FileText', bs: 'bi-file-text' },
                  { lucide: 'Layers', bs: 'bi-layers' },
                  { lucide: 'Building2', bs: 'bi-building' },
                  { lucide: 'Zap', bs: 'bi-lightning' },
                  { lucide: 'BookOpen', bs: 'bi-book' },
                ].map(ic => (
                  <div key={ic.lucide} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <code className="text-[10px] font-mono text-blue-600 w-28 shrink-0">Lucide: {ic.lucide}</code>
                    <code className="text-[10px] font-mono text-green-600 w-28 shrink-0">BS: {ic.bs}</code>
                    <span className="text-[10px] text-gray-400">{'<i class="bi bi-' + ic.bs.replace('bi-', '') + '"></i>'}</span>
                  </div>
                ))}
              </div>
              <CodeBlock>{`<!-- Para usar Bootstrap Icons, agregar en el <head>: -->
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

<!-- Uso: -->
<i class="bi bi-people"></i>
<i class="bi bi-person-plus me-2"></i>
<i class="bi bi-check-circle text-success"></i>`}</CodeBlock>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
