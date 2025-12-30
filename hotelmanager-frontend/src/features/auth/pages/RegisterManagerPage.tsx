import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Hash,
  Building2,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { registerManager } from "../api/authApi";
import { useAuth } from "../context/authContext";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  hotelCode: string;
  hotelName: string;
};

const RegisterManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ IMPORTANT

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
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hotelCodePlaceholder = useMemo(
    () => (isNewHotel ? "Hotel code (new)" : "Hotel code (existing)"),
    [isNewHotel]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleaned = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      hotelCode: formData.hotelCode.trim(),
      hotelName: formData.hotelName.trim(),
    };

    const payload = isNewHotel
      ? cleaned
      : {
          firstName: cleaned.firstName,
          lastName: cleaned.lastName,
          email: cleaned.email,
          password: cleaned.password,
          hotelCode: cleaned.hotelCode,
        };

    try {
      const res = await registerManager(payload as any);

      // ✅ LA CORRECTION CLÉ
      login(res.token);

      // données annexes
      localStorage.setItem("hotelId", String(res.hotelId));
      localStorage.setItem("hotelName", res.hotelName);
      localStorage.setItem("email", res.email.toLowerCase());

      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Registration error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BACK HOME */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2
                   rounded-xl bg-white/80 backdrop-blur-md
                   border border-gray-200 text-emerald-700
                   text-sm font-medium shadow hover:bg-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      {/* PAGE */}
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8F7] px-4 py-10">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden grid lg:grid-cols-2">
          {/* LEFT VISUAL */}
          <div className="hidden lg:block relative overflow-hidden bg-emerald-600/10 pointer-events-none">
            <img
              src="/hy.png"
              alt="Hotel illustration"
              className="absolute inset-0 w-[250%] h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-transparent to-transparent" />
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 p-8 lg:p-12"
          >
            <h2 className="text-2xl font-bold text-emerald-700">
              Create your Manager account
            </h2>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input icon={User} name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required />
              <Input icon={User} name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required />
            </div>

            <Input icon={Mail} name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <Input icon={Lock} name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={isNewHotel} onChange={(e) => setIsNewHotel(e.target.checked)} />
              Create a new hotel
            </label>

            <Input icon={Hash} name="hotelCode" placeholder={hotelCodePlaceholder} value={formData.hotelCode} onChange={handleChange} required />

            {isNewHotel && (
              <Input icon={Building2} name="hotelName" placeholder="Hotel name" value={formData.hotelName} onChange={handleChange} required />
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl"
            >
              {loading ? "Creating…" : "Sign up"}
            </button>
          </form>
        </div>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/80 rounded-3xl p-8 text-center max-w-md">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Registration successful
            </h3>
            <button
              onClick={() => navigate("/dashboard/manager")}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl"
            >
              Go to dashboard <ArrowRight className="inline h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ComponentType<{ className?: string }>;
}

const Input: React.FC<InputProps> = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    <input
      {...props}
      className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500"
    />
  </div>
);

export default RegisterManagerPage;
