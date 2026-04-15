import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PerformanceLevel, PotentialLevel } from '../types';
import type { Employee360Data, Eval360Assignment, EvaluationStorage, PeerSubmission, PerceptionPlacement, PercepcionAssignment } from '../types/evaluation';
import { STORAGE_KEY } from '../types/evaluation';

function loadStorage(): EvaluationStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { threeSixty: {}, percepcion: {}, autoPercepcion: {}, assignments: [], eval360Assignments: [] };
    const p = JSON.parse(raw) as EvaluationStorage;
    return {
      threeSixty: p.threeSixty ?? {},
      percepcion: p.percepcion ?? {},
      autoPercepcion: p.autoPercepcion ?? {},
      assignments: p.assignments ?? [],
      eval360Assignments: p.eval360Assignments ?? [],
    };
  } catch {
    return { threeSixty: {}, percepcion: {}, autoPercepcion: {}, assignments: [], eval360Assignments: [] };
  }
}

interface EvaluationContextValue {
  threeSixty: Record<string, Employee360Data>;
  percepcion: Record<string, PerceptionPlacement[]>;
  autoPercepcion: Record<string, PerceptionPlacement>;
  assignments: PercepcionAssignment[];
  eval360Assignments: Eval360Assignment[];
  saveSelfEvaluation: (employeeId: string, scores: number[]) => void;
  savePeerEvaluation: (employeeId: string, evaluatorName: string, scores: number[]) => void;
  savePerceptionPlacement: (
    employeeId: string,
    evaluatorName: string,
    performanceLevel: PerformanceLevel,
    potentialLevel: PotentialLevel
  ) => void;
  saveAutoPercepcion: (
    employeeId: string,
    evaluatorName: string,
    performanceLevel: PerformanceLevel,
    potentialLevel: PotentialLevel
  ) => void;
  saveAssignment: (evaluatorId: string, targetId: string) => void;
  markAssignmentComplete: (evaluatorId: string, targetId: string) => void;
  saveEval360Assignment: (assignment: Omit<Eval360Assignment, 'id' | 'assignedAt'>) => string;
  completeEval360Assignment: (id: string, scores: number[]) => void;
  removeEval360Assignment: (id: string) => void;
  syncCompletedEvaluations: () => void;
  resetAll: () => void;
}

const EvaluationContext = createContext<EvaluationContextValue | null>(null);

export function EvaluationProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<EvaluationStorage>(() => loadStorage());

  useEffect(() => {
    setStore(loadStorage());
  }, []);

  const persist = useCallback((next: EvaluationStorage) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const triggerSync = useCallback((store: EvaluationStorage) => {
    const next: EvaluationStorage = {
      ...store,
      eval360Assignments: (store.eval360Assignments ?? []).map((assignment) => {
        if (assignment.completedAt) return assignment;

        const employeeData = store.threeSixty[assignment.targetEmployeeId];
        if (!employeeData) return assignment;

        if (assignment.role === 'self' && employeeData.self) {
          return { ...assignment, completedAt: new Date().toISOString(), scores: employeeData.self };
        }

        if (assignment.role !== 'self') {
          const normalizedAssignmentName = assignment.evaluatorName.trim().toLowerCase();

          let matchingPeer = employeeData.peers.find(
            (p) => p.evaluatorName.trim().toLowerCase() === normalizedAssignmentName
          );

          if (!matchingPeer && assignment.isAnonymous) {
            const lastUnmatchedPeer = employeeData.peers.find((p) => p.evaluatorName === 'Anónimo');
            if (lastUnmatchedPeer) {
              matchingPeer = lastUnmatchedPeer;
            }
          }

          if (matchingPeer) {
            return { ...assignment, completedAt: matchingPeer.at, scores: matchingPeer.scores };
          }
        }

        return assignment;
      }),
    };
    return next;
  }, []);

  const saveSelfEvaluation = useCallback(
    (employeeId: string, scores: number[]) => {
      setStore((prev) => {
        const cur = prev.threeSixty[employeeId] ?? { peers: [] };
        let next: EvaluationStorage = {
          ...prev,
          threeSixty: {
            ...prev.threeSixty,
            [employeeId]: { ...cur, self: scores },
          },
        };
        next = triggerSync(next);
        persist(next);
        return next;
      });
    },
    [persist, triggerSync]
  );

  const savePeerEvaluation = useCallback(
    (employeeId: string, evaluatorName: string, scores: number[]) => {
      const sub: PeerSubmission = {
        evaluatorName: evaluatorName.trim() || 'Anónimo',
        scores,
        at: new Date().toISOString(),
      };
      setStore((prev) => {
        const cur = prev.threeSixty[employeeId] ?? { peers: [] };
        let next: EvaluationStorage = {
          ...prev,
          threeSixty: {
            ...prev.threeSixty,
            [employeeId]: { ...cur, peers: [...cur.peers, sub] },
          },
        };
        next = triggerSync(next);
        persist(next);
        return next;
      });
    },
    [persist, triggerSync]
  );

  const savePerceptionPlacement = useCallback(
    (
      employeeId: string,
      evaluatorName: string,
      performanceLevel: PerformanceLevel,
      potentialLevel: PotentialLevel
    ) => {
      const row: PerceptionPlacement = {
        evaluatorName: evaluatorName.trim() || 'Anónimo',
        performanceLevel,
        potentialLevel,
        at: new Date().toISOString(),
      };
      setStore((prev) => {
        const list = prev.percepcion[employeeId] ?? [];
        const next: EvaluationStorage = {
          ...prev,
          percepcion: {
            ...prev.percepcion,
            [employeeId]: [...list, row],
          },
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const saveAutoPercepcion = useCallback(
    (
      employeeId: string,
      evaluatorName: string,
      performanceLevel: PerformanceLevel,
      potentialLevel: PotentialLevel
    ) => {
      const row: PerceptionPlacement = {
        evaluatorName: evaluatorName.trim() || 'Yo',
        performanceLevel,
        potentialLevel,
        at: new Date().toISOString(),
      };
      setStore((prev) => {
        const next: EvaluationStorage = {
          ...prev,
          autoPercepcion: {
            ...prev.autoPercepcion,
            [employeeId]: row,
          },
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const saveAssignment = useCallback(
    (evaluatorId: string, targetId: string) => {
      setStore((prev) => {
        const alreadyExists = prev.assignments.some(
          (a) => a.evaluatorId === evaluatorId && a.targetId === targetId && !a.completedAt
        );
        if (alreadyExists) return prev;
        const assignment: PercepcionAssignment = {
          evaluatorId,
          targetId,
          assignedAt: new Date().toISOString(),
        };
        const next: EvaluationStorage = {
          ...prev,
          assignments: [...prev.assignments, assignment],
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const markAssignmentComplete = useCallback(
    (evaluatorId: string, targetId: string) => {
      setStore((prev) => {
        const next: EvaluationStorage = {
          ...prev,
          assignments: prev.assignments.map((a) =>
            a.evaluatorId === evaluatorId && a.targetId === targetId && !a.completedAt
              ? { ...a, completedAt: new Date().toISOString() }
              : a
          ),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const saveEval360Assignment = useCallback(
    (assignment: Omit<Eval360Assignment, 'id' | 'assignedAt'>): string => {
      const id = `e360-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const full: Eval360Assignment = {
        ...assignment,
        id,
        assignedAt: new Date().toISOString(),
      };
      setStore((prev) => {
        const next: EvaluationStorage = {
          ...prev,
          eval360Assignments: [...(prev.eval360Assignments ?? []), full],
        };
        persist(next);
        return next;
      });
      return id;
    },
    [persist]
  );

  const completeEval360Assignment = useCallback(
    (id: string, scores: number[]) => {
      setStore((prev) => {
        const next: EvaluationStorage = {
          ...prev,
          eval360Assignments: (prev.eval360Assignments ?? []).map((a) =>
            a.id === id ? { ...a, completedAt: new Date().toISOString(), scores } : a
          ),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeEval360Assignment = useCallback(
    (id: string) => {
      setStore((prev) => {
        const next: EvaluationStorage = {
          ...prev,
          eval360Assignments: (prev.eval360Assignments ?? []).filter((a) => a.id !== id),
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const syncCompletedEvaluations = useCallback(() => {
    setStore((prev) => {
      const next = triggerSync(prev);
      persist(next);
      return next;
    });
  }, [persist, triggerSync]);

  const resetAll = useCallback(() => {
    const empty: EvaluationStorage = { threeSixty: {}, percepcion: {}, autoPercepcion: {}, assignments: [], eval360Assignments: [] };
    persist(empty);
    setStore(empty);
  }, [persist]);

  const value = useMemo(
    () => ({
      threeSixty: store.threeSixty,
      percepcion: store.percepcion,
      autoPercepcion: store.autoPercepcion,
      assignments: store.assignments,
      eval360Assignments: store.eval360Assignments ?? [],
      saveSelfEvaluation,
      savePeerEvaluation,
      savePerceptionPlacement,
      saveAutoPercepcion,
      saveAssignment,
      markAssignmentComplete,
      saveEval360Assignment,
      completeEval360Assignment,
      removeEval360Assignment,
      syncCompletedEvaluations,
      resetAll,
    }),
    [
      store.threeSixty,
      store.percepcion,
      store.autoPercepcion,
      store.assignments,
      store.eval360Assignments,
      saveSelfEvaluation,
      savePeerEvaluation,
      savePerceptionPlacement,
      saveAutoPercepcion,
      saveAssignment,
      markAssignmentComplete,
      saveEval360Assignment,
      completeEval360Assignment,
      removeEval360Assignment,
      syncCompletedEvaluations,
      resetAll,
    ]
  );

  return <EvaluationContext.Provider value={value}>{children}</EvaluationContext.Provider>;
}

export function useEvaluationStore() {
  const ctx = useContext(EvaluationContext);
  if (!ctx) throw new Error('useEvaluationStore debe usarse dentro de EvaluationProvider');
  return ctx;
}
