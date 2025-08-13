import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '../pages/login/LoginPage';
import RegisterManagerPage from '../pages/register/RegisterManagerPage';
import ManagerDashboard from '../pages/dashboard/ManagerDashboard';
import EmployeDashboard from '../pages/dashboard/EmployeDashboard';
import ClientDashboard from '../pages/dashboard/ClientDashboard';
import PrivateRoute from './PrivateRoute';
import MePage from '../pages/MePage';
import DashboardAccueil from '../pages/dashboard/ManagerDashboardComponents/DashboardAccueil';
import PlaceholderUtilisateurs from '../pages/dashboard/ManagerDashboardComponents/Utilisateurs';
import RoomsPage from "../pages/dashboard/ManagerDashboardComponents/RoomsPage";
import HotelConfigPage from '../pages/dashboard/ManagerDashboardComponents/HotelConfigPage';
import Planning from '../pages/dashboard/ManagerDashboardComponents/PlanningPage ';
import Pointage from '../pages/dashboard/ManagerDashboardComponents/PointagePage';
import PlanningPage from '../pages/dashboard/EmployeDashboardComponents/PlanningPage';
import PointagePage from '../pages/dashboard/EmployeDashboardComponents/PointagePage';
import DashboardAccueilEmploye from '../pages/dashboard/EmployeDashboardComponents/DashboardAccueilEmploye';
import Channels from '../pages/dashboard/ManagerDashboardComponents/ChannelsPage';
import EmployeeChatPage from '../pages/dashboard/EmployeDashboardComponents/EmployeeChatPage';


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
            <Route index element={<DashboardAccueil />} />
            <Route path="users" element={<PlaceholderUtilisateurs />} />
            <Route path="rooms" element={<RoomsPage/>}/> 
            <Route path="configuration" element={<HotelConfigPage />} />
            <Route path="planning" element={<Planning />} />
            <Route path="pointage" element={<Pointage />} />
            <Route path="channels" element={<Channels />} />
            <Route path="*" element={<div>Section Manager : page introuvable</div>} />
          </Route>
        </Route>

        {/* Routes EMPLOYE */}
        <Route element={<PrivateRoute allowedRoles={['EMPLOYE']} />}>
          <Route path="/dashboard/employe" element={<DashboardAccueilEmploye />}>
            <Route index element={<DashboardAccueil />} /> 
            <Route path="planning" element={<PlanningPage />} />   {/* 👈 ajouté */}
            <Route path="pointage" element={<PointagePage />} />   {/* 👈 ajouté */}
            <Route path="rooms" element={<RoomsPage/>}/>
            <Route path="messages" element={<EmployeeChatPage />} />

          </Route>
        </Route>

        {/* Routes CLIENT */}
        <Route element={<PrivateRoute allowedRoles={['CLIENT']} />}>
          <Route path="/dashboard/client" element={<ClientDashboard />}>
            <Route index element={<DashboardAccueil />} />
            <Route path="rooms" element={<RoomsPage/>}/>
          </Route>
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
