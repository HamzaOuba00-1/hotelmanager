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
import PlanningPage from "./pages/dashboard/EmployeDashboardComponents/EmployeePlanningPage";
import PointagePage from "./pages/dashboard/EmployeDashboardComponents/PointagePage";
import DashboardAccueilEmploye from "./pages/dashboard/EmployeDashboardComponents/DashboardAccueilEmploye";
import Channels from './pages/dashboard/ManagerDashboardComponents/ChannelsPage';
import EmployeeChatPage from "./pages/dashboard/EmployeDashboardComponents/EmployeeChatPage";
import PublicRoomsPage from "./pages/PublicRoomsPage";
import ReservationsPage from "./pages/dashboard/ManagerDashboardComponents/ReservationsPage";
import IssuesPage from "./pages/dashboard/ManagerDashboardComponents/IssuesPage";
import EmployeeIssuesPage from "./pages/dashboard/EmployeDashboardComponents/IssuesPage";

const DEFAULT_PUBLIC_HOTEL_ID = 1;
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterManagerPage />} />
        <Route path="/hotels/:hotelId/rooms" element={<PublicRoomsPage />} />

        {/* Routes protégées - Manager */}
        <Route element={<PrivateRoute allowedRoles={["MANAGER"]} />}>
          <Route path="/dashboard/manager" element={<ManagerDashboard />}>
            <Route index element={<DashboardAccueil />} />
            <Route path="users" element={<PlaceholderUtilisateurs />} />
            <Route path="configuration" element={<HotelConfigPage />} />
            <Route path="rooms" element={<RoomsPage />} />{" "}
            <Route path="reservations" element={<ReservationsPage />} />
            {/* Full path: /dashboard/manager/rooms */}
            <Route path="planning" element={<Planning />} />
            <Route path="pointage" element={<Pointage />} />
            <Route path="channels" element={<Channels />} />
            <Route path="issues" element={<IssuesPage />} />
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
            <Route path="messages" element={<EmployeeChatPage />} />
            <Route path="issues" element={<EmployeeIssuesPage />} />
            
          </Route>
        </Route>

        {/* Routes protégées - Client */}
        <Route element={<PrivateRoute allowedRoles={["CLIENT"]} />}>
          <Route path="/dashboard/client" element={<ClientDashboard />} />
          <Route path="rooms" element={<RoomsPage />} />{" "}
          {/* Full path: /dashboard/client/rooms */}
        </Route>

        {/* Redirections */}
        <Route path="/" element={<Navigate to={`/hotels/${DEFAULT_PUBLIC_HOTEL_ID}/rooms`} replace />}/>
        <Route path="*" element={<div>404 - Page introuvable</div>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
