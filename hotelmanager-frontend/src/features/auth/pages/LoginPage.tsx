import React, { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import { login as loginApi } from "../../auth/api/authApi";
import { useAuth } from "../../auth/context/authContext";

const LoginPage: React.FC = () => {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && user) {
    switch (user.role) {
      case "MANAGER":
        return <Navigate to="/dashboard/manager" replace />;
      case "EMPLOYE":
        return <Navigate to="/dashboard/employe" replace />;
      case "CLIENT":
        return <Navigate to="/dashboard/client" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token, hotelId, hotelName } = await loginApi(credentials);

      login(token);

      localStorage.setItem("hotelId", String(hotelId));
      localStorage.setItem("hotelName", hotelName ?? "");
      localStorage.setItem("email", credentials.email.toLowerCase());

    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 overflow-hidden font-sans">
      <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-emerald-200 opacity-30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-300 opacity-20 blur-2xl" />

      <div className="relative w-full max-w-md bg-white/40 backdrop-blur-lg border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-10">
        <h1 className="text-3xl font-semibold text-emerald-700 mb-8 text-center tracking-tight">
          Welcome
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
            placeholder="Email address"
            value={credentials.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <Input
            icon={Lock}
            name="password"
            type="password"
            placeholder="Password"
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
            Sign in
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-emerald-700 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ComponentType<{ className?: string }>;
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
