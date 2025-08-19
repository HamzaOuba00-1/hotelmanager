import { useState } from "react";
import axios from "axios";
import { Tag, Bed, Layers3, FileText, Activity } from "lucide-react";

interface RoomEditModalProps {
  token: string;
  room: { id: number; roomNumber: number; roomType: string; floor: number; description: string; roomState: string };
  roomTypes: string[];
  onUpdated: () => void;
  onClose: () => void;
}

export default function RoomEditModal({
  token,
  room,
  roomTypes,
  onUpdated,
  onClose,
}: RoomEditModalProps) {
  const [form, setForm] = useState({ ...room });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:8080/api/rooms/${room.id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Erreur mise à jour chambre :", err);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white/60 backdrop-blur-xl shadow-xl border border-white/20 p-8 animate-fade-in">
        {/* Titre */}
        <div className="flex justify-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            Modifier la chambre
          </h2>
        </div>

        {/* Formulaire */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField
            icon={<Bed className="w-4 h-4 text-emerald-500" />}
            label="Numéro de chambre"
            name="roomNumber"
            value={form.roomNumber}
            onChange={handleChange}
          />

          <SelectField
            icon={<FileText className="w-4 h-4 text-emerald-500" />}
            label="Type de chambre"
            name="roomType"
            value={form.roomType}
            onChange={handleChange}
            options={roomTypes} // récupère tous les types disponibles
          />

          <InputField
            icon={<Layers3 className="w-4 h-4 text-emerald-500" />}
            label="Étage"
            name="floor"
            value={form.floor}
            onChange={handleChange}
          />

          <SelectField
            icon={<Activity className="w-4 h-4 text-emerald-500" />}
            label="État"
            name="roomState"
            value={form.roomState}
            onChange={handleChange}
            options={["LIBRE", "OCCUPEE", "EN_NETTOYAGE"]}
          />

          <TextareaField
            icon={<FileText className="w-4 h-4 text-emerald-500" />}
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="sm:col-span-2"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </div>
      </div>

      {/* Confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-5 animate-fade-in">
            <p className="text-center text-gray-700 font-medium">
              Confirmez-vous la modification de cette chambre&nbsp;?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Retour
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-lg"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in .25s ease-out; }
        .input-premium {
          border-radius: .75rem;
          border: 1px solid rgba(0,0,0,.1);
          background: rgba(255,255,255,.7);
          padding: .5rem .75rem;
          outline: none;
          transition: .2s;
        }
        .input-premium:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,.2);
        }
      `}</style>
    </div>
  );
}

/* -------- Composants champs -------- */
function InputField(props: React.ComponentProps<"input"> & { icon: React.ReactNode; label: string }) {
  const { icon, label, ...rest } = props;
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      <span className="flex items-center gap-2">{icon} {label}</span>
      <input {...rest} className="input-premium" />
    </label>
  );
}

function SelectField(props: React.ComponentProps<"select"> & { icon: React.ReactNode; label: string; options: string[] }) {
  const { icon, label, options, ...rest } = props;
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      <span className="flex items-center gap-2">{icon} {label}</span>
      <select {...rest} className="input-premium">
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextareaField(
  props: React.ComponentProps<"textarea"> & { icon: React.ReactNode; label: string }
) {
  const { icon, label, className, ...rest } = props;
  return (
    <label className={`flex flex-col gap-1 text-sm font-medium text-gray-700 ${className ?? ""}`}>
      <span className="flex items-center gap-2">{icon} {label}</span>
      <textarea rows={3} {...rest} className="input-premium" />
    </label>
  );
}
