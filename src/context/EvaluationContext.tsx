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
import type { Employee360Data, EvaluationStorage, PeerSubmission, PerceptionPlacement } from '../types/evaluation';
import { STORAGE_KEY } from '../types/evaluation';

function loadStorage(): EvaluationStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { threeSixty: {}, percepcion: {} };
    const p = JSON.parse(raw) as EvaluationStorage;
    return {
      threeSixty: p.threeSixty ?? {},
      percepcion: p.percepcion ?? {},
    };
  } catch {
    return { threeSixty: {}, percepcion: {} };
  }
}

interface EvaluationContextValue {
  threeSixty: Record<string, Employee360Data>;
  percepcion: Record<string, PerceptionPlacement[]>;
  saveSelfEvaluation: (employeeId: string, scores: number[]) => void;
  savePeerEvaluation: (employeeId: string, evaluatorName: string, scores: number[]) => void;
  savePerceptionPlacement: (
    employeeId: string,
    evaluatorName: string,
    performanceLevel: PerformanceLevel,
    potentialLevel: PotentialLevel
  ) => void;
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

  const saveSelfEvaluation = useCallback(
    (employeeId: string, scores: number[]) => {
      setStore((prev) => {
        const cur = prev.threeSixty[employeeId] ?? { peers: [] };
        const next: EvaluationStorage = {
          ...prev,
          threeSixty: {
            ...prev.threeSixty,
            [employeeId]: { ...cur, self: scores },
          },
        };
        persist(next);
        return next;
      });
    },
    [persist]
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
        const next: EvaluationStorage = {
          ...prev,
          threeSixty: {
            ...prev.threeSixty,
            [employeeId]: { ...cur, peers: [...cur.peers, sub] },
          },
        };
        persist(next);
        return next;
      });
    },
    [persist]
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

  const resetAll = useCallback(() => {
    const empty: EvaluationStorage = { threeSixty: {}, percepcion: {} };
    persist(empty);
    setStore(empty);
  }, [persist]);

  const value = useMemo(
    () => ({
      threeSixty: store.threeSixty,
      percepcion: store.percepcion,
      saveSelfEvaluation,
      savePeerEvaluation,
      savePerceptionPlacement,
      resetAll,
    }),
    [store.threeSixty, store.percepcion, saveSelfEvaluation, savePeerEvaluation, savePerceptionPlacement, resetAll]
  );

  return <EvaluationContext.Provider value={value}>{children}</EvaluationContext.Provider>;
}

export function useEvaluationStore() {
  const ctx = useContext(EvaluationContext);
  if (!ctx) throw new Error('useEvaluationStore debe usarse dentro de EvaluationProvider');
  return ctx;
}
