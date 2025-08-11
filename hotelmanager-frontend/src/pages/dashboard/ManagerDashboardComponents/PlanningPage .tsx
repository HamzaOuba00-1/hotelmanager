/* eslint-disable no-restricted-globals */
import React, { useEffect, useState, useRef } from "react";
import { Trash, CalendarDays, Plus, ChevronLeft, ChevronRight, RefreshCcw, RotateCcw, ClipboardCopy, BicepsFlexed } from "lucide-react";
import { exportElementToPDF } from "../../../utils/exportPdf";
import ExportPdfButton from "./planningComponents/ExportPdfButton";
import { format, startOfWeek, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import TodayTeamSection from "./TodayTeamSection";
import {
  getShiftsForHotel,
  createShift,
  Shift,
} from "../../../api/planningApi";
import { getUsersFromMyHotel } from "../../../api/userApi";
import { User } from "../../../types/User";
import { deleteShift } from "../../../api/planningApi"; // déjà bien exposée

const hours = Array.from({ length: 24 }, (_, i) => i);
const colors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-rose-500",
  "bg-rose-500",
  "bg-lime-500",
  "bg-cyan-500",
  "bg-amber-500",
];

const COLUMN_WIDTH = 60;
const SHIFT_HEIGHT = 24;
const DAY_ROW_BASE_HEIGHT = 32;
const WEEKS_BEFORE = 3;
const WEEKS_AFTER = 3;

export default function PlanningPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [confirmCopyOpen, setConfirmCopyOpen] = useState(false);
  const [confirmRefreshOpen, setConfirmRefreshOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [availableWeeks, setAvailableWeeks] = useState<Date[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    employeeId: "",
    date: "",
    startTime: "",
    endTime: "",
    service: "",
  });

  const loadShifts = async () => {
    const start = format(weekStart, "yyyy-MM-dd");
    const end = format(addDays(weekStart, 6), "yyyy-MM-dd");
    const res = await getShiftsForHotel(start, end);
    setShifts(splitOvernightShifts(res.data));
  };
  

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

  useEffect(() => {
    loadShifts();
  }, [weekStart]);
  useEffect(() => {
    getUsersFromMyHotel().then(setUsers).catch(console.error);
  }, []);
  useEffect(() => {
    generateWeeksAround(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }, []);

  const generateWeeksAround = (center: Date) => {
    const newWeeks = [];
    for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
      newWeeks.push(addDays(center, i * 7));
    }
    setAvailableWeeks(newWeeks);
  };

  const uniqueEmployees = Array.from(new Set(shifts.map((s) => s.employee.id)));
  const getColorForEmployee = (id: number) =>
    colors[uniqueEmployees.indexOf(id) % colors.length];

  const getLeft = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * COLUMN_WIDTH + (m / 60) * COLUMN_WIDTH;
  };

  const getWidth = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    let startMinutes = sh * 60 + sm;
    let endMinutes = eh * 60 + em;
    if (endMinutes <= startMinutes) endMinutes += 1440; // overnight shift

    const duration = endMinutes - startMinutes;
    return (duration / 60) * COLUMN_WIDTH;
  };

  const dayHeights: number[] = [];
  let accumulatedHeight = 0;

  return (
    <div className="p-6 text-center">
      <div className="flex flex-col items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <CalendarDays className="h-8 w-8 text-emerald-600" /> Planning
          hebdomadaire
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all mb-8"
        >
          <Plus className="w-4 h-4" /> Ajouter un shift
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => {
              const today = startOfWeek(new Date(), { weekStartsOn: 1 });
              setWeekStart(today);
              generateWeeksAround(today);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
          >
            <RefreshCcw className="w-4 h-4" />
            Aujourd’hui
          </button>
        </div>
      </div>

      {/* ✅ Navigation par semaines */}
      <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
        <button
          onClick={() => {
            const newCenter = addDays(availableWeeks[0], -7);
            generateWeeksAround(newCenter);
            setWeekStart(newCenter);
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
            generateWeeksAround(newCenter);
            setWeekStart(newCenter);
          }}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex justify-center items-center gap-4 mt-4 mb-8">
        <button
          onClick={() => setConfirmCopyOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-emerald-800 rounded-xl hover:bg-green-200 hover:text-emerald-900 transition font-medium"
        >
          <ClipboardCopy className="w-4 h-4" />
          Copier semaine précédente
        </button>

        <button
          onClick={() => setConfirmRefreshOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 hover:text-red-900 transition font-medium"
        >
          <RefreshCcw className="w-4 h-4" />
          Rafraîchir la semaine
        </button>
        <ExportPdfButton
          targetRef={gridRef}
          fileName={`Planning_${format(weekStart, "yyyy-MM-dd")}_${format(addDays(weekStart, 6), "yyyy-MM-dd")}.pdf`}
          headerText={`Planning : ${format(weekStart, "dd/MM/yyyy")} - ${format(addDays(weekStart, 6), "dd/MM/yyyy")}`}
        />
      </div>

      <div
        ref={gridRef}
        className="export-pdf-scope grid bg-white/50 backdrop-blur-md border rounded-xl overflow-hidden text-sm relative"
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
          const dayShifts = shifts.filter((s) => s.date === dateStr);
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
                const color = getColorForEmployee(shift.employee.id);

                return (
                  <div
                    key={index}
                    className={`absolute text-white text-xs font-medium rounded-lg px-2 py-0.5 truncate shadow-md animate-fadeIn ${color}`}
                    style={{
                      top: dayHeights[i] + top + DAY_ROW_BASE_HEIGHT,
                      left: 150 + left,
                      width,
                      height: SHIFT_HEIGHT,
                      zIndex: 10,
                    }}
                  >
                    <div className="flex items-center gap-x-2 w-full">
                      <button
                        onClick={() => setShiftToDelete(shift)}
                        className="flex-shrink-0 hover:opacity-80"
                        title="Supprimer"
                      >
                        <Trash className="w-3.5 h-3.5 text-white" />
                      </button>
                      <span className="whitespace-nowrap overflow-visible">
                        {shift.employee.firstName} {shift.employee.lastName} -{" "}
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>

                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      {/* ✅ Modal ajout shift */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/60 rounded-2xl shadow-xl p-8 w-full max-w-md animate-fadeIn">
            <div className="flex items-center justify-center gap-2 mb-6">
              <BicepsFlexed className="h-8 w-8 text-[#47B881]" />
              <h2 className="text-xl font-bold text-gray-800">Ajouter un Shift</h2>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const employee = users.find(
                  (u) => u.id === parseInt(form.employeeId)
                );
                if (!employee) return;
                await createShift({
                  employee,
                  date: form.date,
                  startTime: form.startTime,
                  endTime: form.endTime,
                  service: form.service,
                });
                setToast("Shift ajouté ✅");
                setIsModalOpen(false);
                setForm({
                  employeeId: "",
                  date: "",
                  startTime: "",
                  endTime: "",
                  service: "",
                });
                loadShifts();
              }}
              className="space-y-4"
            >
              <label className="block text-sm font-medium">
                Employé
                <select
                  required
                  value={form.employeeId}
                  onChange={(e) =>
                    setForm({ ...form, employeeId: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded-xl mt-1"
                >
                  <option value="">Sélectionner un employé</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Date
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded-xl mt-1"
                />
              </label>
              <div className="flex gap-2">
                <label className="block text-sm font-medium w-full">
                  Début
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    className="w-full border border-gray-300 p-2 rounded-xl mt-1"
                  />
                </label>
                <label className="block text-sm font-medium w-full">
                  Fin
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    className="w-full border border-gray-300 p-2 rounded-xl mt-1"
                  />
                </label>
              </div>
              <label className="block text-sm font-medium">
                Service (optionnel)
                <input
                  type="text"
                  value={form.service}
                  onChange={(e) =>
                    setForm({ ...form, service: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded-xl mt-1"
                />
              </label>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmRefreshOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm animate-fadeIn text-left">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Supprimer tous les shifts de cette semaine ?
            </h2>
            <p className="text-gray-700 mb-6">
              Cette action est irréversible. Elle va supprimer tous les shifts
              planifiés entre <strong>{format(weekStart, "dd/MM/yyyy")}</strong>{" "}
              et <strong>{format(addDays(weekStart, 6), "dd/MM/yyyy")}</strong>.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmRefreshOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  const weekStartStr = format(weekStart, "yyyy-MM-dd");
                  const weekEndStr = format(
                    addDays(weekStart, 6),
                    "yyyy-MM-dd"
                  );
                  const res = await getShiftsForHotel(weekStartStr, weekEndStr);

                  for (const shift of res.data) {
                    await deleteShift(shift.id!);
                  }

                  setToast("Semaine supprimée ❌");
                  setConfirmRefreshOpen(false);
                  loadShifts();
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-lg bg-emerald-600 text-white shadow-xl animate-slideIn z-50">
          {toast}
        </div>
      )}

      {confirmCopyOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm animate-fadeIn text-left">
            <h2 className="text-xl font-bold text-emerald-600 mb-4">
              Copier la semaine précédente ?
            </h2>
            <p className="text-gray-700 mb-6">
              Cette action va dupliquer tous les shifts de la semaine passée
              vers celle-ci.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmCopyOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  const previousStart = addDays(weekStart, -7);
                  const previousEnd = addDays(weekStart, -1);
                  const res = await getShiftsForHotel(
                    format(previousStart, "yyyy-MM-dd"),
                    format(previousEnd, "yyyy-MM-dd")
                  );

                  const copiedShifts = res.data.map((shift) => {
                    const newDate = addDays(new Date(shift.date), 7);
                    return {
                      employee: { id: shift.employee.id },
                      date: format(newDate, "yyyy-MM-dd"),
                      startTime: shift.startTime,
                      endTime: shift.endTime,
                      service: shift.service,
                    };
                  });

                  for (const newShift of copiedShifts) {
                    await createShift(newShift);
                  }

                  setToast("Semaine copiée avec succès ✅");
                  setConfirmCopyOpen(false);
                  loadShifts();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal de confirmation suppression */}
      {shiftToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm animate-fadeIn text-left">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Supprimer ce shift ?
            </h2>
            <p className="text-gray-700 mb-6">
              {shiftToDelete.employee.firstName}{" "}
              {shiftToDelete.employee.lastName} – {shiftToDelete.date} •{" "}
              {shiftToDelete.startTime} - {shiftToDelete.endTime}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShiftToDelete(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  await deleteShift(shiftToDelete.id!);
                  setToast("Shift supprimé 🗑️");
                  setShiftToDelete(null);
                  loadShifts();
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      <TodayTeamSection />
    </div>
  );
}

// 🌟 Animations
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slideIn {
  animation: slideIn 0.4s ease-out;
}
`;
document.head.appendChild(style);