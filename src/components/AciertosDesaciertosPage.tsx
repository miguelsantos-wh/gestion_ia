import { useUser } from '../context/UserContext';
import AciertosAdminPanel from './aciertos/AciertosAdminPanel';
import AciertosEmployeeView from './aciertos/AciertosEmployeeView';

export default function AciertosDesaciertosPage() {
  const { isAdmin, currentEmployee } = useUser();

  if (isAdmin) {
    return <AciertosAdminPanel />;
  }

  if (currentEmployee) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
            {currentEmployee.avatar}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{currentEmployee.name}</h2>
            <p className="text-sm text-gray-500">{currentEmployee.position} · {currentEmployee.department}</p>
          </div>
        </div>
        <AciertosEmployeeView employee={currentEmployee} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-gray-500">No hay empleado asignado a tu cuenta.</p>
    </div>
  );
}
