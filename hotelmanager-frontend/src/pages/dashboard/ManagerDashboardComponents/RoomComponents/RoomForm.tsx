import { useState, FormEvent } from "react";
import axios from "axios";
import { Tag, Bed, Layers3, FileText, Activity, X, Loader2 } from "lucide-react";

interface RoomFormPremiumProps {
  token: string;
  roomTypes: string[];
  onCreated: () => void;
  onClose: () => void;
}

type ProblemDetail = {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string>;
};

const ROOM_STATES = [
  { value: "LIBRE", label: "Libre" },
  { value: "RESERVEE", label: "Réservée" },
  { value: "CHECKIN", label: "Check-in" },
  { value: "ROOM_SERVICE", label: "Room service/maintenance" },
  { value: "CHECKOUT", label: "Check-out" },
  { value: "A_VALIDER_LIBRE", label: "À valider (libre)" },
  { value: "A_NETTOYER", label: "À nettoyer" },
  { value: "EN_NETTOYAGE", label: "En nettoyage" },
  { value: "A_VALIDER_CLEAN", label: "À valider (clean)" },
];

export default function RoomFormPremium({
  token,
  roomTypes,
  onCreated,
  onClose,
}: RoomFormPremiumProps) {
  const [form, setForm] = useState({
    roomNumber: "",
    roomType: roomTypes[0] || "Standard",
    floor: "",
    description: "",
    roomState: "LIBRE", 
  });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrMsg(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrMsg(null);
    setFieldErrors({});
    setLoading(true);

    const roomNumber = Number(form.roomNumber);
    const floor = Number(form.floor);
    if (!Number.isInteger(roomNumber) || roomNumber <= 0) {
      setLoading(false);
      setErrMsg("Le numéro de chambre doit être un entier positif.");
      return;
    }
    if (!Number.isInteger(floor) || floor < 0) {
      setLoading(false);
      setErrMsg("L’étage doit être un entier ≥ 0.");
      return;
    }

    const payload = {
      roomNumber,
      floor,
      roomType: form.roomType.trim(),
      description: form.description.trim(),
      roomState: form.roomState as string, 
      active: true,
    };

    try {
      await axios.post("http://localhost:8080/api/rooms", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", 
        },
      });
      onCreated();
      // reset
      setForm({
        roomNumber: "",
        roomType: roomTypes[0] || "Standard",
        floor: "",
        description: "",
        roomState: "LIBRE",
      });
    } catch (error: any) {
      const pd: ProblemDetail | undefined = error?.response?.data;
      const status = error?.response?.status as number | undefined;

      if (status === 409) {
        setErrMsg(pd?.detail || "Ce numéro de chambre existe déjà pour cet hôtel.");
      } else if (status === 400) {
        if (pd?.errors) setFieldErrors(pd.errors);
        setErrMsg(pd?.detail || pd?.title || "Requête invalide.");
      } else if (pd?.title || pd?.detail) {
        setErrMsg(`${pd.title ?? "Erreur"}${pd.detail ? `: ${pd.detail}` : ""}`);
      } else {
        setErrMsg(error?.message || "Erreur réseau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/60 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-xl p-8 space-y-8 border border-white/20 animate-fade-in relative"
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 p-2 rounded-lg hover:bg-gray-100"
        aria-label="Fermer"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>

      {/* Header */}
      <div className="flex justify-center items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Tag className="w-5 h-5 text-emerald-600" /> Ajouter une nouvelle chambre
        </h2>
      </div>

      {errMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Numéro */}
        <label className="input-label">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-emerald-500" /> Numéro de chambre
          </div>
        <input
            type="number"
            min={1}
            name="roomNumber"
            value={form.roomNumber}
            onChange={handleChange}
            placeholder="Ex: 101"
            required
            className={`input-premium ${fieldErrors["roomNumber"] ? "border-red-300" : ""}`}
          />
          {fieldErrors["roomNumber"] && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors["roomNumber"]}</p>
          )}
        </label>

        {/* Type */}
        <label className="input-label">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" /> Type de chambre
          </div>
          <select
            name="roomType"
            value={form.roomType}
            onChange={handleChange}
            className="input-premium"
          >
            {(roomTypes?.length ? roomTypes : ["Standard"]).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        {/* Étage */}
        <label className="input-label">
          <div className="flex items-center gap-2">
            <Layers3 className="w-4 h-4 text-emerald-500" /> Étage
          </div>
          <input
            type="number"
            min={0}
            name="floor"
            value={form.floor}
            onChange={handleChange}
            placeholder="Ex: 1"
            required
            className={`input-premium ${fieldErrors["floor"] ? "border-red-300" : ""}`}
          />
          {fieldErrors["floor"] && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors["floor"]}</p>
          )}
        </label>

        {/* État */}
        <label className="input-label">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> État
          </div>
          <select
            name="roomState"
            value={form.roomState}
            onChange={handleChange}
            className="input-premium"
          >
            {ROOM_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {/* Description */}
        <label className="input-label sm:col-span-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" /> Description
          </div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Détails, équipements, vue..."
            className="input-premium"
          />
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Ajout...</>) : "Ajouter la chambre"}
        </button>
      </div>

      <style>{`
        .input-label { display:flex; flex-direction:column; gap:4px; font-size:0.875rem; font-weight:500; color:#374151; }
        .input-premium { border-radius:0.75rem; border:1px solid rgba(0,0,0,0.1); background:rgba(255,255,255,0.7); padding:0.5rem 0.75rem; outline:none; transition:all .2s; }
        .input-premium:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.2); }
        @keyframes fade-in { from{opacity:0; transform:scale(.95);} to{opacity:1; transform:scale(1);} }
        .animate-fade-in { animation: fade-in .25s ease-out; }
      `}</style>
    </form>
  );
}
