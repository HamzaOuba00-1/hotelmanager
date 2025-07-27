import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserRound, ChevronDown, ChevronRight } from 'lucide-react';
import AddUserModal from './AddUserModal';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'MANAGER' | 'EMPLOYE';
  hotel: { id: number };
}

const PlaceholderUtilisateurs: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [showManagers, setShowManagers] = useState(true);
  const [showEmployes, setShowEmployes] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = () => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    setConnectedEmail(email);

    axios
      .get<User[]>('http://localhost:8080/users/my-hotel', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          console.error('Format de données inattendu', res);
        }
      })
      .catch((err) => console.error('Erreur chargement utilisateurs :', err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderUserCard = (user: User, isConnected = false) => (
    <div
      key={user.id}
      className={`flex flex-col items-center justify-center w-44 h-44 p-5 rounded-3xl 
        bg-white/50 backdrop-blur-xl border border-white/30 
        shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-white/20 
        transition-transform duration-300 hover:scale-105 hover:shadow-xl
        ${isConnected ? 'ring-2 ring-[#47B881] shadow-green-200' : ''}`}
    >
      <UserRound className="h-10 w-10 text-[#47B881] mb-2" />
      <div className="text-base font-semibold text-gray-800 text-center tracking-wide">
        {user.firstName} {user.lastName}
      </div>
      <div className="text-[13px] text-gray-500 uppercase mt-1 tracking-widest">{user.role}</div>
    </div>
  );

  const managers = users
    .filter((u) => u.role === 'MANAGER')
    .sort((a, b) => (a.email === connectedEmail ? -1 : b.email === connectedEmail ? 1 : 0));

  const employes = users.filter((u) => u.role === 'EMPLOYE');

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-[#ffffff] via-[#f2f4f7] to-[#e6ebf1] font-sans text-[#2C2C2C]">
      {/* Modal ajout utilisateur */}
      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchUsers(); // rechargement propre
          }}
        />
      )}

      <div className="flex justify-end mb-8">
        <button
          onClick={() => setShowModal(true)}
          className="w-12 h-12 flex items-center justify-center text-3xl font-light text-white bg-gradient-to-br from-[#47B881] to-[#34A384] rounded-2xl shadow-lg hover:scale-105 transition-transform"
          aria-label="Ajouter un utilisateur"
        >
          +
        </button>
      </div>

      {/* === MANAGERS === */}
      <div className="mb-8">
        <div
          role="button"
          tabIndex={0}
          className="flex items-center justify-between mb-4 cursor-pointer"
          onClick={() => setShowManagers(!showManagers)}
          onKeyDown={(e) => e.key === 'Enter' && setShowManagers(!showManagers)}
        >
          <h2 className="text-xl font-semibold tracking-wide text-gray-800">Managers</h2>
          {showManagers ? <ChevronDown /> : <ChevronRight />}
        </div>

        {showManagers && (
          <div className="flex flex-wrap gap-6 animate-fade-in">
            {managers.map((u) => renderUserCard(u, u.email === connectedEmail))}
          </div>
        )}
      </div>

      {/* === EMPLOYÉS === */}
      <div>
        <div
          role="button"
          tabIndex={0}
          className="flex items-center justify-between mb-4 cursor-pointer"
          onClick={() => setShowEmployes(!showEmployes)}
          onKeyDown={(e) => e.key === 'Enter' && setShowEmployes(!showEmployes)}
        >
          <h2 className="text-xl font-semibold tracking-wide text-gray-800">Employés</h2>
          {showEmployes ? <ChevronDown /> : <ChevronRight />}
        </div>

        {showEmployes && (
          <div className="flex flex-wrap gap-6 animate-fade-in">
            {employes.map((u) => renderUserCard(u))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceholderUtilisateurs;
