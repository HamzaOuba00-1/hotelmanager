// src/pages/PublicHomePage.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Crown,
  MapPin,
  BedDouble,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { type HotelConfigDTO, listPublicHotels } from "../../hotel/api/hotelApi";

export default function PublicHomePage() {
  const [hotels, setHotels] = useState<HotelConfigDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadHotels = async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await listPublicHotels();
        setHotels(data || []);
      } catch (e: any) {
        setErr(
          e?.response?.data?.detail ||
            e?.message ||
            "Impossible de charger les hôtels."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, []);

  // only show active hotels publicly
  const visibleHotels = (hotels || []).filter((h) => h.active !== false);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-emerald-50">
      {/* full-page layout */}
      <div className="min-h-screen flex flex-col">
        {/* HEADER FULL WIDTH */}
        <header className="w-full px-6 sm:px-10 pt-6 pb-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg flex items-center justify-center">
                <Crown className="text-white w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-1.5">
                  Hotel<span className="text-emerald-600">Flow</span>
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs text-gray-500">
                  Gérez & réservez vos séjours en toute simplicité.
                </p>
              </div>
            </Link>

            {/* Nav droite : Login / Register */}
            <nav className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium px-3 py-1.5 rounded-xl text-gray-700 hover:text-emerald-700 hover:bg-white/80 border border-transparent hover:border-emerald-100 transition"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-4 py-1.5 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-md hover:shadow-lg hover:scale-[1.02] transition"
              >
                Créer un compte manager
              </Link>
            </nav>
          </div>
        </header>

        {/* MAIN FULL WIDTH */}
        <main className="flex-1 w-full px-6 sm:px-10 pb-16">
          <div className="max-w-6xl mx-auto">
            {/* HERO */}
            <section className="mt-8 lg:mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
              {/* Colonne gauche texte */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-100 text-[11px] text-emerald-700 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Plateforme de gestion & réservation hôtelière</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Trouvez l’hôtel,
                  <br />
                  réservez votre séjour
                  <span className="text-emerald-600"> en quelques clics.</span>
                </h1>

                <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-xl">
                  Choisissez un hôtel, sélectionnez vos dates et laissez la
                  plateforme s’occuper du reste. Une expérience fluide pour les
                  clients comme pour les équipes.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href="#hotels"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition"
                  >
                    Voir les hôtels disponibles
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Accès sécurisé pour managers, employés & clients</span>
                  </div>
                </div>
              </div>

              {/* Colonne droite : carte stats */}
              <div className="relative">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-100/60 blur-2xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-100/60 blur-2xl" />

                <div className="relative rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-4">
                  <div className="text-xs font-semibold text-gray-500">
                    Vue d’ensemble
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {visibleHotels.length}
                    <span className="text-sm font-medium text-gray-500 ml-1">
                      hôtel{visibleHotels.length > 1 ? "s" : ""} disponible
                      {visibleHotels.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
                      <div className="text-[11px] text-emerald-700 font-medium mb-1">
                        Pour les clients
                      </div>
                      <ul className="space-y-0.5 text-[11px] text-emerald-900/80">
                        <li>• Réservation en ligne</li>
                        <li>• Compte client auto-généré</li>
                        <li>• Historique des séjours</li>
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
                      <div className="text-[11px] text-gray-700 font-medium mb-1">
                        Pour les équipes
                      </div>
                      <ul className="space-y-0.5 text-[11px] text-gray-700">
                        <li>• Planning & pointage</li>
                        <li>• Gestion des chambres</li>
                        <li>• Signalements centralisés</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-gray-400">
                    Sélectionnez un hôtel plus bas pour accéder à la page de
                    réservation publique.
                  </div>
                </div>
              </div>
            </section>

            {/* LISTE HOTELS */}
            <section id="hotels" className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Nos hôtels partenaires
                  </h2>
                  <p className="text-xs text-gray-500">
                    Cliquez sur un hôtel pour ouvrir la page de réservation
                    dédiée.
                  </p>
                </div>
              </div>

              {err && (
                <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {err}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-40 rounded-2xl bg-white/80 border border-white/60 shadow-sm animate-pulse"
                    />
                  ))}
                </div>
              ) : visibleHotels.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white/70 p-8 text-center text-gray-500 text-sm">
                  Aucun hôtel public n’est encore configuré.
                  <br />
                  <span className="text-xs text-gray-400">
                    Connectez-vous en tant que manager pour créer et activer un
                    hôtel.
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                  {visibleHotels.map((hotel) => (
                    <button
                      key={hotel.id}
                      type="button"
                      onClick={() => navigate(`/hotels/${hotel.id}/rooms`)}
                      className="group relative text-left overflow-hidden rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition" />

                      <div className="relative p-5 flex flex-col gap-3">
                        {/* Top line: logo + name */}
                        <div className="flex items-center gap-3">
                          {hotel.logoUrl ? (
                            <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                              <img
                                src={hotel.logoUrl}
                                alt={hotel.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-semibold flex items-center justify-center">
                              {hotel.name?.[0]?.toUpperCase() ?? "H"}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {hotel.name || "Hôtel sans nom"}
                            </div>
                            {hotel.address && (
                              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate">
                                  {hotel.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Services / tags */}
                        <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-600">
                          {hotel.services?.hasRestaurant && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Restaurant
                            </span>
                          )}
                          {hotel.services?.hasGym && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
                              Salle de sport
                            </span>
                          )}
                          {hotel.services?.hasPool && (
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-100">
                              Piscine
                            </span>
                          )}
                          {hotel.services?.hasBusinessCenter && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100">
                              Business
                            </span>
                          )}
                          {!hotel.services && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
                              Services standard
                            </span>
                          )}
                        </div>

                        {/* Bottom line: CTA + small hint */}
                        <div className="mt-1 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <BedDouble className="w-3.5 h-3.5" />
                            <span>Réserver une chambre</span>
                          </div>
                          <div className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            Ouvrir
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement des hôtels…
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
