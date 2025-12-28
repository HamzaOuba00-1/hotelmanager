import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { getMyShifts, Shift } from "../api/planningApi";
import { useAuth } from "../../auth/context/authContext";
import type { User as AppUser } from "../../users/User";

const hours = Array.from({ length: 24 }, (_, i) => i);
const COLUMN_WIDTH = 60;
const SHIFT_HEIGHT = 24;
const DAY_ROW_BASE_HEIGHT = 32;
const WEEKS_BEFORE = 3;
const WEEKS_AFTER = 3;

export default function EmployeePlanningPage() {
  const { user } = useAuth() as { user: AppUser | null };
  const gridRef = useRef<HTMLDivElement>(null);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [availableWeeks, setAvailableWeeks] = useState<Date[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const splitOvernightShifts = (shifts: Shift[]) => {
    const result: Shift[] = [];
    for (const shift of shifts) {
      const [startH, startM] = shift.startTime.split(":").map(Number);
      const [endH, endM] = shift.endTime.split(":").map(Number);
      const overnight = endH < startH || (endH === startH && endM < startM);

      if (!overnight) result.push(shift);
      else {
        result.push({ ...shift, endTime: "23:59" });

        const nextDate = new Date(shift.date);
        nextDate.setDate(nextDate.getDate() + 1);

        result.push({
          ...shift,
          date: nextDate.toISOString().split("T")[0],
          startTime: "00:00",
        });
      }
    }
    return result;
  };

  const loadMyShifts = async () => {
    const start = format(weekStart, "yyyy-MM-dd");
    const end = format(addDays(weekStart, 6), "yyyy-MM-dd");
    const res = await getMyShifts(start, end);
    setShifts(splitOvernightShifts(res.data));
  };

  useEffect(() => {
    loadMyShifts();
  }, [weekStart]);

  useEffect(() => {
    const center = startOfWeek(new Date(), { weekStartsOn: 1 });
    const newWeeks: Date[] = [];
    for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
      newWeeks.push(addDays(center, i * 7));
    }
    setAvailableWeeks(newWeeks);
  }, []);

  const getLeft = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * COLUMN_WIDTH + (m / 60) * COLUMN_WIDTH;
  };

  const getWidth = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    let startMinutes = sh * 60 + sm;
    let endMinutes = eh * 60 + em;
    if (endMinutes <= startMinutes) endMinutes += 1440;

    const duration = endMinutes - startMinutes;
    return (duration / 60) * COLUMN_WIDTH;
  };

  const dayHeights: number[] = [];
  let accumulatedHeight = 0;

  const myShifts = useMemo(() => {
    if (!user?.id) return shifts;
    return shifts.filter((s) => s.employee?.id === user.id);
  }, [shifts, user?.id]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <div className="container mx-auto p-6">
      {/* ✅ Header EXACTEMENT comme ConfigHotel */}
      <div className="flex flex-col items-center gap-2 mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-1">
          <CalendarDays className="h-8 w-8 text-emerald-600" />
          Mon planning hebdomadaire
        </h1>

        <p className="text-sm text-gray-500 max-w-2xl">
          {user?.firstName ?? ""} {user?.lastName ?? ""}
        </p>

        <button
          onClick={() => {
            const today = startOfWeek(new Date(), { weekStartsOn: 1 });
            setWeekStart(today);
            setToast("Semaine actuelle ✅");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition mt-3"
        >
          <RefreshCcw className="w-4 h-4" />
          Aujourd’hui
        </button>
      </div>

      {/* ✅ Navigation par semaines */}
      <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
        <button
          onClick={() => {
            const newCenter = addDays(availableWeeks[0], -7);
            setWeekStart(newCenter);
            const newWeeks: Date[] = [];
            for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
              newWeeks.push(addDays(newCenter, i * 7));
            }
            setAvailableWeeks(newWeeks);
          }}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {availableWeeks.map((week, idx) => {
          const start = format(week, "dd/MM");
          const end = format(addDays(week, 6), "dd/MM");
          const isActive =
            format(weekStart, "yyyy-MM-dd") === format(week, "yyyy-MM-dd");

          return (
            <button
              key={idx}
              onClick={() => setWeekStart(week)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {start} - {end}
            </button>
          );
        })}

        <button
          onClick={() => {
            const newCenter = addDays(
              availableWeeks[availableWeeks.length - 1],
              7
            );
            setWeekStart(newCenter);
            const newWeeks: Date[] = [];
            for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
              newWeeks.push(addDays(newCenter, i * 7));
            }
            setAvailableWeeks(newWeeks);
          }}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* ✅ Grille planning */}
      <div
        ref={gridRef}
        className="grid bg-white/50 backdrop-blur-md border rounded-xl overflow-hidden text-sm relative mx-auto"
        style={{
          gridTemplateColumns: `150px repeat(24, ${COLUMN_WIDTH}px)`,
          minHeight: accumulatedHeight + DAY_ROW_BASE_HEIGHT,
          width: 150 + 24 * COLUMN_WIDTH,
        }}
      >
        <div className="p-2 text-center font-semibold border">Jour</div>
        {hours.map((h) => (
          <div
            key={h}
            className="p-1 text-center border"
            style={{ width: COLUMN_WIDTH }}
          >
            {h}h
          </div>
        ))}

        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(weekStart, i);
          const dateStr = format(date, "yyyy-MM-dd");
          const label = format(date, "EEEE dd/MM", { locale: fr });
          const dayShifts = myShifts.filter((s) => s.date === dateStr);
          const placed: Shift[][] = [];

          const getStack = (shift: Shift) => {
            for (let r = 0; ; r++) {
              if (!placed[r]) placed[r] = [];
              if (
                !placed[r].some(
                  (s) =>
                    !(
                      s.endTime <= shift.startTime ||
                      s.startTime >= shift.endTime
                    )
                )
              ) {
                placed[r].push(shift);
                return r;
              }
            }
          };

          const indexes = dayShifts.map(getStack);
          const maxStack = Math.max(...indexes, 0);
          const rowHeight = SHIFT_HEIGHT * (maxStack + 1) + 16;

          dayHeights.push(accumulatedHeight);
          accumulatedHeight += rowHeight;

          return (
            <React.Fragment key={i}>
              <div
                className="p-2 font-medium border bg-white/70"
                style={{ height: rowHeight }}
              >
                {label}
              </div>

              {hours.map((_, j) => (
                <div
                  key={j}
                  className="border border-gray-200 bg-white/30 backdrop-blur-sm"
                  style={{ height: rowHeight, width: COLUMN_WIDTH }}
                />
              ))}

              {dayShifts.map((shift, index) => {
                const left = getLeft(shift.startTime);
                const width = getWidth(shift.startTime, shift.endTime);
                const top = indexes[index] * (SHIFT_HEIGHT + 2);

                return (
                  <div
                    key={index}
                    className="absolute text-white text-xs font-medium rounded-lg px-2 py-0.5 truncate shadow-md bg-emerald-600 animate-fadeIn"
                    style={{
                      top: dayHeights[i] + top + DAY_ROW_BASE_HEIGHT,
                      left: 150 + left,
                      width,
                      height: SHIFT_HEIGHT,
                      zIndex: 10,
                    }}
                    title={`${shift.startTime} - ${shift.endTime}${
                      shift.service ? ` • ${shift.service}` : ""
                    }`}
                  >
                    {shift.startTime} - {shift.endTime}
                    {shift.service ? ` • ${shift.service}` : ""}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      {/* ✅ Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-lg bg-emerald-600 text-white shadow-xl animate-slideIn z-50">
          {toast}
        </div>
      )}

      {/* ✅ Animations communes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}
