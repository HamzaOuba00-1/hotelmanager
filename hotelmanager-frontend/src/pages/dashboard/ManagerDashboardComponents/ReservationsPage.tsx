

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarCheck2,
  User2,
  DoorOpen,
  RefreshCw,
  XCircle,
  Search,
  Layers,
  Info,
  Mail,
  Phone,
  ChevronRight,
} from "lucide-react";
import * as rApi from "../../../api/reservationsApi";
import {
  format,
  isSameDay,
  parseISO,
  differenceInCalendarDays,
  isBefore,
  isAfter,
} from "date-fns";
import { fr } from "date-fns/locale";


type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "NO_SHOW"
  | "CANCELED"
  | "COMPLETED";

interface RoomLite {
  id: number;
  roomNumber: number;
  roomType: string;
  floor: number;
}
interface UserLite {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface Reservation {
  id: number;
  hotelId?: number;
  room: RoomLite;
  client?: UserLite | null;
  guestFirstName: string;
  guestLastName: string;
  guestPhone?: string;
  startAt: string; // ISO
  endAt: string; // ISO
  status: ReservationStatus;
  version?: number;
}


const FALLBACK_ALLOWED: Record<ReservationStatus, ReservationStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["CHECKED_IN", "NO_SHOW", "CANCELED"],
  CHECKED_IN: ["COMPLETED"],
  NO_SHOW: ["CANCELED"],
  CANCELED: [],
  COMPLETED: [],
};

const STATUS_STYLE: Record<
  ReservationStatus,
  { label: string; badge: string }
> = {
  PENDING: {
    label: "En attente",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  CONFIRMED: {
    label: "Confirmée",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CHECKED_IN: {
    label: "Check-in",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  NO_SHOW: {
    label: "No-show",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  CANCELED: {
    label: "Annulée",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
  },
  COMPLETED: {
    label: "Complétée",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
};


const toDate = (iso: string) => parseISO(iso);
const nights = (startIso: string, endIso: string) =>
  Math.max(1, differenceInCalendarDays(toDate(endIso), toDate(startIso)));


export default function ReservationsPage() {
  // Data
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [allowedMap, setAllowedMap] = useState<
    Record<number, ReservationStatus[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // UI
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ReservationStatus | "ALL">("ALL");
  const [onlyToday, setOnlyToday] =
    useState<"ALL" | "ARRIVALS" | "DEPARTURES" | "INHOUSE">("ALL");
  const [details, setDetails] = useState<Reservation | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const [confirm, setConfirm] = useState<{
    res?: Reservation;
    label?: string;
    target?: ReservationStatus;
  } | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await rApi.listReservations();
      setReservations(data);
    } catch (e: any) {
      setErr(e?.message || "Erreur de chargement des réservations.");
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const ensureAllowedLoaded = useCallback(
    async (id: number, status: ReservationStatus) => {
      if (allowedMap[id]) return allowedMap[id];
      try {
        const allowed = await rApi.getAllowedStatuses(id);
        setAllowedMap((prev) => ({ ...prev, [id]: allowed }));
        return allowed;
      } catch {
        const fb = FALLBACK_ALLOWED[status] || [];
        setAllowedMap((prev) => ({ ...prev, [id]: fb }));
        return fb;
      }
    },
    [allowedMap]
  );

  const isAllowed = (res: Reservation, target: ReservationStatus) => {
    const cached = allowedMap[res.id];
    if (cached) return cached.includes(target);
    return FALLBACK_ALLOWED[res.status]?.includes(target);
  };

  const today = new Date();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations
      .filter((r) => {
        if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
        if (onlyToday !== "ALL") {
          const s = toDate(r.startAt);
          const e = toDate(r.endAt);
          if (onlyToday === "ARRIVALS" && !isSameDay(s, today)) return false;
          if (onlyToday === "DEPARTURES" && !isSameDay(e, today)) return false;
          if (
            onlyToday === "INHOUSE" &&
            !(isBefore(s, today) && isAfter(e, today))
          )
            return false;
        }
        if (!q) return true;
        const guest = `${r.guestFirstName} ${r.guestLastName}`.toLowerCase();
        const email = (r.client?.email || "").toLowerCase();
        const phone = (r.client?.phone || r.guestPhone || "").toLowerCase();
        const room = String(r.room?.roomNumber || "");
        return guest.includes(q) || email.includes(q) || phone.includes(q) || room.includes(q);
      })
      .sort(
        (a, b) =>
          parseISO(a.startAt).getTime() - parseISO(b.startAt).getTime()
      );
  }, [reservations, query, statusFilter, onlyToday]);

  const kpis = useMemo(() => {
    const arr = reservations.filter((r) =>
      isSameDay(toDate(r.startAt), today)
    ).length;
    const dep = reservations.filter((r) =>
      isSameDay(toDate(r.endAt), today)
    ).length;
    const inH = reservations.filter(
      (r) =>
        isBefore(toDate(r.startAt), today) &&
        isAfter(toDate(r.endAt), today)
    ).length;
    return { arr, dep, inH };
  }, [reservations]);

  const doTransition = async (id: number, target: ReservationStatus) => {
    try {
      await rApi.updateStatus(id, target);
      await fetchReservations();
    } catch (e: any) {
      setErr(e?.message || "Transition refusée.");
    }
  };

  const askConfirm = async (
    res: Reservation,
    target: ReservationStatus,
    label: string
  ) => {
    const allowed = await ensureAllowedLoaded(res.id, res.status);
    if (!allowed.includes(target)) {
      setErr(
        `Transition non autorisée depuis ${res.status} vers ${target}.`
      );
      return;
    }
    setConfirm({ res, target, label });
  };
  useEffect(() => {
    if (confirm?.res && confirmBtnRef.current) confirmBtnRef.current.focus();
  }, [confirm]);


  const Header = () => (
    <div className="flex flex-col items-center gap-2 mb-6 text-center">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-4">
        <CalendarCheck2 className="h-8 w-8 text-emerald-600" /> Agenda des
        réservations
      </h1>

      <button
        onClick={fetchReservations}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );

  const StatusPill: React.FC<{ s: ReservationStatus }> = ({ s }) => (
    <span
      className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-md border ${STATUS_STYLE[s].badge}`}
    >
      {STATUS_STYLE[s].label}
    </span>
  );

  const Row: React.FC<{ r: Reservation }> = ({ r }) => (
    <div className="rounded-2xl border bg-white/70 backdrop-blur p-4 shadow-sm hover:shadow-md transition animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center">
            <User2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start">
            <div className="font-semibold text-gray-900">
              {r.guestFirstName} {r.guestLastName}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              {r.client?.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {r.client.email}
                </span>
              )}
              {(r.client?.phone || r.guestPhone) && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {r.client?.phone || r.guestPhone}
                </span>
              )}
            </div>
          </div>
        </div>
        <StatusPill s={r.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-700">
        <InfoLine
          label="Chambre"
          value={
            <span className="inline-flex items-center gap-1">
              {String(r.room.roomNumber).padStart(3, "0")} • {r.room.roomType}{" "}
              (Étage {r.room.floor})
            </span>
          }
        />
        <InfoLine
          label="Arrivée"
          value={format(toDate(r.startAt), "EEE d MMM HH:mm", { locale: fr })}
        />
        <InfoLine
          label="Départ"
          value={format(toDate(r.endAt), "EEE d MMM HH:mm", { locale: fr })}
        />
        <InfoLine label="Nuits" value={`${nights(r.startAt, r.endAt)}`} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {isAllowed(r, "CONFIRMED") && r.status === "PENDING" && (
          <Action
            onClick={() =>
              askConfirm(r, "CONFIRMED", "Confirmer la réservation ?")
            }
            className="px-3 py-1.5 rounded-lg text-sm shadow-sm hover:shadow transition bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Confirmer
          </Action>
        )}
        {isAllowed(r, "CHECKED_IN") && r.status === "CONFIRMED" && (
          <Action
            onClick={() =>
              askConfirm(r, "CHECKED_IN", "Enregistrer le check-in ?")
            }
            className="px-3 py-1.5 rounded-lg text-sm shadow-sm hover:shadow transition bg-emerald-500 text-white hover:bg-emerald-800"
          >
            Check-in
          </Action>
        )}
        {isAllowed(r, "NO_SHOW") && r.status === "CONFIRMED" && (
          <Action
            onClick={() => askConfirm(r, "NO_SHOW", "Marquer en no-show ?")}
            className="px-3 py-1.5 rounded-lg text-sm shadow-sm hover:shadow transition bg-rose-500 text-white hover:bg-rose-700"
          >
            No-show
          </Action>
        )}
        {isAllowed(r, "COMPLETED") && r.status === "CHECKED_IN" && (
          <Action
            onClick={() =>
              askConfirm(r, "COMPLETED", "Clôturer le séjour (checkout) ?")
            }
            className="px-3 py-1.5 rounded-lg text-sm shadow-sm hover:shadow transition bg-emerald-400 text-white hover:bg-emerald-600"
          >
            Checkout
          </Action>
        )}
        {(r.status === "PENDING" || r.status === "CONFIRMED") &&
          isAllowed(r, "CANCELED") && (
            <Action
              onClick={() =>
                askConfirm(r, "CANCELED", "Annuler la réservation ?")
              }
              className="px-3 py-1.5 rounded-lg text-sm shadow-sm hover:shadow transition border  bg-gray-200 hover:bg-gray-50"
            >
              Annuler
            </Action>
          )}

        <button
          onClick={() => setDetails(r)}
          className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Détails <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );


  return (
    <div className="p-6 text-center space-y-8">
      <Header />

      {/* Filtres — style comme ta PlanningPage : clair, pills arrondies */}
      <div className="bg-white/60 rounded-2xl border shadow p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] items-center gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (nom, email, N° chambre)…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            />
          </div>

          {/* Statuts (groupe séparé → plus de “fusion visuelle”) */}
          <div className="flex items-center gap-3 justify-start lg:justify-center">
            <Layers className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-2 bg-gray-100/70 border rounded-full px-2 py-1">
              {(
                [
                  "ALL",
                  "PENDING",
                  "CONFIRMED",
                  "CHECKED_IN",
                  "COMPLETED",
                  "CANCELED",
                  "NO_SHOW",
                ] as const
              ).map((key) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    statusFilter === key
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-white hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {key === "ALL"
                    ? "Tous"
                    : STATUS_STYLE[key as ReservationStatus].label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates du jour (deuxième groupe séparé) */}
          <div className="flex items-center gap-3 justify-start lg:justify-end">
            <div className="flex flex-wrap gap-2 bg-gray-100/70 border rounded-full px-2 py-1">
              {(["ALL", "ARRIVALS", "DEPARTURES", "INHOUSE"] as const).map(
                (k) => (
                  <button
                    key={k}
                    onClick={() => setOnlyToday(k)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      onlyToday === k
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-white hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {k === "ALL"
                      ? "Toutes dates"
                      : k === "ARRIVALS"
                      ? "Arrivées du jour"
                      : k === "DEPARTURES"
                      ? "Départs du jour"
                      : "En séjour aujourd’hui"}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs style “carte claire” comme Planning */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Kpi label="Arrivées du jour" value={kpis.arr} />
        <Kpi label="Départs du jour" value={kpis.dep} />
        <Kpi label="En séjour aujourd’hui" value={kpis.inH} />
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm p-3">
          {err}
        </div>
      )}
      {loading && <div className="text-sm text-gray-500">Chargement…</div>}

      {/* Liste unique */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <Row key={r.id} r={r} />
        ))}
        {!loading && filtered.length === 0 && (
          <Empty message="Aucune réservation ne correspond aux filtres." />
        )}
      </div>

      {/* Info */}
      <div className="bg-white/60 rounded-2xl border p-4 text-sm text-gray-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-emerald-600 mt-0.5" />
        <p>
          Actions calculées via transitions autorisées (API), avec repli local
          en cas d’indisponibilité.
        </p>
      </div>

      {/* Modal Détails */}
      {details && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 animate-fadeIn"
          aria-hidden={!details}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User2 className="w-5 h-5 text-emerald-700" /> Détails
                réservation
              </div>
              <button className="text-sm text-gray-500 hover:text-gray-700" onClick={() => setDetails(null)}>
                Fermer
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <InfoLine
                label="Client"
                value={`${details.guestFirstName} ${details.guestLastName}`}
              />
              <InfoLine label="Email" value={details.client?.email || "—"} />
              <InfoLine
                label="Téléphone"
                value={details.client?.phone || details.guestPhone || "—"}
              />
              <InfoLine
                label="Chambre"
                value={`#${String(details.room.roomNumber).padStart(
                  3,
                  "0"
                )} – ${details.room.roomType} (Étage ${details.room.floor})`}
              />
              <InfoLine
                label="Arrivée"
                value={format(toDate(details.startAt), "PPPp", { locale: fr })}
              />
              <InfoLine
                label="Départ"
                value={format(toDate(details.endAt), "PPPp", { locale: fr })}
              />
              <InfoLine
                label="Nuits"
                value={`${nights(details.startAt, details.endAt)}`}
              />
              <InfoLine label="Statut" value={<StatusPill s={details.status} />} />
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation */}
      {confirm?.res && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 animate-fadeIn"
          aria-hidden={!confirm?.res}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-center space-y-5"
          >
            <div className="flex justify-center">
              <XCircle className="w-10 h-10 text-emerald-600 rotate-45" />
            </div>
            <p id="confirm-title" className="text-gray-800 text-lg font-semibold">
              {confirm.label}
            </p>
            <p className="text-sm text-gray-500">
              {confirm?.res?.guestFirstName} {confirm?.res?.guestLastName} •
              Chambre {String(confirm?.res?.room.roomNumber).padStart(3, "0")}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                ref={confirmBtnRef}
                onClick={async () => {
                  if (!confirm?.target || !confirm?.res) return;
                  await doTransition(confirm.res.id, confirm.target);
                  setConfirm(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm shadow hover:shadow-md"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}

/* --------------- Petits composants --------------- */

const Empty: React.FC<{ message: string }> = ({ message }) => (
  <div className="col-span-full rounded-xl border bg-white/60 backdrop-blur p-4 text-sm text-gray-500 flex items-center gap-2">
    <span className="inline-block h-2 w-2 rounded-full bg-gray-300" /> {message}
  </div>
);

const Kpi: React.FC<{ label: string; value: number | string }> = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-3xl font-bold mt-1">{value}</div>
  </div>
);

const Action: React.FC<{
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ onClick, className, children }) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);

const InfoLine: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <div className="text-[11px] text-gray-500">{label}</div>
    <div className="text-gray-800">{value}</div>
  </div>
);


if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn { animation: fadeIn .3s ease-out; }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .animate-slideIn { animation: slideIn .4s ease-out; }
  `;
  document.head.appendChild(style);
}
