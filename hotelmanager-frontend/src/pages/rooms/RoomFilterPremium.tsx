import { useState } from "react";
import { Filter } from "lucide-react";

interface RoomFilterProps {
  floors: string[];
  onFilterChange: (type: "ALL" | "FLOOR" | "STATE", value: string) => void;
}

export default function RoomFilterPremium({ floors, onFilterChange }: RoomFilterProps) {
  const [filterType, setFilterType] = useState<"ALL" | "FLOOR" | "STATE">("ALL");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [open, setOpen] = useState(false);

  const handleTypeChange = (type: "ALL" | "FLOOR" | "STATE") => {
    setFilterType(type);
    setSelectedFloor("");
    setSelectedState("");
    onFilterChange(type, "");
  };

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
      {/* Bouton principal */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow hover:shadow-lg transition"
      >
        <Filter className="w-5 h-5" />
        Filtrer
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border shadow-xl p-4 space-y-3 animate-fadeIn z-50">
          {/* Type de filtre */}
          <label className="block text-sm font-medium text-gray-700">Type de filtre</label>
          <select
            value={filterType}
            onChange={(e) => handleTypeChange(e.target.value as "ALL" | "FLOOR" | "STATE")}
            className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Tout afficher</option>
            <option value="FLOOR">Par étage</option>
            <option value="STATE">Par état</option>
          </select>

          {/* Choix étage */}
          {filterType === "FLOOR" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Choisir étage</label>
              <select
                value={selectedFloor}
                onChange={(e) => applyFilter(e.target.value)}
                className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Tous</option>
                {floors.map((f) => (
                  <option key={f} value={f}>
                    Étage {f}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Choix état */}
          {filterType === "STATE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Choisir état</label>
              <select
                value={selectedState}
                onChange={(e) => applyFilter(e.target.value)}
                className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Tous</option>
                <option value="LIBRE">Libre</option>
                <option value="OCCUPEE">Occupée</option>
                <option value="EN_NETTOYAGE">En nettoyage</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
