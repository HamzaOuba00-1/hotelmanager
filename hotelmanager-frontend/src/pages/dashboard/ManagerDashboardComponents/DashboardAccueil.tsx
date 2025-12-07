// src/pages/dashboard/manager/DashboardAccueil.tsx

import { useEffect, useState, useMemo, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

import { getMyHotel } from "../../../api/hotelApi";
import { getIssuesForMyHotel, type Issue } from "../../../api/issueApi";
import { listRooms, type RoomLite } from "../../../api/roomsApi";
import { listReservations, type Reservation } from "../../../api/reservationsApi";

import { getUsersFromMyHotel } from "../../../api/userApi";
import type { User } from "../../../types/User";

import {
  AlertTriangle,
  CheckCircle,
  CalendarCheck2,
  BedDouble,
  User2,
  Building2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { parseISO, isSameDay } from "date-fns";

type IssueStats = {
  open: number;
  resolved: number;
  important: number;
};

// ⚠️ RoomLite peut ne pas exposer roomState
type RoomWithState = RoomLite & { roomState?: string };

const ROLE_LABEL: Record<string, string> = {
  MANAGER: "Manager",
  EMPLOYE: "Employé",
  CLIENT: "Client",
};

function getInitials(first?: string, last?: string) {
  const f = (first ?? "").trim();
  const l = (last ?? "").trim();
  const a = f ? f[0].toUpperCase() : "";
  const b = l ? l[0].toUpperCase() : "";
  const res = `${a}${b}`.trim();
  return res || "U";
}

/* ---------- Mini KPI (soft luxe) ---------- */
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

export default function DashboardAccueil() {
  const [hotel, setHotel] = useState<any>(null);

  // ------------------ CURRENT USER ------------------
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);

  // ------------------ ISSUES ------------------
  const [issueStats, setIssueStats] = useState<IssueStats>({
    open: 0,
    resolved: 0,
    important: 0,
  });
  const [issuesLoading, setIssuesLoading] = useState(false);

  // ------------------ RESERVATIONS ------------------
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resLoading, setResLoading] = useState(false);

  // ------------------ ROOMS ------------------
  const [rooms, setRooms] = useState<RoomWithState[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const navigate = useNavigate();

  // ========================== HOTEL ==========================
  useEffect(() => {
    getMyHotel()
      .then(setHotel)
      .catch((e) => console.error("Erreur getMyHotel :", e));
  }, []);

  // ========================== CURRENT USER (SAME AS Utilisateurs) ==========================
  useEffect(() => {
    const loadCurrentUser = async () => {
      setUserLoading(true);
      try {
        const emailLs = localStorage.getItem("email");

        const users = await getUsersFromMyHotel();

        // ✅ même logique que PlaceholderUtilisateurs
        const meUser =
          (emailLs ? users.find((u) => u.email === emailLs) : null) ??
          // fallback intelligent si jamais email absent
          users.find((u) => u.role === "MANAGER") ??
          users[0] ??
          null;

        setCurrentUser(meUser);
      } catch (e) {
        console.error("Erreur chargement utilisateur courant :", e);
        setCurrentUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  // ========================== ISSUES ==========================
  useEffect(() => {
    const loadIssues = async () => {
      setIssuesLoading(true);
      try {
        const { data } = await getIssuesForMyHotel();
        const issues: Issue[] = data || [];

        const open = issues.filter((i) => i.status === "OPEN").length;
        const resolved = issues.filter((i) => i.status === "RESOLVED").length;
        const important = issues.filter((i) => i.important).length;

        setIssueStats({ open, resolved, important });
      } catch (e) {
        console.error("Erreur chargement issues :", e);
      } finally {
        setIssuesLoading(false);
      }
    };

    loadIssues();
  }, []);

  // ========================== RESERVATIONS ==========================
  useEffect(() => {
    const loadReservations = async () => {
      setResLoading(true);
      try {
        const data = await listReservations();
        setReservations(data || []);
      } catch (e) {
        console.error("Erreur chargement réservations :", e);
      } finally {
        setResLoading(false);
      }
    };

    loadReservations();
  }, []);

  // ========================== ROOMS ==========================
  useEffect(() => {
    const loadRooms = async () => {
      setRoomsLoading(true);
      try {
        const data = await listRooms();
        setRooms((data || []) as RoomWithState[]);
      } catch (e) {
        console.error("Erreur chargement rooms :", e);
      } finally {
        setRoomsLoading(false);
      }
    };

    loadRooms();
  }, []);

  const needsConfig = !hotel || !hotel.address || !hotel.checkInHour;

  // ========================== DONUT ISSUES ==========================
  const { total, openDeg, resolvedDegEnd } = useMemo(() => {
    const totalCount = issueStats.open + issueStats.resolved;
    if (totalCount === 0) return { total: 0, openDeg: 0, resolvedDegEnd: 0 };

    const openPct = (issueStats.open / totalCount) * 100;
    const resolvedPct = (issueStats.resolved / totalCount) * 100;

    const openDegLocal = (openPct * 360) / 100;
    const resolvedDegEndLocal = ((openPct + resolvedPct) * 360) / 100;

    return {
      total: totalCount,
      openDeg: openDegLocal,
      resolvedDegEnd: resolvedDegEndLocal,
    };
  }, [issueStats]);

  const circleStyle: CSSProperties =
    total === 0
      ? { backgroundImage: "conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)" }
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

  // ========================== KPI ROOMS ==========================
  const roomKpis = useMemo(() => {
    const count = (state: string) =>
      rooms.filter((r) => r.roomState === state).length;

    const totalRooms = rooms.length;

    const libre = count("LIBRE");
    const reservee = count("RESERVEE");
    const checkin = count("CHECKIN");
    const roomService = count("ROOM_SERVICE");
    const aNettoyer = count("A_NETTOYER");
    const maintenance = count("MAINTENANCE");

    const occupied = checkin + roomService;

    return {
      total: totalRooms,
      libre,
      reservee,
      occupied,
      aNettoyer,
      maintenance,
    };
  }, [rooms]);

  // ========================== KPI RESERVATIONS DU JOUR ==========================
  const reservationKpis = useMemo(() => {
    const today = new Date();

    const arr = reservations.filter((r) =>
      isSameDay(parseISO(r.startAt), today)
    ).length;

    const dep = reservations.filter((r) =>
      isSameDay(parseISO(r.endAt), today)
    ).length;

    const inH = roomKpis.occupied;

    return { arr, dep, inH };
  }, [reservations, roomKpis.occupied]);

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-lg font-medium">
        Bienvenue sur le Dashboard
        {hotel?.name ? ` – ${hotel.name}` : ""}
      </div>

      {/* Alerte config */}
      {needsConfig && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
          <div className="font-semibold text-amber-800">
            Configuration requise
          </div>
          <p className="text-amber-700 text-sm mt-1">
            Pour activer toutes les fonctionnalités, veuillez compléter la
            configuration de votre hôtel.
          </p>
          <button
            onClick={() => navigate("/dashboard/manager/configuration")}
            className="mt-3 inline-flex items-center rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
          >
            Ouvrir la configuration
          </button>
        </div>
      )}

      {/* ✅ Layout premium + équilibré */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ------------------ PROFIL USER (2/3) ------------------ */}
          <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-6 lg:col-span-2">
            <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-emerald-100/40 blur-2xl" />
            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-amber-100/40 blur-2xl" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Profil utilisateur
                </div>

                <span className="text-[10px] px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50/70 text-emerald-700 font-medium">
                  {ROLE_LABEL[currentUser?.role ?? "MANAGER"] ??
                    String(currentUser?.role ?? "Manager")}
                </span>
              </div>

              {userLoading ? (
                <div className="mt-4 text-xs text-gray-500">
                  Chargement du profil…
                </div>
              ) : (
                <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-5">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg grid place-items-center text-white text-2xl font-bold">
                      {getInitials(currentUser?.firstName, currentUser?.lastName)}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-white border shadow-sm grid place-items-center">
                      <User2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>

                  {/* Nom + prénom */}
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">
                      Utilisateur connecté
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 tracking-tight">
                      {currentUser
                        ? `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim() || "—"
                        : "—"}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border bg-white/60">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {ROLE_LABEL[currentUser?.role ?? "MANAGER"] ??
                          String(currentUser?.role ?? "Manager")}
                      </span>

                      <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border bg-white/60">
                        <Building2 className="w-3 h-3 text-emerald-600" />
                        {hotel?.name || "Hôtel"}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-[10px] text-gray-500">Vue rapide</div>
                    <div className="mt-1 text-sm font-medium text-gray-800">
                      Dashboard manager
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Accès & supervision
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ------------------ RÉSERVATIONS (1/3) ------------------ */}
          <div className="rounded-3xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                Réservations du jour
              </h2>
              <button
                onClick={() => navigate("/dashboard/manager/reservations")}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
              >
                Voir
              </button>
            </div>

            {resLoading ? (
              <div className="text-xs text-gray-500">
                Chargement des réservations…
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <MiniKpi label="Arrivées" value={reservationKpis.arr} />
                <MiniKpi label="Départs" value={reservationKpis.dep} />
                <MiniKpi label="En séjour" value={reservationKpis.inH} />
              </div>
            )}

            <div className="mt-3 text-[11px] text-gray-500">
              “En séjour” = chambres occupées.
            </div>
          </div>

          {/* ------------------ LIGNE 2 : 3 cartes ------------------ */}

          {/* ISSUES */}
          <div className="rounded-3xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-emerald-600" />
                Signalements
              </h2>
              <button
                onClick={() => navigate("/dashboard/manager/issues")}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
              >
                Voir
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full" style={circleStyle} />
                <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-xl font-bold text-gray-800">
                    {total}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-1 text-sm">
                {issuesLoading ? (
                  <div className="text-xs text-gray-500">Chargement…</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Ouverts</span>
                      <span className="font-medium text-gray-800">
                        {issueStats.open}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Résolus</span>
                      <span className="font-medium text-gray-800">
                        {issueStats.resolved}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <span>Importants</span>
                      <span className="font-medium text-gray-700">
                        {issueStats.important}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CHAMBRES — GLOBAL (3 KPIs) */}
          <div className="rounded-3xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-emerald-600" />
                Chambres — Global
              </h2>
              <button
                onClick={() => navigate("/dashboard/manager/rooms")}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
              >
                Voir
              </button>
            </div>

            {roomsLoading ? (
              <div className="text-xs text-gray-500">Chargement…</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <MiniKpi label="Total" value={roomKpis.total} />
                <MiniKpi label="Occupées" value={roomKpis.occupied} />
                <MiniKpi label="Libres" value={roomKpis.libre} />
              </div>
            )}

            <div className="mt-3 text-[11px] text-gray-500">
              Indicateurs principaux.
            </div>
          </div>

          {/* ÉTATS CHAMBRES (3 KPIs) */}
          <div className="rounded-3xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-emerald-600" />
                États des chambres
              </h2>
              <button
                onClick={() => navigate("/dashboard/manager/rooms")}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
              >
                Voir
              </button>
            </div>

            {roomsLoading ? (
              <div className="text-xs text-gray-500">Chargement…</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <MiniKpi label="Réservées" value={roomKpis.reservee} />
                <MiniKpi label="À nettoyer" value={roomKpis.aNettoyer} />
                <MiniKpi label="Maintenance" value={roomKpis.maintenance} />
              </div>
            )}

            <div className="mt-3 text-[11px] text-gray-500">
              Vue opérationnelle.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
