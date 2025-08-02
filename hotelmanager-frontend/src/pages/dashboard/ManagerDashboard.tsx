import React from "react";
import { Search, LayoutDashboard, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

/**
 * ManagerDashboard
 * ---------------------------------------------------------------------------
 *  • Sidebar (Dashboard, Utilisateurs)
 *  • Topbar (recherche + avatar)
 *  • Zone de contenu centrale dynamique via <Outlet />
 */

// ---------------------------------------------------------------------------
// UI PRIMITIVES
// ---------------------------------------------------------------------------

const Logo: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => (
  <div className="h-10 w-10 rounded-lg bg-white shadow flex items-center justify-center overflow-hidden">
    {src ? (
      <img
        src={src}
        alt={alt ?? "Hotel logo"}
        className="h-full w-full object-contain"
      />
    ) : (
      <span className="text-[10px] font-semibold text-gray-400">LOGO</span>
    )}
  </div>
);

// 👇 Composant de lien latéral réutilisable
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
      ${isActive ? "bg-emerald-600/10 text-emerald-700"
                 : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`
    }
  >
    {icon}
    {children}
  </NavLink>
);

// ---------------------------------------------------------------------------
// Layout Components
// ---------------------------------------------------------------------------

const Sidebar: React.FC<{ logoSrc?: string }> = ({ logoSrc }) => (
  <aside className="w-64 shrink-0 bg-[#F6F8F7] h-screen p-6 flex flex-col">
    {/* Logo */}
    <div className="mb-10 flex items-center gap-3">
      <Logo src={logoSrc} />
    </div>

    {/* Navigation */}
    <nav className="space-y-1 flex-1">
      <SidebarLink to="/dashboard/manager" icon={<LayoutDashboard size={18} />} exact>
        Dashboard
      </SidebarLink>
      <SidebarLink to="/dashboard/manager/users" icon={<Users size={18} />}>
        Utilisateurs
      </SidebarLink>
        <SidebarLink to="/dashboard/manager/rooms" icon={<span role="img" aria-label="Bed">🛏</span>}> {/* Or use an icon from lucide-react if available */}
            Chambres
        </SidebarLink>

    </nav>
  </aside>
);

const Topbar: React.FC<{ avatarSrc?: string }> = ({ avatarSrc }) => (
  <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
    {/* Search bar */}
    <div className="relative w-72">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="search"
        placeholder="Search"
        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>

    {/* Avatar */}
    <img
      src={avatarSrc ?? "/avatar-placeholder.jpg"}
      alt="Profil utilisateur"
      className="h-9 w-9 rounded-full object-cover"
    />
  </header>
);

// ---------------------------------------------------------------------------
// Main Layout
// ---------------------------------------------------------------------------

const ManagerDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
