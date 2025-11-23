import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getMyHotel } from "../../../api/hotelApi";
import {
  getIssuesForMyHotel,
  type Issue,
} from "../../../api/issueApi";
import { AlertTriangle, CheckCircle } from "lucide-react";

type IssueStats = {
  open: number;
  resolved: number;
  important: number;
};

export default function DashboardAccueil() {
  const [hotel, setHotel] = useState<any>(null);

  const [issueStats, setIssueStats] = useState<IssueStats>({
    open: 0,
    resolved: 0,
    important: 0,
  });
  const [issuesLoading, setIssuesLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getMyHotel()
      .then(setHotel)
      .catch((e) => console.error("Erreur getMyHotel :", e));
  }, []);

  useEffect(() => {
    const loadIssues = async () => {
      setIssuesLoading(true);
      try {
        const { data } = await getIssuesForMyHotel();
        const issues: Issue[] = data || [];

        const open = issues.filter((i) => i.status === "OPEN").length;
        const resolved = issues.filter((i) => i.status === "RESOLVED").length;
        const important = issues.filter((i) => i.important).length;

        setIssueStats({ open, resolved, important });
      } catch (e) {
        console.error("Erreur chargement issues :", e);
      } finally {
        setIssuesLoading(false);
      }
    };

    loadIssues();
  }, []);

  const needsConfig = !hotel || !hotel.address || !hotel.checkInHour;

  // calcul pour le cercle
  const { total, openPct, resolvedPct } = useMemo(() => {
    const totalCount = issueStats.open + issueStats.resolved;
    if (totalCount === 0) {
      return { total: 0, openPct: 0, resolvedPct: 0 };
    }
    const o = (issueStats.open / totalCount) * 100;
    const r = (issueStats.resolved / totalCount) * 100;
    return { total: totalCount, openPct: o, resolvedPct: r };
  }, [issueStats]);

  // style dynamique du cercle (conic-gradient simple)
  const circleStyle: React.CSSProperties =
    total === 0
      ? {
          backgroundImage: "conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)",
        }
      : {
          backgroundImage: `conic-gradient(
            #f97316 0deg,
            #f97316 ${openPct}deg,
            #22c55e ${openPct}deg,
            #22c55e ${openPct + resolvedPct}deg,
            #e5e7eb ${openPct + resolvedPct}deg,
            #e5e7eb 360deg
          )`,
        };

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-lg font-medium">
        Bienvenue sur le Dashboard
        {hotel?.name ? ` – ${hotel.name}` : ""}
      </div>

      {/* Alerte config */}
      {needsConfig && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
          <div className="font-semibold text-amber-800">
            Configuration requise
          </div>
          <p className="text-amber-700 text-sm mt-1">
            Pour activer toutes les fonctionnalités, veuillez compléter la
            configuration de votre hôtel (coordonnées, horaires, services…).
          </p>
          <button
            onClick={() => navigate("/dashboard/manager/configuration")}
            className="mt-3 inline-flex items-center rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
          >
            Ouvrir la configuration
          </button>
        </div>
      )}

      {/* KPI Signalements – 1 carte (~1/3 de ligne) */}
      <section>
        <div className="bg-white/70 rounded-2xl border shadow p-5 w-full md:w-1/3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-emerald-600" />
              Signalements de l’hôtel
            </h2>
            <button
              onClick={() => navigate("/dashboard/manager/issues")}
              className="text-xs text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
            >
              Voir
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Cercle statistique */}
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full"
                style={circleStyle}
              />
              <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-xl font-bold text-gray-800">
                  {total}
                </span>
              </div>
            </div>

            {/* Légende simple */}
            <div className="flex-1 space-y-1 text-sm">
              {issuesLoading ? (
                <div className="text-xs text-gray-500">
                  Chargement des signalements…
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
                      {issueStats.open}
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
                      {issueStats.resolved}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                    <span>Importants</span>
                    <span className="font-medium text-gray-700">
                      {issueStats.important}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
