import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type { SavedWheel } from "../types/wheel";

interface WheelManagerProps {
  wheels: SavedWheel[];
  activeWheelId: string;
  disabled: boolean;
  onSelectWheel: (id: string) => void;
  onCreateWheel: (name: string) => void;
  onRenameWheel: (id: string, name: string) => void;
  onDuplicateWheel: (id: string) => void;
  onDeleteWheel: (id: string) => void;
}

const PAGE_SIZE = 6;

function WheelManager({
  wheels,
  activeWheelId,
  disabled,
  onSelectWheel,
  onCreateWheel,
  onRenameWheel,
  onDuplicateWheel,
  onDeleteWheel,
}: WheelManagerProps) {
  const [newWheelName, setNewWheelName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<SavedWheel | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");

  const buttonClass =
    "rounded-lg border border-white/10 bg-[#383838] p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30";

  const filteredWheels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...wheels]
      .filter((wheel) =>
        wheel.name.toLowerCase().includes(query)
      )
      .sort(
        (a, b) =>
          new Date(b.lastUsedAt).getTime() -
          new Date(a.lastUsedAt).getTime()
      );
  }, [wheels, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWheels.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedWheels = filteredWheels.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (disabled) return;

    const name = newWheelName.trim();

    if (!name) {
      setError("Please enter a name for your wheel.");
      return;
    }

    onCreateWheel(name);
    setNewWheelName("");
    setError("");
    setCurrentPage(1);
  };

  const startRenaming = (wheel: SavedWheel) => {
    if (disabled) return;

    setRenamingId(wheel.id);
    setRenamingName(wheel.name);
    setError("");
  };

  const saveRename = (id: string) => {
    if (disabled) return;

    const name = renamingName.trim();

    if (!name) {
      setError("Wheel name cannot be empty.");
      return;
    }

    onRenameWheel(id, name);
    setRenamingId(null);
    setRenamingName("");
    setError("");
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenamingName("");
    setError("");
  };

  const confirmDelete = () => {
    if (!deleteTarget || disabled) return;

    onDeleteWheel(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleDuplicate = (id: string) => {
    if (disabled) return;

    onDuplicateWheel(id);
    setCurrentPage(1);
  };

  return (
    <>
      <section className="rounded-3xl border border-white/10 bg-[#292929] p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">My Saved Wheels</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Create, search, and manage your decision wheels.
            </p>
          </div>

          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
            {wheels.length} {wheels.length === 1 ? "wheel" : "wheels"}
          </span>
        </div>

        <form onSubmit={handleCreate} className="mb-4 flex gap-2">
          <input
            type="text"
            value={newWheelName}
            onChange={(event) => {
              setNewWheelName(event.target.value);
              setError("");
            }}
            placeholder="Name your new wheel..."
            maxLength={40}
            disabled={disabled}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#212121] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-violet-500 disabled:opacity-40"
          />

          <button
            type="submit"
            disabled={disabled || !newWheelName.trim()}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Wheel</span>
          </button>
        </form>

        <div className="relative mb-5">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search saved wheels..."
            className="w-full rounded-xl border border-white/10 bg-[#212121] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-violet-500"
          />
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-400">{error}</p>
        )}

        {filteredWheels.length > 0 ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedWheels.map((wheel) => {
                const isActive = wheel.id === activeWheelId;
                const isRenaming = renamingId === wheel.id;

                return (
                  <motion.div
                    layout
                    key={wheel.id}
                    className={`min-w-0 rounded-2xl border p-4 transition ${
                      isActive
                        ? "border-violet-400/60 bg-violet-500/10"
                        : "border-white/10 bg-[#212121] hover:border-white/20"
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {isRenaming ? (
                          <input
                            autoFocus
                            value={renamingName}
                            maxLength={40}
                            disabled={disabled}
                            onChange={(event) => {
                              setRenamingName(event.target.value);
                              setError("");
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                saveRename(wheel.id);
                              }

                              if (event.key === "Escape") {
                                cancelRename();
                              }
                            }}
                            className="w-full rounded-lg border border-violet-500 bg-[#292929] px-2 py-2 text-sm text-white outline-none"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectWheel(wheel.id)}
                            disabled={disabled}
                            title={wheel.name}
                            className="block max-w-full truncate text-left text-sm font-semibold text-white hover:text-violet-300 disabled:cursor-not-allowed"
                          >
                            {wheel.name}
                          </button>
                        )}

                        <p className="mt-2 text-xs text-neutral-300">
                          {wheel.choices.length}{" "}
                          {wheel.choices.length === 1
                            ? "choice"
                            : "choices"}
                        </p>

                        <p className="mt-1 text-[11px] text-neutral-400">
                          Last used:{" "}
                          {new Date(wheel.lastUsedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {isActive && !isRenaming && (
                        <span className="shrink-0 rounded-full bg-violet-500/20 px-2 py-1 text-[10px] font-semibold text-violet-300">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                      <button
                        type="button"
                        onClick={() => onSelectWheel(wheel.id)}
                        disabled={disabled || isActive || isRenaming}
                        className="text-xs font-semibold text-violet-300 transition hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isActive ? "Currently selected" : "Use this wheel"}
                      </button>

                      <div className="flex shrink-0 items-center gap-1">
                        {isRenaming ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveRename(wheel.id)}
                              disabled={disabled}
                              className="rounded-lg p-2 text-emerald-400 hover:bg-emerald-400/10 disabled:opacity-30"
                              aria-label="Save wheel name"
                            >
                              <Check size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={cancelRename}
                              disabled={disabled}
                              className="rounded-lg p-2 text-neutral-400 hover:bg-white/5 disabled:opacity-30"
                              aria-label="Cancel renaming"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startRenaming(wheel)}
                              disabled={disabled}
                              className={buttonClass}
                              aria-label={`Rename ${wheel.name}`}
                              title="Rename"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicate(wheel.id)}
                              disabled={disabled}
                              className={buttonClass}
                              aria-label={`Duplicate ${wheel.name}`}
                              title="Duplicate"
                            >
                              <Copy size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(wheel)}
                              disabled={disabled || wheels.length <= 1}
                              className={`${buttonClass} hover:bg-red-500/10 hover:text-red-400`}
                              aria-label={`Delete ${wheel.name}`}
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <p className="text-xs text-neutral-500">
                  Showing{" "}
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filteredWheels.length)}{" "}
                  of {filteredWheels.length} wheels
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={safePage === 1}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#383838] px-3 py-2 text-xs text-neutral-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft size={15} />
                    Previous
                  </button>

                  <span className="min-w-16 text-center text-xs text-neutral-400">
                    Page {safePage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={safePage === totalPages}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#383838] px-3 py-2 text-xs text-neutral-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
            <Search
              size={26}
              className="mx-auto mb-3 text-neutral-500"
            />

            <p className="text-sm font-medium text-white">
              No wheels found
            </p>

            <p className="mt-2 text-xs text-neutral-400">
              Try another search term or create a new wheel.
            </p>
          </div>
        )}

        <p className="mt-5 text-xs text-neutral-300">
          Wheels are sorted by recent use and saved automatically on this device.
        </p>
      </section>

      {/* Custom delete confirmation dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setDeleteTarget(null);
              }
            }}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-wheel-title"
              aria-describedby="delete-wheel-description"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#292929] p-6 shadow-2xl"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                <Trash2 size={22} />
              </div>

              <h3
                id="delete-wheel-title"
                className="text-xl font-bold text-white"
              >
                Delete this wheel?
              </h3>

              <p
                id="delete-wheel-description"
                className="mt-3 text-sm leading-6 text-neutral-400"
              >
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {deleteTarget.name}
                </span>
                ? This will permanently remove its saved choices. This
                action cannot be undone.
              </p>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border border-white/10 bg-[#383838] px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-[#454545] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={disabled}
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete wheel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default WheelManager;