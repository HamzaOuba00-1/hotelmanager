// src/pages/dashboard/client/ClientDashboard.tsx

import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { CalendarCheck2, MessageSquare, User2, LogOut, X } from "lucide-react";

import { getMyHotel } from "../../api/hotelApi";
import { useAuth } from "../../auth/authContext";

/* -------------------- Confirm Logout Modal -------------------- */
const ConfirmLogoutModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={(e) => e.currentTarget === e.target && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.12)] p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-gray-900">
            Confirmer la déconnexion
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100/70 transition"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Voulez-vous vraiment vous déconnecter ?
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white/70 text-sm hover:bg-white transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-700 transition"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------- TopbarLink (same style as home) -------------------- */
const TopbarLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  exact?: boolean;
}> = ({ to, icon, children, exact = false }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) =>
      [
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
        "border",
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm"
          : "bg-white/70 text-gray-700 border-white/60 hover:bg-white hover:shadow-md",
      ].join(" ")
    }
  >
    {icon}
    {children}
  </NavLink>
);

/* -------------------- ClientDashboard -------------------- */
const ClientDashboard: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const { logout } = useAuth();

  useEffect(() => {
    const fetchHotelLogo = async () => {
      try {
        const hotel = await getMyHotel();
        setLogoUrl(hotel?.logoUrl ?? undefined);
      } catch (err) {
        console.error("Erreur récupération logo hôtel :", err);
      }
    };

    fetchHotelLogo();
  }, []);

  const brand = useMemo(() => {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Hotel logo"
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="text-white font-semibold text-sm">HF</span>
          )}
        </div>

        <div className="leading-tight">
          <div className="text-lg font-semibold text-gray-900 tracking-tight">
            Hotel<span className="text-emerald-600">Flow</span>
          </div>
          <p className="text-xs text-gray-500">Espace client</p>
        </div>
      </div>
    );
  }, [logoUrl]);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-emerald-50 font-sans">
      {/* Background blobs like home */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl" />
      </div>

      {/* HEADER FULL WIDTH (same layout as PublicHomePage) */}
      <header className="w-full px-6 sm:px-10 pt-6 pb-4 sticky top-0 z-40">
        <div className="w-full flex items-center justify-between">
          {/* Brand */}
          {brand}

          {/* Center nav (desktop) */}
          <nav className="hidden md:flex items-center gap-3">
            <TopbarLink
              to="/dashboard/client/reservations"
              icon={<CalendarCheck2 className="w-4 h-4" />}
            >
              Réservations
            </TopbarLink>

            <TopbarLink
              to="/dashboard/client/messages"
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Messages
            </TopbarLink>

            <TopbarLink
              to="/dashboard/client/profil"
              icon={<User2 className="w-4 h-4" />}
            >
              Profil
            </TopbarLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfirmLogout(true)}
              className="text-sm font-semibold px-4 py-2 rounded-xl text-rose-700 bg-white/70 border border-white/60 shadow-sm hover:bg-rose-50 hover:border-rose-200 hover:shadow-md transition"
              title="Déconnexion"
            >
              <span className="inline-flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Déconnexion
              </span>
            </button>
          </div>
        </div>

        {/* Mobile nav (same vibe) */}
        <div className="md:hidden mt-4 flex items-center gap-2">
          <TopbarLink
            to="/dashboard/client/reservations"
            icon={<CalendarCheck2 className="w-4 h-4" />}
          >
            Réserv.
          </TopbarLink>

          <TopbarLink
            to="/dashboard/client/messages"
            icon={<MessageSquare className="w-4 h-4" />}
          >
            Msg
          </TopbarLink>

          <TopbarLink to="/dashboard/client/profil" icon={<User2 className="w-4 h-4" />}>
            Profil
          </TopbarLink>
        </div>
      </header>

      {/* MAIN FULL WIDTH like home */}
      <main className="w-full px-6 sm:px-10 pb-16">
        {/* Glass content wrapper like home cards */}
        <div className="w-full rounded-3xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.10)] p-5 sm:p-7">
          <Outlet />
        </div>
      </main>

      <ConfirmLogoutModal
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
      />
    </div>
  );
};

export default ClientDashboard;
