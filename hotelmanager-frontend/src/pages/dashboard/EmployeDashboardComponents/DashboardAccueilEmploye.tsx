import React, {
  useEffect,
  useState,
  useMemo,
  type CSSProperties,
} from "react";
import {
  Calendar,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getIssuesForMyHotel, type Issue } from "../../../api/issueApi";
import { getMe, getUsersFromMyHotel } from "../../../api/userApi";
import type { User } from "../../../types/User";

type IssueStats = {
  open: number;
  resolved: number;
  important: number;
};

const DashboardAccueilEmploye: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);

  // 1) Charger les signalements de l'hôtel (indépendant de l'utilisateur)
  useEffect(() => {
    const loadIssues = async () => {
      setLoadingIssues(true);
      try {
        const { data } = await getIssuesForMyHotel();
        setIssues(data || []);
      } catch (e) {
        console.error("Erreur chargement issues :", e);
      } finally {
        setLoadingIssues(false);
      }
    };

    loadIssues();
  }, []);

  // 2) Charger l'utilisateur courant (email + user de l'hôtel)
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const meEmail = await getMe(); // /auth/me → string (email)
        const users = await getUsersFromMyHotel();
        const meUser = users.find((u) => u.email === meEmail) || null;
        setCurrentUser(meUser);
      } catch (e) {
        console.error("Erreur chargement utilisateur courant :", e);
        // si ça casse, on laisse currentUser = null
      }
    };

    loadCurrentUser();
  }, []);

  // 3) Stats seulement sur MES signalements (fallback = tous si currentUser introuvable)
  const ownStats: IssueStats = useMemo(() => {
    // si l'utilisateur n'est pas encore identifié, on considère tous les issues
    const mine: Issue[] =
      currentUser == null
        ? issues
        : issues.filter((i) => i.createdById === currentUser.id);

    const open = mine.filter((i) => i.status === "OPEN").length;
    const resolved = mine.filter((i) => i.status === "RESOLVED").length;
    const important = mine.filter((i) => i.important).length;

    return { open, resolved, important };
  }, [issues, currentUser]);

  // 4) Calcul du donut
  const { total, openDeg, resolvedDegEnd } = useMemo(() => {
    const totalCount = ownStats.open + ownStats.resolved;
    if (totalCount === 0) {
      return { total: 0, openDeg: 0, resolvedDegEnd: 0 };
    }

    const openPct = (ownStats.open / totalCount) * 100;
    const resolvedPct = (ownStats.resolved / totalCount) * 100;

    const openDegLocal = (openPct * 360) / 100;
    const resolvedDegEndLocal = ((openPct + resolvedPct) * 360) / 100;

    return {
      total: totalCount,
      openDeg: openDegLocal,
      resolvedDegEnd: resolvedDegEndLocal,
    };
  }, [ownStats]);

  const circleStyle: CSSProperties =
    total === 0
      ? {
          backgroundImage: "conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)",
        }
      : {
          backgroundImage: `conic-gradient(
            #f97316 0deg,
            #f97316 ${openDeg}deg,
            #22c55e ${openDeg}deg,
            #22c55e ${resolvedDegEnd}deg,
            #e5e7eb ${resolvedDegEnd}deg,
            #e5e7eb 360deg
          )`,
        };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenue
          {currentUser ? `, ${currentUser.firstName} 👋` : " 👋"}
        </h1>
        <p className="text-gray-500">
          Voici un aperçu de vos informations et actions rapides.
        </p>
      </div>

      {/* Cartes actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/employe/planning"
          className="p-6 bg-white shadow rounded-lg hover:shadow-md transition"
        >
          <Calendar className="h-8 w-8 text-emerald-500 mb-4" />
          <h2 className="text-lg font-semibold">Voir mon planning</h2>
          <p className="text-gray-500 text-sm">
            Consultez vos prochains shifts
          </p>
        </Link>

        <Link
          to="/dashboard/employe/pointage"
          className="p-6 bg-white shadow rounded-lg hover:shadow-md transition"
        >
          <UserCheck className="h-8 w-8 text-blue-500 mb-4" />
          <h2 className="text-lg font-semibold">Pointer</h2>
          <p className="text-gray-500 text-sm">
            Enregistrer votre arrivée ou départ
          </p>
        </Link>

        <Link
          to="/dashboard/employe/rooms"
          className="p-6 bg-white shadow rounded-lg hover:shadow-md transition"
        >
          <Clock className="h-8 w-8 text-orange-500 mb-4" />
          <h2 className="text-lg font-semibold">Voir mes tâches</h2>
          <p className="text-gray-500 text-sm">
            Consultez les tâches assignées
          </p>
        </Link>
      </div>

      {/* KPIs + donut "mes signalements" */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total heures ce mois</p>
          <p className="text-2xl font-bold">120h</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Présences ce mois</p>
          <p className="text-2xl font-bold">18</p>
        </div>

        {/* KPI 3 : diagramme circulaire de MES signalements (ou de tous si currentUser est inconnu) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-emerald-500" />
              Mes signalements
            </p>
            <Link
              to="/dashboard/employe/issues"
              className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
            >
              Voir
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full" style={circleStyle} />
              <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-[10px] text-gray-500">Total</span>
                <span className="text-lg font-bold text-gray-800">
                  {total}
                </span>
              </div>
            </div>

            {/* Légende */}
            <div className="flex-1 space-y-1 text-xs sm:text-sm">
              {loadingIssues ? (
                <div className="text-xs text-gray-500">
                  Chargement de vos signalements…
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-gray-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Ouverts
                      </span>
                    </div>
                    <span className="font-medium text-gray-800">
                      {ownStats.open}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-gray-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        Résolus
                      </span>
                    </div>
                    <span className="font-medium text-gray-800">
                      {ownStats.resolved}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Importants</span>
                    <span className="font-medium text-gray-700">
                      {ownStats.important}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAccueilEmploye;
