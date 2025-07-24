// ManagerUsersPage.tsx
import { useState } from "react";
import AddUserForm from "./AddUserForm";
import UserList from "./UserList";

const ManagerUsersPage = () => {
  const [reloadFlag, setReloadFlag] = useState(0);

  return (
    <>
      <h2 className="text-xl font-semibold mb-6">Gestion des utilisateurs</h2>

      <AddUserForm onUserCreated={() => setReloadFlag((n) => n + 1)} />

      <div className="mt-10">
        <UserList key={reloadFlag} />
      </div>
    </>
  );
};
