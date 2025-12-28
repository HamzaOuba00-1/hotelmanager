import { useEffect, useState, useCallback, useMemo, type FC } from "react";
import axios from "axios";
import { useAuth } from "../../auth/context/authContext";
import { BedDouble, List, Plus } from "lucide-react";
import RoomFormPremium from "../components/RoomForm";
import RoomsTable, { Room } from "../components/RoomsTable";
import RoomFilterPremium from "../components/RoomFilter";
import { createPortal } from "react-dom";
import { DEFAULT_ROOM_TYPES } from "../../hotel/components/HotelStructureCard";

// ✅ Petit KPI réutilisable (déclaré خارج composant)
const RoomKpi: FC<{ label: string; value: number | string }> = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border bg-white/60 backdrop-blur p-4 shadow-sm">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-2xl font-bold text-gray-800 mt-1">{value}</div>
  </div>
);

export default function RoomsPage() {
  const { user } = useAuth();
  const token = localStorage.getItem("token") || "";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotelRoomTypes, setHotelRoomTypes] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "FLOOR" | "STATE">(
    "ALL"
  );
  const [filterValue, setFilterValue] = useState("");
  const [showForm, setShowForm] = useState(false);

  const isManager = user?.role === "MANAGER";
  const isEmployee = user?.role === "EMPLOYE";
  const isClient = user?.role === "CLIENT";

  const fetchRooms = useCallback(async () => {
    if (!token) return;

    let url = "http://localhost:8080/api/rooms";
    if (isClient) url = "http://localhost:8080/api/rooms/my-room";

    const { data } = await axios.get<Room | Room[]>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setRooms(Array.isArray(data) ? data : [data]);
  }, [token, isClient]);

  const fetchHotelConfig = useCallback(async () => {
    if (!token || isClient) return;

    // ⚠️ Garde ton endpoint actuel si c'est bien celui de ton backend
    // Si jamais tu as un /api/hotels/me, tu peux remplacer ici.
    const { data } = await axios.get<{ roomTypes: string[] }>(
      "http://localhost:8080/hotels/me",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setHotelRoomTypes(data.roomTypes ?? []);
  }, [token, isClient]);

  useEffect(() => {
    fetchHotelConfig();
    fetchRooms();
  }, [fetchHotelConfig, fetchRooms]);

  // ✅ Liste finale pour le select : TOUS les types
  const allRoomTypes = useMemo(() => {
    const merged = new Set<string>([...DEFAULT_ROOM_TYPES, ...hotelRoomTypes]);
    return Array.from(merged);
  }, [hotelRoomTypes]);

  const floorsList = useMemo(
    () => Array.from(new Set(rooms.map((r) => String(r.floor)))).sort(),
    [rooms]
  );

  // ✅ KPIs rooms basés sur RoomState
  const roomKpis = useMemo(() => {
    const total = rooms.length;

    const libre = rooms.filter((r) => r.roomState === "LIBRE").length;
    const reservee = rooms.filter((r) => r.roomState === "RESERVEE").length;

    const checkin = rooms.filter((r) => r.roomState === "CHECKIN").length;
    const roomService = rooms.filter(
      (r) => r.roomState === "ROOM_SERVICE"
    ).length;

    const aNettoyer = rooms.filter((r) => r.roomState === "A_NETTOYER").length;
    const enNettoyage = rooms.filter(
      (r) => r.roomState === "EN_NETTOYAGE"
    ).length;

    const maintenance = rooms.filter(
      (r) => r.roomState === "MAINTENANCE"
    ).length;

    const inactive = rooms.filter((r) => r.roomState === "INACTIVE").length;

    // ✅ Occupées = CHECKIN + ROOM_SERVICE
    const occupied = checkin + roomService;

    return {
      total,
      libre,
      reservee,
      occupied,
      checkin,
      roomService,
      aNettoyer,
      enNettoyage,
      maintenance,
      inactive,
    };
  }, [rooms]);

  return (
    <div className="container mx-auto p-6 space-y-8">
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

        {/* ✅ KPIs Rooms (pas pour client) */}
        {!isClient && (
          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <RoomKpi label="Total chambres" value={roomKpis.total} />
              <RoomKpi label="Occupées" value={roomKpis.occupied} />
              <RoomKpi label="Libres" value={roomKpis.libre} />
              <RoomKpi label="Réservées" value={roomKpis.reservee} />
              <RoomKpi label="À nettoyer" value={roomKpis.aNettoyer} />
            </div>


          </div>
        )}
      </div>

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
          roomTypes={allRoomTypes}
        />
      </div>

      {showForm &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
            <RoomFormPremium
              token={token}
              roomTypes={allRoomTypes}
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
