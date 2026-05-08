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
  logout: () => void;
  isAdmin: boolean;
  currentEmployee: typeof EMPLOYEES[0] | null;
}

const SESSION_KEY = 'ninebox-session-user';

function loadStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => loadStoredUser());

  const setUser = (u: User) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUserState(u);
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUserState(null);
  };

  const isAdmin = user?.role === 'admin';
  const currentEmployee = user?.employeeId ? EMPLOYEES.find(e => e.id === user.employeeId) ?? null : null;

  return (
    <UserContext.Provider value={{ user, setUser, logout, isAdmin, currentEmployee }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
