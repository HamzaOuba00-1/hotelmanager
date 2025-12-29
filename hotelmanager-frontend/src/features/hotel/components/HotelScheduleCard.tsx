import { UseFormReturn } from "react-hook-form";
import type { HotelConfigForm } from "./schemas";
import {
  CalendarDays,
  Clock,
  Plus,
  X,
  CircleX,
  ChartSpline,
} from "lucide-react";

export default function HotelScheduleCard({
  form,
}: {
  form: UseFormReturn<HotelConfigForm>;
}) {
  const { register, getValues, watch, setValue } = form;

  const closedDays = watch("closedDays") ?? [];

  const addClosedDay = (value: string) => {
    const day = value.trim();
    if (!day) return;
    if (closedDays.includes(day)) return;

    const next = [...closedDays, day];
    setValue("closedDays", next, { shouldDirty: true });
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 px-4 py-2 text-sm bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500 transition";

  const labelClass = "grid gap-1 text-sm font-medium text-gray-700";

  return (
    <section className="rounded-xl border border-gray-100 bg-white/70 shadow-xl backdrop-blur-md transition-all duration-300">
      {/* Card header defining the schedule and availability section */}
      <header className="bg-gradient-to-r from-emerald-500/80 to-emerald-700/70 text-white px-8 py-5 rounded-t-xl shadow backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <CalendarDays className="w-6 h-6 text-white" />
          <h2 className="text-lg font-semibold tracking-wide uppercase">
            Schedule & Availability
          </h2>
        </div>
      </header>

      <div className="p-8 grid gap-8">
        {/* Check-in and check-out time configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className={labelClass}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Check-in time
            </div>
            <input
              type="time"
              className={inputClass}
              {...register("checkInHour")}
            />
          </label>

          <label className={labelClass}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Check-out time
            </div>
            <input
              type="time"
              className={inputClass}
              {...register("checkOutHour")}
            />
          </label>
        </div>

        {/* Closed days management */}
        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <CircleX className="w-4 h-4 text-emerald-500" />
            Closed days
          </div>

          <div className="flex gap-2 flex-wrap">
            {closedDays.map((day, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-800 shadow-sm"
              >
                {day}
                <button
                  type="button"
                  className="text-gray-500 hover:text-red-500 transition"
                  onClick={() => {
                    const next = closedDays.filter((_, i) => i !== index);
                    setValue("closedDays", next, { shouldDirty: true });
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="date"
              id="closed-day-input"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById(
                  "closed-day-input"
                ) as HTMLInputElement;
                addClosedDay(input.value);
                input.value = "";
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-md border border-emerald-500 text-emerald-600 font-medium text-sm hover:bg-emerald-50 transition"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* High season date range configuration */}
        <div className="grid md:grid-cols-2 gap-6">
          <label className={labelClass}>
            <div className="flex items-center gap-2">
              <ChartSpline className="w-4 h-4 text-emerald-500" />
              High season start
            </div>
            <input
              type="date"
              className={inputClass}
              value={getValues("highSeason")?.from ?? ""}
              onChange={(e) =>
                setValue(
                  "highSeason",
                  {
                    from: e.target.value,
                    to: getValues("highSeason")?.to ?? "",
                  },
                  { shouldDirty: true }
                )
              }
            />
          </label>

          <label className={labelClass}>
            <div className="flex items-center gap-2">
              <ChartSpline className="w-4 h-4 text-emerald-500" />
              High season end
            </div>
            <input
              type="date"
              className={inputClass}
              value={getValues("highSeason")?.to ?? ""}
              onChange={(e) =>
                setValue(
                  "highSeason",
                  {
                    from: getValues("highSeason")?.from ?? "",
                    to: e.target.value,
                  },
                  { shouldDirty: true }
                )
              }
            />
          </label>
        </div>
      </div>
    </section>
  );
}
