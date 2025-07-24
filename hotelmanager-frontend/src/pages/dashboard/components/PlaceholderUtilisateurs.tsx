import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserRound } from 'lucide-react';


interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'MANAGER' | 'EMPLOYE' | 'CLIENT';
  hotel: {
    id: number;
  };
}

const PlaceholderUtilisateurs: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [connectedUserEmail, setConnectedUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    console.log('Email connecté :', email);
    setConnectedUserEmail(email);

    axios
      .get<User[]>('http://localhost:8080/users/my-hotel', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des utilisateurs :', err);
      });
  }, []);

  return (
    <div className="p-4">
      {/* + Button en haut à droite */}
      <div className="flex justify-end mb-4">
        <button className="w-12 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-100 text-2xl">+</button>
      </div>

      {/* Liste utilisateurs */}
      <div className="flex flex-wrap gap-4">
        {users.map((user) => {
          const isConnectedUser = user.email === connectedUserEmail;

          return (
            <div
              key={user.id}
              className={`flex flex-col items-center justify-center w-32 h-40 rounded-xl shadow-md p-2 border-2 transition
                ${isConnectedUser ? 'border-green-300' : 'border-gray-300'}
              `}
            >
              <UserRound className="h-10 w-10 text-green-500 mb-2" />
              <div className="text-sm font-semibold text-center">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs font-medium text-gray-600">{user.role}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaceholderUtilisateurs;
