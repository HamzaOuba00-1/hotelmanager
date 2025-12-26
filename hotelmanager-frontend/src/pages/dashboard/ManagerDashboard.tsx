// src/pages/dashboard/ManagerDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Search,
  LayoutDashboard,
  Users,
  Cog,
  CalendarIcon,
  DoorClosed,
  QrCode,
  MessageSquare,
  CalendarCheck2,
  AlertTriangle,
  User2,
  LogOut,
  X,
  Home
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { getMyHotel } from "../../api/hotelApi";
import { useAuth } from "../../auth/authContext";
import { Link } from "react-router-dom";

const Logo: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => (
  <div className="w-full h-14 flex items-center justify-center rounded-lg bg-white shadow overflow-hidden">
    {src ? (
      <img
        src={src}
        alt={alt ?? "Hotel logo"}
        className="h-full w-auto object-contain"
      />
    ) : (
      <span className="text-sm font-semibold text-gray-400">LOGO</span>
    )}
  </div>
);

const SidebarLink: React.FC<{
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  exact?: boolean;
}> = ({ to, icon, children, exact = false }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
      ${
        isActive
          ? "bg-emerald-600/10 text-emerald-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`
    }
  >
    {icon}
    {children}
  </NavLink>
);

const SidebarAction: React.FC<{
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  tone?: "default" | "danger";
}> = ({ onClick, icon, children, tone = "default" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
    ${
      tone === "danger"
        ? "text-rose-600 hover:bg-rose-50"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`}
  >
    {icon}
    {children}
  </button>
);

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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-gray-900">
            Confirmer la déconnexion
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
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
            className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-700"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<{
  logoSrc?: string;
  onAskLogout: () => void;
}> = ({ logoSrc, onAskLogout }) => (
  <aside className="w-64 shrink-0 bg-[#F6F8F7] h-screen p-6 flex flex-col">
    <div className="mb-10">
      <Logo src={logoSrc} />
    </div>

    <nav className="space-y-1 flex-1">
      <SidebarLink to="/dashboard/manager" icon={<LayoutDashboard size={18} />} exact>
        Dashboard
      </SidebarLink>

      <SidebarLink to="/dashboard/manager/configuration" icon={<Cog size={18} />}>
        Configuration
      </SidebarLink>

      <SidebarLink to="/dashboard/manager/rooms" icon={<DoorClosed size={18} />}>
        Chambres
      </SidebarLink>

      <SidebarLink
        to="/dashboard/manager/reservations"
        icon={<CalendarCheck2 size={18} />}
      >
        Réservations
      </SidebarLink>

      <SidebarLink to="/dashboard/manager/users" icon={<Users size={18} />}>
        Utilisateurs
      </SidebarLink>

      <SidebarLink to="/dashboard/manager/channels" icon={<MessageSquare size={18} />}>
        Chaînes
      </SidebarLink>

      <SidebarLink to="/dashboard/manager/issues" icon={<AlertTriangle size={18} />}>
        Signalements
      </SidebarLink>

      <SidebarLink to="/dashboard/manager/planning" icon={<CalendarIcon size={18} />}>
        Planning
      </SidebarLink>

      <SidebarLink to="/dashboard/manager/pointage" icon={<QrCode size={18} />}>
        Pointage
      </SidebarLink>

      <SidebarLink to="/dashboard/manager/profil" icon={<User2 size={18} />}>
        Mon profil
      </SidebarLink>
    </nav>

    {/* Zone bas de sidebar */}
    <div className="pt-4 border-t">
      <SidebarAction
        onClick={onAskLogout}
        icon={<LogOut size={18} />}
        tone="danger"
      >
        Déconnexion
      </SidebarAction>
    </div>
  </aside>
);



const Topbar: React.FC<{
  hotelName?: string;
  logoUrl?: string;
  avatarSrc?: string;
}> = ({ hotelName, logoUrl, avatarSrc }) => (
  <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6">
    {/* Left: Home + hotel */}
    <div className="flex items-center gap-3 min-w-0">
      


    </div>

    <div className="flex items-center gap-3">

      <Link
        to="/dashboard/manager/home"
        className="h-10 w-10 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition"
        title="Accueil public"
      >
        <Home className="w-5 h-5 text-emerald-700" />
      </Link>


    </div>
  </header>
);


const ManagerDashboard: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const { logout } = useAuth();

  useEffect(() => {
    const fetchHotelLogo = async () => {
      try {
        const hotel = await getMyHotel();
        setLogoUrl(hotel.logoUrl ?? undefined);
      } catch (err) {
        console.error("Erreur récupération logo hôtel :", err);
      }
    };

    fetchHotelLogo();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar
        logoSrc={logoUrl}
        onAskLogout={() => setConfirmLogout(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>

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

export default ManagerDashboard;
