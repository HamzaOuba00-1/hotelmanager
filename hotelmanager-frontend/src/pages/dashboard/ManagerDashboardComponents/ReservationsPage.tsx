// src/pages/dashboard/ManagerDashboardComponents/ReservationsPage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import {
  CalendarCheck2,
  ClipboardCheck,
  Bed,
  DoorOpen,
  RefreshCw,
  Wrench,
  XCircle,
  CheckCircle2,
} from "lucide-react";

type RoomState =
  | "LIBRE" | "RESERVEE" | "CHECKIN" | "ROOM_SERVICE" | "CHECKOUT"
  | "A_VALIDER_LIBRE" | "A_NETTOYER" | "EN_NETTOYAGE" | "A_VALIDER_CLEAN"
  | "MAINTENANCE" | "INACTIVE";

interface Room {
  id: number;
  roomNumber: number;
  roomType: string;
  floor: number;
  description: string;
  roomState: RoomState;
  active: boolean;
}

/** Fallback local (si le fetch allowed-states échoue) — aligné avec le backend */
const FALLBACK_ALLOWED: Record<RoomState, RoomState[]> = {
  LIBRE:           ["RESERVEE", "CHECKIN", "MAINTENANCE", "INACTIVE"],
  RESERVEE:        ["CHECKIN", "A_VALIDER_LIBRE", "LIBRE"],
  CHECKIN:         ["ROOM_SERVICE", "CHECKOUT"],
  CHECKOUT:        ["A_VALIDER_LIBRE", "A_NETTOYER"],
  A_VALIDER_LIBRE: ["CHECKIN", "A_NETTOYER"],
  ROOM_SERVICE:    ["CHECKIN", "CHECKOUT"],
  A_NETTOYER:      ["EN_NETTOYAGE"],
  EN_NETTOYAGE:    ["A_VALIDER_CLEAN"],
  A_VALIDER_CLEAN: ["LIBRE", "A_NETTOYER"],
  MAINTENANCE:     ["LIBRE"],
  INACTIVE:        [],
};

export default function ReservationsPage() {
  const token = localStorage.getItem("token") || "";
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allowedMap, setAllowedMap] = useState<Record<number, RoomState[]>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // confirmation modale
  const [confirm, setConfirm] = useState<{ room?: Room; label?: string; target?: RoomState } | null>(null);

  const fetchRooms = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get<Room[]>("/api/rooms"); // header JWT auto via interceptor
      setRooms(data);
      // recharge paresseuse des allowed: on ne vide pas allowedMap, on complète à la demande
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  /** Récupère les transitions autorisées d'une chambre, et met en cache */
  const ensureAllowedLoaded = useCallback(async (roomId: number) => {
    if (allowedMap[roomId]) return allowedMap[roomId];
    try {
      const { data } = await api.get<RoomState[]>(`/api/rooms/${roomId}/allowed-states`);
      setAllowedMap(prev => ({ ...prev, [roomId]: data }));
      return data;
    } catch {
      // fallback si l'endpoint n'est pas joignable
      const current = rooms.find(r => r.id === roomId)?.roomState as RoomState | undefined;
      const fb = current ? FALLBACK_ALLOWED[current] : [];
      setAllowedMap(prev => ({ ...prev, [roomId]: fb }));
      return fb;
    }
  }, [allowedMap, rooms]);

  const isAllowed = (room: Room, target: RoomState) => {
    const cached = allowedMap[room.id];
    if (cached) return cached.includes(target);
    // no cache -> fallback immédiat en attendant le fetch
    return FALLBACK_ALLOWED[room.roomState]?.includes(target);
  };

  // Sélections utiles
  const reserved = useMemo(
    () => rooms.filter(r => r.roomState === "RESERVEE").sort((a,b)=>a.roomNumber-b.roomNumber),
    [rooms]
  );
  const toValidate = useMemo(
    () => rooms.filter(r => r.roomState === "A_VALIDER_LIBRE").sort((a,b)=>a.roomNumber-b.roomNumber),
    [rooms]
  );
  const inHouse = useMemo(
    () => rooms.filter(r => r.roomState === "CHECKIN").sort((a,b)=>a.roomNumber-b.roomNumber),
    [rooms]
  );

  // Action générique de transition d'état
  const doTransition = async (roomId: number, target: RoomState) => {
    try {
      await api.patch(`/api/rooms/${roomId}/state`, { state: target }); // JSON body
      await fetchRooms();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data?.title || e?.message || "Transition refusée.";
      setErr(msg);
    }
  };

  const header = (Icon: any, title: string) => (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-5 h-5 text-emerald-600" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  );

  const StatePill: React.FC<{ state: RoomState }> = ({ state }) => (
    <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
      {state}
    </span>
  );

  const Card: React.FC<{ room: Room; children?: React.ReactNode }> = ({ room, children }) => (
    <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-gray-500 mb-2">Étage {room.floor}</div>
        <StatePill state={room.roomState} />
      </div>
      <div className="flex items-center gap-2 text-xl font-bold text-emerald-700">
        <DoorOpen className="w-5 h-5" />
        {String(room.roomNumber).padStart(3, "0")}
      </div>
      <div className="text-xs text-gray-500 mt-1">{room.roomType}</div>
      {room.description && (
        <div className="text-xs text-gray-400 mt-1">{room.description}</div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </div>
  );

  /** Ouvre le modal après avoir vérifié dynamiquement que la transition est autorisée */
  const askConfirm = async (room: Room, target: RoomState, label: string) => {
    const allowed = await ensureAllowedLoaded(room.id);
    if (!allowed.includes(target)) {
      setErr(`Transition non autorisée depuis ${room.roomState} vers ${target}.`);
      return;
    }
    setConfirm({ room, target, label });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarCheck2 className="w-7 h-7 text-emerald-600" />
          Gestion des réservations
        </h1>
        <button
          onClick={fetchRooms}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white shadow hover:shadow-md"
        >
          Actualiser
        </button>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}
      {loading && <div className="text-sm text-gray-500">Chargement…</div>}

      {/* Nouvelles réservations */}
      <section>
        {header(ClipboardCheck, "Nouvelles réservations")}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reserved.map((room) => (
            <Card key={room.id} room={room}>
              {isAllowed(room, "CHECKIN") && (
                <button
                  onClick={() => askConfirm(room, "CHECKIN", "Confirmer le check-in ?")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                >
                  Check-in
                </button>
              )}
              {isAllowed(room, "LIBRE") && (
                <button
                  onClick={() => askConfirm(room, "LIBRE", "Annuler la réservation ?")}
                  className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                >
                  Annuler
                </button>
              )}
              {isAllowed(room, "A_VALIDER_LIBRE") && (
                <button
                  onClick={() => askConfirm(room, "A_VALIDER_LIBRE", "Mettre en validation de départ ?")}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                >
                  À valider (libre)
                </button>
              )}
            </Card>
          ))}
          {!loading && reserved.length === 0 && (
            <div className="col-span-full text-sm text-gray-500">Aucune réservation en attente.</div>
          )}
        </div>
      </section>

      {/* À valider (libre) */}
      <section>
        {header(CheckCircle2, "Départs à valider")}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {toValidate.map((room) => (
            <Card key={room.id} room={room}>
              {isAllowed(room, "A_NETTOYER") && (
                <button
                  onClick={() => askConfirm(room, "A_NETTOYER", "Confirmer départ (→ À nettoyer) ?")}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-sm hover:bg-cyan-700"
                >
                  Confirmer départ
                </button>
              )}
              {isAllowed(room, "CHECKOUT") && (
                <button
                  onClick={() => askConfirm(room, "CHECKOUT", "Annuler départ (→ Checkout) ?")}
                  className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                >
                  Annuler départ
                </button>
              )}
            </Card>
          ))}
          {!loading && toValidate.length === 0 && (
            <div className="col-span-full text-sm text-gray-500">Aucun départ à valider.</div>
          )}
        </div>
      </section>

      {/* Séjours en cours */}
      <section>
        {header(Bed, "Séjours en cours")}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {inHouse.map((room) => (
            <Card key={room.id} room={room}>
              {isAllowed(room, "ROOM_SERVICE") && (
                <button
                  onClick={() => askConfirm(room, "ROOM_SERVICE", "Passer en room service ?")}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-600 flex items-center gap-1"
                >
                  <Wrench className="w-4 h-4" /> Room service
                </button>
              )}
              {isAllowed(room, "CHECKOUT") && (
                <button
                  onClick={() => askConfirm(room, "CHECKOUT", "Passer en checkout ?")}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-sm hover:bg-cyan-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" /> Checkout
                </button>
              )}
            </Card>
          ))}
          {!loading && inHouse.length === 0 && (
            <div className="col-span-full text-sm text-gray-500">Aucun séjour en cours.</div>
          )}
        </div>
      </section>

      {/* Modal de confirmation */}
      {confirm?.room && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-center space-y-5">
            <div className="flex justify-center">
              <XCircle className="w-10 h-10 text-emerald-600 rotate-45" />
            </div>
            <p className="text-gray-700 text-lg">{confirm.label}</p>
            <p className="text-sm text-gray-500">
              Chambre <strong>{String(confirm.room.roomNumber).padStart(3, "0")}</strong> – {confirm.room.roomType}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 rounded-xl border text-sm"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  if (!confirm.target || !confirm.room) return;
                  await doTransition(confirm.room.id, confirm.target);
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
    </div>
  );
}
