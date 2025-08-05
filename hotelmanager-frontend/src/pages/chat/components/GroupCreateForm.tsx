import React, {useState} from "react";
import axios from "axios";

interface Props {
    onGroupCreated: () => void;
}

const GroupCreateForm: React.FC<Props> = ({onGroupCreated}) => {
    const [groupName, setGroupName] = useState("");
    const [employeeIds, setEmployeeIds] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vous devez être connecté.");
            return;
        }

        try {
            await axios.post(
                "/api/chat/groups",
                {
                    name: groupName,
                    employeeIds: employeeIds.split(",").map((id) => id.trim()),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // ✅ Ajout du token ici
                    },
                }
            );
            setGroupName("");
            setEmployeeIds("");
            onGroupCreated();
        } catch (error: any) {
            console.error("Erreur lors de la création du groupe :", error);
            alert("Erreur lors de la création du groupe. Vérifie les permissions ou le format des données.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Nom du groupe"
                className="w-full border p-2 rounded"
                required
            />
            <input
                type="text"
                value={employeeIds}
                onChange={(e) => setEmployeeIds(e.target.value)}
                placeholder="IDs des employés (séparés par des virgules)"
                className="w-full border p-2 rounded"
                required
            />
            <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700"
            >
                Créer le groupe
            </button>
        </form>
    );
};

export default GroupCreateForm;
