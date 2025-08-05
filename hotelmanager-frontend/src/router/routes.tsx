import React from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';

import LoginPage from '../pages/login/LoginPage';
import RegisterManagerPage from '../pages/register/RegisterManagerPage';
import ManagerDashboard from '../pages/dashboard/ManagerDashboard';
import EmployeDashboard from '../pages/dashboard/EmployeDashboard';
import ClientDashboard from '../pages/dashboard/ClientDashboard';
import PrivateRoute from './PrivateRoute';
import MePage from '../pages/MePage';
import DashboardAccueil from '../pages/dashboard/components/DashboardAccueil';
import PlaceholderUtilisateurs from '../pages/dashboard/components/PlaceholderUtilisateurs';
import RoomsPage from "../pages/rooms/RoomsPage";
import HotelConfigPage from '../pages/dashboard/components/HotelConfigPage';
import ChatPage from "../pages/chat/ChatPage";

const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Routes publiques */}
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterManagerPage/>}/>
                <Route path="/me" element={<MePage/>}/>

                {/* Routes MANAGER */}
                <Route element={<PrivateRoute allowedRoles={['MANAGER']}/>}>
                    <Route path="/dashboard/manager" element={<ManagerDashboard/>}>
                        {/* Sous-routes imbriquées du layout Manager */}
                        <Route index element={<DashboardAccueil/>}/>
                        <Route path="users" element={<PlaceholderUtilisateurs/>}/>
                        <Route path="rooms" element={<RoomsPage/>}/> {/* Access: /dashboard/manager/rooms */}
                        <Route path="configuration" element={<HotelConfigPage/>}/>
                        <Route path="chat" element={<ChatPage/>}/>
                        {/* 404 local à la section manager (optionnel mais utile) */}
                        <Route path="*" element={<div>Section Manager : page introuvable</div>}/>
                    </Route>
                </Route>

                {/* Routes EMPLOYE */}
                <Route element={<PrivateRoute allowedRoles={['EMPLOYE']}/>}>
                    <Route path="/dashboard/employe" element={<EmployeDashboard/>}>
                        <Route index element={<DashboardAccueil/>}/> {/* Optional default for /dashboard/employe */}
                        <Route path="rooms" element={<RoomsPage/>}/> {/* Access: /dashboard/employe/rooms */}
                    </Route>
                </Route>

                {/* Routes CLIENT */}
                <Route element={<PrivateRoute allowedRoles={['CLIENT']}/>}>
                    <Route path="/dashboard/client" element={<ClientDashboard/>}>
                        <Route index element={<DashboardAccueil/>}/> {/* Optional default for /dashboard/client */}
                        <Route path="rooms" element={<RoomsPage/>}/> {/* Access: /dashboard/client/rooms */}
                    </Route>
                </Route>

                {/* Test / Démo */}
                <Route path="/test" element={<div style={{color: 'green'}}>Test direct OK</div>}/>

                {/* Fallback global */}
                <Route path="/" element={<Navigate to="/login"/>}/>
                <Route path="*" element={<div>404 - Page introuvable</div>}/>
            </Routes>

            <Route path="/test" element={<div style={{color: 'green'}}>Test direct OK</div>}/>

        </Router>
    );
};

export default AppRoutes;
