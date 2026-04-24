import { useState } from 'react';
import {
  ArrowLeft, User, Clock, Umbrella, BarChart2, FileText, File, Calendar, CheckSquare,
  Star, Briefcase, BookOpen, Compass, Key, Shield, Settings, ChevronDown, Info,
  GraduationCap, Award, Globe, Zap, Pencil, Plus, Download, CheckCircle2, Circle,
  MapPin, CreditCard, Building2, TrendingUp, Target, ClipboardList, UserCheck,
  ThumbsUp, ThumbsDown, ChevronUp,
} from 'lucide-react';
import type { EmployeeProfile } from '../data/employeeProfiles';
import { BOX_CONFIGS } from '../data/mockData';
import { EMPLOYEES } from '../data/mockData';

type Tab =
  | 'perfil'
  | 'fichajes'
  | 'ausencias'
  | 'estadisticas'
  | 'contratos'
  | 'documentos'
  | 'horarios'
  | 'tareas'
  | 'evaluaciones';

type ProfileSection =
  | 'datos-personales'
  | 'datos-laborales'
  | 'datos-nomina'
  | 'campos'
  | 'formacion'
  | 'journey'
  | 'accesos'
  | 'roles'
  | 'automatizaciones'
  | 'configuracion';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'perfil', label: 'Perfil', icon: <User size={14} /> },
  { id: 'fichajes', label: 'Fichajes', icon: <Clock size={14} /> },
  { id: 'ausencias', label: 'Ausencias y vacaciones', icon: <Umbrella size={14} /> },
  { id: 'estadisticas', label: 'Estadísticas', icon: <BarChart2 size={14} /> },
  { id: 'contratos', label: 'Contratos', icon: <FileText size={14} /> },
  { id: 'documentos', label: 'Documentos', icon: <File size={14} /> },
  { id: 'horarios', label: 'Horarios', icon: <Calendar size={14} /> },
  { id: 'tareas', label: 'Tareas', icon: <CheckSquare size={14} /> },
  { id: 'evaluaciones', label: 'Evaluaciones', icon: <Star size={14} /> },
];

const PROFILE_SECTIONS: { id: ProfileSection; label: string; icon: React.ReactNode }[] = [
  { id: 'datos-personales', label: 'Datos personales', icon: <User size={15} /> },
  { id: 'datos-laborales', label: 'Datos laborales', icon: <Briefcase size={15} /> },
  { id: 'datos-nomina', label: 'Datos nómina', icon: <CreditCard size={15} /> },
  { id: 'campos', label: 'Campos personalizados', icon: <FileText size={15} /> },
  { id: 'formacion', label: 'Formación y habilidades', icon: <GraduationCap size={15} /> },
  { id: 'journey', label: 'Journey', icon: <Compass size={15} /> },
  { id: 'accesos', label: 'Accesos', icon: <Key size={15} /> },
  { id: 'roles', label: 'Roles', icon: <Shield size={15} /> },
  { id: 'automatizaciones', label: 'Automatizaciones', icon: <Zap size={15} /> },
  { id: 'configuracion', label: 'Configuración', icon: <Settings size={15} /> },
];

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400';
const selectCls =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none appearance-none transition-all focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400';

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-bold text-gray-900 mb-5">{children}</h3>;
}

function Divider() {
  return <hr className="border-gray-100 my-7" />;
}

// ── SECTIONS ─────────────────────────────────────────────────────────────────

function DatosPersonales({ emp }: { emp: EmployeeProfile }) {
  const [sharesBirthday, setSharesBirthday] = useState(emp.sharesBirthday);

  return (
    <div>
      <SectionTitle>Información personal</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Nombre" required>
          <input type="text" defaultValue={emp.firstName} className={inputCls} />
        </FormField>
        <FormField label="Apellido paterno" required>
          <input type="text" defaultValue={emp.lastName} className={inputCls} />
        </FormField>
        <FormField label="Apellido materno">
          <input type="text" defaultValue={emp.maternalLastName} className={inputCls} />
        </FormField>
        <div className="md:col-span-1" />
        <div className="grid grid-cols-2 gap-2 md:col-span-2">
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Tipo de identificación principal">
              <SelectWrapper>
                <select defaultValue={emp.idType} className={selectCls}>
                  <option value="CURP">CURP</option>
                  <option value="INE">INE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </SelectWrapper>
            </FormField>
            <FormField label=" ">
              <input type="text" defaultValue={emp.idNumber} className={inputCls} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Tipo de identificación secundaria">
              <SelectWrapper>
                <select defaultValue={emp.idType2} className={selectCls}>
                  <option value="RFC">RFC</option>
                  <option value="NSS">NSS</option>
                  <option value="">—</option>
                </select>
              </SelectWrapper>
            </FormField>
            <FormField label=" ">
              <input type="text" defaultValue={emp.idNumber2} className={inputCls} />
            </FormField>
          </div>
        </div>
        <FormField label="Nacionalidad">
          <SelectWrapper>
            <select defaultValue={emp.nationality} className={selectCls}>
              <option>Mexicana</option>
              <option>Estadounidense</option>
              <option>Colombiana</option>
              <option>Argentina</option>
            </select>
          </SelectWrapper>
        </FormField>
        <FormField label="Estado civil">
          <SelectWrapper>
            <select defaultValue={emp.civilStatus} className={selectCls}>
              <option>Soltero</option>
              <option>Soltera</option>
              <option>Casado</option>
              <option>Casada</option>
              <option>Divorciado</option>
              <option>Divorciada</option>
              <option>Viudo</option>
              <option>Viuda</option>
            </select>
          </SelectWrapper>
        </FormField>
        <FormField label="Fecha de nacimiento">
          <div className="relative">
            <input type="date" defaultValue={emp.birthDate} className={inputCls} />
          </div>
        </FormField>
        <FormField label="Género">
          <SelectWrapper>
            <select defaultValue={emp.gender} className={selectCls}>
              <option>Masculino</option>
              <option>Femenino</option>
              <option>No binario</option>
              <option>Prefiero no especificar</option>
            </select>
          </SelectWrapper>
        </FormField>
        <div className="md:col-span-2">
          <label
            className="inline-flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={() => setSharesBirthday(v => !v)}
          >
            <div
              className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all shrink-0 ${sharesBirthday ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 group-hover:border-gray-400'}`}
            >
              {sharesBirthday && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 3.5L4 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-700 font-medium">Compartir cumpleaños</span>
            <Info size={13} className="text-gray-400" />
          </label>
        </div>
      </div>

      <Divider />
      <SectionTitle>Dirección</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Domicilio">
          <input type="text" defaultValue={emp.street} className={inputCls} />
        </FormField>
        <FormField label="Colonia">
          <input type="text" defaultValue={emp.colony} className={inputCls} />
        </FormField>
        <FormField label="Código postal">
          <input type="text" defaultValue={emp.postalCode} className={inputCls} />
        </FormField>
        <FormField label="Alcaldía / municipio">
          <input type="text" defaultValue={emp.municipality} className={inputCls} />
        </FormField>
        <FormField label="Estado">
          <SelectWrapper>
            <select defaultValue={emp.state} className={selectCls}>
              <option>Ciudad de México</option>
              <option>Jalisco</option>
              <option>Nuevo León</option>
              <option>Estado de México</option>
            </select>
          </SelectWrapper>
        </FormField>
        <FormField label="País">
          <SelectWrapper>
            <select defaultValue={emp.country} className={selectCls}>
              <option>México</option>
              <option>Estados Unidos</option>
              <option>Colombia</option>
            </select>
          </SelectWrapper>
        </FormField>
      </div>

      <Divider />
      <SectionTitle>Contacto</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Correo electrónico corporativo">
          <input type="email" defaultValue={emp.email} className={inputCls} />
        </FormField>
        <FormField label="Teléfono">
          <input type="tel" defaultValue={emp.phone} className={inputCls} />
        </FormField>
      </div>
    </div>
  );
}

function DatosLaborales({ emp }: { emp: EmployeeProfile }) {
  return (
    <div>
      <SectionTitle>Información laboral</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Número de empleado">
          <input type="text" defaultValue={emp.employeeNumber} readOnly className={`${inputCls} bg-gray-50 cursor-default`} />
        </FormField>
        <FormField label="Fecha de ingreso">
          <input type="date" defaultValue={emp.startDate} className={inputCls} />
        </FormField>
        <FormField label="Puesto">
          <input type="text" defaultValue={emp.position} className={inputCls} />
        </FormField>
        <FormField label="Departamento">
          <SelectWrapper>
            <select defaultValue={emp.department} className={selectCls}>
              <option>Tecnología</option>
              <option>Ventas</option>
              <option>Recursos Humanos</option>
              <option>Finanzas</option>
              <option>Operaciones</option>
              <option>Marketing</option>
            </select>
          </SelectWrapper>
        </FormField>
        <FormField label="Tipo de contrato">
          <SelectWrapper>
            <select defaultValue={emp.contractType} className={selectCls}>
              <option>Indefinido</option>
              <option>Por tiempo determinado</option>
              <option>Por obra o servicio</option>
              <option>Prácticas</option>
            </select>
          </SelectWrapper>
        </FormField>
        <FormField label="Tipo de jornada">
          <SelectWrapper>
            <select defaultValue={emp.workdayType} className={selectCls}>
              <option>Tiempo completo</option>
              <option>Medio tiempo</option>
              <option>Por horas</option>
            </select>
          </SelectWrapper>
        </FormField>
        <FormField label="Horario de trabajo">
          <input type="text" defaultValue={emp.workSchedule} className={inputCls} />
        </FormField>
        <FormField label="Centro de costos">
          <input type="text" defaultValue={emp.costCenter} className={inputCls} />
        </FormField>
        <FormField label="Responsable / Jefe directo">
          <input type="text" defaultValue={emp.manager} className={inputCls} />
        </FormField>
        <FormField label="Lugar de trabajo">
          <SelectWrapper>
            <select defaultValue={emp.workLocation} className={selectCls}>
              <option>Oficina central</option>
              <option>Remoto</option>
              <option>Híbrido</option>
              <option>Planta operativa</option>
              <option>Oficina + campo</option>
            </select>
          </SelectWrapper>
        </FormField>
      </div>
    </div>
  );
}

function DatosNomina({ emp }: { emp: EmployeeProfile }) {
  return (
    <div>
      <SectionTitle>Datos de nómina</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Método de pago">
          <SelectWrapper>
            <select defaultValue={emp.paymentMethod} className={selectCls}>
              <option>Transferencia bancaria</option>
              <option>Cheque</option>
              <option>Efectivo</option>
            </select>
          </SelectWrapper>
        </FormField>
        <FormField label="Banco">
          <SelectWrapper>
            <select defaultValue={emp.bank} className={selectCls}>
              <option>BBVA</option>
              <option>Banamex</option>
              <option>Banorte</option>
              <option>Santander</option>
              <option>HSBC</option>
            </select>
          </SelectWrapper>
        </FormField>
        <FormField label="CLABE interbancaria">
          <input type="text" defaultValue={emp.clabe} className={inputCls} maxLength={18} />
        </FormField>
        <FormField label="Esquema de nómina">
          <SelectWrapper>
            <select defaultValue={emp.payrollScheme} className={selectCls}>
              <option>Neto garantizado</option>
              <option>Mixto</option>
              <option>Mixto + comisiones</option>
              <option>Mixto + bono</option>
            </select>
          </SelectWrapper>
        </FormField>
        <FormField label="Salario diario">
          <input type="text" defaultValue={emp.dailySalary} className={inputCls} />
        </FormField>
        <FormField label="Salario mensual">
          <input type="text" defaultValue={emp.monthlySalary} className={inputCls} />
        </FormField>
      </div>
    </div>
  );
}

function CamposPersonalizados() {
  return (
    <div>
      <SectionTitle>Campos personalizados</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Número de camiseta (uniforme)">
          <input type="text" placeholder="Ej. M, L, XL" className={inputCls} />
        </FormField>
        <FormField label="Categoría de nómina interna">
          <SelectWrapper>
            <select className={selectCls}>
              <option value="">Selecciona</option>
              <option>Operativo</option>
              <option>Administrativo</option>
              <option>Directivo</option>
            </select>
          </SelectWrapper>
        </FormField>
        <FormField label="Código de acceso a planta">
          <input type="text" placeholder="Ej. ACC-2024-XX" className={inputCls} />
        </FormField>
        <FormField label="Programa de beneficios">
          <SelectWrapper>
            <select className={selectCls}>
              <option value="">Selecciona</option>
              <option>Plan A – Básico</option>
              <option>Plan B – Estándar</option>
              <option>Plan C – Premium</option>
            </select>
          </SelectWrapper>
        </FormField>
      </div>
      <div className="mt-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <Plus size={14} />
          Agregar campo personalizado
        </button>
      </div>
    </div>
  );
}

function Formacion({ emp }: { emp: EmployeeProfile }) {
  return (
    <div className="space-y-8">
      {/* Education */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Formación académica</SectionTitle>
          <button type="button" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700">
            <Plus size={13} /> Agregar
          </button>
        </div>
        <div className="space-y-3">
          {emp.education.map((edu, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <GraduationCap size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{edu.level}</p>
                <p className="text-xs text-gray-600">{edu.field}</p>
                <p className="text-xs text-gray-400">{edu.institution} · {edu.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Certificaciones</SectionTitle>
          <button type="button" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700">
            <Plus size={13} /> Agregar
          </button>
        </div>
        {emp.certifications.length === 0 ? (
          <p className="text-sm text-gray-400">Sin certificaciones registradas.</p>
        ) : (
          <div className="space-y-3">
            {emp.certifications.map((cert, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <Award size={16} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{cert.name}</p>
                  <p className="text-xs text-gray-500">{cert.issuer} · {cert.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills */}
      <div>
        <SectionTitle>Habilidades</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {emp.skills.map(skill => (
            <span key={skill} className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
              {skill}
            </span>
          ))}
          <button type="button" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:bg-gray-50 transition-colors inline-flex items-center gap-1">
            <Plus size={11} /> Agregar
          </button>
        </div>
      </div>

      {/* Languages */}
      <div>
        <SectionTitle>Idiomas</SectionTitle>
        <div className="space-y-2">
          {emp.languages.map((lang, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white">
              <Globe size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm font-semibold text-gray-800">{lang.language}</span>
              <span className="text-xs text-gray-400 ml-auto">{lang.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Journey({ emp }: { emp: EmployeeProfile }) {
  const typeStyles: Record<string, { bg: string; text: string; dot: string }> = {
    hire: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    promotion: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    review: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    training: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    award: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  };
  const typeLabels: Record<string, string> = {
    hire: 'Incorporación',
    promotion: 'Promoción',
    review: 'Evaluación',
    training: 'Capacitación',
    award: 'Reconocimiento',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionTitle>Journey del colaborador</SectionTitle>
        <button type="button" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700">
          <Plus size={13} /> Agregar evento
        </button>
      </div>
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
        <div className="space-y-5 pl-8">
          {[...emp.journey].reverse().map((ev, i) => {
            const s = typeStyles[ev.type];
            return (
              <div key={i} className="relative">
                <div className={`absolute -left-8 top-2 w-3.5 h-3.5 rounded-full border-2 border-white ${s.dot} shadow-sm`} />
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                          {typeLabels[ev.type]}
                        </span>
                        <span className="text-xs text-gray-400">{ev.date}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{ev.event}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{ev.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Accesos({ emp }: { emp: EmployeeProfile }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <SectionTitle>Accesos a sistemas</SectionTitle>
        <button type="button" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700">
          <Plus size={13} /> Agregar acceso
        </button>
      </div>
      <div className="space-y-3">
        {emp.accesses.map((acc, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
              <Key size={15} className="text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{acc.system}</p>
              <p className="text-xs text-gray-500">{acc.role} · Desde {acc.granted}</p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${acc.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              {acc.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Roles({ emp }: { emp: EmployeeProfile }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <SectionTitle>Roles y responsabilidades</SectionTitle>
        <button type="button" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700">
          <Plus size={13} /> Agregar rol
        </button>
      </div>
      <div className="space-y-3">
        {emp.roles.map((role, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <Shield size={15} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{role.name}</p>
              <p className="text-xs text-gray-500">Desde {role.since}</p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {role.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Automatizaciones() {
  const rules = [
    { name: 'Alerta de vencimiento de contrato', trigger: '30 días antes del vencimiento', action: 'Notificar a RRHH', active: true },
    { name: 'Recordatorio de evaluación', trigger: 'Inicio de ciclo de evaluación', action: 'Enviar correo al colaborador', active: true },
    { name: 'Bienvenida automática', trigger: 'Alta de empleado nuevo', action: 'Enviar kit de bienvenida por correo', active: false },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <SectionTitle>Automatizaciones activas</SectionTitle>
        <button type="button" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700">
          <Plus size={13} /> Nueva regla
        </button>
      </div>
      <div className="space-y-3">
        {rules.map((r, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
              <Zap size={15} className="text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{r.name}</p>
              <p className="text-xs text-gray-500">{r.trigger} → {r.action}</p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${r.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
              {r.active ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Configuracion({ emp }: { emp: EmployeeProfile }) {
  return (
    <div>
      <SectionTitle>Configuración del perfil</SectionTitle>
      <div className="space-y-4">
        {[
          { label: 'Visible en el directorio de empleados', checked: true },
          { label: 'Recibir notificaciones por correo', checked: true },
          { label: 'Recibir recordatorios de evaluaciones', checked: true },
          { label: 'Permitir que compañeros vean su posición en la Matriz 9-Box', checked: false },
          { label: 'Cuenta activa', checked: true },
        ].map(({ label, checked }, i) => (
          <label key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group">
            <span className="text-sm text-gray-700">{label}</span>
            <div className="relative">
              <div className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
              </div>
            </div>
          </label>
        ))}
      </div>

      <Divider />
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
        <div className="flex-1">
          <p className="text-sm font-bold text-red-800">Zona de peligro</p>
          <p className="text-xs text-red-600 mt-0.5">Estas acciones son irreversibles. Procede con cuidado.</p>
        </div>
        <button type="button" className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-all">
          Dar de baja
        </button>
      </div>
    </div>
  );
}

// ── PLACEHOLDER TABS ──────────────────────────────────────────────────────────

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <BookOpen size={22} className="text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-400">{label}</p>
      <p className="text-xs text-gray-300 mt-1">Sin datos disponibles.</p>
    </div>
  );
}

// ── DOCUMENTOS TAB ────────────────────────────────────────────────────────────

function DocumentosTab({ emp }: { emp: EmployeeProfile }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-base font-bold text-gray-900">Documentos del colaborador</p>
        <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm">
          <Plus size={13} /> Subir documento
        </button>
      </div>
      <div className="space-y-3">
        {emp.documents.map((doc, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <File size={15} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
              <p className="text-xs text-gray-400">{doc.type} · Subido {doc.uploadedAt} · {doc.size}</p>
            </div>
            <button type="button" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
              <Download size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EVALUACIONES TAB ──────────────────────────────────────────────────────────

type EvalSubTab = 'empleadoA' | 'eval360' | 'aciertos';

const EVAL_SUBTABS: { id: EvalSubTab; label: string; icon: React.ReactNode }[] = [
  { id: 'empleadoA', label: 'Empleado A', icon: <UserCheck size={14} /> },
  { id: 'eval360', label: 'Evaluación 360', icon: <ClipboardList size={14} /> },
  { id: 'aciertos', label: 'Aciertos y Desaciertos', icon: <Target size={14} /> },
];

// ── EMPLEADO A (9-BOX) ────────────────────────────────────────────────────────

const GRID_LAYOUT: { row: number; col: number; potential: string; performance: string }[] = [
  { row: 0, col: 0, potential: 'high', performance: 'low' },
  { row: 0, col: 1, potential: 'high', performance: 'medium' },
  { row: 0, col: 2, potential: 'high', performance: 'high' },
  { row: 1, col: 0, potential: 'medium', performance: 'low' },
  { row: 1, col: 1, potential: 'medium', performance: 'medium' },
  { row: 1, col: 2, potential: 'medium', performance: 'high' },
  { row: 2, col: 0, potential: 'low', performance: 'low' },
  { row: 2, col: 1, potential: 'low', performance: 'medium' },
  { row: 2, col: 2, potential: 'low', performance: 'high' },
];

function EmpleadoATab({ emp }: { emp: EmployeeProfile }) {
  const mockEmp = EMPLOYEES.find(e => e.name === `${emp.firstName} ${emp.lastName}`);
  if (!mockEmp) return <EmptyEval label="Empleado A" />;

  const box = BOX_CONFIGS.find(
    b => b.potentialLevel === mockEmp.potentialLevel && b.performanceLevel === mockEmp.performanceLevel
  );

  const perfPct = Math.round((mockEmp.performance / 5) * 100);
  const potPct = Math.round((mockEmp.potential / 5) * 100);

  const levelLabel: Record<string, string> = { high: 'Alto', medium: 'Medio', low: 'Bajo' };
  const levelColor: Record<string, string> = {
    high: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    medium: 'text-blue-700 bg-blue-50 border-blue-200',
    low: 'text-red-700 bg-red-50 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Header resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-gray-100 bg-white">
          <p className="text-xs text-gray-400 mb-1">Posición 9-Box</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-lg font-black px-3 py-1 rounded-lg"
              style={{ background: box?.bgColor, color: box?.textColor }}
            >
              {box?.code ?? '—'}
            </span>
            <span className="text-sm font-bold text-gray-800">{box?.label ?? '—'}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 bg-white">
          <p className="text-xs text-gray-400 mb-2">Resultados</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Score</span>
            <span className="text-sm font-black text-gray-900">{mockEmp.performance.toFixed(1)}<span className="text-xs font-normal text-gray-400">/5</span></span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${perfPct}%`, background: box?.color ?? '#3b82f6' }} />
          </div>
          <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelColor[mockEmp.performanceLevel]}`}>
            {levelLabel[mockEmp.performanceLevel]}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 bg-white">
          <p className="text-xs text-gray-400 mb-2">Valores</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Score</span>
            <span className="text-sm font-black text-gray-900">{mockEmp.potential.toFixed(1)}<span className="text-xs font-normal text-gray-400">/5</span></span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${potPct}%`, background: box?.color ?? '#3b82f6' }} />
          </div>
          <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelColor[mockEmp.potentialLevel]}`}>
            {levelLabel[mockEmp.potentialLevel]}
          </span>
        </div>
      </div>

      {/* Mini 9-box grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-900 mb-4">Posición en la Matriz 9-Box</p>
        <div className="flex gap-4">
          {/* Y-axis label */}
          <div className="flex items-center">
            <span className="text-[10px] text-gray-400 font-semibold tracking-wide" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              VALORES →
            </span>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-1.5">
              {GRID_LAYOUT.map(cell => {
                const cellBox = BOX_CONFIGS.find(b => b.potentialLevel === cell.potential && b.performanceLevel === cell.performance);
                const isActive = cellBox?.potentialLevel === mockEmp.potentialLevel && cellBox?.performanceLevel === mockEmp.performanceLevel;
                return (
                  <div
                    key={`${cell.row}-${cell.col}`}
                    className={`relative rounded-xl p-3 transition-all ${isActive ? 'ring-2 ring-offset-1' : ''}`}
                    style={{
                      background: isActive ? cellBox?.bgColor : '#f9fafb',
                      borderColor: isActive ? cellBox?.color : 'transparent',
                      ringColor: isActive ? cellBox?.color : undefined,
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span
                        className="text-[10px] font-black px-1.5 py-0.5 rounded"
                        style={{ background: cellBox?.bgColor, color: cellBox?.textColor }}
                      >
                        {cellBox?.code}
                      </span>
                      {isActive && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black shadow-sm" style={{ background: cellBox?.color }}>
                          {emp.avatar.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] font-semibold leading-tight" style={{ color: cellBox?.textColor ?? '#374151' }}>
                      {cellBox?.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-2">
              <span className="text-[10px] text-gray-400 font-semibold tracking-wide">← RESULTADOS →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Competencias */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-900 mb-4">Competencias evaluadas</p>
        <div className="space-y-3">
          {mockEmp.competencies.map((comp, i) => {
            const pct = Math.round((comp.score / 5) * 100);
            const barColor = comp.score >= 4 ? '#10b981' : comp.score >= 3 ? '#3b82f6' : '#f59e0b';
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700">{comp.label}</span>
                  <span className="text-xs font-bold text-gray-900">{comp.score.toFixed(1)}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Objetivos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-900 mb-4">Objetivos del ciclo</p>
        <div className="space-y-4">
          {mockEmp.goals.map((goal, i) => {
            const over = goal.progress > 100;
            const pct = Math.min(goal.progress, 100);
            const barColor = goal.progress >= 90 ? '#10b981' : goal.progress >= 70 ? '#3b82f6' : '#f59e0b';
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-700 flex-1">{goal.label}</span>
                  <span className={`text-xs font-bold ml-3 ${over ? 'text-emerald-600' : goal.progress < 70 ? 'text-amber-600' : 'text-gray-900'}`}>
                    {goal.progress}%
                    {over && <span className="ml-1 text-[10px] font-semibold text-emerald-500">↑</span>}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recomendación */}
      {box && (
        <div className="rounded-2xl p-5 border" style={{ background: box.bgColor, borderColor: box.color + '40' }}>
          <p className="text-xs font-bold mb-1.5" style={{ color: box.textColor }}>Recomendación para este perfil</p>
          <p className="text-sm leading-relaxed" style={{ color: box.textColor }}>{box.recommendation}</p>
        </div>
      )}
    </div>
  );
}

// ── EVALUACIÓN 360 ────────────────────────────────────────────────────────────

function Eval360Tab({ emp }: { emp: EmployeeProfile }) {
  const mockEmp = EMPLOYEES.find(e => e.name === `${emp.firstName} ${emp.lastName}`);
  if (!mockEmp) return <EmptyEval label="Evaluación 360" />;

  // Derive mock 360 data from existing competencies
  const competencies = mockEmp.competencies;
  const avgScore = competencies.reduce((s, c) => s + c.score, 0) / competencies.length;

  const getClassification = (score: number) => {
    if (score >= 4.5) return { label: 'Sobresaliente', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: '#10b981' };
    if (score >= 3.5) return { label: 'Bueno', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: '#3b82f6' };
    if (score >= 2.5) return { label: 'Regular', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: '#f59e0b' };
    return { label: 'Deficiente', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: '#ef4444' };
  };

  const cls = getClassification(avgScore);

  // Simulate self vs peer scores (slight variance from real competency scores)
  const withScores = competencies.map((c, i) => {
    const selfScore = Math.min(5, Math.max(1, +(c.score + (i % 2 === 0 ? 0.3 : -0.2)).toFixed(1)));
    const peerScore = c.score;
    return { ...c, selfScore, peerScore };
  });

  const sorted = [...withScores].sort((a, b) => b.peerScore - a.peerScore);
  const strengths = sorted.slice(0, 3);
  const improvements = [...withScores].sort((a, b) => a.peerScore - b.peerScore).slice(0, 3);

  // Mock evaluators
  const evaluators = [
    { name: mockEmp.name === emp.firstName + ' ' + emp.lastName ? 'Autoevaluación' : emp.firstName, role: 'Autoevaluación', score: +(avgScore + 0.2).toFixed(1), completed: true },
    { name: 'Jefe directo', role: 'Superior', score: +(avgScore - 0.1).toFixed(1), completed: true },
    { name: 'Colega 1', role: 'Par', score: +(avgScore + 0.1).toFixed(1), completed: true },
    { name: 'Colega 2', role: 'Par', score: +(avgScore - 0.3).toFixed(1), completed: true },
    { name: 'Colaborador', role: 'Subordinado', score: null, completed: false },
  ];

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${cls.border} ${cls.bg}`}>
          <p className={`text-xs font-medium mb-2 ${cls.text}`}>Resultado global</p>
          <p className={`text-3xl font-black ${cls.text}`}>{avgScore.toFixed(1)}<span className="text-sm font-normal opacity-60">/5</span></p>
          <span className={`mt-1.5 inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${cls.border} ${cls.bg} ${cls.text}`}>
            {cls.label}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 bg-white">
          <p className="text-xs text-gray-400 mb-2">Evaluadores</p>
          <p className="text-3xl font-black text-gray-900">{evaluators.filter(e => e.completed).length}<span className="text-sm font-normal text-gray-400">/{evaluators.length}</span></p>
          <p className="text-xs text-gray-500 mt-1">completaron la evaluación</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 bg-white">
          <p className="text-xs text-gray-400 mb-2">Ciclo</p>
          <p className="text-sm font-bold text-gray-900">Julio–Dic 2024</p>
          <p className="text-xs text-gray-400 mt-1">Última actualización: {mockEmp.lastReview}</p>
        </div>
      </div>

      {/* Evaluadores */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-900 mb-4">Evaluadores</p>
        <div className="space-y-2">
          {evaluators.map((ev, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                {ev.name.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{ev.name}</p>
                <p className="text-[10px] text-gray-400">{ev.role}</p>
              </div>
              {ev.completed ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-gray-900">{ev.score}</span>
                  <CheckCircle2 size={13} className="text-emerald-500" />
                </div>
              ) : (
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pendiente</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de competencias */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-900 mb-4">Resultados por competencia</p>
        <div className="space-y-3">
          {withScores.map((c, i) => {
            const barColor = c.peerScore >= 4 ? '#10b981' : c.peerScore >= 3 ? '#3b82f6' : '#f59e0b';
            return (
              <div key={i} className="grid grid-cols-[1fr_60px_60px_80px] gap-3 items-center text-xs">
                <span className="text-gray-700 truncate">{c.label}</span>
                <span className="text-center text-gray-500">{c.selfScore}</span>
                <span className="text-center font-bold text-gray-900">{c.peerScore.toFixed(1)}</span>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(c.peerScore / 5) * 100}%`, background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-[1fr_60px_60px_80px] gap-3 mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-semibold">
          <span>Competencia</span>
          <span className="text-center">Auto</span>
          <span className="text-center">Pares</span>
          <span>Barra</span>
        </div>
      </div>

      {/* Fortalezas y áreas de mejora */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ThumbsUp size={13} className="text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-gray-900">Top 3 Fortalezas</p>
          </div>
          <div className="space-y-2">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50">
                <span className="text-[10px] font-black text-emerald-600 w-4 shrink-0">{i + 1}</span>
                <span className="text-xs text-emerald-800 font-semibold flex-1 truncate">{s.label}</span>
                <span className="text-xs font-black text-emerald-700">{s.peerScore.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={13} className="text-amber-600" />
            </div>
            <p className="text-sm font-bold text-gray-900">Top 3 Áreas de Mejora</p>
          </div>
          <div className="space-y-2">
            {improvements.map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50">
                <span className="text-[10px] font-black text-amber-600 w-4 shrink-0">{i + 1}</span>
                <span className="text-xs text-amber-800 font-semibold flex-1 truncate">{s.label}</span>
                <span className="text-xs font-black text-amber-700">{s.peerScore.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PDI */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-900">Plan de Desarrollo Individual (PDI)</p>
          <button type="button" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700">
            <Plus size={12} /> Agregar acción
          </button>
        </div>
        <div className="space-y-2">
          {improvements.map((area, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_80px] gap-3 items-center text-xs p-2.5 rounded-xl border border-gray-50 bg-gray-50">
              <span className="text-gray-700">{area.label}</span>
              <input
                type="text"
                defaultValue="Capacitación Q1"
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-400"
              />
              <input
                type="date"
                defaultValue="2025-03-31"
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_100px_80px] gap-3 mt-2 text-[10px] text-gray-400 font-semibold px-2.5">
          <span>Área de mejora</span>
          <span>Acción</span>
          <span>Fecha límite</span>
        </div>
      </div>
    </div>
  );
}

// ── ACIERTOS Y DESACIERTOS ────────────────────────────────────────────────────

function AciertosTab({ emp }: { emp: EmployeeProfile }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  // Mock sessions specific to this employee
  const sessions = [
    {
      period: 'Q4 2024',
      date: '2024-12-10',
      evaluator: 'Jefe directo',
      status: 'completed' as const,
      resultados: [
        { objetivo: 'Cumplimiento de metas del trimestre', logrado: 'Superó la meta en un 12%', pct: 112 },
        { objetivo: 'Reducción de tiempos de entrega', logrado: 'Redujo 8% sobre objetivo de 5%', pct: 98 },
        { objetivo: 'Satisfacción interna del cliente', logrado: 'Puntaje 4.6/5 vs. meta 4.5', pct: 100 },
      ],
      aciertos: [
        'Demostró liderazgo en momentos de presión durante el cierre de proyectos.',
        'Colaboró proactivamente con otros equipos, facilitando entregas a tiempo.',
        'Comunicación clara y asertiva con stakeholders internos.',
      ],
      desaciertos: [
        'Dificultad para delegar tareas en momentos de alta carga de trabajo.',
        'Documentación de procesos entregada con retraso en dos ocasiones.',
      ],
      retroEmpresa: 'La empresa reconoce el esfuerzo sostenido durante el trimestre y agradece la disposición ante los cambios de prioridad.',
      compromisosColaborador: [
        { descripcion: 'Completar curso de gestión del tiempo', fecha: '2025-02-28' },
        { descripcion: 'Entregar documentación de los 3 proyectos activos', fecha: '2025-01-31' },
      ],
      compromisosEmpresa: [
        { descripcion: 'Proveer acceso al programa de capacitación interna', fecha: '2025-01-15' },
        { descripcion: 'Asignar mentor para acompañamiento de delegación', fecha: '2025-02-01' },
      ],
    },
    {
      period: 'Q3 2024',
      date: '2024-09-15',
      evaluator: 'Jefe directo',
      status: 'completed' as const,
      resultados: [
        { objetivo: 'Lanzamiento de módulo nuevo', logrado: 'Entregado en fecha', pct: 100 },
        { objetivo: 'Capacitación al equipo', logrado: 'Completada al 80%', pct: 80 },
      ],
      aciertos: [
        'Iniciativa propia para resolver bloqueadores técnicos.',
        'Mentoría informal a nuevo miembro del equipo.',
      ],
      desaciertos: [
        'Algunos requerimientos no se validaron con el cliente antes de desarrollar.',
      ],
      retroEmpresa: 'Buen trimestre en general; se destacó la adaptación ante cambios de alcance.',
      compromisosColaborador: [
        { descripcion: 'Validar requerimientos con cliente antes de iniciar desarrollo', fecha: '2024-10-01' },
      ],
      compromisosEmpresa: [
        { descripcion: 'Definir proceso formal de validación de requerimientos', fecha: '2024-10-15' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Resumen tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-gray-100 bg-white">
          <p className="text-xs text-gray-400 mb-1">Sesiones completadas</p>
          <p className="text-2xl font-black text-gray-900">{sessions.filter(s => s.status === 'completed').length}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50">
          <p className="text-xs text-emerald-600 mb-1">Aciertos registrados</p>
          <p className="text-2xl font-black text-emerald-700">{sessions.reduce((s, ss) => s + ss.aciertos.length, 0)}</p>
        </div>
        <div className="p-4 rounded-xl border border-amber-100 bg-amber-50">
          <p className="text-xs text-amber-600 mb-1">Áreas de mejora</p>
          <p className="text-2xl font-black text-amber-700">{sessions.reduce((s, ss) => s + ss.desaciertos.length, 0)}</p>
        </div>
      </div>

      {/* Sessions accordion */}
      {sessions.map((session, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <button
            type="button"
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Target size={15} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">Sesión {session.period}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {session.status === 'completed' ? 'Completada' : 'Borrador'}
                </span>
              </div>
              <p className="text-xs text-gray-400">{session.date} · Evaluador: {session.evaluator}</p>
            </div>
            {expandedIdx === idx
              ? <ChevronUp size={15} className="text-gray-400 shrink-0" />
              : <ChevronDown size={15} className="text-gray-400 shrink-0" />
            }
          </button>

          {expandedIdx === idx && (
            <div className="px-5 pb-5 space-y-5 border-t border-gray-50">
              {/* Resultados vs objetivos */}
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={12} className="text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Resultados</p>
                </div>
                <div className="space-y-2">
                  {session.resultados.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-700">{r.objetivo}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{r.logrado}</p>
                        </div>
                        <span className={`text-xs font-black shrink-0 ${r.pct >= 100 ? 'text-emerald-600' : r.pct >= 80 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {r.pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(r.pct, 100)}%`,
                            background: r.pct >= 100 ? '#10b981' : r.pct >= 80 ? '#3b82f6' : '#f59e0b',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aciertos y Desaciertos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <ThumbsUp size={12} className="text-emerald-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Aciertos</p>
                  </div>
                  <ul className="space-y-2">
                    {session.aciertos.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                        <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-emerald-800 leading-relaxed">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                      <ThumbsDown size={12} className="text-amber-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Áreas de mejora</p>
                  </div>
                  <ul className="space-y-2">
                    {session.desaciertos.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                        <TrendingUp size={13} className="text-amber-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-amber-800 leading-relaxed">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Retroalimentación empresa */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Retroalimentación de la empresa</p>
                <p className="text-xs text-slate-700 leading-relaxed">{session.retroEmpresa}</p>
              </div>

              {/* Compromisos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wide mb-2">Compromisos del colaborador</p>
                  <div className="space-y-2">
                    {session.compromisosColaborador.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-teal-50 border border-teal-100">
                        <Circle size={12} className="text-teal-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-teal-800 leading-relaxed">{c.descripcion}</p>
                          <p className="text-[10px] text-teal-500 mt-0.5">{c.fecha}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-2">Compromisos de la empresa</p>
                  <div className="space-y-2">
                    {session.compromisosEmpresa.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                        <Circle size={12} className="text-blue-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-blue-800 leading-relaxed">{c.descripcion}</p>
                          <p className="text-[10px] text-blue-500 mt-0.5">{c.fecha}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────

function EmptyEval({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
        <Star size={20} className="text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-400">{label}</p>
      <p className="text-xs text-gray-300 mt-1">Sin datos de evaluación disponibles.</p>
    </div>
  );
}

// ── EVALUACIONES WRAPPER ──────────────────────────────────────────────────────

function EvaluacionesTab({ emp }: { emp: EmployeeProfile }) {
  const [subTab, setSubTab] = useState<EvalSubTab>('empleadoA');

  return (
    <div>
      {/* Sub-tab bar */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
        {EVAL_SUBTABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              subTab === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'empleadoA' && <EmpleadoATab emp={emp} />}
      {subTab === 'eval360' && <Eval360Tab emp={emp} />}
      {subTab === 'aciertos' && <AciertosTab emp={emp} />}
    </div>
  );
}

// ── TAREAS TAB ────────────────────────────────────────────────────────────────

function TareasTab({ emp }: { emp: EmployeeProfile }) {
  const tasks = [
    { label: 'Completar evaluación 360', due: '2025-01-31', done: false },
    { label: 'Actualizar CV interno', due: '2025-02-15', done: true },
    { label: 'Firmar adendum de contrato', due: '2025-01-20', done: false },
    { label: 'Completar curso de seguridad', due: '2024-12-31', done: true },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-base font-bold text-gray-900">Tareas asignadas</p>
        <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm">
          <Plus size={13} /> Nueva tarea
        </button>
      </div>
      <div className="space-y-2">
        {tasks.map((t, i) => (
          <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${t.done ? 'border-gray-100 bg-gray-50' : 'border-gray-100 bg-white'}`}>
            {t.done
              ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              : <Circle size={16} className="text-gray-300 shrink-0" />
            }
            <span className={`text-sm flex-1 ${t.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{t.label}</span>
            <span className={`text-xs ${new Date(t.due) < new Date() && !t.done ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>{t.due}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ESTADÍSTICAS TAB ──────────────────────────────────────────────────────────

function EstadisticasTab({ emp }: { emp: EmployeeProfile }) {
  const stats = [
    { label: 'Días trabajados (año actual)', value: '218' },
    { label: 'Ausencias registradas', value: '4' },
    { label: 'Vacaciones disponibles', value: '8 días' },
    { label: 'Horas extra acumuladas', value: '12 h' },
    { label: 'Evaluaciones completadas', value: emp.journey.filter(j => j.type === 'review').length.toString() },
    { label: 'Capacitaciones completadas', value: emp.journey.filter(j => j.type === 'training').length.toString() },
  ];
  return (
    <div className="space-y-5">
      <p className="text-base font-bold text-gray-900">Estadísticas del colaborador</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-gray-100 bg-white">
            <p className="text-xs text-gray-400 leading-tight mb-1">{s.label}</p>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────

interface Props {
  emp: EmployeeProfile;
  onBack: () => void;
}

export default function EmployeeProfilePage({ emp, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('perfil');
  const [activeSection, setActiveSection] = useState<ProfileSection>('datos-personales');

  const fullName = `${emp.firstName} ${emp.lastName} ${emp.maternalLastName}`;

  const renderSection = () => {
    switch (activeSection) {
      case 'datos-personales': return <DatosPersonales emp={emp} />;
      case 'datos-laborales': return <DatosLaborales emp={emp} />;
      case 'datos-nomina': return <DatosNomina emp={emp} />;
      case 'campos': return <CamposPersonalizados />;
      case 'formacion': return <Formacion emp={emp} />;
      case 'journey': return <Journey emp={emp} />;
      case 'accesos': return <Accesos emp={emp} />;
      case 'roles': return <Roles emp={emp} />;
      case 'automatizaciones': return <Automatizaciones />;
      case 'configuracion': return <Configuracion emp={emp} />;
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'perfil': return null; // handled via section layout
      case 'fichajes': return <PlaceholderTab label="Fichajes" />;
      case 'ausencias': return <PlaceholderTab label="Ausencias y vacaciones" />;
      case 'estadisticas': return <EstadisticasTab emp={emp} />;
      case 'contratos': return <PlaceholderTab label="Contratos" />;
      case 'documentos': return <DocumentosTab emp={emp} />;
      case 'horarios': return <PlaceholderTab label="Horarios" />;
      case 'tareas': return <TareasTab emp={emp} />;
      case 'evaluaciones': return <EvaluacionesTab emp={emp} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3.5 flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Regresar</span>
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm"
              style={{ backgroundColor: emp.avatarColor }}
            >
              {emp.avatar}
            </div>
            <span className="text-sm font-bold text-gray-900">{fullName}</span>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative flex-1">
              <input
                type="search"
                placeholder="Buscar empleado"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-sm text-gray-600 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <ChevronDown size={13} className="text-gray-400 shrink-0" />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'perfil' ? (
          <div className="flex gap-6">
            {/* Left sidebar */}
            <aside className="w-52 shrink-0">
              {/* Avatar card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center mb-4">
                <div className="relative mb-3">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-black shadow-md"
                    style={{ backgroundColor: emp.avatarColor }}
                  >
                    {emp.avatar}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center shadow-md hover:bg-slate-700 transition-colors"
                  >
                    <Pencil size={11} className="text-white" />
                  </button>
                </div>
                <p className="text-xs font-bold text-gray-800 text-center leading-tight">{fullName}</p>
                <p className="text-[11px] text-gray-400 text-center mt-0.5">{emp.position}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <MapPin size={10} className="text-gray-300" />
                  <span className="text-[10px] text-gray-400">{emp.workLocation}</span>
                </div>
                <div className="mt-3 w-full">
                  <span className={`flex items-center justify-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${emp.department === 'Tecnología' ? 'bg-blue-50 text-blue-700' : emp.department === 'Ventas' ? 'bg-amber-50 text-amber-700' : emp.department === 'Marketing' ? 'bg-rose-50 text-rose-700' : emp.department === 'Finanzas' ? 'bg-emerald-50 text-emerald-700' : emp.department === 'Recursos Humanos' ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
                    <Building2 size={10} />
                    {emp.department}
                  </span>
                </div>
              </div>

              {/* Section nav */}
              <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {PROFILE_SECTIONS.map(sec => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium transition-all border-b border-gray-50 last:border-0 ${
                      activeSection === sec.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={activeSection === sec.id ? 'text-blue-600' : 'text-gray-400'}>
                      {sec.icon}
                    </span>
                    {sec.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
                {renderSection()}
                {/* Save button */}
                <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {renderTab()}
          </div>
        )}
      </div>
    </div>
  );
}
