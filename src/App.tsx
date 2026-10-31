import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

import {
  RotateCw,
  RotateCcw,
  Sparkles,
  Trophy,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Save,
  FilePlus2,
  Volume2,
  VolumeX,
  MousePointer2,
} from "lucide-react";

import Wheel from "./components/wheel/Wheel";
import WheelManager from "./components/saved-wheels/WheelManager";
import SpinHistory from "./components/history/SpinHistory";

import useSavedWheels from "./hooks/useSavedWheels";
import useSpinHistory from "./hooks/useSpinHistory";

const INITIAL_CHOICES = [
  "Go for a walk",
  "Watch a movie",
  "Order food",
  "Read a book",
  "Play games",
  "Sleep",
];

const DEMO_CHOICES = [
  "Pizza",
  "Burger",
  "Pasta",
  "Sushi",
  "Tacos",
  "Salad",
];

type WinnerType = "random" | "manual";

function App() {
  const {
    wheels,
    activeWheel,
    activeWheelId,
    selectWheel,
    createWheel,
    updateWheelName,
    updateWheelChoices,
    duplicateWheel,
    deleteWheel,
  } = useSavedWheels(INITIAL_CHOICES);

  const {
    enabled: historyEnabled,
    entries: historyEntries,
    setEnabled: setHistoryEnabled,
    addEntry: addHistoryEntry,
    deleteEntry: deleteHistoryEntry,
    clearHistory,
  } = useSpinHistory();

  const choices = activeWheel?.choices ?? [];

  const [newChoice, setNewChoice] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerType, setWinnerType] = useState<WinnerType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const pendingWinner = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const changeChoices = (
    updater: string[] | ((previous: string[]) => string[])
  ) => {
    if (!activeWheel) return;

    updateWheelChoices(activeWheel.id, updater);
    setSelectedIndex(null);
    setWinner(null);
    setWinnerType(null);
  };

  const prepareAudio = () => {
    if (!soundEnabled || typeof window === "undefined") return;

    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }
  };

  const playCelebrationSound = () => {
    const context = audioContextRef.current;
    if (!context) return;

    const playNotes = () => {
      const notes = [
        { frequency: 523.25, start: 0, duration: 0.18 },
        { frequency: 659.25, start: 0.16, duration: 0.18 },
        { frequency: 783.99, start: 0.32, duration: 0.35 },
      ];

      notes.forEach(({ frequency, start, duration }) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        const noteStart = context.currentTime + start;
        const noteEnd = noteStart + duration;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(
          0.16,
          noteStart + 0.025
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(noteStart);
        oscillator.stop(noteEnd);
      });
    };

    if (context.state === "suspended") {
      void context.resume().then(playNotes);
    } else {
      playNotes();
    }
  };

  const resetWheelState = () => {
    setNewChoice("");
    setEditingIndex(null);
    setEditingValue("");
    setRotation(0);
    setWinner(null);
    setWinnerType(null);
    setSelectedIndex(null);
    setError("");
    pendingWinner.current = null;
  };

  const handleSelectWheel = (id: string) => {
    if (spinning) return;

    selectWheel(id);
    resetWheelState();
  };

  const handleCreateWheel = (name: string) => {
    if (spinning) return;

    createWheel(name);
    resetWheelState();
  };

  const handleDuplicateWheel = (id: string) => {
    if (spinning) return;

    const newId = duplicateWheel(id);

    if (newId) {
      resetWheelState();
    }
  };

  const handleDeleteWheel = (id: string) => {
    if (spinning || wheels.length <= 1) return;

    deleteWheel(id);
    resetWheelState();
  };

  const createBlankWheel = () => {
    if (spinning) return;

    changeChoices([]);
    resetWheelState();
  };

  const addDemoChoices = () => {
    if (spinning) return;

    changeChoices(DEMO_CHOICES);
    resetWheelState();
  };

  const resetWheelPosition = () => {
    if (spinning) return;

    setRotation(0);
    setWinner(null);
    setWinnerType(null);
    setSelectedIndex(null);
    pendingWinner.current = null;
  };

  const addChoice = () => {
    if (spinning) return;

    const value = newChoice.trim();

    if (!value) {
      setError("Please enter a choice.");
      return;
    }

    if (
      choices.some(
        (choice) => choice.toLowerCase() === value.toLowerCase()
      )
    ) {
      setError("This choice already exists.");
      return;
    }

    changeChoices((previous) => [...previous, value]);
    setNewChoice("");
    setError("");
  };

  const deleteChoice = (index: number) => {
    if (spinning) return;

    changeChoices((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );

    setError("");
  };

  const startEditing = (index: number) => {
    if (spinning) return;

    setEditingIndex(index);
    setEditingValue(choices[index]);
    setError("");
  };

  const saveEdit = () => {
    if (spinning || editingIndex === null) return;

    const value = editingValue.trim();

    if (!value) {
      setError("Choice cannot be empty.");
      return;
    }

    const duplicate = choices.some(
      (choice, index) =>
        index !== editingIndex &&
        choice.toLowerCase() === value.toLowerCase()
    );

    if (duplicate) {
      setError("This choice already exists.");
      return;
    }

    changeChoices((previous) =>
      previous.map((choice, index) =>
        index === editingIndex ? value : choice
      )
    );

    setEditingIndex(null);
    setEditingValue("");
    setError("");
  };

  const cancelEditing = () => {
    if (spinning) return;

    setEditingIndex(null);
    setEditingValue("");
    setError("");
  };

  // Clicking a segment only selects it.
  const handleSelectSegment = (index: number) => {
    if (spinning || !choices[index]) return;

    setSelectedIndex(index);
    setWinner(null);
    setWinnerType(null);
  };

  // Dragging and releasing manually chooses the pointer's segment.
  const handleManualSelection = (index: number) => {
    if (spinning || !choices[index]) return;

    const selectedChoice = choices[index];

    setSelectedIndex(index);
    setWinner(selectedChoice);
    setWinnerType("manual");

    if (activeWheel) {
      addHistoryEntry(
        activeWheel.id,
        activeWheel.name,
        selectedChoice,
        "manual",
        choices.length
      );
    }
  };

  const handleManualRotate = (nextRotation: number) => {
    if (spinning) return;

    setRotation(nextRotation);
    setWinner(null);
    setWinnerType(null);
  };

  // Random spinning.
  const spinWheel = () => {
    if (spinning || choices.length < 2) return;

    if (soundEnabled) prepareAudio();

    setWinner(null);
    setWinnerType(null);
    setSelectedIndex(null);
    setSpinning(true);

    const winningIndex = Math.floor(Math.random() * choices.length);

    pendingWinner.current = choices[winningIndex];

    const segmentAngle = 360 / choices.length;

    const desiredAngle =
      (360 - (winningIndex + 0.5) * segmentAngle) % 360;

    const currentAngle = ((rotation % 360) + 360) % 360;

    const adjustment =
      (desiredAngle - currentAngle + 360) % 360;

    setRotation(rotation + 5 * 360 + adjustment);
  };

  // Called only when the random spin animation finishes.
  const handleSpinComplete = () => {
    setSpinning(false);

    const completedWinner = pendingWinner.current;
    pendingWinner.current = null;

    setWinner(completedWinner);
    setWinnerType(completedWinner ? "random" : null);

    if (!completedWinner) return;

    const winningIndex = choices.indexOf(completedWinner);

    setSelectedIndex(winningIndex >= 0 ? winningIndex : null);

    if (activeWheel) {
      addHistoryEntry(
        activeWheel.id,
        activeWheel.name,
        completedWinner,
        "random",
        choices.length
      );
    }

    confetti({
      particleCount: 130,
      spread: 85,
      startVelocity: 45,
      gravity: 0.9,
      origin: { y: 0.58 },
      colors: [
        "#8B5CF6",
        "#EC4899",
        "#F97316",
        "#EAB308",
        "#10B981",
        "#06B6D4",
      ],
    });

    if (soundEnabled) {
      playCelebrationSound();
    }
  };

  const resetChoices = () => {
    if (spinning) return;

    changeChoices(INITIAL_CHOICES);
    resetWheelState();
  };

  const toggleSound = () => {
    setSoundEnabled((previous) => !previous);
  };

  const selectedChoice =
    selectedIndex !== null ? choices[selectedIndex] : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#212121] text-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-5">
          <div className="rounded-xl bg-linear-to-br from-violet-500 to-pink-500 p-3">
            <Sparkles size={20} />
          </div>

          <div>
            <h1 className="text-lg font-bold">
              Let the Wheel Decide
            </h1>

            <p className="text-sm text-neutral-300">
              Sometimes, let chance choose.
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <section className="mb-12 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Can't decide?
            <span className="ml-3 bg-linear-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Spin it.
            </span>
          </h2>

          <p className="mt-4 text-neutral-300">
            Create your wheels and let randomness decide.
          </p>
        </section>

        {/* Saved wheels */}
        <section className="mb-10">
          <WheelManager
            wheels={wheels}
            activeWheelId={activeWheelId}
            disabled={spinning}
            onSelectWheel={handleSelectWheel}
            onCreateWheel={handleCreateWheel}
            onRenameWheel={updateWheelName}
            onDuplicateWheel={handleDuplicateWheel}
            onDeleteWheel={handleDeleteWheel}
          />
        </section>

        {/* Workspace */}
        <section className="grid items-center gap-10 lg:grid-cols-2">
          {/* Wheel */}
          <div className="rounded-3xl border border-white/10 bg-[#292929] p-6 md:p-10">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold">Decision wheel</h3>

                <p className="mt-1 truncate text-sm text-neutral-300">
                  {activeWheel?.name}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-sm font-medium text-violet-200">
                  {choices.length} choices
                </span>

                <button
                  type="button"
                  onClick={toggleSound}
                  aria-label={
                    soundEnabled ? "Turn sound off" : "Turn sound on"
                  }
                  aria-pressed={soundEnabled}
                  title={soundEnabled ? "Sound on" : "Sound off"}
                  className="rounded-lg border border-white/10 bg-[#383838] p-2 text-neutral-200 transition hover:bg-[#454545] hover:text-white"
                >
                  {soundEnabled ? (
                    <Volume2 size={17} />
                  ) : (
                    <VolumeX size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Winner and selection display */}
            <div className="mb-6 min-h-20">
              <AnimatePresence mode="wait">
                {winner && (
                  <motion.div
                    key={`${activeWheelId}-${winner}-${winnerType}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`rounded-2xl border px-5 py-4 text-center ${
                      winnerType === "random"
                        ? "border-amber-400/30 bg-amber-400/10"
                        : "border-violet-400/30 bg-violet-500/10"
                    }`}
                  >
                    <div
                      className={`mb-1 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest ${
                        winnerType === "random"
                          ? "text-amber-300"
                          : "text-violet-300"
                      }`}
                    >
                      {winnerType === "random" ? (
                        <Trophy size={15} />
                      ) : (
                        <MousePointer2 size={15} />
                      )}

                      {winnerType === "random"
                        ? "The wheel has decided"
                        : "Manual result"}
                    </div>

                    <p className="break-words text-2xl font-extrabold text-white">
                      {winner}
                    </p>
                  </motion.div>
                )}

                {!winner && selectedChoice && (
                  <motion.div
                    key={`${activeWheelId}-${selectedIndex}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-violet-400/30 bg-violet-500/10 px-5 py-4 text-center"
                  >
                    <div className="mb-1 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-300">
                      <MousePointer2 size={15} />
                      Selected choice
                    </div>

                    <p className="break-words text-xl font-bold text-white">
                      {selectedChoice}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Wheel
              choices={choices}
              rotation={rotation}
              spinning={spinning}
              selectedIndex={selectedIndex}
              onSpinComplete={handleSpinComplete}
              onSelectSegment={handleSelectSegment}
              onManualRotate={handleManualRotate}
              onManualSelection={handleManualSelection}
            />

            <button
              onClick={spinWheel}
              disabled={spinning || choices.length < 2}
              className="mx-auto mt-8 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-pink-600 px-6 py-4 font-bold text-white shadow-lg shadow-violet-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCw
                size={19}
                className={spinning ? "animate-spin" : ""}
              />

              {spinning ? "Spinning..." : "Spin the wheel"}
            </button>

            <button
              onClick={resetWheelPosition}
              disabled={spinning || rotation === 0}
              className="mx-auto mt-3 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#383838] px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:border-violet-400/40 hover:bg-[#414141] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={17} />
              Reset Wheel Position
            </button>

            {choices.length < 2 && (
              <p className="mt-4 text-center text-sm text-amber-300">
                Add at least two choices to spin.
              </p>
            )}
          </div>

          {/* Choice manager */}
          <div className="rounded-3xl border border-white/10 bg-[#292929] p-6 md:p-8">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Your choices</h3>

                <p className="mt-1 text-sm text-neutral-300">
                  Customize this saved wheel.
                </p>
              </div>

              <span className="rounded-lg bg-[#383838] px-3 py-2 text-sm font-medium text-neutral-200">
                {choices.length} options
              </span>
            </div>

            <button
              onClick={createBlankWheel}
              disabled={spinning}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-400/60 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FilePlus2 size={18} />
              Clear Current Wheel
            </button>

            <button
              onClick={addDemoChoices}
              disabled={spinning}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-pink-400/30 bg-pink-500/10 px-4 py-3 text-sm font-semibold text-pink-200 transition hover:border-pink-400/60 hover:bg-pink-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles size={18} />
              Add Demo Choices
            </button>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                addChoice();
              }}
              className="mb-5 flex gap-2"
            >
              <input
                type="text"
                value={newChoice}
                onChange={(event) => {
                  setNewChoice(event.target.value);
                  setError("");
                }}
                placeholder="Add a new choice..."
                maxLength={40}
                disabled={spinning}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#212121] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-400 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              />

              <button
                type="submit"
                disabled={spinning}
                className="flex items-center justify-center rounded-xl bg-violet-600 px-4 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Add choice"
              >
                <Plus size={20} />
              </button>
            </form>

            {error && (
              <p className="mb-4 text-sm font-medium text-red-300">
                {error}
              </p>
            )}

            <div className="max-h-105 space-y-3 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {choices.map((choice, index) => (
                  <motion.div
                    key={`${index}-${choice}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                      selectedIndex === index
                        ? "border-violet-400/50 bg-violet-500/10"
                        : "border-white/10 bg-[#212121]"
                    }`}
                  >
                    {editingIndex === index ? (
                      <input
                        autoFocus
                        value={editingValue}
                        maxLength={40}
                        disabled={spinning}
                        onChange={(event) => {
                          setEditingValue(event.target.value);
                          setError("");
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") saveEdit();
                          if (event.key === "Escape") cancelEditing();
                        }}
                        className="min-w-0 flex-1 rounded-lg border border-violet-500 bg-[#292929] px-3 py-2 text-sm outline-none disabled:opacity-40"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectSegment(index)}
                        disabled={spinning}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold text-neutral-300">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="truncate text-sm font-medium text-neutral-100">
                          {choice}
                        </span>
                      </button>
                    )}

                    <div className="flex shrink-0 items-center gap-2">
                      {editingIndex === index ? (
                        <>
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={spinning}
                            className="rounded-lg p-2 text-emerald-400 hover:bg-emerald-400/10 disabled:opacity-30"
                            aria-label="Save choice"
                          >
                            <Check size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={spinning}
                            className="rounded-lg p-2 text-neutral-300 hover:bg-white/5 disabled:opacity-30"
                            aria-label="Cancel editing"
                          >
                            <X size={17} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditing(index)}
                            disabled={spinning}
                            className="rounded-lg p-2 text-neutral-300 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Edit ${choice}`}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteChoice(index)}
                            disabled={spinning}
                            className="rounded-lg p-2 text-neutral-300 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Delete ${choice}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {choices.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
                  <Sparkles
                    size={28}
                    className="mx-auto mb-3 text-violet-400"
                  />

                  <p className="text-sm font-semibold text-white">
                    Your wheel is blank
                  </p>

                  <p className="mt-2 text-sm text-neutral-300">
                    Add choices above to start building your wheel.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
              <span className="text-sm font-medium text-neutral-300">
                Saved automatically
              </span>

              <button
                onClick={resetChoices}
                disabled={spinning}
                className="flex items-center gap-2 text-sm font-semibold text-neutral-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Save size={16} />
                Reset defaults
              </button>
            </div>
          </div>
        </section>

        {/* Spin history */}
        <section className="mt-10">
          <SpinHistory
            enabled={historyEnabled}
            entries={historyEntries}
            activeWheelId={activeWheelId}
            onToggle={setHistoryEnabled}
            onDelete={deleteHistoryEntry}
            onClear={clearHistory}
          />
        </section>

        <footer className="mt-16 border-t border-white/10 pt-6 text-center text-sm font-medium text-neutral-300">
          Made for the moments when you just can't decide.
        </footer>
      </main>
    </div>
  );
}

export default App;