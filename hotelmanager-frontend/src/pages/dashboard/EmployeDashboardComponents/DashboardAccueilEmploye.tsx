import React from "react";
import { Calendar, Clock, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardAccueilEmploye: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Bienvenue 👋</h1>
        <p className="text-gray-500">Voici un aperçu de vos informations et actions rapides.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/employe/planning"
          className="p-6 bg-white shadow rounded-lg hover:shadow-md transition"
        >
          <Calendar className="h-8 w-8 text-emerald-500 mb-4" />
          <h2 className="text-lg font-semibold">Voir mon planning</h2>
          <p className="text-gray-500 text-sm">Consultez vos prochains shifts</p>
        </Link>

        <Link
          to="/dashboard/employe/pointage"
          className="p-6 bg-white shadow rounded-lg hover:shadow-md transition"
        >
          <UserCheck className="h-8 w-8 text-blue-500 mb-4" />
          <h2 className="text-lg font-semibold">Pointer</h2>
          <p className="text-gray-500 text-sm">Enregistrer votre arrivée ou départ</p>
        </Link>

        <Link
          to="/dashboard/employe/rooms"
          className="p-6 bg-white shadow rounded-lg hover:shadow-md transition"
        >
          <Clock className="h-8 w-8 text-orange-500 mb-4" />
          <h2 className="text-lg font-semibold">Voir mes tâches</h2>
          <p className="text-gray-500 text-sm">Consultez les tâches assignées</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total heures ce mois</p>
          <p className="text-2xl font-bold">120h</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Présences ce mois</p>
          <p className="text-2xl font-bold">18</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Absences</p>
          <p className="text-2xl font-bold">2</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardAccueilEmploye;
