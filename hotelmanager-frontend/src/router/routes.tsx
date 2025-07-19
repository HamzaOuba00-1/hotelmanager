import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '../pages/login/LoginPage';
import RegisterManagerPage from '../pages/register/RegisterManagerPage';
import ManagerDashboard from '../pages/dashboard/ManagerDashboard';
import EmployeDashboard from '../pages/dashboard/EmployeDashboard';
import ClientDashboard from '../pages/dashboard/ClientDashboard';
import UserList from '../pages/user/UserList';
import PrivateRoute from './PrivateRoute';
import MePage from '../pages/MePage'; // pour tester /me

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterManagerPage />} />

        {/* Route test /me */}
        <Route path="/me" element={<MePage />} />

        {/* Routes protégées : accès MANAGER */}
        <Route element={<PrivateRoute allowedRoles={['MANAGER']} />}>
          <Route path="/dashboard/manager" element={<ManagerDashboard />} />
          <Route path="/users" element={<UserList />} />
        </Route>

        {/* Routes protégées : accès EMPLOYE */}
        <Route element={<PrivateRoute allowedRoles={['EMPLOYE']} />}>
          <Route path="/dashboard/employe" element={<EmployeDashboard />} />
        </Route>

        {/* Routes protégées : accès CLIENT */}
        <Route element={<PrivateRoute allowedRoles={['CLIENT']} />}>
          <Route path="/dashboard/client" element={<ClientDashboard />} />
        </Route>

        {/* Redirection */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<div>404 - Page introuvable</div>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
