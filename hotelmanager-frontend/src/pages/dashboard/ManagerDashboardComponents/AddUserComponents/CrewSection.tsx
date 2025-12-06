import React, { useEffect, useState, useCallback } from "react";
import { getCrews } from "../../../../api/crewApi";
import { Crew, ServiceType } from "../../../../types/Crew";
import { User } from "../../../../types/User";
import AddCrewModal from "./AddCrewModal";
import CrewDetailsModal from "./CrewDetailsModal";

import {
  Users,
  DoorOpen,
  Hotel,
  Drill,
  Utensils,
  Martini,
  ConciergeBell,
  Bubbles,
  Shield,
  MonitorCog,
  HandCoins,
  ChefHat,
  Network,
} from "lucide-react";

type Props = { allUsers: User[] };

const serviceIcon = (s: ServiceType) => {
  const cls = "w-8 h-8";
  switch (s) {
    case "RECEPTION":
      return <Hotel className={cls} />;
    case "HOUSEKEEPING":
      return <DoorOpen className={cls} />;
    case "MAINTENANCE":
      return <Drill className={cls} />;
    case "KITCHEN":
      return <ChefHat className={cls} />;
    case "RESTAURANT":
      return <Utensils className={cls} />;
    case "BAR":
      return <Martini className={cls} />;
    case "CONCIERGE":
      return <ConciergeBell className={cls} />;
    case "SPA":
      return <Bubbles className={cls} />;
    case "SECURITY":
      return <Shield className={cls} />;
    case "IT":
      return <MonitorCog className={cls} />;
    case "FINANCE":
      return <HandCoins className={cls} />;
    case "HR":
      return <Network className={cls} />;
    default:
      return <Users className={cls} />;
  }
};

const CrewSection: React.FC<Props> = ({ allUsers }) => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCrewId, setSelectedCrewId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCrews();
      setCrews(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="mt-12">
      {/* Header + bouton d’ajout */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-wide text-gray-800">
          Crews / Services
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 h-12 flex items-center justify-center text-base font-medium text-white
                     bg-gradient-to-br from-[#47B881] to-[#34A384] rounded-2xl shadow-lg
                     hover:scale-105 transition-transform"
        >
          Ajouter un crew
        </button>
      </div>

      {/* Liste en carrés cliquables */}
      <div className="flex flex-wrap gap-6">
        {crews.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCrewId(c.id)}
            className="flex flex-col items-center justify-center w-44 h-44 p-5 rounded-3xl 
                       bg-white/50 backdrop-blur-xl border border-white/30 
                       shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-white/20 
                       transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            title="Voir les détails"
          >
            <div className="h-10 w-10 text-[#47B881] mb-2 flex items-center justify-center">
              {serviceIcon(c.service)}
            </div>
            <div className="text-base font-semibold text-gray-800 text-center tracking-wide">
              {c.name}
            </div>
            <div className="text-[12px] text-gray-500 uppercase mt-1 tracking-widest">
              {c.service}
            </div>
          </button>
        ))}
      </div>

      {loading && <div className="mt-4 text-sm text-gray-500">Chargement…</div>}

      {showAddModal && (
        <AddCrewModal
          onClose={() => setShowAddModal(false)}
          onSuccess={refresh}
          allUsers={allUsers}
        />
      )}

      {selectedCrewId !== null && (
        <CrewDetailsModal
          crewId={selectedCrewId}
          onClose={() => setSelectedCrewId(null)}
          onSaved={refresh}
          onDeleted={refresh}
          allUsers={allUsers}
        />
      )}
    </div>
  );
};

export default CrewSection;
