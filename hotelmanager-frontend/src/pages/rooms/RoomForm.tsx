import { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";
import { PlusCircle } from "lucide-react";

interface RoomFormProps {
  token: string;
  roomTypes: string[];
  onCreated: () => void;
}

export default function RoomForm({ token, roomTypes, onCreated }: RoomFormProps) {
  const [form, setForm] = useState({
    roomNumber: "",
    roomType: roomTypes[0] || "",
    floor: "",
    description: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await axios.post("http://localhost:8080/api/rooms", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setForm({
      roomNumber: "",
      roomType: roomTypes[0] || "",
      floor: "",
      description: "",
    });
    onCreated();
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
        <PlusCircle className="w-6 h-6 text-emerald-500" /> Ajouter une chambre
      </h3>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input
          name="roomNumber"
          placeholder="Numéro"
          value={form.roomNumber}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 shadow-inner bg-white/70 focus:ring-2 focus:ring-emerald-500"
          required
        />
        <select
          name="roomType"
          value={form.roomType}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 bg-white/70 focus:ring-2 focus:ring-emerald-500"
        >
          {roomTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <input
          name="floor"
          placeholder="Étage"
          value={form.floor}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 bg-white/70 focus:ring-2 focus:ring-emerald-500"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 md:col-span-2 bg-white/70 focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="md:col-span-2 bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600 transition"
        >
          Créer
        </button>
      </form>
    </div>
  );
}
