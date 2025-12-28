import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarIcon,
  PenLine,
  MessageSquare,
  AlertTriangle,
  User2,
  LogOut,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { getMyHotel } from "../features/hotel/api/hotelApi";
import { useAuth } from "../features/auth/context/authContext";

/**
 * Displays the hotel logo inside the sidebar.
 * Falls back to a placeholder when no logo is available.
 */
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

/**
 * Navigation link used inside the employee sidebar.
 * Automatically handles active route styling.
 */
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

/**
 * Sidebar action button (non-navigation).
 * Mainly used for destructive or secondary actions such as logout.
 */
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

/**
 * Modal dialog used to confirm logout action.
 * Prevents accidental session termination.
 */
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
          <h2 className="text-lg font-semibold text-gray-900">
            Confirm logout
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Are you sure you want to log out?
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-700"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Sidebar layout for employee users.
 * Contains all navigation links related to employee features.
 */
const Sidebar: React.FC<{
  logoSrc?: string;
  onAskLogout: () => void;
}> = ({ logoSrc, onAskLogout }) => (
  <aside className="w-64 shrink-0 bg-[#F6F8F7] h-screen p-6 flex flex-col">
    <div className="mb-10">
      <Logo src={logoSrc} />
    </div>

    <nav className="space-y-1 flex-1">
      <SidebarLink to="/dashboard/employe" icon={<LayoutDashboard size={18} />} exact>
        Dashboard
      </SidebarLink>

      <SidebarLink to="/dashboard/employe/planning" icon={<CalendarIcon size={18} />}>
        My schedule
      </SidebarLink>

      <SidebarLink to="/dashboard/employe/pointage" icon={<PenLine size={18} />}>
        Attendance
      </SidebarLink>

      <SidebarLink to="/dashboard/employe/messages" icon={<MessageSquare size={18} />}>
        Messages
      </SidebarLink>

      <SidebarLink to="/dashboard/employe/issues" icon={<AlertTriangle size={18} />}>
        Issues
      </SidebarLink>

      <SidebarLink to="/dashboard/employe/profil" icon={<User2 size={18} />}>
        My profile
      </SidebarLink>
    </nav>

    <div className="pt-4 border-t">
      <SidebarAction
        onClick={onAskLogout}
        icon={<LogOut size={18} />}
        tone="danger"
      >
        Logout
      </SidebarAction>
    </div>
  </aside>
);

/**
 * Top navigation bar aligned with the manager layout.
 * Reserved for future global actions (notifications, language, etc.).
 */
const Topbar: React.FC = () => (
  <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6">
    <div />
    <div className="flex items-center gap-3" />
  </header>
);

/**
 * Main dashboard layout for employee users.
 * Responsible for:
 * - Fetching hotel branding
 * - Rendering sidebar and topbar
 * - Providing an outlet for feature pages
 */
const EmployeDashboard: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const { logout } = useAuth();

  useEffect(() => {
    const fetchHotelLogo = async () => {
      try {
        const hotel = await getMyHotel();
        setLogoUrl(hotel?.logoUrl);
      } catch (error) {
        console.error("Failed to load hotel logo:", error);
      }
    };

    fetchHotelLogo();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar logoSrc={logoUrl} onAskLogout={() => setConfirmLogout(true)} />

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

export default EmployeDashboard;
