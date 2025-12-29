import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getAvailableRooms, reserveRoom } from "../../reservations/api/publiApi";
import { PublicRoom } from "../../rooms/publicTypes";
import {
  buildStartISO,
  buildEndISO,
  defaultArrival,
  defaultDeparture,
} from "../../../shared/utils/datetime";
import {
  CalendarRange,
  Crown,
  DoorOpen,
  BedDouble,
  Copy,
  Check,
  Phone,
  ShieldCheck,
  MapPin,
  Mail,
  PawPrint,
  Clock,
} from "lucide-react";
import { type HotelConfigDTO, listPublicHotels } from "../../hotel/api/hotelApi";

type ProblemDetail = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
};

export default function PublicRoomsPage() {
  const { hotelId } = useParams();
  const HOTEL_ID = Number(hotelId);

  const [arrival, setArrival] = useState<string>(() => defaultArrival());
  const [departure, setDeparture] = useState<string>(() => defaultDeparture());
  const startAtISO = useMemo(() => buildStartISO(arrival), [arrival]);
  const endAtISO = useMemo(() => buildEndISO(departure), [departure]);

  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ------- Hotel info -------
  const [hotel, setHotel] = useState<HotelConfigDTO | null>(null);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [hotelErr, setHotelErr] = useState<string | null>(null);

  const [openReserve, setOpenReserve] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<PublicRoom | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  // ------- Load available rooms -------
  const loadAvailable = useCallback(async () => {
    if (!HOTEL_ID || Number.isNaN(HOTEL_ID)) {
      setErr("Invalid hotel.");
      return;
    }
    if (!arrival || !departure) return;
    if (new Date(arrival) >= new Date(departure)) {
      setErr("Arrival date must be before the departure date.");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const data = await getAvailableRooms(HOTEL_ID, startAtISO, endAtISO);
      setPublicRooms(data);
    } catch (e: any) {
      setErr(
        e?.response?.data?.detail || e?.message || "Loading error."
      );
    } finally {
      setLoading(false);
    }
  }, [HOTEL_ID, arrival, departure, startAtISO, endAtISO]);

  useEffect(() => {
    loadAvailable();
  }, [loadAvailable]);

  // ------- Load hotel info -------
  useEffect(() => {
    const loadHotel = async () => {
      if (!HOTEL_ID || Number.isNaN(HOTEL_ID)) return;

      setHotelLoading(true);
      setHotelErr(null);
      try {
        // Simple approach: reuse the public list and filter it
        const data = await listPublicHotels();
        const found = (data || []).find((h) => h.id === HOTEL_ID) || null;
        if (!found) {
          setHotelErr("Hotel not found.");
        }
        setHotel(found);
      } catch (e: any) {
        setHotelErr(
          e?.response?.data?.detail ||
            e?.message ||
            "Unable to load hotel information."
        );
      } finally {
        setHotelLoading(false);
      }
    };

    loadHotel();
  }, [HOTEL_ID]);

  function openReserveFor(room: PublicRoom) {
    setSelectedRoom(room);
    setFirstName("");
    setLastName("");
    setGuestPhone("");
    setReserveError(null);
    setCopied(null);
    setOpenReserve(true);
  }

  function validatePhone(p: string) {
    const v = p.trim();
    return v.length >= 6;
  }

  async function submitReserve(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoom || !HOTEL_ID) return;

    if (!firstName.trim() || !lastName.trim()) {
      setReserveError("Please enter your first and last name.");
      return;
    }
    if (!validatePhone(guestPhone)) {
      setReserveError("Please enter a valid phone number.");
      return;
    }

    try {
      setReserveLoading(true);
      setReserveError(null);

      const res = await reserveRoom({
        hotelId: HOTEL_ID,
        roomId: selectedRoom.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        guestPhone,
        startAt: startAtISO,
        endAt: endAtISO,
      });

      setOpenReserve(false);
      setGeneratedEmail(res.email);
      setGeneratedPassword(res.generatedPassword);
      setOpenSuccess(true);

      await loadAvailable();
    } catch (e: any) {
      const pd: ProblemDetail | undefined = e?.response?.data;
      if ((e?.response?.status ?? 0) === 409) {
        setReserveError(
          pd?.detail || "Time slot already taken. Refreshing availability…"
        );
        await loadAvailable();
      } else {
        setReserveError(
          pd?.detail || pd?.title || e?.message || "Unable to complete booking."
        );
      }
    } finally {
      setReserveLoading(false);
    }
  }

  const canSearch =
    arrival && departure && new Date(arrival) < new Date(departure);

  const totalRooms =
    hotel?.floors && hotel.roomsPerFloor
      ? hotel.floors * hotel.roomsPerFloor
      : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <div className="relative">
        <header className="max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg flex items-center justify-center">
              <Crown className="text-white w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
                Booking
                {hotel && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="truncate max-w-[180px] sm:max-w-xs text-emerald-700">
                      {hotel.name}
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {hotel?.address
                  ? hotel.address
                  : "Choose your dates and book your stay."}
              </p>
            </div>
          </div>
        </header>
      </div>

      {/* Hotel info card */}
      <div className="max-w-6xl mx-auto px-6">
        {hotelLoading ? (
          <div className="mb-4 h-24 rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl animate-pulse" />
        ) : hotel ? (
          <section className="mb-5 rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center sm:items-stretch">
            {/* Logo / initiales */}
            <div className="flex-shrink-0">
              {hotel.logoUrl ? (
                <div className="h-16 w-16 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                  <img
                    src={hotel.logoUrl}
                    alt={hotel.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-2xl font-semibold flex items-center justify-center">
                  {hotel.name?.[0]?.toUpperCase() ?? "H"}
                </div>
              )}
            </div>

            {/* Infos principales */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {hotel.name}
                  </h2>
                  {hotel.address && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{hotel.address}</span>
                    </div>
                  )}
                </div>

                {totalRooms && totalRooms > 0 && (
                  <span className="mt-1 sm:mt-0 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-700">
                    <BedDouble className="w-3.5 h-3.5" />
                    ≈ {totalRooms} rooms
                  </span>
                )}
              </div>

              {/* Tags contact & politique */}
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-600">
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
                    Check-in {hotel.checkInHour} • Check-out {hotel.checkOutHour}
                  </span>
                )}
                {hotel.minAge != null && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Min age {hotel.minAge} years
                  </span>
                )}
                {hotel.petsAllowed && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
                    <PawPrint className="w-3 h-3" />
                    Pets allowed
                  </span>
                )}
              </div>

              {/* Services */}
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-gray-600">
                {hotel.services?.hasRestaurant && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Restaurant
                  </span>
                )}
                {hotel.services?.hasGym && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
                    Gym
                  </span>
                )}
                {hotel.services?.hasPool && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-100">
                    Pool
                  </span>
                )}
                {hotel.services?.hasBusinessCenter && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100">
                    Business center
                  </span>
                )}
                {!hotel.services && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
                    Standard services
                  </span>
                )}
              </div>
            </div>
          </section>
        ) : hotelErr ? (
          <div className="mb-5 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2">
            {hotelErr}
          </div>
        ) : null}
      </div>

      {/* Date selection */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CalendarRange className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Select your dates
              </h2>
              <p className="text-xs text-gray-500">
                Room availability updates automatically.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Arrival
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
                Departure
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
                disabled={!canSearch}
                className={`w-full px-4 py-2 rounded-xl text-white shadow-lg text-sm font-medium transition
                  ${
                    canSearch
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:scale-[1.02] hover:shadow-xl"
                      : "bg-gray-300 cursor-not-allowed shadow-none"
                  }
                `}
              >
                Search
              </button>
            </div>
          </div>

          {err && <div className="mt-3 text-sm text-rose-600">{err}</div>}
        </div>
      </div>

      {/* Available rooms */}
      <div className="max-w-6xl mx-auto px-6 mt-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-3xl bg-white/70 border border-white/40 shadow animate-pulse"
              />
            ))}
          </div>
        ) : publicRooms.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            No rooms available for this date range. Try other dates.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicRooms.map((room) => (
              <div
                key={room.id}
                className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_40px_rgba(16,185,129,0.15)] transition-all duration-300"
              >
                <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="text-xs text-gray-500">
                      Floor {room.floor}
                    </div>
                    <span className="px-2 py-0.5 text-[11px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Available
                    </span>
                  </div>

                <div className="mt-3 flex items-center gap-2 text-2xl font-bold text-gray-800 relative z-10">
                  <DoorOpen className="w-6 h-6 text-emerald-600" />
                  {String(room.roomNumber).padStart(3, "0")}
                </div>
                <div className="text-sm text-gray-500 relative z-10">
                  {room.roomType}
                </div>
                {room.description && (
                  <div className="text-xs text-gray-400 mt-1 line-clamp-2 relative z-10">
                    {room.description}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2 text-emerald-700 text-sm">
                    <BedDouble className="w-4 h-4" />
                    Premium comfort
                  </div>
                  <button
                    onClick={() => openReserveFor(room)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md hover:shadow-lg hover:scale-[1.03] transition"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking modal */}
      {openReserve && selectedRoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reserve-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenReserve(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-emerald-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-5 h-5 text-emerald-600" />
              <h3
                id="reserve-title"
                className="text-lg font-semibold text-gray-800"
              >
                Complete your booking
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Room{" "}
              <strong>
                {String(selectedRoom.roomNumber).padStart(3, "0")}
              </strong>{" "}
              — {selectedRoom.roomType}
            </p>

            <form onSubmit={submitReserve} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  First name
                </label>
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Last name
                </label>
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Phone
                </label>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 px-2 py-1 rounded-lg bg-gray-50 border">
                    <Phone className="w-3 h-3 text-gray-400" />
                    Stay contact
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              {reserveError && (
                <div className="text-sm text-rose-600">{reserveError}</div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenReserve(false)}
                  className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reserveLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md hover:shadow-lg"
                >
                  {reserveLoading ? "Booking…" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openSuccess && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenSuccess(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-emerald-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3
                id="success-title"
                className="text-lg font-semibold text-gray-800"
              >
                Guest account created
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Save these credentials: they are shown <strong>only once</strong>.
            </p>

            <div className="space-y-3">
              <CopyRow
                label="Email"
                value={generatedEmail}
                onCopy={() =>
                  quickCopy(
                    generatedEmail,
                    () => setCopied("email"),
                    () => setCopied(null)
                  )
                }
                copied={copied === "email"}
              />
              <CopyRow
                label="Password"
                value={generatedPassword}
                onCopy={() =>
                  quickCopy(
                    generatedPassword,
                    () => setCopied("password"),
                    () => setCopied(null)
                  )
                }
                copied={copied === "password"}
                secret
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => setOpenSuccess(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md hover:shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
  copied,
  secret,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied?: boolean;
  secret?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-gray-50 px-3 py-2">
      <div>
        <div className="text-[11px] text-gray-500">{label}</div>
        <div className="font-mono text-sm text-gray-800 select-all">
          {secret ? "••••••••••••" : value}
        </div>
      </div>
      <button
        onClick={onCopy}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-white text-sm hover:bg-gray-50"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

async function quickCopy(text: string, onOk: () => void, onClear?: () => void) {
  try {
    await navigator.clipboard.writeText(text);
    onOk();
    if (onClear) {
      setTimeout(() => onClear(), 1200);
    }
  } catch {
    /* ignore */
  }
}
