import {
  Layers3,
  Building2,
  BedDouble,
  Hotel,
  Warehouse,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import type { HotelConfigForm } from "./schemas";
import clsx from "clsx";
import { useEffect } from "react";

export const DEFAULT_ROOM_TYPES = [
  "Single",
  "Double",
  "Twin",
  "Suite",
  "Deluxe",
  "Family",
] as const;

const roomTypeOptions = [
  { label: "Single", icon: BedDouble },
  { label: "Double", icon: BedDouble },
  { label: "Twin", icon: BedDouble },
  { label: "Suite", icon: Hotel },
  { label: "Deluxe", icon: Hotel },
  { label: "Family", icon: Warehouse },
];

export default function HotelStructureCard({
  form,
  isLocked = false,
}: {
  form: UseFormReturn<HotelConfigForm>;
  isLocked?: boolean;
}) {
  const { register, watch, setValue, getValues } = form;

  const floors = watch("floors") ?? 0;
  const floorLabels = watch("floorLabels") ?? [];
  const roomTypes = watch("roomTypes") ?? [];

  useEffect(() => {
    if (floors > 0) {
      const current = [...(getValues("floorLabels") ?? [])];
      const updated = Array.from({ length: floors }, (_, i) =>
        current[i] ?? (i === 0 ? "Ground floor" : `Floor ${i}`)
      );
      setValue("floorLabels", updated, { shouldDirty: true });
    } else {
      setValue("floorLabels", [], { shouldDirty: true });
    }
  }, [floors, getValues, setValue]);

  const updateLabel = (index: number, value: string) => {
    const current = [...(getValues("floorLabels") ?? [])];
    current[index] = value;
    setValue("floorLabels", current, { shouldDirty: true });
  };

  const toggleRoomType = (label: string) => {
    if (isLocked) return;

    const current = getValues("roomTypes") ?? [];
    const exists = current.includes(label);

    const updated = exists
      ? current.filter((v) => v !== label)
      : [...current, label];

    setValue("roomTypes", updated, { shouldDirty: true });
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 px-4 py-2 text-sm bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500 transition";

  const labelClass = "grid gap-1 text-sm font-medium text-gray-700";

  return (
    <section className="rounded-xl border border-gray-100 bg-white/70 shadow-xl backdrop-blur-md transition-all duration-300">
      {/* Hotel structure configuration header */}
      <header className="bg-gradient-to-r from-emerald-500/80 to-emerald-700/70 text-white px-8 py-5 rounded-t-xl shadow backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <Layers3 className="w-6 h-6 text-white" />
          <h2 className="text-lg font-semibold tracking-wide uppercase">
            Hotel structure
          </h2>
        </div>
      </header>

      <div className="p-8 grid gap-8">
        {/* Floors and room capacity configuration */}
        <div className="grid md:grid-cols-2 gap-6">
          <label className={labelClass}>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Number of floors
              {isLocked && <Lock className="w-3.5 h-3.5 text-gray-400 ml-1" />}
            </div>
            <input
              type="number"
              disabled={isLocked}
              className={clsx(
                inputClass,
                isLocked && "opacity-60 cursor-not-allowed"
              )}
              {...register("floors", { valueAsNumber: true })}
              placeholder="e.g. 5"
            />
            {isLocked && (
              <span className="text-[11px] text-gray-500 italic">
                Can only be defined once
              </span>
            )}
          </label>

          <label className={labelClass}>
            <div className="flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-emerald-500" />
              Rooms per floor
              {isLocked && <Lock className="w-3.5 h-3.5 text-gray-400 ml-1" />}
            </div>
            <input
              type="number"
              disabled={isLocked}
              className={clsx(
                inputClass,
                isLocked && "opacity-60 cursor-not-allowed"
              )}
              {...register("roomsPerFloor", { valueAsNumber: true })}
              placeholder="e.g. 10"
            />
            {isLocked && (
              <span className="text-[11px] text-gray-500 italic">
                Can only be defined once
              </span>
            )}
          </label>
        </div>

        {/* Available room types selection */}
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Hotel className="w-4 h-4 text-emerald-500" />
            Available room types
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                <Lock className="w-3.5 h-3.5" /> Locked
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {roomTypeOptions.map(({ label, icon: Icon }) => {
              const active = roomTypes.includes(label);

              return (
                <button
                  key={label}
                  type="button"
                  disabled={isLocked}
                  onClick={() => toggleRoomType(label)}
                  className={clsx(
                    "flex flex-col items-center justify-center p-4 rounded-xl border transition shadow backdrop-blur-md relative",
                    active
                      ? "bg-emerald-500/90 border-emerald-600 text-white shadow-lg"
                      : "bg-white/50 border-gray-200 text-gray-700 hover:bg-white/60",
                    isLocked &&
                      "opacity-60 cursor-not-allowed hover:bg-white/50"
                  )}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">{label}</span>
                  {active && (
                    <CheckCircle2 className="absolute top-1 right-1 w-4 h-4 text-white" />
                  )}
                </button>
              );
            })}
          </div>

          {!roomTypes.length && !isLocked && (
            <p className="text-xs text-gray-500 italic">
              Tip: select at least one room type for the hotel.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
