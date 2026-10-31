import { useEffect, useState } from "react";
import type {
  SpinHistoryEntry,
  SpinHistoryState,
  SpinResultType,
} from "../components/types/history";

const STORAGE_KEY = "wheel-spin-history";
const MAX_HISTORY = 500;

function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadHistory(): SpinHistoryState {
  const fallback: SpinHistoryState = {
    enabled: false,
    entries: [],
  };

  if (typeof window === "undefined") return fallback;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return fallback;

    const parsed: unknown = JSON.parse(stored);

    if (!parsed || typeof parsed !== "object") return fallback;

    const data = parsed as Record<string, unknown>;

    return {
      enabled: data.enabled === true,
      entries: Array.isArray(data.entries)
        ? data.entries.filter(
            (entry): entry is SpinHistoryEntry =>
              !!entry &&
              typeof entry === "object" &&
              typeof (entry as SpinHistoryEntry).id === "string" &&
              typeof (entry as SpinHistoryEntry).wheelId === "string" &&
              typeof (entry as SpinHistoryEntry).wheelName === "string" &&
              typeof (entry as SpinHistoryEntry).winner === "string" &&
              typeof (entry as SpinHistoryEntry).createdAt === "string" &&
              ((entry as SpinHistoryEntry).type === "random" ||
                (entry as SpinHistoryEntry).type === "manual") &&
              typeof (entry as SpinHistoryEntry).choiceCount === "number",
          )
        : [],
    };
  } catch (error) {
    console.error("Failed to load spin history:", error);
    return fallback;
  }
}

function useSpinHistory() {
  const [state, setState] = useState<SpinHistoryState>(loadHistory);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save spin history:", error);
    }
  }, [state]);

  const setEnabled = (enabled: boolean) => {
    setState((previous) => ({
      ...previous,
      enabled,
    }));
  };

  const addEntry = (
    wheelId: string,
    wheelName: string,
    winner: string,
    type: SpinResultType,
    choiceCount: number,
  ) => {
    setState((previous) => {
      if (!previous.enabled) return previous;

      const entry: SpinHistoryEntry = {
        id: createId(),
        wheelId,
        wheelName,
        winner,
        type,
        choiceCount,
        createdAt: new Date().toISOString(),
      };

      return {
        ...previous,
        entries: [entry, ...previous.entries].slice(0, MAX_HISTORY),
      };
    });
  };

  const deleteEntry = (id: string) => {
    setState((previous) => ({
      ...previous,
      entries: previous.entries.filter((entry) => entry.id !== id),
    }));
  };

  const clearHistory = (wheelId?: string) => {
    setState((previous) => ({
      ...previous,
      entries: wheelId
        ? previous.entries.filter((entry) => entry.wheelId !== wheelId)
        : [],
    }));
  };

  return {
    enabled: state.enabled,
    entries: state.entries,
    setEnabled,
    addEntry,
    deleteEntry,
    clearHistory,
  };
}

export default useSpinHistory;
