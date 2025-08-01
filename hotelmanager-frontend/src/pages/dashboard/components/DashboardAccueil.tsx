import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyHotel } from "../../../api/hotelApi";

export default function DashboardAccueil() {
  const [hotel, setHotel] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => { getMyHotel().then(setHotel); }, []);

  const needsConfig = !hotel || !hotel.address || !hotel.checkInHour;

  return (
    <div className="space-y-6">
      <div className="text-lg font-medium">
        Bienvenue sur le Dashboard{hotel?.name ? ` – ${hotel.name}` : ""}
      </div>

      {needsConfig && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
          <div className="font-semibold text-amber-800">Configuration requise</div>
          <p className="text-amber-700 text-sm mt-1">
            Pour activer toutes les fonctionnalités, veuillez compléter la configuration
            de votre hôtel (coordonnées, horaires, services…).
          </p>
          <button
            onClick={() => navigate("/dashboard/manager/configuration")}
            className="mt-3 inline-flex items-center rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white"
          >
            Ouvrir la configuration
          </button>
        </div>
      )}
    </div>
  );
}
