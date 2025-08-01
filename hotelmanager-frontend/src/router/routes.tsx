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
import HotelConfigPage from '../pages/dashboard/components/HotelConfigPage';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterManagerPage />} />
        <Route path="/me" element={<MePage />} />

        {/* MANAGER */}
        <Route element={<PrivateRoute allowedRoles={['MANAGER']} />}>
          <Route path="/dashboard/manager/*" element={<ManagerDashboard />}>
            <Route index element={<DashboardAccueil />} />
            <Route path="users" element={<PlaceholderUtilisateurs />} />
            <Route path="configuration" element={<HotelConfigPage />} />
            {/* 404 local à la section manager (optionnel mais utile) */}
            <Route path="*" element={<div>Section Manager : page introuvable</div>} />
          </Route>
        </Route>

        {/* EMPLOYE */}
        <Route element={<PrivateRoute allowedRoles={['EMPLOYE']} />}>
          <Route path="/dashboard/employe" element={<EmployeDashboard />} />
        </Route>

        {/* CLIENT */}
        <Route element={<PrivateRoute allowedRoles={['CLIENT']} />}>
          <Route path="/dashboard/client" element={<ClientDashboard />} />
        </Route>

        {/* Test / Démo */}
        <Route path="/test" element={<div style={{ color: 'green' }}>Test direct OK</div>} />

        {/* Fallback global */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<div>404 - Page introuvable</div>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
