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
import type { Employee360Data, Eval360Assignment, Evaluation360Session, EvaluationStorage, PeerSubmission, PerceptionPlacement, PercepcionAssignment, PdiItem } from '../types/evaluation';
import { STORAGE_KEY } from '../types/evaluation';
import { EMPLOYEES } from '../data/mockData';
import { DEFAULT_360_TEMPLATE_ID } from '../data/evaluation360Template';

function migrateLegacyAssignments(
  assignments: Eval360Assignment[],
  existingSessions: Evaluation360Session[]
): { assignments: Eval360Assignment[]; sessions: Evaluation360Session[] } {
  const legacyAssignments = assignments.filter(a => a.sessionId === 'legacy');
  if (legacyAssignments.length === 0) return { assignments, sessions: existingSessions };

  const newSessions: Evaluation360Session[] = [...existingSessions];
  const updatedAssignments: Eval360Assignment[] = assignments.filter(a => a.sessionId !== 'legacy');

  // Group legacy assignments by targetEmployeeId
  const byEmployee = legacyAssignments.reduce<Record<string, Eval360Assignment[]>>((acc, a) => {
    if (!acc[a.targetEmployeeId]) acc[a.targetEmployeeId] = [];
    acc[a.targetEmployeeId].push(a);
    return acc;
  }, {});

  for (const [employeeId, empAssignments] of Object.entries(byEmployee)) {
    // Check if a legacy session already exists for this employee
    const existingLegacySession = existingSessions.find(
      s => s.targetEmployeeId === employeeId && s.period === 'Q4-2024'
    );

    let sessionId: string;
    if (existingLegacySession) {
      sessionId = existingLegacySession.id;
    } else {
      const employee = EMPLOYEES.find(e => e.id === employeeId);
      const name = employee ? `Evaluación 360 — ${employee.name}` : 'Evaluación 360';
      sessionId = `s360-legacy-${employeeId}`;
      const session: Evaluation360Session = {
        id: sessionId,
        targetEmployeeId: employeeId,
        name,
        description: 'Evaluación migrada automáticamente desde registros anteriores.',
        period: 'Q4-2024',
        dueDate: '',
        templateId: DEFAULT_360_TEMPLATE_ID,
        createdAt: empAssignments[0]?.assignedAt ?? new Date().toISOString(),
      };
      newSessions.push(session);
    }

    empAssignments.forEach(a => {
      updatedAssignments.push({ ...a, sessionId });
    });
  }

  return { assignments: updatedAssignments, sessions: newSessions };
}

function loadStorage(): EvaluationStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { threeSixty: {}, percepcion: {}, autoPercepcion: {}, assignments: [], eval360Assignments: [], eval360Sessions: [], pdiItems: {} };
    const p = JSON.parse(raw) as EvaluationStorage;

    const rawAssignments = (p.eval360Assignments ?? []).map(a => ({ ...a, sessionId: a.sessionId ?? 'legacy' }));
    const rawSessions = p.eval360Sessions ?? [];
    const { assignments: migratedAssignments, sessions: migratedSessions } = migrateLegacyAssignments(rawAssignments, rawSessions);

    const storage: EvaluationStorage = {
      threeSixty: p.threeSixty ?? {},
      percepcion: p.percepcion ?? {},
      autoPercepcion: p.autoPercepcion ?? {},
      assignments: p.assignments ?? [],
      eval360Assignments: migratedAssignments,
      eval360Sessions: migratedSessions,
      pdiItems: p.pdiItems ?? {},
    };

    // Persist the migration immediately so it's not re-run on every load
    if (migratedSessions.length > rawSessions.length || migratedAssignments.some((a, i) => a.sessionId !== rawAssignments[i]?.sessionId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    }

    return storage;
  } catch {
    return { threeSixty: {}, percepcion: {}, autoPercepcion: {}, assignments: [], eval360Assignments: [], eval360Sessions: [], pdiItems: {} };
  }
}

interface EvaluationContextValue {
  threeSixty: Record<string, Employee360Data>;
  percepcion: Record<string, PerceptionPlacement[]>;
  autoPercepcion: Record<string, PerceptionPlacement>;
  assignments: PercepcionAssignment[];
  eval360Assignments: Eval360Assignment[];
  eval360Sessions: Evaluation360Session[];
  pdiItems: Record<string, PdiItem[]>;
  savePdiItems: (sessionId: string, items: PdiItem[]) => void;
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
  createEval360Session: (session: Omit<Evaluation360Session, 'id' | 'createdAt'>) => string | null;
  saveEval360Assignment: (assignment: Omit<Eval360Assignment, 'id' | 'assignedAt'>) => string;
  completeEval360Assignment: (id: string, scores: number[]) => void;
  removeEval360Assignment: (id: string) => void;
  removeEval360Session: (sessionId: string) => void;
  syncCompletedEvaluations: () => void;
  resetAll: () => void;
  hasPeriodConflict: (targetEmployeeId: string, period: string, excludeSessionId?: string) => boolean;
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
    const synced360: EvaluationStorage = {
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

    const syncedAssignments = (synced360.assignments ?? []).map((assignment) => {
      if (assignment.completedAt) return assignment;

      const evaluatorEmployee = EMPLOYEES.find((e) => e.id === assignment.evaluatorId);
      if (!evaluatorEmployee) return assignment;

      const evaluatorNameNorm = evaluatorEmployee.name.trim().toLowerCase();
      const placements = synced360.percepcion[assignment.targetId] ?? [];

      const match = placements.find(
        (p) => p.evaluatorName && p.evaluatorName.trim().toLowerCase() === evaluatorNameNorm
      );

      if (match) {
        return { ...assignment, completedAt: match.at };
      }

      return assignment;
    });

    const next: EvaluationStorage = {
      ...synced360,
      assignments: syncedAssignments,
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
        let next: EvaluationStorage = {
          ...prev,
          percepcion: {
            ...prev.percepcion,
            [employeeId]: [...list, row],
          },
        };
        next = triggerSync(next);
        persist(next);
        return next;
      });
    },
    [persist, triggerSync]
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

  const hasPeriodConflict = useCallback(
    (targetEmployeeId: string, period: string, excludeSessionId?: string): boolean => {
      return store.eval360Sessions.some(
        s => s.targetEmployeeId === targetEmployeeId && s.period === period && s.id !== excludeSessionId
      );
    },
    [store.eval360Sessions]
  );

  const createEval360Session = useCallback(
    (session: Omit<Evaluation360Session, 'id' | 'createdAt'>): string | null => {
      const conflict = store.eval360Sessions.some(
        s => s.targetEmployeeId === session.targetEmployeeId && s.period === session.period
      );
      if (conflict) return null;

      const id = `s360-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const full: Evaluation360Session = { ...session, id, createdAt: new Date().toISOString() };
      setStore((prev) => {
        const next: EvaluationStorage = {
          ...prev,
          eval360Sessions: [...(prev.eval360Sessions ?? []), full],
        };
        persist(next);
        return next;
      });
      return id;
    },
    [persist, store.eval360Sessions]
  );

  const removeEval360Session = useCallback(
    (sessionId: string) => {
      setStore((prev) => {
        const next: EvaluationStorage = {
          ...prev,
          eval360Sessions: (prev.eval360Sessions ?? []).filter(s => s.id !== sessionId),
          eval360Assignments: (prev.eval360Assignments ?? []).filter(a => a.sessionId !== sessionId),
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

  const savePdiItems = useCallback(
    (sessionId: string, items: PdiItem[]) => {
      setStore((prev) => {
        const next: EvaluationStorage = {
          ...prev,
          pdiItems: { ...(prev.pdiItems ?? {}), [sessionId]: items },
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetAll = useCallback(() => {
    const empty: EvaluationStorage = { threeSixty: {}, percepcion: {}, autoPercepcion: {}, assignments: [], eval360Assignments: [], eval360Sessions: [], pdiItems: {} };
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
      eval360Sessions: store.eval360Sessions ?? [],
      pdiItems: store.pdiItems ?? {},
      savePdiItems,
      saveSelfEvaluation,
      savePeerEvaluation,
      savePerceptionPlacement,
      saveAutoPercepcion,
      saveAssignment,
      markAssignmentComplete,
      createEval360Session,
      saveEval360Assignment,
      completeEval360Assignment,
      removeEval360Assignment,
      removeEval360Session,
      syncCompletedEvaluations,
      resetAll,
      hasPeriodConflict,
    }),
    [
      store.threeSixty,
      store.percepcion,
      store.autoPercepcion,
      store.assignments,
      store.eval360Assignments,
      store.eval360Sessions,
      store.pdiItems,
      savePdiItems,
      saveSelfEvaluation,
      savePeerEvaluation,
      savePerceptionPlacement,
      saveAutoPercepcion,
      saveAssignment,
      markAssignmentComplete,
      createEval360Session,
      saveEval360Assignment,
      completeEval360Assignment,
      removeEval360Assignment,
      removeEval360Session,
      syncCompletedEvaluations,
      resetAll,
      hasPeriodConflict,
    ]
  );

  return <EvaluationContext.Provider value={value}>{children}</EvaluationContext.Provider>;
}

export function useEvaluationStore() {
  const ctx = useContext(EvaluationContext);
  if (!ctx) throw new Error('useEvaluationStore debe usarse dentro de EvaluationProvider');
  return ctx;
}
