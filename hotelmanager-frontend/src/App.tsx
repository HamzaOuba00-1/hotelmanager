import {Navigate, Route, Routes,} from 'react-router-dom';

import LoginPage from './pages/login/LoginPage';
import RegisterManagerPage from './pages/register/RegisterManagerPage';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import EmployeDashboard from './pages/dashboard/EmployeDashboard';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import PrivateRoute from './router/PrivateRoute';
import DashboardAccueil from './pages/dashboard/components/DashboardAccueil';
import PlaceholderUtilisateurs from './pages/dashboard/components/PlaceholderUtilisateurs';
import {AuthProvider} from "./auth/authContext";
import RoomsPage from "./pages/rooms/RoomsPage";


function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Routes publiques */}
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterManagerPage/>}/>

                {/* Routes protégées - Manager */}
                <Route element={<PrivateRoute allowedRoles={['MANAGER']}/>}>
                    <Route path="/dashboard/manager" element={<ManagerDashboard/>}>
                        <Route index element={<DashboardAccueil/>}/>
                        <Route path="users" element={<PlaceholderUtilisateurs/>}/>
                        <Route path="rooms" element={<RoomsPage />} /> {/* Full path: /dashboard/manager/rooms */}
                    </Route>
                </Route>

                {/* Routes protégées - Employé */}
                <Route element={<PrivateRoute allowedRoles={['EMPLOYE']}/>}>
                    <Route path="/dashboard/employe" element={<EmployeDashboard/>}/>
                    <Route path="rooms" element={<RoomsPage />} /> {/* Full path: /dashboard/employe/rooms */}
                </Route>

                {/* Routes protégées - Client */}
                <Route element={<PrivateRoute allowedRoles={['CLIENT']}/>}>
                    <Route path="/dashboard/client" element={<ClientDashboard/>}/>
                    <Route path="rooms" element={<RoomsPage />} /> {/* Full path: /dashboard/client/rooms */}
                </Route>

                {/* Redirections */}
                <Route path="/" element={<Navigate to="/login"/>}/>
                <Route path="*" element={<div>404 - Page introuvable</div>}/>
            </Routes>
        </AuthProvider>
    );
}

export default App;
