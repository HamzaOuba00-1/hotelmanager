import { useState } from "react";
import { Bed, DoorOpen, SprayCan, Wrench, CheckCircle, ClipboardCheck, RefreshCw } from "lucide-react";

interface RoomStateSelectorProps {
  roomId: number;
  currentState: string;
  onRequestStateChange: (newState: string) => void;
  openMenuRoomId: number | null;
  setOpenMenuRoomId: (id: number | null) => void;
  /** Liste des cibles autorisées depuis l'état courant (optionnelle).
   *  Si fournie, seules ces valeurs seront proposées. */
  allowedTargets?: string[];
}

const stateOptions = [
  { value: "LIBRE",            label: "Libre",              icon: DoorOpen,       color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "RESERVEE",         label: "Réservée",           icon: ClipboardCheck, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "CHECKIN",          label: "Check-in",           icon: Bed,            color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "ROOM_SERVICE",     label: "Room service",       icon: Wrench,         color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "CHECKOUT",         label: "Check-out",          icon: RefreshCw,      color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { value: "A_VALIDER_LIBRE",  label: "À valider (libre)",  icon: CheckCircle,    color: "bg-lime-50 text-lime-700 border-lime-200" },
  { value: "A_NETTOYER",       label: "À nettoyer",         icon: SprayCan,       color: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "EN_NETTOYAGE",     label: "En nettoyage",       icon: SprayCan,       color: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "A_VALIDER_CLEAN",  label: "À valider (clean)",  icon: CheckCircle,    color: "bg-teal-50 text-teal-700 border-teal-200" },
];

export default function RoomStateSelector({
  currentState,
  onRequestStateChange,
  openMenuRoomId,
  setOpenMenuRoomId,
  roomId,
  allowedTargets,
}: RoomStateSelectorProps) {
  const open = openMenuRoomId === roomId;
  const [openUp, setOpenUp] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUp(spaceBelow < 200);
    setOpenMenuRoomId(open ? null : roomId);
  };

  const current = stateOptions.find((opt) => opt.value === currentState) || stateOptions[0];
  const CurrentIcon = current.icon;

  // 1) Point de vérité UI : si allowedTargets est fourni, on filtre dessus.
  // 2) On retire toujours l'état courant des choix.
  const filteredByAllowed = (allowedTargets && allowedTargets.length > 0)
    ? stateOptions.filter((o) => allowedTargets.includes(o.value))
    : stateOptions;

  const menuOptions = filteredByAllowed.filter((o) => o.value !== currentState);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={toggleMenu}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl border ${current.color} shadow-sm hover:shadow-md transition`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{current.label}</span>
        </div>
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden animate-fadeIn z-50 ${
            openUp ? "bottom-full mb-2" : "mt-2"
          }`}
        >
          {menuOptions.length > 0 ? (
            menuOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpenMenuRoomId(null);
                    onRequestStateChange(opt.value);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 w-full text-left text-sm hover:bg-gray-50 ${opt.color} transition`}
                >
                  <Icon className="w-4 h-4" />
                  {opt.label}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">Aucune transition disponible</div>
          )}
        </div>
      )}
    </div>
  );
}
