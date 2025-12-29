import { useState } from "react";
import { STATE_OPTIONS, RoomState } from "./roomStates";

interface RoomStateSelectorProps {
  roomId: number;
  currentState: RoomState;
  onRequestStateChange: (newState: RoomState) => void;
  openMenuRoomId: number | null;
  setOpenMenuRoomId: (id: number | null) => void;
  allowedTargets?: RoomState[];
  onOpenMenu?: () => void;
}

export default function RoomStateSelector({
  currentState,
  onRequestStateChange,
  openMenuRoomId,
  setOpenMenuRoomId,
  roomId,
  allowedTargets,
  onOpenMenu,
}: RoomStateSelectorProps) {
  const open = openMenuRoomId === roomId;
  const [openUp, setOpenUp] = useState(false);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const willOpen = !open;

    setOpenUp(spaceBelow < 200);
    setOpenMenuRoomId(willOpen ? roomId : null);
    if (willOpen) onOpenMenu?.();
  };

  const current =
    STATE_OPTIONS.find((opt) => opt.value === currentState) ??
    STATE_OPTIONS[0];

  const CurrentIcon = current.icon;

  const filteredOptions =
    allowedTargets && allowedTargets.length > 0
      ? STATE_OPTIONS.filter((o) => allowedTargets.includes(o.value))
      : STATE_OPTIONS;

  const menuOptions = filteredOptions.filter(
    (o) => o.value !== currentState
  );

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={toggleMenu}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl border ${current.color} shadow-sm hover:shadow-md transition`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change room state"
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className="w-4 h-4" aria-hidden />
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
                  aria-label={`Change state to ${opt.label}`}
                  onClick={() => {
                    setOpenMenuRoomId(null);
                    onRequestStateChange(opt.value);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 w-full text-left text-sm hover:bg-gray-50 ${opt.color} transition`}
                >
                  <Icon className="w-4 h-4" aria-hidden />
                  {opt.label}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No available transitions
            </div>
          )}
        </div>
      )}
    </div>
  );
}
