import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Hash, Building2, Loader2 } from "lucide-react";
import { registerManager } from "../api/authApi";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  hotelCode: string;
  hotelName: string;
};

const RegisterManagerPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    hotelCode: "",
    hotelName: "",
  });

  const [isNewHotel, setIsNewHotel] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const hotelCodePlaceholder = useMemo(
    () => (isNewHotel ? "Code hôtel (nouveau)" : "Code hôtel (existant)"),
    [isNewHotel]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleaned: FormData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      hotelCode: formData.hotelCode.trim(),
      hotelName: formData.hotelName.trim(),
    };

    const payload = isNewHotel
      ? {
          firstName: cleaned.firstName,
          lastName: cleaned.lastName,
          email: cleaned.email,
          password: cleaned.password,
          hotelCode: cleaned.hotelCode,
          hotelName: cleaned.hotelName,
        }
      : {
          firstName: cleaned.firstName,
          lastName: cleaned.lastName,
          email: cleaned.email,
          password: cleaned.password,
          hotelCode: cleaned.hotelCode,
        };

    try {
      const res = await registerManager(payload as any);

      localStorage.setItem("token", res.token);
      localStorage.setItem("hotelId", String(res.hotelId));
      localStorage.setItem("hotelName", res.hotelName);
      localStorage.setItem("email", res.email.toLowerCase());

      alert("Inscription réussie !");
      navigate("/dashboard/manager");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur d'inscription. Vérifiez vos informations puis réessayez.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F8F7] px-4 py-10 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden grid lg:grid-cols-2">
        {/* Illustration (FULL COVER like your screenshot) */}
        <div className="hidden lg:block relative overflow-hidden bg-emerald-600/10">
          {/* Background image that fills the whole div */}
          <img
            src="/hy.png"
            alt="Illustration hôtel"
            className="absolute inset-0 w-[250%] h-full object-cover"
            draggable={false}
          />

          {/* Optional overlay for nicer blending with your theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-transparent to-transparent" />

          {/* Bottom label */}
          <span className="absolute bottom-4 right-4 text-sm text-white drop-shadow-lg">
            Rejoignez la plateforme Hotel Flow
          </span>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-emerald-700 -mb-2">
            Créer votre compte Manager
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            Gérer vos équipes et projets.
          </p>

          {/* Prénom / Nom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              icon={User}
              name="firstName"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={handleChange}
              required
              autoComplete="given-name"
            />
            <Input
              icon={User}
              name="lastName"
              placeholder="Nom"
              value={formData.lastName}
              onChange={handleChange}
              required
              autoComplete="family-name"
            />
          </div>

          {/* Email */}
          <Input
            icon={Mail}
            name="email"
            type="email"
            placeholder="Adresse email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          {/* Password */}
          <Input
            icon={Lock}
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          {/* Toggle : nouveau hôtel ? */}
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700 select-none">
            <input
              type="checkbox"
              checked={isNewHotel}
              onChange={(e) => setIsNewHotel(e.target.checked)}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            Créer un nouvel hôtel
          </label>

          {/* Code hôtel */}
          <Input
            icon={Hash}
            name="hotelCode"
            placeholder={hotelCodePlaceholder}
            value={formData.hotelCode}
            onChange={handleChange}
            required
          />

          {/* Nom hôtel – seulement si nouveau hôtel */}
          {isNewHotel && (
            <Input
              icon={Building2}
              name="hotelName"
              placeholder="Nom hôtel"
              value={formData.hotelName}
              onChange={handleChange}
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            S’inscrire
          </button>
        </form>
      </div>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const Input: React.FC<InputProps> = ({ icon: Icon, className, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    <input
      {...props}
      className={`w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
        className ?? ""
      }`}
    />
  </div>
);

export default RegisterManagerPage;
