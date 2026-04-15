import { createContext, useContext, ReactNode, useState } from 'react';
import { EMPLOYEES } from '../data/mockData';

type UserRole = 'admin' | 'employee';

interface User {
  id: string;
  name: string;
  role: UserRole;
  employeeId?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  isAdmin: boolean;
  currentEmployee: typeof EMPLOYEES[0] | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({
    id: 'emp-001',
    name: 'Empleado A',
    role: 'employee',
    employeeId: 'emp-001',
  });

  const isAdmin = user?.role === 'admin';
  const currentEmployee = user?.employeeId ? EMPLOYEES.find(e => e.id === user.employeeId) || null : null;

  return (
    <UserContext.Provider value={{ user, setUser, isAdmin, currentEmployee }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
