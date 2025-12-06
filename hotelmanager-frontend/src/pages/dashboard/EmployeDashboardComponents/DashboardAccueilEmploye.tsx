import React, {
  useEffect,
  useState,
  useMemo,
  type CSSProperties,
} from "react";
import { Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

import { getIssuesForMyHotel, type Issue } from "../../../api/issueApi";
import { getMe, getUsersFromMyHotel } from "../../../api/userApi";
import type { User } from "../../../types/User";

import { getMyShifts, type Shift } from "../../../api/planningApi";
import { startOfWeek, addDays, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

type IssueStats = {
  open: number;
  resolved: number;
  important: number;
};

const DashboardAccueilEmploye: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // ---------- Signalements ----------
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);

  // ---------- Planning ----------
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);

  // 1) Charger les signalements de l'hôtel
  useEffect(() => {
    const loadIssues = async () => {
      setLoadingIssues(true);
      try {
        const { data } = await getIssuesForMyHotel();
        setIssues(data || []);
      } catch (e) {
        console.error("Erreur chargement issues :", e);
      } finally {
        setLoadingIssues(false);
      }
    };
    loadIssues();
  }, []);

  // 2) Charger l'utilisateur courant
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const meEmail = await getMe(); // /auth/me → string (email)
        const users = await getUsersFromMyHotel();
        const meUser = users.find((u) => u.email === meEmail) || null;
        setCurrentUser(meUser);
      } catch (e) {
        console.error("Erreur chargement utilisateur courant :", e);
      }
    };
    loadCurrentUser();
  }, []);

  // 3) Charger mon planning (semaine courante + prochaine)
  useEffect(() => {
    const loadMyShifts = async () => {
      setLoadingShifts(true);
      try {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });

        // On récupère 2 semaines d’un coup :
        // - pour calculer les heures de cette semaine
        // - et trouver le prochain shift même si c’est la semaine suivante
        const rangeStart = format(weekStart, "yyyy-MM-dd");
        const rangeEnd = format(addDays(weekStart, 13), "yyyy-MM-dd");

        const res = await getMyShifts(rangeStart, rangeEnd);
        setMyShifts(res.data || []);
      } catch (e) {
        console.error("Erreur chargement shifts employé :", e);
      } finally {
        setLoadingShifts(false);
      }
    };

    loadMyShifts();
  }, []);

  // ===================== SIGNALMENTS STATS =====================

  const ownStats: IssueStats = useMemo(() => {
    const mine: Issue[] =
      currentUser == null
        ? issues
        : issues.filter((i) => i.createdById === currentUser.id);

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

  // ===================== PLANNING KPIs =====================

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

      // overnight safety
      if (end <= start) end += 1440;

      totalMin += end - start;
    }

    // arrondi à 0.5h si tu veux une lecture plus propre
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
    if (!nextShift) return "Aucun shift à venir";

    const d = parseISO(nextShift.date);
    const dayName = format(d, "EEEE", { locale: fr }); // ex: mardi

    return `${dayName} ${nextShift.startTime} - ${nextShift.endTime}`;
  }, [nextShift]);

  // ===================== UI =====================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenue
          {currentUser ? `, ${currentUser.firstName} 👋` : " 👋"}
        </h1>
        <p className="text-gray-500">
          Voici votre résumé planning et signalements.
        </p>
      </div>

      {/*  Planning + Signalements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ================= PLANNING CARD ================= */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Mon planning
            </p>
            <Link
              to="/dashboard/employe/planning"
              className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
            >
              Voir
            </Link>
          </div>

          {loadingShifts ? (
            <div className="text-sm text-gray-500">
              Chargement de votre planning…
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 text-sm text-emerald-700">
                  <Clock className="w-4 h-4" />
                  Heures à travailler cette semaine
                </div>
                <div className="text-3xl font-bold text-gray-800 mt-1">
                  {hoursThisWeek}h
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(weekStartDate, "dd/MM")} -{" "}
                  {format(weekEndDate, "dd/MM")}
                </div>
              </div>

              
            </div>
          )}
        </div>

        {/* ================= SIGNALMENTS CARD ================= */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-emerald-500" />
              Mes signalements
            </p>
            <Link
              to="/dashboard/employe/issues"
              className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
            >
              Voir
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full" style={circleStyle} />
              <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-[10px] text-gray-500">Total</span>
                <span className="text-lg font-bold text-gray-800">
                  {total}
                </span>
              </div>
            </div>

            {/* Légende */}
            <div className="flex-1 space-y-1 text-xs sm:text-sm">
              {loadingIssues ? (
                <div className="text-xs text-gray-500">
                  Chargement de vos signalements…
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-gray-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Ouverts
                      </span>
                    </div>
                    <span className="font-medium text-gray-800">
                      {ownStats.open}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-gray-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        Résolus
                      </span>
                    </div>
                    <span className="font-medium text-gray-800">
                      {ownStats.resolved}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Importants</span>
                    <span className="font-medium text-gray-700">
                      {ownStats.important}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAccueilEmploye;
