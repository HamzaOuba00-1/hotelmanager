import {
  Trash2,
  Layers3,
  Building2,
  BedDouble,
  Landmark,
  Pencil,
  Hotel,
  Warehouse,
  CheckCircle2,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import type { HotelConfigForm } from "./schemas";
import clsx from "clsx";
import { useEffect } from "react";

const roomTypeOptions = [
  { label: "Single", icon: BedDouble },
  { label: "Double", icon: BedDouble },
  { label: "Twin", icon: BedDouble },
  { label: "Suite", icon: Hotel },
  { label: "Deluxe", icon: Hotel },
  { label: "Familiale", icon: Warehouse },
];

export default function HotelStructureCard({
  form,
}: {
  form: UseFormReturn<HotelConfigForm>;
}) {
  const { register, watch, setValue, getValues } = form;

  const floors = watch("floors") ?? 0;
  const floorLabels = watch("floorLabels") ?? [];
  const roomTypes = watch("roomTypes") ?? [];

  // Génération automatique des labels si vides
  useEffect(() => {
    if (!floorLabels.length && floors > 0) {
      const defaultLabels = Array.from({ length: floors }, (_, i) =>
        i === 0 ? "RDC" : `${i}e`
      );
      setValue("floorLabels", defaultLabels, { shouldDirty: true });
    }
  }, [floors, floorLabels, setValue]);

  const updateLabel = (index: number, value: string) => {
    const current = [...(getValues("floorLabels") ?? [])];
    current[index] = value;
    setValue("floorLabels", current, { shouldDirty: true });
  };

  const deleteLabel = (index: number) => {
    const current = [...(getValues("floorLabels") ?? [])];
    current.splice(index, 1); // Supprime un label

    // Met à jour `floorLabels` et `floors`
    setValue("floorLabels", current, { shouldDirty: true });
    setValue("floors", current.length, { shouldDirty: true });
  };

  const toggleRoomType = (label: string) => {
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
      <header className="bg-gradient-to-r from-emerald-500/80 to-emerald-700/70 text-white px-8 py-5 rounded-t-xl shadow backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <Layers3 className="w-6 h-6 text-white" />
          <h2 className="text-lg font-semibold tracking-wide uppercase">
            Structure de l'hôtel
          </h2>
        </div>
      </header>

      <div className="p-8 grid gap-8">
        {/* Étages & chambres */}
        <div className="grid md:grid-cols-2 gap-6">
          <label className={labelClass}>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Nombre d'étages
            </div>
            <input
              type="number"
              className={inputClass}
              {...register("floors", { valueAsNumber: true })}
              placeholder="Ex: 5"
            />
          </label>

          <label className={labelClass}>
            <div className="flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-emerald-500" />
              Chambres par étage
            </div>
            <input
              type="number"
              className={inputClass}
              {...register("roomsPerFloor", { valueAsNumber: true })}
              placeholder="Ex: 10"
            />
          </label>
        </div>

        {/* Labels des étages */}
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Labels des étages
          </div>

          {floors > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[320px] overflow-y-auto pr-1">
              {Array.from({ length: floorLabels.length }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-gray-200 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold shadow">
                    {i === 0 ? "RDC" : i}
                  </div>
                  <input
                    type="text"
                    value={floorLabels[i] ?? ""}
                    placeholder={`Étage ${i}`}
                    onChange={(e) => updateLabel(i, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => deleteLabel(i)}
                    className="text-gray-500 hover:text-red-700"
                    title="Supprimer cet étage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Définissez le nombre d’étages pour générer les labels.
            </p>
          )}
        </div>

        {/* Types de chambres */}
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Hotel className="w-4 h-4 text-emerald-500" />
            Types de chambres disponibles
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {roomTypeOptions.map(({ label, icon: Icon }) => {
              const active = roomTypes.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleRoomType(label)}
                  className={clsx(
                    "flex flex-col items-center justify-center p-4 rounded-xl border transition shadow backdrop-blur-md relative",
                    active
                      ? "bg-emerald-500/90 border-emerald-600 text-white shadow-lg"
                      : "bg-white/50 border-gray-200 text-gray-700 hover:bg-white/60"
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
        </div>
      </div>
    </section>
  );
}
