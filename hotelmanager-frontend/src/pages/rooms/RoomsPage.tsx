import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import { useAuth } from "../../auth/authContext";
import { Bed, PlusCircle, List, Trash2 } from "lucide-react";

type Room = {
    id: number;
    roomNumber: string;
    roomType: string;
    floor: string;
    description: string;
    roomState: string;
};

type RoomForm = {
    roomNumber: string;
    roomType: string;
    floor: string;
    description: string;
};

const RoomsPage: React.FC = () => {
    const { user } = useAuth();
    const token = localStorage.getItem("token");

    const [rooms, setRooms] = useState<Room[]>([]);
    const [form, setForm] = useState<RoomForm>({
        roomNumber: "",
        roomType: "simple",
        floor: "",
        description: "",
    });

    const isManager = user?.role === "MANAGER";
    const isEmployee = user?.role === "EMPLOYE";
    const isClient = user?.role === "CLIENT";

    const fetchRooms = async () => {
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };
        let url = "http://localhost:8080/api/rooms";

        if (isClient) {
            url = "http://localhost:8080/api/rooms/my-room";
        }
        try {
            const res = await axios.get<Room | Room[]>(url, { headers });
            console.log("Rooms fetched:", res.data);
            const data = Array.isArray(res.data) ? res.data : [res.data];
            setRooms(data);
        } catch (err) {
            console.error("Erreur lors de la récupération des chambres:", err);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [token, user, isClient]);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        if (!isManager) return;
        console.log("Données envoyées :", form);  // <-- debug ici

        try {
            await axios.post("http://localhost:8080/api/rooms", form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            window.location.reload();
        } catch (error) {
            console.error("Erreur lors de la création", error);
        }
    };

    const handleDelete = async (roomId: number) => {
        if (!isManager) return;
        try {
            await axios.delete(`http://localhost:8080/api/rooms/${roomId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchRooms();
        } catch (error) {
            console.error("Erreur lors de la suppression", error);
        }
    };

    const handleEtatChange = async (roomId: number, newEtat: string) => {
        if (!isManager && !isEmployee) return;
        try {
            await axios.patch(
                `http://localhost:8080/api/rooms/${roomId}/state`,
                null,
                {
                    params: { state: newEtat },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            await fetchRooms();
        } catch (error) {
            console.error("Erreur lors du changement d'état", error);
        }
    };

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    return (
        <>
            {/* Ajout animations globales */}
            <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out;
            }
          `}</style>

            <div className="container mx-auto p-6 grid gap-6 animate-fadeIn">
                <h1 className="text-2xl font-semibold mb-6 flex items-center justify-center gap-2">
                    <Bed className="w-8 h-8 text-blue-600" />
                    Gestion des chambres
                </h1>

                {isManager && (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                            <PlusCircle className="w-6 h-6 text-green-600" /> Ajouter une chambre
                        </h3>
                        <form onSubmit={handleCreate} className="grid gap-6 md:grid-cols-2">
                            <input
                                type="text"
                                name="roomNumber"
                                placeholder="Numéro"
                                value={form.roomNumber.toString()}
                                onChange={handleInputChange}
                                required
                                className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <select
                                name="roomType"
                                value={form.roomType}
                                onChange={handleInputChange}
                                className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="simple">Simple</option>
                                <option value="double">Double</option>
                                <option value="suite">Suite</option>
                            </select>
                            <input
                                type="text"
                                name="floor"
                                placeholder="Étage"
                                value={form.floor}
                                onChange={handleInputChange}
                                required
                                className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <textarea
                                name="description"
                                placeholder="Description"
                                value={form.description}
                                onChange={handleInputChange}
                                className="border rounded p-2 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                Créer
                            </button>
                        </form>
                    </div>
                )}

                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                    <List className="w-6 h-6 text-gray-700" /> Liste des chambres
                </h3>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg shadow">
                        <thead className="bg-gray-100 rounded-t-lg">
                        <tr>
                            <th className="p-3 text-left border-b">Numéro</th>
                            <th className="p-3 text-left border-b">Type</th>
                            <th className="p-3 text-left border-b">Étage</th>
                            <th className="p-3 text-left border-b">État</th>
                            {(isManager || isEmployee) && (
                                <th className="p-3 text-left border-b">Actions</th>
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {rooms.map((room) => (
                            <tr key={room.id} className="hover:bg-gray-50 transition">
                                <td className="p-3 border-b">{room.roomNumber}</td>
                                <td className="p-3 border-b">{room.roomType}</td>
                                <td className="p-3 border-b">{room.floor}</td>
                                <td className="p-3 border-b">{room.roomState}</td>
                                {(isManager || isEmployee) && (
                                    <td className="p-3 border-b flex flex-col md:flex-row gap-2 items-start md:items-center">
                                        <select
                                            value={room.roomState ?? "LIBRE"}
                                            onChange={(e) => handleEtatChange(room.id, e.target.value)}
                                            className="border rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        >
                                            <option value="LIBRE">Libre</option>
                                            <option value="OCCUPEE">Occupée</option>
                                            <option value="EN_NETTOYAGE">En nettoyage</option>
                                        </select>


                                        {isManager && (
                                            <button
                                                onClick={() => handleDelete(room.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" /> Supprimer
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default RoomsPage;
