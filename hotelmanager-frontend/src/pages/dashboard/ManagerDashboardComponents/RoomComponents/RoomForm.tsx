import { useState, FormEvent } from "react";
import axios from "axios";
import { Tag, Bed, Layers3, FileText, Activity } from "lucide-react";

interface RoomFormPremiumProps {
  token: string;
  roomTypes: string[];
  onCreated: () => void;
  onClose: () => void;
}

export default function RoomFormPremium({
  token,
  roomTypes,
  onCreated,
  onClose,
}: RoomFormPremiumProps) {
  const [form, setForm] = useState({
    roomNumber: "",
    roomType: roomTypes[0] || "",
    floor: "",
    description: "",
    roomState: "LIBRE",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/rooms", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onCreated();
      setForm({
        roomNumber: "",
        roomType: roomTypes[0] || "",
        floor: "",
        description: "",
        roomState: "LIBRE",
      });
    } catch (err) {
      console.error("Erreur création chambre :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/60 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-xl p-8 space-y-8 border border-white/20 animate-fade-in"
    >
      {/* Header centré */}
      <div className="flex justify-center items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Tag className="w-5 h-5 text-emerald-600" /> Ajouter une nouvelle chambre
        </h2>
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Numéro */}
        <label className="input-label">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-emerald-500" /> Numéro de chambre
          </div>
          <input
            type="text"
            name="roomNumber"
            value={form.roomNumber}
            onChange={handleChange}
            placeholder="Ex: 101"
            required
            className="input-premium"
          />
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
            {roomTypes.length > 0 ? (
              roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))
            ) : (
              <option value="">Aucun type disponible</option>
            )}
          </select>
        </label>

        {/* Étage */}
        <label className="input-label">
          <div className="flex items-center gap-2">
            <Layers3 className="w-4 h-4 text-emerald-500" /> Étage
          </div>
          <input
            type="text"
            name="floor"
            value={form.floor}
            onChange={handleChange}
            placeholder="Ex: 1"
            required
            className="input-premium"
          />
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
            <option value="LIBRE">Libre</option>
            <option value="OCCUPEE">Occupée</option>
            <option value="EN_NETTOYAGE">En nettoyage</option>
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
          className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg transition disabled:opacity-50"
        >
          {loading ? "Ajout..." : "Ajouter la chambre"}
        </button>
      </div>

      <style>{`
        .input-label {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        .input-premium {
          border-radius: 0.75rem;
          border: 1px solid rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.7);
          padding: 0.5rem 0.75rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .input-premium:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
      `}</style>
    </form>
  );
}
