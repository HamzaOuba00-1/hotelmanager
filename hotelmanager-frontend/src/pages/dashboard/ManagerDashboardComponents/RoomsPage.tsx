import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../auth/authContext";
import { BedDouble, List, Plus } from "lucide-react";
import RoomFormPremium from "./RoomComponents/RoomForm";
import RoomsTable, { Room } from "./RoomComponents/RoomsTable";
import RoomFilterPremium from "./RoomComponents/RoomFilter";
import { createPortal } from "react-dom";

export default function RoomsPage() {
  const { user } = useAuth();
  const token = localStorage.getItem("token") || "";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "FLOOR" | "STATE">("ALL");
  const [filterValue, setFilterValue] = useState("");
  const [showForm, setShowForm] = useState(false);

  const isManager = user?.role === "MANAGER";
  const isEmployee = user?.role === "EMPLOYE";
  const isClient = user?.role === "CLIENT";

  /* ---------- Récupération chambres ---------- */
  const fetchRooms = useCallback(async () => {
    if (!token) return;
    let url = "http://localhost:8080/api/rooms";
    if (isClient) url = "http://localhost:8080/api/rooms/my-room";

    const { data } = await axios.get<Room | Room[]>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setRooms(Array.isArray(data) ? data : [data]);
  }, [token, isClient]);

  /* ---------- Récupération config hôtel ---------- */
  const fetchHotelConfig = useCallback(async () => {
    if (!token) return;
    const { data } = await axios.get<{ roomTypes: string[] }>(
      "http://localhost:8080/hotels/me",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (data.roomTypes?.length) setRoomTypes(data.roomTypes);
  }, [token]);

  /* ---------- Chargement au montage ---------- */
  useEffect(() => {
    fetchHotelConfig();
    fetchRooms();
  }, [fetchHotelConfig, fetchRooms]);

  /* ---------- Liste des étages dynamiques ---------- */
  const floorsList = Array.from(new Set(rooms.map((r) => r.floor))).sort();

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Titre + bouton centrés */}
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
          <BedDouble className="w-8 h-8 text-emerald-600" />
          Gestion des chambres
        </h1>

        {isManager && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg hover:shadow-emerald-300/50 hover:scale-[1.03] transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Ajouter une chambre
          </button>
        )}
      </div>

      {/* Liste + Filtre */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-700">
            <List className="w-6 h-6 text-emerald-500" /> Liste des chambres
          </h3>
          <RoomFilterPremium
            floors={floorsList}
            onFilterChange={(type, value) => {
              setFilterType(type);
              setFilterValue(value);
            }}
          />
        </div>

        <RoomsTable
          rooms={rooms}
          token={token}
          isManager={isManager}
          isEmployee={isEmployee}
          onRefresh={fetchRooms}
          filterType={filterType}
          selectedFloor={filterType === "FLOOR" ? filterValue : ""}
          selectedState={filterType === "STATE" ? filterValue : ""}
          roomTypes={roomTypes}
        />
      </div>

      {/* Modal luxe */}
      {showForm &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
            <RoomFormPremium
              token={token}
              roomTypes={roomTypes}
              onCreated={() => {
                fetchRooms();
                setShowForm(false);
              }}
              onClose={() => setShowForm(false)}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
