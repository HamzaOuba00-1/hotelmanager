import axios from "axios";
import { Bed, SprayCan, DoorOpen, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import RoomStateSelector from "./RoomStateSelector";
import RoomEditModal from "./RoomEditModal";

export interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  floor: string;
  description: string;
  roomState: string;
}

interface RoomsTableProps {
  rooms: Room[];
  token: string;
  isManager: boolean;
  isEmployee: boolean;
  onRefresh: () => void;
  filterType: "ALL" | "FLOOR" | "STATE";
  selectedFloor: string;
  selectedState: string;
  roomTypes: string[];
}

export default function RoomsTable({
  rooms,
  token,
  isManager,
  isEmployee,
  onRefresh,
  filterType,
  selectedFloor,
  selectedState,
  roomTypes,
}: RoomsTableProps) {
  const [openMenuRoomId, setOpenMenuRoomId] = useState<number | null>(null);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  const [stateChangeData, setStateChangeData] = useState<{ room: Room; newState: string } | null>(null);
  const [showDeleteBlockedModal, setShowDeleteBlockedModal] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null)

  const handleDelete = async (id: number) => {
    await axios.delete(`http://localhost:8080/api/rooms/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    onRefresh();
  };

  const handleConfirmStateChange = async () => {
  if (!stateChangeData) return;
  try {
    await axios.patch(
      `http://localhost:8080/api/rooms/${stateChangeData.room.id}/state`,
      { state: stateChangeData.newState },                  // JSON body (pas query)
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setStateChangeData(null);
    onRefresh();
  } catch (err: any) {
    const status = err?.response?.status;
    const pd = err?.response?.data; // ProblemDetail { title, detail, ... }
    if (status === 409) {
      setStateError(pd?.detail || "Transition non autorisée.");
    } else if (status === 400) {
      setStateError(pd?.detail || pd?.title || "Requête invalide.");
    } else {
      setStateError(err?.message || "Erreur inattendue.");
    }
  }
};

  // en haut du fichier RoomsTable.tsx
  const ALLOWED: Record<string, string[]> = {
    LIBRE: ["RESERVEE", "CHECKIN", "ROOM_SERVICE"],
    RESERVEE: ["CHECKIN", "A_VALIDER_LIBRE", "LIBRE"],
    CHECKIN: ["ROOM_SERVICE", "CHECKOUT"],
    CHECKOUT: ["A_NETTOYER"],
    A_NETTOYER: ["EN_NETTOYAGE"],
    EN_NETTOYAGE: ["A_VALIDER_CLEAN"],
    A_VALIDER_CLEAN: ["LIBRE", "A_NETTOYER"],
    ROOM_SERVICE: ["A_NETTOYER", "A_VALIDER_CLEAN", "LIBRE"],
    A_VALIDER_LIBRE: ["LIBRE"],
  };


  const stateStyles: Record<
    string,
    { gradient: string; glow: string; text: string }
  > = {
    LIBRE: {
      gradient: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      glow: "shadow-[0_4px_25px_rgba(16,185,129,0.25)]",
      text: "text-emerald-700",
    },
    RESERVEE: {
      gradient: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      glow: "shadow-[0_4px_25px_rgba(99,102,241,0.25)]",
      text: "text-indigo-700",
    },
    CHECKIN: {
      gradient: "bg-gradient-to-br from-blue-50 to-blue-100",
      glow: "shadow-[0_4px_25px_rgba(59,130,246,0.25)]",
      text: "text-blue-700",
    },
    ROOM_SERVICE: {
      gradient: "bg-gradient-to-br from-amber-50 to-amber-100",
      glow: "shadow-[0_4px_25px_rgba(245,158,11,0.25)]",
      text: "text-amber-700",
    },
    CHECKOUT: {
      gradient: "bg-gradient-to-br from-cyan-50 to-cyan-100",
      glow: "shadow-[0_4px_25px_rgba(34,211,238,0.25)]",
      text: "text-cyan-700",
    },
    A_VALIDER_LIBRE: {
      gradient: "bg-gradient-to-br from-lime-50 to-lime-100",
      glow: "shadow-[0_4px_25px_rgba(132,204,22,0.25)]",
      text: "text-lime-700",
    },
    A_NETTOYER: {
      gradient: "bg-gradient-to-br from-rose-50 to-rose-100",
      glow: "shadow-[0_4px_25px_rgba(244,63,94,0.25)]",
      text: "text-rose-700",
    },
    EN_NETTOYAGE: {
      gradient: "bg-gradient-to-br from-orange-50 to-orange-100",
      glow: "shadow-[0_4px_25px_rgba(249,115,22,0.25)]",
      text: "text-orange-700",
    },
    A_VALIDER_CLEAN: {
      gradient: "bg-gradient-to-br from-teal-50 to-teal-100",
      glow: "shadow-[0_4px_25px_rgba(20,184,166,0.25)]",
      text: "text-teal-700",
    },
    DEFAULT: {
      gradient: "bg-gradient-to-br from-gray-50 to-gray-100",
      glow: "shadow-none",
      text: "text-gray-700",
    },
  };


  const getStateIcon = (state: string) => {
    switch (state) {
      case "LIBRE": return <DoorOpen className="w-8 h-8" />;
      case "OCCUPEE": return <Bed className="w-8 h-8" />;
      case "EN_NETTOYAGE": return <SprayCan className="w-8 h-8" />;
      default: return <Bed className="w-8 h-8" />;
    }
  };

  let filteredRooms = [...rooms];
  if (filterType === "FLOOR" && selectedFloor) {
    filteredRooms = filteredRooms.filter(r => String(r.floor) === String(selectedFloor));
  }
  if (filterType === "STATE" && selectedState) {
    filteredRooms = filteredRooms.filter(r => r.roomState === selectedState);
  }

  const sortedRooms = [...filteredRooms].sort((a, b) =>
    String(a.roomNumber ?? "").padStart(3, "0").localeCompare(
      String(b.roomNumber ?? "").padStart(3, "0"),
      undefined,
      { numeric: true }
    )
  );

  return (
    <>
      {/* Liste des chambres */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {sortedRooms.map((room) => {
          const style = stateStyles[room.roomState] || stateStyles.DEFAULT;
          const isMenuOpen = openMenuRoomId === room.id;

          return (
            <div
              key={room.id}
              className={`relative flex flex-col items-center p-4 rounded-2xl border border-white 
                ${style.gradient} ${style.glow} backdrop-blur-sm transition-all duration-300 
                hover:scale-[1.02] hover:shadow-lg ${isMenuOpen ? "z-50" : ""}`}
            >
              <div className="text-[11px] opacity-60 mb-3">Étage {room.floor}</div>

              <div className={`flex items-center gap-2 text-2xl font-bold mb-3 ${style.text}`}>
                {getStateIcon(room.roomState)}
                {room.roomNumber?.toString().padStart(3, "0")}
              </div>

              <div className="text-xs font-semibold opacity-80 mb-2">{room.roomType}</div>

              {(isManager || isEmployee) && (
                <RoomStateSelector
                  currentState={room.roomState}
                  roomId={room.id}
                  onRequestStateChange={(newState) => setStateChangeData({ room, newState })}
                  openMenuRoomId={openMenuRoomId}
                  setOpenMenuRoomId={setOpenMenuRoomId}
                  allowedTargets={ALLOWED[room.roomState] ?? []}
                />
              )}

              {isManager && (
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => setEditRoom(room)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition"
                  >
                    <Pencil className="w-3 h-3" /> Éditer
                  </button>
                  <button
                    onClick={() => setDeleteRoom(room)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal d'édition */}
      {editRoom && (
        <RoomEditModal
          room={{
            ...editRoom!,
            roomNumber: String(editRoom!.roomNumber),
            floor: String(editRoom!.floor),
          }}
          roomTypes={roomTypes}
          onUpdated={onRefresh}
          onClose={() => setEditRoom(null)} token={""}        />

      )}

      {/* Modal confirmation suppression */}
      {deleteRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-center space-y-5">
            <p className="text-gray-700 text-lg">
              Voulez-vous vraiment supprimer la chambre <strong>{deleteRoom.roomNumber}</strong> ?
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setDeleteRoom(null)}
                className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (
                    deleteRoom.roomState === "OCCUPEE" ||
                    deleteRoom.roomState === "EN_NETTOYAGE"
                  ) {
                    setShowDeleteBlockedModal(true);
                  } else {
                    handleDelete(deleteRoom.id);
                    setDeleteRoom(null);
                  }
                }}
                className="px-6 py-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md hover:shadow-lg transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal blocage suppression */}
      {showDeleteBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-center space-y-5">
            <h2 className="text-xl font-bold text-red-600">Suppression impossible</h2>
            <p className="text-gray-700 text-md">
              La chambre <strong>{deleteRoom?.roomNumber}</strong> est actuellement{" "}
              <strong>{deleteRoom?.roomState}</strong>. Elle ne peut être supprimée
              que lorsqu'elle est <strong>libre</strong>.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  setShowDeleteBlockedModal(false);
                  setDeleteRoom(null);
                }}
                className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation changement état */}
      {stateChangeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-center space-y-5">
            <p className="text-gray-700 text-lg">
              Changer l'état de la chambre <strong>{stateChangeData.room.roomNumber}</strong> vers{" "}
              <strong>{stateChangeData.newState}</strong> ?
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setStateChangeData(null)}
                className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmStateChange}
                className="px-6 py-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
