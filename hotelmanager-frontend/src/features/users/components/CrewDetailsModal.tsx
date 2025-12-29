import React, { useEffect, useMemo, useState, useCallback } from "react";
import clsx from "clsx";
import { Crew } from "../Crew";
import { User } from "../User";
import { getCrew, updateCrew, deleteCrew } from "../api/crewApi";
import {
  UserRound,
  Users,
  PencilLine,
  Trash2,
  X,
  CheckCircle2,
  Shield,
  Hotel,
  Drill,
  Utensils,
  Martini,
  ConciergeBell,
  Bubbles,
  MonitorCog,
  HandCoins,
  DoorOpen,
  Loader2,
  ChefHat,
  Network,
  Bookmark,
} from "lucide-react";
import ConfirmModal from "../../../shared/components/ConfirmModal";

type Props = {
  crewId: number;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  allUsers: User[];
};

const cardBase =
  "flex flex-col items-center justify-center w-36 h-36 p-5 rounded-3xl " +
  "backdrop-blur-xl border shadow-[0_8px_24px_rgba(0,0,0,0.08)] " +
  "ring-1 ring-white/20 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg";

const chip =
  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium " +
  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";

const btnBase =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500";
const btnGhost =
  btnBase + " border border-gray-200 text-gray-700 hover:bg-gray-100";
const btnDanger = btnBase + " border border-red-500 text-red-500 hover:bg-red-50";
const btnPrimary =
  btnBase +
  " text-white bg-gradient-to-br from-emerald-600 to-emerald-500 hover:shadow-lg";

const serviceIcon = (service?: Crew["service"]) => {
  const cls = "w-4 h-4";
  switch (service) {
    case "RECEPTION":
      return <Hotel className={cls} />;
    case "HOUSEKEEPING":
      return <DoorOpen className={cls} />;
    case "MAINTENANCE":
      return <Drill className={cls} />;
    case "KITCHEN":
      return <ChefHat className={cls} />;
    case "RESTAURANT":
      return <Utensils className={cls} />;
    case "BAR":
      return <Martini className={cls} />;
    case "CONCIERGE":
      return <ConciergeBell className={cls} />;
    case "SPA":
      return <Bubbles className={cls} />;
    case "SECURITY":
      return <Shield className={cls} />;
    case "IT":
      return <MonitorCog className={cls} />;
    case "FINANCE":
      return <HandCoins className={cls} />;
    case "HR":
      return <Network className={cls} />;
    default:
      return <Users className={cls} />;
  }
};

const CrewDetailsModal: React.FC<Props> = ({
  crewId,
  onClose,
  onSaved,
  onDeleted,
  allUsers,
}) => {
  const [crew, setCrew] = useState<Crew | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const usersById = useMemo(
    () => new Map(allUsers.map((u) => [Number((u as any).id), u])),
    [allUsers]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const c = await getCrew(crewId);
      setCrew(c);
      setName(c.name);
      setSelectedIds(c.members.map((m) => Number((m as any).id)));
    } catch {
      setError("Unable to load the crew.");
    } finally {
      setLoading(false);
    }
  }, [crewId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const confirmSave = () => setShowConfirmSave(true);
  const confirmDelete = () => setShowConfirmDelete(true);

  const doSave = async () => {
    if (!crew) return;
    setSaving(true);
    setError(null);
    try {
      await updateCrew(crew.id, {
        name: name.trim(),
        service: crew.service,
        memberIds: selectedIds,
      });
      setEditMode(false);
      await load();
      onSaved();
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(false);
      setShowConfirmSave(false);
    }
  };

  const doDelete = async () => {
    if (!crew) return;
    try {
      await deleteCrew(crew.id);
      onDeleted();
      onClose();
    } catch {
      setError("Unable to delete.");
    } finally {
      setShowConfirmDelete(false);
    }
  };

  const resetEdit = () => {
    if (!crew) return;
    setName(crew.name);
    setSelectedIds(crew.members.map((m) => Number((m as any).id)));
    setEditMode(false);
    setError(null);
  };

  const headerTitle = editMode ? "Edit crew" : "Crew details";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl animate-fadeIn">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs">
                {serviceIcon(crew?.service)}
                <span>{crew?.service || "-"}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white drop-shadow mt-2">
                {headerTitle}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-white/90 text-sm">
                <Users className="w-4 h-4" />
                <span>{crew?.members?.length || 0} member(s)</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {!editMode ? (
                <>
                  <button className={btnGhost} onClick={() => setEditMode(true)}>
                    <PencilLine className="w-4 h-4" /> Edit
                  </button>
                  <button className={btnDanger} onClick={confirmDelete}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  <button className={btnPrimary} onClick={onClose}>
                    <X className="w-4 h-4" /> Close
                  </button>
                </>
              ) : (
                <>
                  <button className={btnGhost} onClick={resetEdit}>
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button className={btnPrimary} onClick={confirmSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {saving ? "Saving�" : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 flex items-center gap-2">
              <Shield className="w-4 h-4" /> {error}
            </div>
          ) : !crew ? null : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600 mb-2">Crew name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!editMode}
                      className={clsx(
                        "w-full rounded-2xl border px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500",
                        editMode ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"
                      )}
                    />
                  </div>

                  <div className={chip}>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span className="text-xs text-gray-500">
                      <span className="font-medium">{selectedIds.length}</span> selected
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800">Members</h3>
                    {!editMode && (
                      <span className="text-xs text-gray-500">
                        {crew.members.length} member(s)
                      </span>
                    )}
                  </div>

                  {!editMode ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {crew.members.map((m) => (
                        <div
                          key={Number((m as any).id)}
                          className={clsx(cardBase, "bg-white/50 border-white/30")}
                        >
                          <UserRound className="h-8 w-8 text-emerald-600 mb-2" />
                          <div className="text-sm font-semibold text-gray-800 text-center">
                            {m.firstName} {m.lastName}
                          </div>
                          <div className="text-[11px] text-gray-500 uppercase mt-1 tracking-widest">
                            {m.role}
                          </div>
                        </div>
                      ))}
                      {crew.members.length === 0 && (
                        <span className="text-sm text-gray-500">No members.</span>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {allUsers.map((u) => {
                        const uid = Number((u as any).id);
                        const active = selectedIds.includes(uid);

                        return (
                          <button
                            type="button"
                            key={uid}
                            onClick={() => toggle(uid)}
                            aria-pressed={active}
                            className={clsx(
                              cardBase,
                              "m-0.5",
                              active
                                ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200"
                                : "bg-white/50 border-white/30"
                            )}
                            title={`${u.firstName} ${u.lastName}`}
                          >
                            <UserRound
                              className={clsx(
                                "h-8 w-8 mb-2",
                                active ? "text-emerald-700" : "text-emerald-600"
                              )}
                            />
                            <div className="text-sm font-semibold text-gray-800 text-center">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-[11px] text-gray-500 uppercase mt-1 tracking-widest">
                              {(usersById.get(uid) as any)?.role ?? u.role}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex sm:hidden flex-col gap-3">
                {!editMode ? (
                  <>
                    <button className={btnDanger} onClick={confirmDelete}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button className={btnGhost} onClick={() => setEditMode(true)}>
                      <PencilLine className="w-4 h-4" /> Edit
                    </button>
                    <button className={btnPrimary} onClick={onClose}>
                      <X className="w-4 h-4" /> Close
                    </button>
                  </>
                ) : (
                  <>
                    <button className={btnGhost} onClick={resetEdit}>
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button className={btnPrimary} onClick={confirmSave} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {saving ? "Saving�" : "Save"}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showConfirmDelete}
        title="Confirm deletion"
        tone="danger"
        message={
          <div>
            Are you sure you want to delete this crew?
            <div className="mt-2 text-xs text-gray-500">This action cannot be undone.</div>
          </div>
        }
        confirmLabel="Delete"
        onConfirm={doDelete}
        onClose={() => setShowConfirmDelete(false)}
      />

      <ConfirmModal
        open={showConfirmSave}
        title="Save changes"
        message={
          <div className="space-y-1">
            <div>
              Name: <span className="font-medium">{name || "(empty)"}</span>
            </div>
            <div>
              Selected members: <span className="font-medium">{selectedIds.length}</span>
            </div>
          </div>
        }
        confirmLabel="Save"
        onConfirm={doSave}
        onClose={() => setShowConfirmSave(false)}
        loading={saving}
      />
    </div>
  );
};

export default CrewDetailsModal;
