import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/context/authContext";
import { Loader2, ShieldCheck } from "lucide-react";

type Props = {
  allowedRoles: string[];
};

const PrivateRoute: React.FC<Props> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  /* ===== LOADING PREMIUM ===== */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-2xl px-10 py-8 animate-fade-in">
          
          {/* Icone */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl animate-pulse" />
            <ShieldCheck className="relative w-12 h-12 text-emerald-600" />
          </div>

          {/* Spinner */}
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />

          {/* Texte */}
          <p className="text-sm font-medium text-gray-700 tracking-wide">
            Vérification de la session…
          </p>
        </div>

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.25s ease-out;
          }
        `}</style>
      </div>
    );
  }

  /* ===== AUTH ===== */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
