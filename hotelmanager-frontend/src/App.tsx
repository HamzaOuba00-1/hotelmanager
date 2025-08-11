import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/login/LoginPage";
import RegisterManagerPage from "./pages/register/RegisterManagerPage";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import EmployeDashboard from "./pages/dashboard/EmployeDashboard";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import PrivateRoute from "./router/PrivateRoute";
import DashboardAccueil from "./pages/dashboard/ManagerDashboardComponents/DashboardAccueil";
import PlaceholderUtilisateurs from "./pages/dashboard/ManagerDashboardComponents/Utilisateurs";
import { AuthProvider } from "./auth/authContext";
import RoomsPage from "./pages/dashboard/ManagerDashboardComponents/RoomsPage";
import Pointage from "./pages/dashboard/ManagerDashboardComponents/PointagePage";

import HotelConfigPage from "./pages/dashboard/ManagerDashboardComponents/HotelConfigPage";
import Planning from "./pages/dashboard/ManagerDashboardComponents/PlanningPage ";
import PlanningPage from "./pages/dashboard/EmployeDashboardComponents/PlanningPage";
import PointagePage from "./pages/dashboard/EmployeDashboardComponents/PointagePage";
import DashboardAccueilEmploye from "./pages/dashboard/EmployeDashboardComponents/DashboardAccueilEmploye";
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterManagerPage />} />

        {/* Routes protégées - Manager */}
        <Route element={<PrivateRoute allowedRoles={["MANAGER"]} />}>
          <Route path="/dashboard/manager" element={<ManagerDashboard />}>
            <Route index element={<DashboardAccueil />} />
            <Route path="users" element={<PlaceholderUtilisateurs />} />
            <Route path="configuration" element={<HotelConfigPage />} />
            <Route path="rooms" element={<RoomsPage />} />{" "}
            {/* Full path: /dashboard/manager/rooms */}
            <Route path="planning" element={<Planning />} />
            <Route path="pointage" element={<Pointage />} />
          </Route>
        </Route>

        {/* Routes protégées - Employé */}
        <Route element={<PrivateRoute allowedRoles={["EMPLOYE"]} />}>
          <Route path="/dashboard/employe" element={<EmployeDashboard />}>
            <Route index element={<DashboardAccueilEmploye />} />
            <Route path="planning" element={<PlanningPage />} />{" "}
            {/* 👈 ajouté */}
            <Route path="pointage" element={<PointagePage />} />{" "}
            {/* 👈 ajouté */}
            <Route path="rooms" element={<RoomsPage />} />
          </Route>
        </Route>

        {/* Routes protégées - Client */}
        <Route element={<PrivateRoute allowedRoles={["CLIENT"]} />}>
          <Route path="/dashboard/client" element={<ClientDashboard />} />
          <Route path="rooms" element={<RoomsPage />} />{" "}
          {/* Full path: /dashboard/client/rooms */}
        </Route>

        {/* Redirections */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<div>404 - Page introuvable</div>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
