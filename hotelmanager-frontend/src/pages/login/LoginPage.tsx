import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { login } from "../../api/authApi";
import { Mail, Lock, Loader2 } from "lucide-react";

interface DecodedToken {
  sub: string;
  role: string;
  userId: number;
  hotelId: number;
  iat: number;
  exp: number;
}

/**
 * LoginPage – version "haute‑gamme" (glassmorphism)
 * ---------------------------------------------------------------------------
 *   • Fond dégradé subtil et halo translucide
 *   • Carte en verre (bg‑white/40 + backdrop‑blur) + bordure 1px blanche
 *   • Couleurs Emerald pour l'accent principal
 */

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token } = await login(credentials);
      localStorage.setItem("token", token);
      localStorage.setItem("email", credentials.email);

      

      const decoded = jwtDecode<DecodedToken>(token);
      switch (decoded.role) {
        case "MANAGER":
          navigate("/dashboard/manager");
          break;
        case "EMPLOYE":
          navigate("/employe");
          break;
        case "CLIENT":
          navigate("/client");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Échec de la connexion. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 overflow-hidden font-sans">
      {/* Halo décoratif */}
      <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-emerald-200 opacity-30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-300 opacity-20 blur-2xl" />

      <div className="relative w-full max-w-md bg-white/40 backdrop-blur-lg border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-10">
        <h1 className="text-3xl font-semibold text-emerald-700 mb-8 text-center tracking-tight">
          Bienvenue
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50/70 border border-red-200 rounded-lg p-3 backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            icon={Mail}
            name="email"
            type="email"
            placeholder="Adresse email"
            value={credentials.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <Input
            icon={Lock}
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={credentials.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600/90 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Reusable Input component – transparent/glass style
// ---------------------------------------------------------------------------
interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const Input: React.FC<InputProps> = ({ icon: Icon, className, ...props }) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
    <input
      {...props}
      className={`w-full pl-11 pr-3 py-3 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className ?? ""}`}
    />
  </div>
);

export default LoginPage;
