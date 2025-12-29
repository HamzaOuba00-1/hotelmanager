import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { enUS } from "date-fns/locale";
import { getMyShifts, Shift } from "../api/planningApi";
import { useAuth } from "../../auth/context/authContext";
import type { User as AppUser } from "../../users/User";

/* Time grid constants */
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const COLUMN_WIDTH = 60;
const SHIFT_HEIGHT = 24;
const DAY_ROW_BASE_HEIGHT = 32;

/* Week navigation range */
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

  /* Splits overnight shifts into two calendar days */
  const splitOvernightShifts = (items: Shift[]): Shift[] => {
    const result: Shift[] = [];

    for (const shift of items) {
      const [startH, startM] = shift.startTime.split(":").map(Number);
      const [endH, endM] = shift.endTime.split(":").map(Number);

      const isOvernight =
        endH < startH || (endH === startH && endM < startM);

      if (!isOvernight) {
        result.push(shift);
      } else {
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

  /* Fetch shifts for the selected week */
  const loadMyShifts = async () => {
    const start = format(weekStart, "yyyy-MM-dd");
    const end = format(addDays(weekStart, 6), "yyyy-MM-dd");

    const res = await getMyShifts(start, end);
    setShifts(splitOvernightShifts(res.data));
  };

  useEffect(() => {
    loadMyShifts();
  }, [weekStart]);

  /* Generate selectable weeks around the current one */
  useEffect(() => {
    const center = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weeks: Date[] = [];

    for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
      weeks.push(addDays(center, i * 7));
    }

    setAvailableWeeks(weeks);
  }, []);

  /* Horizontal position in the grid based on time */
  const getLeft = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * COLUMN_WIDTH + (m / 60) * COLUMN_WIDTH;
  };

  /* Width of a shift block based on duration */
  const getWidth = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    let startMinutes = sh * 60 + sm;
    let endMinutes = eh * 60 + em;

    if (endMinutes <= startMinutes) endMinutes += 1440;

    return ((endMinutes - startMinutes) / 60) * COLUMN_WIDTH;
  };

  /* Filter shifts assigned to the current employee */
  const myShifts = useMemo(() => {
    if (!user?.id) return shifts;
    return shifts.filter((s) => s.employee?.id === user.id);
  }, [shifts, user?.id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  let accumulatedHeight = 0;
  const dayOffsets: number[] = [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center gap-2 mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-1">
          <CalendarDays className="h-8 w-8 text-emerald-600" />
          My Weekly Schedule
        </h1>

        <p className="text-sm text-gray-500">
          {user?.firstName} {user?.lastName}
        </p>

        <button
          onClick={() => {
            setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
            setToast("Current week loaded");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition mt-3"
        >
          <RefreshCcw className="w-4 h-4" />
          Today
        </button>
      </div>

      <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
        <button
          onClick={() => {
            const center = addDays(availableWeeks[0], -7);
            setWeekStart(center);

            const weeks: Date[] = [];
            for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
              weeks.push(addDays(center, i * 7));
            }
            setAvailableWeeks(weeks);
          }}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {availableWeeks.map((week, i) => {
          const active =
            format(weekStart, "yyyy-MM-dd") === format(week, "yyyy-MM-dd");

          return (
            <button
              key={i}
              onClick={() => setWeekStart(week)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                active
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {format(week, "dd/MM")} -{" "}
              {format(addDays(week, 6), "dd/MM")}
            </button>
          );
        })}

        <button
          onClick={() => {
            const center = addDays(
              availableWeeks[availableWeeks.length - 1],
              7
            );
            setWeekStart(center);

            const weeks: Date[] = [];
            for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
              weeks.push(addDays(center, i * 7));
            }
            setAvailableWeeks(weeks);
          }}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={gridRef}
        className="grid bg-white/50 border rounded-xl overflow-hidden text-sm relative mx-auto"
        style={{
          gridTemplateColumns: `150px repeat(24, ${COLUMN_WIDTH}px)`,
          width: 150 + 24 * COLUMN_WIDTH,
        }}
      >
        <div className="p-2 text-center font-semibold border">Day</div>
        {HOURS.map((h) => (
          <div key={h} className="p-1 text-center border">
            {h}:00
          </div>
        ))}

        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(weekStart, i);
          const dateStr = format(date, "yyyy-MM-dd");
          const label = format(date, "EEEE dd/MM", { locale: enUS });

          const dayShifts = myShifts.filter((s) => s.date === dateStr);
          const stacks: Shift[][] = [];

          const getRow = (shift: Shift) => {
            for (let r = 0; ; r++) {
              if (!stacks[r]) stacks[r] = [];
              if (
                !stacks[r].some(
                  (s) =>
                    !(
                      s.endTime <= shift.startTime ||
                      s.startTime >= shift.endTime
                    )
                )
              ) {
                stacks[r].push(shift);
                return r;
              }
            }
          };

          const rows = dayShifts.map(getRow);
          const rowHeight = SHIFT_HEIGHT * (Math.max(...rows, 0) + 1) + 16;

          dayOffsets.push(accumulatedHeight);
          accumulatedHeight += rowHeight;

          return (
            <React.Fragment key={i}>
              <div
                className="p-2 font-medium border bg-white/70"
                style={{ height: rowHeight }}
              >
                {label}
              </div>

              {HOURS.map((_, j) => (
                <div
                  key={j}
                  className="border bg-white/30"
                  style={{ height: rowHeight }}
                />
              ))}

              {dayShifts.map((shift, idx) => (
                <div
                  key={idx}
                  className="absolute bg-emerald-600 text-white text-xs rounded-lg px-2 py-0.5 shadow animate-fadeIn"
                  style={{
                    top:
                      dayOffsets[i] +
                      rows[idx] * (SHIFT_HEIGHT + 2) +
                      DAY_ROW_BASE_HEIGHT,
                    left: 150 + getLeft(shift.startTime),
                    width: getWidth(shift.startTime, shift.endTime),
                    height: SHIFT_HEIGHT,
                  }}
                >
                  {shift.startTime} - {shift.endTime}
                  {shift.service ? ` • ${shift.service}` : ""}
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 bg-emerald-600 text-white rounded-lg shadow animate-slideIn">
          {toast}
        </div>
      )}

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
