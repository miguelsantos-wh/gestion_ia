import { useState } from 'react';
import { Search, BarChart3, ShieldCheck, User } from 'lucide-react';
import { EMPLOYEES } from '../data/mockData';
import { useUser } from '../context/UserContext';

export default function LoginSelectPage() {
  const { setUser } = useUser();
  const [search, setSearch] = useState('');

  const filtered = EMPLOYEES.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAdmin = () => {
    setUser({ id: 'admin-001', name: 'RRHH Admin', role: 'admin' });
  };

  const handleSelectEmployee = (empId: string, empName: string) => {
    setUser({ id: `user-${empId}`, name: empName, role: 'employee', employeeId: empId });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top brand bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Matriz 9-Box</p>
            <p className="text-xs text-gray-400">Panel de evaluaciones RRHH</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-6">
          {/* Heading */}
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">¿Quién eres?</h1>
            <p className="text-sm text-gray-500 mt-1.5">Selecciona tu perfil para continuar. No se requiere contraseña.</p>
          </div>

          {/* Admin card */}
          <button
            type="button"
            onClick={handleSelectAdmin}
            className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5 flex items-center gap-4 group text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900">RRHH Admin</p>
              <p className="text-sm text-gray-500">Acceso completo a todas las evaluaciones y configuraciones</p>
            </div>
            <div className="shrink-0 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              Administrador
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">o selecciona un colaborador</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Employee search */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cargo o área…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-all shadow-sm"
            />
          </div>

          {/* Employee grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-sm text-gray-400">
                No se encontraron colaboradores.
              </div>
            ) : (
              filtered.map(emp => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleSelectEmployee(emp.id, emp.name)}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all p-4 flex items-center gap-3 group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 shrink-0 group-hover:bg-slate-200 transition-colors">
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{emp.name}</p>
                    <p className="text-xs text-gray-500 truncate">{emp.position}</p>
                    <p className="text-[11px] text-gray-400 truncate">{emp.department}</p>
                  </div>
                  <div className="shrink-0 w-7 h-7 rounded-full bg-gray-100 group-hover:bg-slate-800 flex items-center justify-center transition-colors">
                    <User size={12} className="text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
