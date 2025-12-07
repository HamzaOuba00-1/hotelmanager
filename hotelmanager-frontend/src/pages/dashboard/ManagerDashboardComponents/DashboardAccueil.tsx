// src/pages/dashboard/manager/DashboardAccueil.tsx

import { useEffect, useState, useMemo, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

import { getMyHotel } from "../../../api/hotelApi";
import { getIssuesForMyHotel, type Issue } from "../../../api/issueApi";
import { listRooms, type RoomLite } from "../../../api/roomsApi";
import { listReservations, type Reservation } from "../../../api/reservationsApi";

import { AlertTriangle, CheckCircle, CalendarCheck2, BedDouble } from "lucide-react";
import { parseISO, isSameDay } from "date-fns";

type IssueStats = {
  open: number;
  resolved: number;
  important: number;
};

// ⚠️ Si RoomLite n'expose pas encore roomState dans ton api/roomsApi,
// on sécurise sans casser TS.
type RoomWithState = RoomLite & { roomState?: string };

export default function DashboardAccueil() {
  const [hotel, setHotel] = useState<any>(null);

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

  // Hôtel
  useEffect(() => {
    getMyHotel()
      .then(setHotel)
      .catch((e) => console.error("Erreur getMyHotel :", e));
  }, []);

  // Issues
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

  // Reservations
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

  // Rooms
  useEffect(() => {
    const loadRooms = async () => {
      setRoomsLoading(true);
      try {
        const data = await listRooms();
        // 🔒 cast safe vers RoomWithState
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

  // ------------------ Donut ISSUES ------------------
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

  // ------------------ KPI ROOMS (états) ------------------
  const roomKpis = useMemo(() => {
    const count = (state: string) =>
      rooms.filter((r) => r.roomState === state).length;

    const totalRooms = rooms.length;

    const libre = count("LIBRE");
    const reservee = count("RESERVEE");
    const checkin = count("CHECKIN");
    const roomService = count("ROOM_SERVICE");
    const aNettoyer = count("A_NETTOYER");
    const enNettoyage = count("EN_NETTOYAGE");
    const maintenance = count("MAINTENANCE");
    const inactive = count("INACTIVE");

    const occupied = checkin + roomService;

    return {
      total: totalRooms,
      libre,
      reservee,
      occupied,
      checkin,
      roomService,
      aNettoyer,
      enNettoyage,
      maintenance,
      inactive,
    };
  }, [rooms]);

  // ------------------ KPI RESERVATIONS DU JOUR ------------------
  const reservationKpis = useMemo(() => {
    const today = new Date();

    const arr = reservations.filter((r) =>
      isSameDay(parseISO(r.startAt), today)
    ).length;

    const dep = reservations.filter((r) =>
      isSameDay(parseISO(r.endAt), today)
    ).length;

    // ✅ TON BESOIN : "séjours en cours = nombre de chambre occupée"
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
            configuration de votre hôtel (coordonnées, horaires, services…).
          </p>
          <button
            onClick={() => navigate("/dashboard/manager/configuration")}
            className="mt-3 inline-flex items-center rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
          >
            Ouvrir la configuration
          </button>
        </div>
      )}

      {/* ✅ 3 cartes séparées */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ------------------ Carte ISSUES ------------------ */}
          <div className="bg-white/70 rounded-2xl border shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-emerald-600" />
                Signalements de l’hôtel
              </h2>
              <button
                onClick={() => navigate("/dashboard/manager/issues")}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
              >
                Voir
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Donut */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full" style={circleStyle} />
                <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-xl font-bold text-gray-800">
                    {total}
                  </span>
                </div>
              </div>

              {/* Légende */}
              <div className="flex-1 space-y-1 text-sm">
                {issuesLoading ? (
                  <div className="text-xs text-gray-500">
                    Chargement des signalements…
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
                        {issueStats.open}
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

          {/* ------------------ Carte RESERVATIONS ------------------ */}
          <div className="bg-white/70 rounded-2xl border shadow p-5">
            <div className="flex items-center justify-between mb-3">
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
              “En séjour” = nombre de chambres occupées (CHECKIN + ROOM_SERVICE).
            </div>
          </div>

          {/* ------------------ Carte ROOMS ------------------ */}
          <div className="bg-white/70 rounded-2xl border shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-emerald-600" />
                Chambres
              </h2>
              <button
                onClick={() => navigate("/dashboard/manager/rooms")}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
              >
                Voir
              </button>
            </div>

            {roomsLoading ? (
              <div className="text-xs text-gray-500">
                Chargement des chambres…
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MiniKpi label="Total" value={roomKpis.total} />
                <MiniKpi label="Libres" value={roomKpis.libre} />
                <MiniKpi label="Réservées" value={roomKpis.reservee} />
                <MiniKpi label="Occupées" value={roomKpis.occupied} />
                <MiniKpi label="À nettoyer" value={roomKpis.aNettoyer} />
                <MiniKpi label="Maintenance" value={roomKpis.maintenance} />
              </div>
            )}

            <div className="mt-3 text-[11px] text-gray-500">
              KPIs calculés depuis l’état réel des chambres.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Mini KPI ---------- */
const MiniKpi: React.FC<{ label: string; value: number | string }> = ({
  label,
  value,
}) => (
  <div className="rounded-xl border bg-white/70 p-3 text-center">
    <div className="text-[11px] text-gray-500">{label}</div>
    <div className="text-2xl font-bold text-gray-800 mt-0.5">{value}</div>
  </div>
);
