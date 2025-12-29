import React, { useMemo, useState, useCallback } from "react";
import clsx from "clsx";
import { createCrew } from "../api/crewApi";
import { User } from "../User";
import { ServiceType } from "../Crew";
import {
  UserRound,
  UserRoundPlus,
} from "lucide-react";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  allUsers: User[];
};

const serviceOptions: { value: ServiceType; label: string }[] = [
  { value: "RECEPTION", label: "Reception" },
  { value: "HOUSEKEEPING", label: "Housekeeping" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "KITCHEN", label: "Kitchen" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "BAR", label: "Bar" },
  { value: "CONCIERGE", label: "Concierge" },
  { value: "SPA", label: "Spa" },
  { value: "SECURITY", label: "Security" },
  { value: "IT", label: "IT" },
  { value: "FINANCE", label: "Finance" },
  { value: "HR", label: "HR" },
];

const roleLabel = (r?: string) => r ?? "MEMBER";

/** base tile without conflicting colors */
const tileBase =
  "flex flex-col items-center justify-center w-36 h-36 p-5 rounded-3xl " +
  "backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] " +
  "transition-all duration-200 hover:scale-105 hover:shadow-xl";

const AddCrewModal: React.FC<Props> = ({ onClose, onSuccess, allUsers }) => {
  const [name, setName] = useState("");
  const [service, setService] = useState<ServiceType>("RECEPTION");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const users = useMemo(() => allUsers ?? [], [allUsers]);

  const toggle = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Crew name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createCrew({
        name: name.trim(),
        service,
        memberIds: selectedIds,
      });
      onSuccess();
      onClose();
    } catch {
      setError("Unable to create the crew.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className={clsx(
          "bg-white/60 backdrop-blur-xl w-full max-w-3xl rounded-3xl shadow-xl",
          "p-8 sm:p-10 border border-white/20 animate-fade-in",
          "max-h-[85vh] overflow-hidden"
        )}
      >
        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <UserRoundPlus className="h-6 w-6 text-emerald-600" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Add a Crew
          </h2>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Basic form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <input
            placeholder="Crew name (e.g. Night Maintenance)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input sm:col-span-2"
            required
          />
          <select
            value={service}
            onChange={(e) => setService(e.target.value as ServiceType)}
            className="input"
          >
            {serviceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Member selection */}
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-600">
            Select members
            <span className="ml-2 text-xs text-gray-400">
              ({selectedIds.length} selected
              {selectedIds.length > 1 ? "s" : ""})
            </span>
          </div>

          <div className="max-h-[360px] overflow-y-auto px-2 py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {users.map((u) => {
                const uid = Number((u as any).id);
                const active = selectedIds.includes(uid);

                return (
                  <button
                    type="button"
                    key={uid}
                    onClick={() => toggle(uid)}
                    aria-pressed={active}
                    title={`${u.firstName} ${u.lastName}`}
                    className={clsx(
                      tileBase,
                      "border ring-2 m-0.5",
                      active
                        ? "bg-emerald-100 border-emerald-400 ring-emerald-300"
                        : "bg-white/70 border-white/40 ring-white/20"
                    )}
                  >
                    <UserRound
                      className={clsx(
                        "h-8 w-8 mb-2",
                        active ? "text-emerald-700" : "text-emerald-500"
                      )}
                    />
                    <div className="text-sm font-semibold text-gray-800 text-center">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-[11px] text-gray-500 uppercase mt-1 tracking-widest">
                      {roleLabel((u as any).role)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-white/30">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl
                       bg-gradient-to-br from-emerald-600 to-emerald-500
                       text-white shadow-md hover:shadow-lg transition
                       disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCrewModal;
