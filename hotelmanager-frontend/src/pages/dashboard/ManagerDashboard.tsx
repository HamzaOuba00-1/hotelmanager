import React from 'react';
import UserList from '../user/UserList';

const ManagerDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>

      <section className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Utilisateurs</h2>
        <UserList />
      </section>
    </div>
  );
};

export default ManagerDashboard;
