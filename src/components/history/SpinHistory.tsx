import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  History,
  Trash2,
  X,
  Clock3,
  Trophy,
  Shuffle,
  MousePointer2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type { SpinHistoryEntry } from "../types/history";

interface SpinHistoryProps {
  enabled: boolean;
  entries: SpinHistoryEntry[];
  activeWheelId: string;
  onToggle: (enabled: boolean) => void;
  onDelete: (id: string) => void;
  onClear: (wheelId?: string) => void;
}

function SpinHistory({
  enabled,
  entries,
  activeWheelId,
  onToggle,
  onDelete,
  onClear,
}: SpinHistoryProps) {
  const [expanded, setExpanded] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  const wheelEntries = entries.filter(
    (entry) => entry.wheelId === activeWheelId
  );

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#292929] p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/10 p-3 text-violet-300">
            <History size={21} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">
              Spin History
            </h3>
            <p className="mt-1 text-sm text-neutral-300">
              {wheelEntries.length} saved results for this wheel
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((previous) => !previous)}
          className="rounded-lg border border-white/10 bg-[#383838] p-2 text-neutral-200 hover:bg-white/10"
          aria-label={expanded ? "Collapse history" : "Expand history"}
        >
          {expanded ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#212121] p-4">
        <div>
          <p className="text-sm font-semibold text-white">
            Save spin history
          </p>
          <p className="mt-1 text-xs text-neutral-300">
            Remember results on this device.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`relative h-7 w-12 rounded-full transition ${
            enabled ? "bg-violet-600" : "bg-neutral-600"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
              enabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {!enabled && (
              <div className="mt-5 rounded-xl border border-dashed border-white/20 p-6 text-center">
                <History
                  size={28}
                  className="mx-auto mb-3 text-neutral-400"
                />
                <p className="font-semibold text-white">
                  History is turned off
                </p>
                <p className="mt-2 text-sm text-neutral-300">
                  Turn on Save spin history to start recording future results.
                </p>
              </div>
            )}

            {enabled && wheelEntries.length > 0 && (
              <>
                <div className="mt-5 space-y-3">
                  {wheelEntries.map((entry) => (
                    <motion.div
                      layout
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#212121] p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-amber-400/10 p-2 text-amber-300">
                          <Trophy size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">
                            {entry.winner}
                          </p>

                          <p className="mt-1 text-xs text-neutral-300">
                            {entry.type === "random" ? (
                              <Shuffle
                                size={12}
                                className="mr-1 inline"
                              />
                            ) : (
                              <MousePointer2
                                size={12}
                                className="mr-1 inline"
                              />
                            )}
                            {entry.type === "random"
                              ? "Random spin"
                              : "Manual selection"}
                            {" · "}
                            {entry.choiceCount} choices
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                            <Clock3 size={12} />
                            {formatDate(entry.createdAt)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDelete(entry.id)}
                        className="shrink-0 rounded-lg p-2 text-neutral-300 transition hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Delete history record for ${entry.winner}`}
                        title="Delete record"
                      >
                        <X size={17} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="mt-5 flex items-center gap-2 text-sm font-semibold text-red-300 transition hover:text-red-200"
                >
                  <Trash2 size={16} />
                  Clear this wheel's history
                </button>
              </>
            )}

            {enabled && wheelEntries.length === 0 && (
              <div className="mt-5 rounded-xl border border-dashed border-white/20 p-8 text-center">
                <History
                  size={28}
                  className="mx-auto mb-3 text-neutral-400"
                />
                <p className="font-semibold text-white">
                  No spin history yet
                </p>
                <p className="mt-2 text-sm text-neutral-300">
                  Your future random spins and manual selections will appear here.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setConfirmClear(false);
              }
            }}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="clear-history-title"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#292929] p-6 shadow-2xl"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                <Trash2 size={22} />
              </div>

              <h3
                id="clear-history-title"
                className="text-xl font-bold text-white"
              >
                Clear this wheel's history?
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                All {wheelEntries.length} saved results for this wheel
                will be permanently deleted. Other wheels' history will
                remain untouched.
              </p>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="rounded-xl border border-white/10 bg-[#383838] px-4 py-3 text-sm font-semibold text-neutral-200 transition hover:bg-[#454545]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClear(activeWheelId);
                    setConfirmClear(false);
                  }}
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  Clear history
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default SpinHistory;