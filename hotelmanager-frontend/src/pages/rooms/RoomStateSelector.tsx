import { useState } from "react";
import { Bed, DoorOpen, SprayCan, ChevronDown } from "lucide-react";

interface RoomStateSelectorProps {
  roomId: number;
  currentState: string;
  onRequestStateChange: (newState: string) => void;
  openMenuRoomId: number | null;
  setOpenMenuRoomId: (id: number | null) => void;
}

const stateOptions = [
  { value: "LIBRE", label: "Libre", icon: DoorOpen, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "OCCUPEE", label: "Occupée", icon: Bed, color: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "EN_NETTOYAGE", label: "En nettoyage", icon: SprayCan, color: "bg-amber-50 text-amber-700 border-amber-200" },
];

export default function RoomStateSelector({
  currentState,
  onRequestStateChange,
  openMenuRoomId,
  setOpenMenuRoomId,
  roomId,
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

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={toggleMenu}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl border ${current.color} shadow-sm hover:shadow-md transition`}
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{current.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`absolute w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden animate-fadeIn z-50
            ${openUp ? "bottom-full mb-2" : "mt-2"}`}
        >
          {stateOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
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
          })}
        </div>
      )}
    </div>
  );
}
