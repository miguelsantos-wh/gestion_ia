import { BarChart3, UserCheck, ClipboardList, Target, ChevronRight, Menu, X, LayoutList } from 'lucide-react';
import { useState } from 'react';

export type SidebarView = 'dashboard' | 'empleadoA' | 'eval360' | 'aciertos' | 'formulario';

interface SidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

const MENU_ITEMS: { id: SidebarView; label: string; icon: React.ReactNode; section: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} />, section: 'principal' },
  { id: 'empleadoA', label: 'Empleado A', icon: <UserCheck size={18} />, section: 'evaluaciones' },
  { id: 'eval360', label: 'Evaluación 360', icon: <ClipboardList size={18} />, section: 'evaluaciones' },
  { id: 'aciertos', label: 'Aciertos y Desaciertos', icon: <Target size={18} />, section: 'evaluaciones' },
  { id: 'formulario', label: 'Guía de Formularios', icon: <LayoutList size={18} />, section: 'utilidades' },
];

const SECTIONS = {
  principal: 'Navegación Principal',
  evaluaciones: 'Evaluaciones',
  utilidades: 'Utilidades',
};

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (view: SidebarView) => {
    onViewChange(view);
    setIsOpen(false);
  };

  const groupedItems = MENU_ITEMS.reduce(
    (acc, item) => {
      const section = item.section;
      if (!acc[section]) acc[section] = [];
      acc[section].push(item);
      return acc;
    },
    {} as Record<string, typeof MENU_ITEMS>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto z-40 transition-transform lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Matriz 9-Box</h1>
              <p className="text-xs text-gray-400">Panel RRHH</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-6">
          {Object.entries(groupedItems).map(([sectionKey, items]) => (
            <div key={sectionKey}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                {SECTIONS[sectionKey as keyof typeof SECTIONS]}
              </h2>
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${
                        activeView === item.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {activeView === item.id && <ChevronRight size={16} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">RH</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700">RRHH Admin</div>
              <div className="text-xs text-gray-400">Ciclo 2024</div>
            </div>
          </div>
        </div>
      </aside>

      <div className={`${isOpen ? 'block' : 'hidden'} fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden`} onClick={() => setIsOpen(false)} />
    </>
  );
}
