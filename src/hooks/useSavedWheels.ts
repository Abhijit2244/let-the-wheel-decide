import { useEffect, useState } from "react";
import type { SavedWheel } from "../components/types/wheel";

const SAVED_WHEELS_KEY = "saved-wheels";
const ACTIVE_WHEEL_KEY = "active-wheel-id";
const LEGACY_CHOICES_KEY = "wheel-choices";

interface WheelState {
  wheels: SavedWheel[];
  activeWheelId: string;
}

type ChoicesUpdater = string[] | ((previous: string[]) => string[]);

function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function normalizeWheel(value: unknown): SavedWheel | null {
  if (!value || typeof value !== "object") return null;

  const wheel = value as Record<string, unknown>;

  if (
    typeof wheel.id !== "string" ||
    typeof wheel.name !== "string" ||
    !isStringArray(wheel.choices) ||
    typeof wheel.createdAt !== "string" ||
    typeof wheel.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: wheel.id,
    name: wheel.name,
    choices: wheel.choices,
    createdAt: wheel.createdAt,
    updatedAt: wheel.updatedAt,
    lastUsedAt:
      typeof wheel.lastUsedAt === "string" ? wheel.lastUsedAt : wheel.updatedAt,
  };
}

function createWheel(name: string, choices: string[] = []): SavedWheel {
  const now = new Date().toISOString();

  return {
    id: createId(),
    name,
    choices: [...choices],
    createdAt: now,
    updatedAt: now,
    lastUsedAt: now,
  };
}

function loadInitialState(initialChoices: string[]): WheelState {
  const fallbackWheel = createWheel("My First Wheel", initialChoices);

  if (typeof window === "undefined") {
    return {
      wheels: [fallbackWheel],
      activeWheelId: fallbackWheel.id,
    };
  }

  try {
    const savedWheels = localStorage.getItem(SAVED_WHEELS_KEY);

    if (savedWheels !== null) {
      const parsed: unknown = JSON.parse(savedWheels);

      if (Array.isArray(parsed)) {
        const validWheels = parsed
          .map(normalizeWheel)
          .filter((wheel): wheel is SavedWheel => wheel !== null);

        if (validWheels.length > 0) {
          const storedActiveId = localStorage.getItem(ACTIVE_WHEEL_KEY);

          const activeWheel = validWheels.find(
            (wheel) => wheel.id === storedActiveId,
          );

          return {
            wheels: validWheels,
            activeWheelId: activeWheel ? activeWheel.id : validWheels[0].id,
          };
        }
      }
    }

    // Migrate the previous single-wheel data.
    const legacyChoices = localStorage.getItem(LEGACY_CHOICES_KEY);

    if (legacyChoices !== null) {
      const parsed: unknown = JSON.parse(legacyChoices);

      if (isStringArray(parsed)) {
        fallbackWheel.choices = parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load saved wheels:", error);
  }

  return {
    wheels: [fallbackWheel],
    activeWheelId: fallbackWheel.id,
  };
}

function useSavedWheels(initialChoices: string[]) {
  const [state, setState] = useState<WheelState>(() =>
    loadInitialState(initialChoices),
  );

  const { wheels, activeWheelId } = state;

  const activeWheel =
    wheels.find((wheel) => wheel.id === activeWheelId) ?? wheels[0];

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_WHEELS_KEY, JSON.stringify(wheels));

      localStorage.setItem(ACTIVE_WHEEL_KEY, activeWheelId);
    } catch (error) {
      console.error("Failed to save wheels:", error);
    }
  }, [wheels, activeWheelId]);

  const selectWheel = (id: string) => {
    setState((previous) => {
      const now = new Date().toISOString();

      const selectedWheel = previous.wheels.find((wheel) => wheel.id === id);

      if (!selectedWheel) return previous;

      return {
        activeWheelId: id,
        wheels: previous.wheels.map((wheel) =>
          wheel.id === id ? { ...wheel, lastUsedAt: now } : wheel,
        ),
      };
    });
  };

  const createNewWheel = (name: string, choices: string[] = []): string => {
    const newWheel = createWheel(name.trim(), choices);

    setState((previous) => ({
      wheels: [...previous.wheels, newWheel],
      activeWheelId: newWheel.id,
    }));

    return newWheel.id;
  };

  const updateWheelName = (id: string, name: string) => {
    const trimmedName = name.trim();

    if (!trimmedName) return;

    setState((previous) => ({
      ...previous,
      wheels: previous.wheels.map((wheel) =>
        wheel.id === id
          ? {
              ...wheel,
              name: trimmedName,
              updatedAt: new Date().toISOString(),
            }
          : wheel,
      ),
    }));
  };

  const updateWheelChoices = (id: string, updater: ChoicesUpdater) => {
    setState((previous) => ({
      ...previous,
      wheels: previous.wheels.map((wheel) => {
        if (wheel.id !== id) return wheel;

        const updatedChoices =
          typeof updater === "function" ? updater(wheel.choices) : updater;

        return {
          ...wheel,
          choices: [...updatedChoices],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  };

  const duplicateWheel = (id: string): string | null => {
    const source = wheels.find((wheel) => wheel.id === id);

    if (!source) return null;

    const duplicate = createWheel(`${source.name} (Copy)`, source.choices);

    setState((previous) => ({
      wheels: [...previous.wheels, duplicate],
      activeWheelId: duplicate.id,
    }));

    return duplicate.id;
  };

  const deleteWheel = (id: string) => {
    setState((previous) => {
      if (previous.wheels.length <= 1) return previous;

      const remaining = previous.wheels.filter((wheel) => wheel.id !== id);

      if (remaining.length === previous.wheels.length) {
        return previous;
      }

      const activeWasDeleted = previous.activeWheelId === id;
      const fallbackWheel = remaining[0];

      return {
        wheels: activeWasDeleted
          ? remaining.map((wheel) =>
              wheel.id === fallbackWheel.id
                ? { ...wheel, lastUsedAt: new Date().toISOString() }
                : wheel,
            )
          : remaining,
        activeWheelId: activeWasDeleted
          ? fallbackWheel.id
          : previous.activeWheelId,
      };
    });
  };

  return {
    wheels,
    activeWheel,
    activeWheelId,
    selectWheel,
    createWheel: createNewWheel,
    updateWheelName,
    updateWheelChoices,
    duplicateWheel,
    deleteWheel,
  };
}

export default useSavedWheels;
