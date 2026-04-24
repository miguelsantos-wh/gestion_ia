import { useState, useMemo } from 'react';
import { Search, Users, ChevronRight, Building2, Briefcase } from 'lucide-react';
import { EMPLOYEE_PROFILES, type EmployeeProfile } from '../data/employeeProfiles';
import EmployeeProfilePage from './EmployeeProfilePage';

const DEPT_COLORS: Record<string, { bg: string; text: string }> = {
  Tecnología: { bg: 'bg-blue-50', text: 'text-blue-700' },
  Ventas: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Marketing: { bg: 'bg-rose-50', text: 'text-rose-700' },
  Finanzas: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'Recursos Humanos': { bg: 'bg-teal-50', text: 'text-teal-700' },
  Operaciones: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const DEPARTMENTS = ['Todos', 'Tecnología', 'Ventas', 'Marketing', 'Finanzas', 'Recursos Humanos', 'Operaciones'];

export default function EmployeeListPage() {
  const [selectedEmp, setSelectedEmp] = useState<EmployeeProfile | null>(null);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('Todos');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return EMPLOYEE_PROFILES.filter(e => {
      const fullName = `${e.firstName} ${e.lastName} ${e.maternalLastName}`.toLowerCase();
      const matchSearch = fullName.includes(q) || e.position.toLowerCase().includes(q) || e.department.toLowerCase().includes(q);
      const matchDept = dept === 'Todos' || e.department === dept;
      return matchSearch && matchDept;
    });
  }, [search, dept]);

  if (selectedEmp) {
    return <EmployeeProfilePage emp={selectedEmp} onBack={() => setSelectedEmp(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-sm text-gray-600 mt-1">Directorio y perfiles del equipo</p>
        </div>
      </header>
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header + filters */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, puesto o departamento..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {DEPARTMENTS.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDept(d)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${dept === d ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-2 mb-4">
        <Users size={14} className="text-gray-400" />
        <span className="text-xs text-gray-500">
          {filtered.length} colaborador{filtered.length !== 1 ? 'es' : ''}
          {dept !== 'Todos' ? ` en ${dept}` : ''}
          {search ? ` que coinciden con "${search}"` : ''}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Users size={22} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-400">Sin resultados</p>
          <p className="text-xs text-gray-300 mt-1">Intenta con otro nombre o filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(emp => {
            const deptStyle = DEPT_COLORS[emp.department] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
            const fullName = `${emp.firstName} ${emp.lastName} ${emp.maternalLastName}`;
            return (
              <div
                key={emp.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-sm shrink-0"
                    style={{ backgroundColor: emp.avatarColor }}
                  >
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{fullName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Briefcase size={11} className="text-gray-400 shrink-0" />
                      <p className="text-xs text-gray-500 truncate">{emp.position}</p>
                    </div>
                  </div>
                </div>

                {/* Department badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg ${deptStyle.bg} ${deptStyle.text}`}>
                    <Building2 size={10} />
                    {emp.department}
                  </span>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 mb-0.5">Correo</p>
                    <p className="text-[11px] font-semibold text-gray-700 truncate">{emp.email.split('@')[0]}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 mb-0.5">Num. empleado</p>
                    <p className="text-[11px] font-semibold text-gray-700">{emp.employeeNumber}</p>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => setSelectedEmp(emp)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 active:scale-95 transition-all shadow-sm group-hover:bg-blue-600"
                >
                  Ver perfil
                  <ChevronRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
}
