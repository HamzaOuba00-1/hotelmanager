import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getAvailableRooms, reserveRoom } from "./../api/publicApi";
import { PublicRoom } from "./../types/publicTypes";
import { buildStartISO, buildEndISO, defaultArrival, defaultDeparture } from "./../utils/datetime";
import {
  CalendarRange,
  Crown,
  DoorOpen,
  BedDouble,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";

type ProblemDetail = { type?: string; title?: string; status?: number; detail?: string };

export default function PublicRoomsPage() {
  // ---- hotelId depuis l'URL /hotels/:hotelId/rooms
  const { hotelId } = useParams();
  const HOTEL_ID = Number(hotelId);

  // ---- dates
  const [arrival, setArrival] = useState<string>(() => defaultArrival());
  const [departure, setDeparture] = useState<string>(() => defaultDeparture());
  const startAtISO = useMemo(() => buildStartISO(arrival), [arrival]);
  const endAtISO   = useMemo(() => buildEndISO(departure), [departure]);

  // ---- data
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ---- modale réservation
  const [openReserve, setOpenReserve] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<PublicRoom | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError]     = useState<string | null>(null);

  // ---- modale succès
  const [openSuccess, setOpenSuccess] = useState(false);
  const [generatedEmail, setGeneratedEmail]       = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  // ---- fetch des dispos
  const loadAvailable = useCallback(async () => {
    if (!HOTEL_ID || Number.isNaN(HOTEL_ID)) {
      setErr("Hôtel invalide.");
      return;
    }
    if (!arrival || !departure) return;
    if (new Date(arrival) >= new Date(departure)) {
      setErr("La date d'arrivée doit être antérieure à la date de départ.");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const data = await getAvailableRooms(HOTEL_ID, startAtISO, endAtISO);
      setPublicRooms(data);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [HOTEL_ID, arrival, departure, startAtISO, endAtISO]);

  useEffect(() => {
    // charge au premier rendu et quand l'hôtel change
    loadAvailable();
  }, [loadAvailable]);

  // ---- actions
  function openReserveFor(room: PublicRoom) {
    setSelectedRoom(room);
    setFirstName("");
    setLastName("");
    setReserveError(null);
    setOpenReserve(true);
  }

  async function submitReserve(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoom || !HOTEL_ID) return;
    try {
      setReserveLoading(true);
      setReserveError(null);
      const res = await reserveRoom({
        hotelId: HOTEL_ID,
        roomId: selectedRoom.id,
        firstName,
        lastName,
        startAt: startAtISO,
        endAt: endAtISO,
      });
      // succès → affiche identifiants une seule fois
      setOpenReserve(false);
      setGeneratedEmail(res.email);
      setGeneratedPassword(res.generatedPassword);
      setOpenSuccess(true);
      await loadAvailable(); // la chambre devient RESERVEE côté back
    } catch (e: any) {
      const pd: ProblemDetail | undefined = e?.response?.data;
      if ((e?.response?.status ?? 0) === 409) {
        setReserveError(pd?.detail || "Créneau déjà pris. Actualisation des disponibilités…");
        await loadAvailable();
      } else {
        setReserveError(pd?.detail || pd?.title || e?.message || "Réservation impossible.");
      }
    } finally {
      setReserveLoading(false);
    }
  }

  // ---- UI
  const canSearch = arrival && departure && new Date(arrival) < new Date(departure);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-emerald-50">
      {/* Header luxe */}
      <div className="relative">
        <header className="max-w-6xl mx-auto px-6 pt-10 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg flex items-center justify-center">
              <Crown className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Réservation — Hôtel
              </h1>
              <p className="text-sm text-gray-500">Une touche de luxe, simplement.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm">Paiement sécurisé (prochainement)</span>
          </div>
        </header>
      </div>

      {/* Barre dates */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur-sm shadow-[0_8px_35px_rgba(16,185,129,0.08)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <CalendarRange className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-800">Sélectionnez vos dates</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Arrivée</label>
              <input
                type="date"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Départ</label>
              <input
                type="date"
                value={departure}
                min={arrival || undefined}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-1 flex items-end">
              <button
                onClick={loadAvailable}
                disabled={!canSearch}
                className={`w-full px-4 py-2 rounded-xl text-white shadow-lg transition
                  ${canSearch ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:scale-[1.02]" : "bg-gray-300 cursor-not-allowed"}
                `}
              >
                Rechercher
              </button>
            </div>
          </div>

          {err && <div className="mt-3 text-sm text-rose-600">{err}</div>}
        </div>
      </div>

      {/* Liste des chambres dispo */}
      <div className="max-w-6xl mx-auto px-6 mt-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/70 shadow animate-pulse" />
            ))}
          </div>
        ) : publicRooms.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            Aucune chambre disponible sur cet intervalle. Essayez d’autres dates.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicRooms.map((room) => (
              <div
                key={room.id}
                className="group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition" />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">Étage {room.floor}</div>
                  <span className="px-2 py-0.5 text-[11px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Disponible
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-gray-800">
                  <DoorOpen className="w-6 h-6 text-emerald-600" />
                  {String(room.roomNumber).padStart(3, "0")}
                </div>
                <div className="text-sm text-gray-500">{room.roomType}</div>
                {room.description && (
                  <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {room.description}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 text-sm">
                    <BedDouble className="w-4 h-4" />
                    Confort premium
                  </div>
                  <button
                    onClick={() => openReserveFor(room)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition"
                  >
                    Réserver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Réserver */}
      {openReserve && selectedRoom && (
        <div role="dialog" aria-modal="true" aria-labelledby="reserve-title" className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenReserve(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-emerald-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-5 h-5 text-emerald-600" />
              <h3 id="reserve-title" className="text-lg font-semibold text-gray-800">Finaliser la réservation</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Chambre <strong>{String(selectedRoom.roomNumber).padStart(3, "0")}</strong> — {selectedRoom.roomType}
            </p>

            <form onSubmit={submitReserve} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Prénom</label>
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {reserveError && <div className="text-sm text-rose-600">{reserveError}</div>}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpenReserve(false)} className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" disabled={reserveLoading} className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg">
                  {reserveLoading ? "Réservation…" : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Succès (identifiants affichés une seule fois) */}
      {openSuccess && (
        <div role="dialog" aria-modal="true" aria-labelledby="success-title" className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenSuccess(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-emerald-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 id="success-title" className="text-lg font-semibold text-gray-800">Compte client créé</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Conservez ces identifiants : ils sont affichés <strong>une seule fois</strong>.
            </p>

            <div className="space-y-3">
              <CopyRow
                label="Email"
                value={generatedEmail}
                onCopy={() => quickCopy(generatedEmail, () => setCopied("email"))}
                copied={copied === "email"}
              />
              <CopyRow
                label="Mot de passe"
                value={generatedPassword}
                onCopy={() => quickCopy(generatedPassword, () => setCopied("password"))}
                copied={copied === "password"}
                secret
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button onClick={() => setOpenSuccess(false)} className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg">
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------- util UI --------- */
function CopyRow({
  label, value, onCopy, copied, secret,
}: { label: string; value: string; onCopy: () => void; copied?: boolean; secret?: boolean }) {
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
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copié" : "Copier"}
      </button>
    </div>
  );
}

async function quickCopy(text: string, onOk: () => void) {
  try {
    await navigator.clipboard.writeText(text);
    onOk();
    setTimeout(() => onOk(), 1200);
  } catch { /* ignore */ }
}
