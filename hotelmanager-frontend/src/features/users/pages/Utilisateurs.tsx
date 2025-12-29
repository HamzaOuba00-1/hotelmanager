import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  UserRound,
  ChevronDown,
  ChevronRight,
  Users,
} from "lucide-react";
import CrewSection from "../components/CrewSection";
import AddUserModal from "../components/AddUserModal";
import type { User } from "../User";

const PlaceholderUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [showManagers, setShowManagers] = useState(true);
  const [showEmployees, setShowEmployees] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    setConnectedEmail(email);

    axios
      .get<User[]>("http://localhost:8080/users/my-hotel", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) setUsers(res.data);
        else console.error("Unexpected data format", res);
      })
      .catch((err) =>
        console.error("Error loading users:", err)
      );
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
        ${isConnected ? "ring-2 ring-[#47B881] shadow-green-200" : ""}`}
    >
      <UserRound className="h-10 w-10 text-[#47B881] mb-2" />
      <div className="text-base font-semibold text-gray-800 text-center tracking-wide">
        {user.firstName} {user.lastName}
      </div>
      <div className="text-[13px] text-gray-500 uppercase mt-1 tracking-widest">
        {user.role}
      </div>
    </div>
  );

  const managers = users
    .filter((u) => u.role === "MANAGER")
    .sort((a, b) =>
      a.email === connectedEmail
        ? -1
        : b.email === connectedEmail
        ? 1
        : 0
    );

  const employees = users.filter((u) => u.role === "EMPLOYE");

  return (
    <div className="container mx-auto p-6 min-h-screen">
      {/* Add user modal */}
      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchUsers();
          }}
        />
      )}

      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="h-8 w-8 text-emerald-600" />
          Hotel Team
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          Manage managers and employees associated with your hotel.
        </p>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 
                    bg-gradient-to-br from-emerald-500 to-emerald-600 text-white 
                    rounded-xl shadow-lg hover:from-emerald-600 hover:to-emerald-700 
                    transition-all mt-3"
          aria-label="Add user"
        >
          Add member
        </button>
      </div>

      {/* === MANAGERS === */}
      <div className="mb-10">
        <div
          role="button"
          tabIndex={0}
          className="flex items-center justify-between mb-4 cursor-pointer 
                     bg-white/50 backdrop-blur-md border border-white/30 
                     rounded-2xl px-4 py-3 shadow-sm"
          onClick={() => setShowManagers(!showManagers)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            setShowManagers(!showManagers)
          }
        >
          <h2 className="text-lg font-semibold tracking-wide text-gray-800">
            Managers
          </h2>
          {showManagers ? (
            <ChevronDown className="text-gray-600" />
          ) : (
            <ChevronRight className="text-gray-600" />
          )}
        </div>

        {showManagers && (
          <div className="flex flex-wrap gap-6 animate-fadeIn">
            {managers.map((u) =>
              renderUserCard(u, u.email === connectedEmail)
            )}
          </div>
        )}
      </div>

      {/* === EMPLOYEES === */}
      <div className="mb-10">
        <div
          role="button"
          tabIndex={0}
          className="flex items-center justify-between mb-4 cursor-pointer 
                     bg-white/50 backdrop-blur-md border border-white/30 
                     rounded-2xl px-4 py-3 shadow-sm"
          onClick={() => setShowEmployees(!showEmployees)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            setShowEmployees(!showEmployees)
          }
        >
          <h2 className="text-lg font-semibold tracking-wide text-gray-800">
            Employees
          </h2>
          {showEmployees ? (
            <ChevronDown className="text-gray-600" />
          ) : (
            <ChevronRight className="text-gray-600" />
          )}
        </div>

        {showEmployees && (
          <div className="flex flex-wrap gap-6 animate-fadeIn">
            {employees.map((u) => renderUserCard(u))}
          </div>
        )}
      </div>

      <CrewSection allUsers={users} />

      {/* Consistent animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PlaceholderUsers;
