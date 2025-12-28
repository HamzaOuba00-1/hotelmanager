import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyHotel, type HotelConfigDTO } from "../../../features/hotel/api/hotelApi";
import { getAvailableRooms } from "../../reservations/api/publicApi";
import { PublicRoom } from "../../../features/rooms/publicTypes";
import {
  buildStartISO,
  buildEndISO,
  defaultArrival,
  defaultDeparture,
} from "../../../shared/utils/datetime";
import {
  CalendarRange,
  DoorOpen,
  BedDouble,
  MapPin,
  Phone,
  Mail,
  Clock,
  PawPrint,
  ShieldCheck,
  Crown,
  Loader2,
} from "lucide-react";

export default function ManagerHomePage() {
  const [hotel, setHotel] = useState<HotelConfigDTO | null>(null);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelErr, setHotelErr] = useState<string | null>(null);

  const [arrival, setArrival] = useState<string>(() => defaultArrival());
  const [departure, setDeparture] = useState<string>(() => defaultDeparture());
  const startAtISO = useMemo(() => buildStartISO(arrival), [arrival]);
  const endAtISO = useMemo(() => buildEndISO(departure), [departure]);

  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSearch =
    arrival && departure && new Date(arrival) < new Date(departure);

  // 1) Charger l’hôtel du manager
  useEffect(() => {
    const loadHotel = async () => {
      setHotelLoading(true);
      setHotelErr(null);
      try {
        const h = await getMyHotel();
        setHotel(h);
      } catch (e: any) {
        setHotelErr(
          e?.response?.data?.detail ||
            e?.message ||
            "Impossible de charger l’hôtel du manager."
        );
      } finally {
        setHotelLoading(false);
      }
    };
    loadHotel();
  }, []);

  // 2) Charger les chambres dispo (pour l’hôtel du manager)
  const loadAvailable = useCallback(async () => {
    if (!hotel?.id) return;

    if (!arrival || !departure) return;
    if (new Date(arrival) >= new Date(departure)) {
      setErr("La date d'arrivée doit être antérieure à la date de départ.");
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const data = await getAvailableRooms(Number(hotel.id), startAtISO, endAtISO);
      setRooms(data || []);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [hotel?.id, arrival, departure, startAtISO, endAtISO]);

  // Auto-refresh quand hôtel + dates changent
  useEffect(() => {
    if (!hotel?.id) return;
    loadAvailable();
  }, [hotel?.id, loadAvailable]);

  const totalRooms =
    hotel?.floors && hotel.roomsPerFloor ? hotel.floors * hotel.roomsPerFloor : null;

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="flex justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-emerald-600" />
            Accueil manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualisez rapidement les chambres disponibles de votre hôtel.
          </p>
        </div>
      </div>

      {/* Card Hôtel */}
      {hotelLoading ? (
        <div className="h-28 rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl animate-pulse" />
      ) : hotelErr ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700 text-sm">
          {hotelErr}
        </div>
      ) : hotel ? (
        <section className="rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-5">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex items-center gap-3 min-w-0">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xl font-semibold flex items-center justify-center">
                  {hotel.name?.[0]?.toUpperCase() ?? "H"}
                </div>
              

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {hotel.name}
                  </h2>
                  {totalRooms && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-700">
                      <BedDouble className="w-3.5 h-3.5" />
                      ≈ {totalRooms} chambres
                    </span>
                  )}
                </div>

                {hotel.address && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{hotel.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="sm:ml-auto flex flex-wrap gap-2 text-[11px] text-gray-600">
              {hotel.phone && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                  <Phone className="w-3 h-3" />
                  {hotel.phone}
                </span>
              )}
              {hotel.email && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                  <Mail className="w-3 h-3" />
                  {hotel.email}
                </span>
              )}
              {hotel.checkInHour && hotel.checkOutHour && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                  <Clock className="w-3 h-3" />
                  {hotel.checkInHour} → {hotel.checkOutHour}
                </span>
              )}
              {hotel.minAge != null && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Âge min {hotel.minAge}
                </span>
              )}
              {hotel.petsAllowed && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
                  <PawPrint className="w-3 h-3" />
                  Animaux OK
                </span>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Barre dates */}
      <section className="rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CalendarRange className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Disponibilités
            </h3>
            <p className="text-xs text-gray-500">
              Choisissez un intervalle pour voir les chambres libres.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Arrivée
            </label>
            <input
              type="date"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Départ
            </label>
            <input
              type="date"
              value={departure}
              min={arrival || undefined}
              onChange={(e) => setDeparture(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              onClick={loadAvailable}
              disabled={!canSearch || !hotel?.id}
              className={`w-full px-4 py-2 rounded-xl text-white shadow-lg text-sm font-medium transition
                ${
                  canSearch && hotel?.id
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:scale-[1.02] hover:shadow-xl"
                    : "bg-gray-300 cursor-not-allowed shadow-none"
                }`}
            >
              Rechercher
            </button>
          </div>
        </div>

        {err && <div className="mt-3 text-sm text-rose-600">{err}</div>}
      </section>

      {/* Liste chambres dispo */}
      <section className="pb-2">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-3xl bg-white/70 border border-white/40 shadow animate-pulse"
              />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white/70 p-10 text-center text-gray-600">
            Aucune chambre disponible sur cet intervalle.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_40px_rgba(16,185,129,0.15)] transition-all duration-300"
              >
                <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="text-xs text-gray-500">Étage {room.floor}</div>
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Libre
                  </span>
                </div>

                <div className="relative z-10 mt-3 flex items-center gap-2 text-2xl font-bold text-gray-800">
                  <DoorOpen className="w-6 h-6 text-emerald-600" />
                  {String(room.roomNumber).padStart(3, "0")}
                </div>

                <div className="relative z-10 text-sm text-gray-500">
                  {room.roomType}
                </div>

                {room.description && (
                  <div className="relative z-10 text-xs text-gray-400 mt-1 line-clamp-2">
                    {room.description}
                  </div>
                )}

                <div className="relative z-10 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 text-sm">
                    <BedDouble className="w-4 h-4" />
                    Disponible
                  </div>
                  <span className="text-xs text-gray-400">
                    (Réservation côté public)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement…
          </div>
        )}
      </section>
    </div>
  );
}
