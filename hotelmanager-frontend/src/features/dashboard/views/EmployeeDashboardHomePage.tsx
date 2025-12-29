import React, { useEffect, useState, useMemo, type CSSProperties } from "react";
import { Calendar, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

import { getIssuesForMyHotel, type Issue } from "../../issues/api/issueApi";
import { getUsersFromMyHotel } from "../../users/api/userApi";
import type { User } from "../../users/User";

import { getMyShifts, type Shift } from "../../planning/api/planningApi";
import { startOfWeek, addDays, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

type IssueStats = {
  open: number;
  resolved: number;
  important: number;
};

/* ---------- Mini KPI (same component as manager) ---------- */
const MiniKpi: React.FC<{ label: string; value: number | string }> = ({
  label,
  value,
}) => (
  <div
    className="
      rounded-2xl 
      border border-white/50 
      bg-white/60 
      backdrop-blur-xl
      p-3 
      text-center 
      shadow-[0_6px_18px_rgba(0,0,0,0.06)]
      ring-1 ring-white/40
    "
  >
    <div className="text-[10px] tracking-wide text-gray-500">{label}</div>
    <div className="text-2xl font-semibold text-gray-900 mt-0.5">{value}</div>
  </div>
);

const DashboardAccueilEmploye: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  // ---------- Reports ----------
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);

  // ---------- Schedule ----------
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);

  useEffect(() => {
    const loadIssues = async () => {
      setLoadingIssues(true);
      try {
        const { data } = await getIssuesForMyHotel();
        setIssues(data || []);
      } catch (e) {
        console.error("Error loading issues:", e);
      } finally {
        setLoadingIssues(false);
      }
    };
    loadIssues();
  }, []);


  useEffect(() => {
    const loadCurrentUser = async () => {
      setUserLoading(true);
      try {
        const emailLs = localStorage.getItem("email");
        const users = await getUsersFromMyHotel();

        const meUser =
          (emailLs ? users.find((u) => u.email === emailLs) : null) ??
          users.find((u) => u.role === "EMPLOYE") ??
          users[0] ??
          null;

        setCurrentUser(meUser);
      } catch (e) {
        console.error("Error loading current user:", e);
        setCurrentUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    const loadMyShifts = async () => {
      setLoadingShifts(true);
      try {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });

        const rangeStart = format(weekStart, "yyyy-MM-dd");
        const rangeEnd = format(addDays(weekStart, 13), "yyyy-MM-dd");

        const res = await getMyShifts(rangeStart, rangeEnd);
        setMyShifts(res.data || []);
      } catch (e) {
        console.error("Error loading employee shifts:", e);
      } finally {
        setLoadingShifts(false);
      }
    };

    loadMyShifts();
  }, []);

  // ===================== REPORTS STATS =====================

  const ownStats: IssueStats = useMemo(() => {
    if (!currentUser || !currentUser.id) {
      const open = issues.filter((i) => i.status === "OPEN").length;
      const resolved = issues.filter((i) => i.status === "RESOLVED").length;
      const important = issues.filter((i) => i.important).length;
      return { open, resolved, important };
    }

    const mine = issues.filter((i) => i.createdById === currentUser.id);

    const open = mine.filter((i) => i.status === "OPEN").length;
    const resolved = mine.filter((i) => i.status === "RESOLVED").length;
    const important = mine.filter((i) => i.important).length;

    return { open, resolved, important };
  }, [issues, currentUser]);

  const { total, openDeg, resolvedDegEnd } = useMemo(() => {
    const totalCount = ownStats.open + ownStats.resolved;
    if (totalCount === 0) {
      return { total: 0, openDeg: 0, resolvedDegEnd: 0 };
    }

    const openPct = (ownStats.open / totalCount) * 100;
    const resolvedPct = (ownStats.resolved / totalCount) * 100;

    const openDegLocal = (openPct * 360) / 100;
    const resolvedDegEndLocal = ((openPct + resolvedPct) * 360) / 100;

    return {
      total: totalCount,
      openDeg: openDegLocal,
      resolvedDegEnd: resolvedDegEndLocal,
    };
  }, [ownStats]);

  const circleStyle: CSSProperties =
    total === 0
      ? {
          backgroundImage: "conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)",
        }
      : {
          backgroundImage: `conic-gradient(
            #f97316 0deg,
            #f97316 ${openDeg}deg,
            #22c55e ${openDeg}deg,
            #22c55e ${resolvedDegEnd}deg,
            #e5e7eb ${resolvedDegEnd}deg,
            #e5e7eb 360deg
          )`,
        };

  // ===================== SCHEDULE KPIs =====================

  const parseTimeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  const { weekStartDate, weekEndDate } = useMemo(() => {
    const today = new Date();
    const ws = startOfWeek(today, { weekStartsOn: 1 });
    const we = addDays(ws, 6);
    return { weekStartDate: ws, weekEndDate: we };
  }, []);

  const weeklyShifts = useMemo(() => {
    return myShifts.filter((s) => {
      const d = parseISO(s.date);
      return d >= weekStartDate && d <= weekEndDate;
    });
  }, [myShifts, weekStartDate, weekEndDate]);

  const hoursThisWeek = useMemo(() => {
    let totalMin = 0;

    for (const s of weeklyShifts) {
      const start = parseTimeToMinutes(s.startTime);
      let end = parseTimeToMinutes(s.endTime);
      if (end <= start) end += 1440;
      totalMin += end - start;
    }

    const hours = totalMin / 60;
    return Math.round(hours * 2) / 2;
  }, [weeklyShifts]);

  const nextShift = useMemo(() => {
    const now = new Date();

    const withStartDate = myShifts
      .map((s) => ({
        shift: s,
        start: new Date(`${s.date}T${s.startTime}`),
      }))
      .filter((x) => !isNaN(x.start.getTime()));

    withStartDate.sort((a, b) => a.start.getTime() - b.start.getTime());

    return withStartDate.find((x) => x.start >= now)?.shift ?? null;
  }, [myShifts]);

  const nextShiftLabel = useMemo(() => {
    if (!nextShift) return "No upcoming shift";

    const d = parseISO(nextShift.date);
    const dayName = format(d, "EEEE", { locale: fr });

    return `${dayName} ${nextShift.startTime} - ${nextShift.endTime}`;
  }, [nextShift]);

  // ===================== UI =====================

  return (
    <div className="space-y-6">
      {/* ✅ Header aligned with the manager’s style */}
      <div>
        <div className="text-lg font-bold text-gray-800">
          Welcome to the Dashboard
          {userLoading
            ? ""
            : currentUser?.firstName
            ? ` – ${currentUser.firstName}`
            : ""}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Here is your schedule and reports summary.
        </div>
      </div>

      {/* Schedule + Reports */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ================= SCHEDULE CARD ================= */}
          <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-6">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  My schedule
                </p>
                <Link
                  to="/dashboard/employe/planning"
                  className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
                >
                  View
                </Link>
              </div>

              {loadingShifts ? (
                <div className="text-xs text-gray-500">
                  Loading your schedule…
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <MiniKpi
                      label="Weekly hours"
                      value={`${hoursThisWeek}h`}
                    />
                    <MiniKpi
                      label="Weekly shifts"
                      value={weeklyShifts.length}
                    />
                    <MiniKpi
                      label="Period"
                      value={`${format(weekStartDate, "dd/MM")}-${format(
                        weekEndDate,
                        "dd/MM"
                      )}`}
                    />
                  </div>

                  {nextShift && (
                    <div className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 ring-1 ring-white/40">
                      <div className="text-[10px] tracking-wide text-gray-500">
                        Next shift
                      </div>
                      <div className="text-sm font-medium text-gray-900 mt-1">
                        {nextShiftLabel}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ================= REPORTS CARD ================= */}
          <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-6">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-emerald-600" />
                  My reports
                </p>
                <Link
                  to="/dashboard/employe/issues"
                  className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
                >
                  View
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full" style={circleStyle} />
                  <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-500">Total</span>
                    <span className="text-xl font-bold text-gray-800">
                      {total}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-1 text-sm">
                  {loadingIssues ? (
                    <div className="text-xs text-gray-500">Loading…</div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Open</span>
                        <span className="font-medium text-gray-800">
                          {ownStats.open}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Resolved</span>
                        <span className="font-medium text-gray-800">
                          {ownStats.resolved}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                        <span>Important</span>
                        <span className="font-medium text-gray-700">
                          {ownStats.important}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!loadingIssues && total === 0 && (
                <div className="mt-3 text-[11px] text-gray-500">
                  No reports created yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardAccueilEmploye;
