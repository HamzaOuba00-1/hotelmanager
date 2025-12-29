import { useState } from "react";
import { Filter } from "lucide-react";

interface RoomFilterProps {
  floors: string[];
  onFilterChange: (type: "ALL" | "FLOOR" | "STATE", value: string) => void;
}

export default function RoomFilterPremium({
  floors,
  onFilterChange,
}: RoomFilterProps) {
  const [filterType, setFilterType] = useState<"ALL" | "FLOOR" | "STATE">("ALL");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [open, setOpen] = useState(false);

  /* ---------- Change filter type ---------- */
  const handleTypeChange = (type: "ALL" | "FLOOR" | "STATE") => {
    setFilterType(type);
    setSelectedFloor("");
    setSelectedState("");
    onFilterChange(type, "");
  };

  /* ---------- Apply selected filter ---------- */
  const applyFilter = (value: string) => {
    if (filterType === "FLOOR") {
      setSelectedFloor(value);
      onFilterChange("FLOOR", value);
    }
    if (filterType === "STATE") {
      setSelectedState(value);
      onFilterChange("STATE", value);
    }
  };

  return (
    <div className="relative">
      {/* Main button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow hover:shadow-lg transition"
      >
        <Filter className="w-5 h-5" />
        Filter
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border shadow-xl p-4 space-y-3 animate-fadeIn z-50">
          {/* Filter type */}
          <label className="block text-sm font-medium text-gray-700">
            Filter type
          </label>
          <select
            value={filterType}
            onChange={(e) =>
              handleTypeChange(
                e.target.value as "ALL" | "FLOOR" | "STATE"
              )
            }
            className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Show all</option>
            <option value="FLOOR">By floor</option>
            <option value="STATE">By status</option>
          </select>

          {/* Floor selection */}
          {filterType === "FLOOR" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select floor
              </label>
              <select
                value={selectedFloor}
                onChange={(e) => applyFilter(e.target.value)}
                className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All floors</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor}>
                    Floor {floor}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* State selection */}
          {filterType === "STATE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select status
              </label>
              <select
                value={selectedState}
                onChange={(e) => applyFilter(e.target.value)}
                className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All statuses</option>
                <option value="LIBRE">Available</option>
                <option value="OCCUPEE">Occupied</option>
                <option value="EN_NETTOYAGE">Cleaning</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
