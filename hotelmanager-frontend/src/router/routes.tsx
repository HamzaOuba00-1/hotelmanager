import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '../pages/login/LoginPage';
import RegisterManagerPage from '../pages/register/RegisterManagerPage';
import ManagerDashboard from '../pages/dashboard/ManagerDashboard';
import EmployeDashboard from '../pages/dashboard/EmployeDashboard';
import ClientDashboard from '../pages/dashboard/ClientDashboard';
import PrivateRoute from './PrivateRoute';
import MePage from '../pages/MePage';

import DashboardAccueil from '../pages/dashboard/components/DashboardAccueil';
import PlaceholderUtilisateurs from '../pages/dashboard/components/PlaceholderUtilisateurs';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterManagerPage />} />
        <Route path="/me" element={<MePage />} />

        {/* Routes MANAGER */}
        <Route element={<PrivateRoute allowedRoles={['MANAGER']} />}>
          <Route path="/dashboard/manager" element={<ManagerDashboard />}>
            {/* Sous-routes imbriquées du layout Manager */}
            <Route index element={<DashboardAccueil />} />
            <Route path="users" element={<PlaceholderUtilisateurs />} />
          </Route>
        </Route>

        {/* Routes EMPLOYE */}
        <Route element={<PrivateRoute allowedRoles={['EMPLOYE']} />}>
          <Route path="/dashboard/employe" element={<EmployeDashboard />} />
        </Route>

        {/* Routes CLIENT */}
        <Route element={<PrivateRoute allowedRoles={['CLIENT']} />}>
          <Route path="/dashboard/client" element={<ClientDashboard />} />
        </Route>

        {/* Redirections */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<div>404 - Page introuvable</div>} />
      </Routes>

      <Route path="/test" element={<div style={{ color: 'green' }}>Test direct OK</div>} />

    </Router>
  );
};

export default AppRoutes;
