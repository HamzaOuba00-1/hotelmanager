import { useEffect, useState } from 'react';
import { getAllUsers, deleteUser } from '../../api/userApi';
import { User } from '../../types/User';
import AddUserForm from './AddUserForm';

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsers();
      setUsers(res);
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des utilisateurs :", err);
      if (err.response?.status === 403) {
        setError("⛔️ Accès interdit : vous n’avez pas les permissions.");
      } else {
        setError("Impossible de charger les utilisateurs. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('❓ Supprimer cet utilisateur ?')) {
      try {
        await deleteUser(id);
        setUsers(prev => prev.filter((u) => u.id !== id));
      } catch (err) {
        alert("⚠️ Erreur lors de la suppression.");
        console.error(err);
      }
    }
  };

  const handleUserCreated = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Gestion des utilisateurs</h2>

      <AddUserForm onUserCreated={handleUserCreated} />

      {loading && <p>⏳ Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && users.length === 0 && !error && (
        <p className="text-gray-500">Aucun utilisateur trouvé.</p>
      )}

      <ul className="space-y-2 mt-4">
        {users.map((user) => (
          <li key={user.id} className="flex justify-between items-center border-b pb-1">
            <span>
              {user.firstName} {user.lastName} ({user.role}) — <strong>{user.email}</strong>
            </span>
            <button
              className="text-red-600 hover:underline"
              onClick={() => handleDelete(user.id)}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
