// src/App.tsx
import { Route, Routes } from "react-router-dom";

import LoginPage from "./pages/login/LoginPage";
import RegisterManagerPage from "./pages/register/RegisterManagerPage";
import PublicRoomsPage from "./pages/PublicRoomsPage";
import PublicHomePage from "./pages/PublicHomePage";

import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import EmployeDashboard from "./pages/dashboard/EmployeDashboard";
import ClientDashboard from "./pages/dashboard/ClientDashboard";

import PrivateRoute from "./router/PrivateRoute";
import { AuthProvider } from "./auth/authContext";

// Manager pages
import DashboardAccueil from "./pages/dashboard/ManagerDashboardComponents/DashboardAccueil";
import PlaceholderUtilisateurs from "./pages/dashboard/ManagerDashboardComponents/Utilisateurs";
import HotelConfigPage from "./pages/dashboard/ManagerDashboardComponents/HotelConfigPage";
import RoomsPage from "./pages/dashboard/ManagerDashboardComponents/RoomsPage";
import ReservationsPage from "./pages/dashboard/ManagerDashboardComponents/ReservationsPage";
import Planning from "./pages/dashboard/ManagerDashboardComponents/PlanningPage ";
import Pointage from "./pages/dashboard/ManagerDashboardComponents/PointagePage";
import Channels from "./pages/dashboard/ManagerDashboardComponents/ChannelsPage";
import IssuesPage from "./pages/dashboard/ManagerDashboardComponents/IssuesPage";
import ManagerProfilePage from "./pages/dashboard/ManagerDashboardComponents/ManagerProfilePage";

// Employe pages
import DashboardAccueilEmploye from "./pages/dashboard/EmployeDashboardComponents/DashboardAccueilEmploye";
import PlanningPage from "./pages/dashboard/EmployeDashboardComponents/EmployeePlanningPage";
import PointagePage from "./pages/dashboard/EmployeDashboardComponents/PointagePage";
import EmployeeChatPage from "./pages/dashboard/EmployeDashboardComponents/EmployeeChatPage";
import EmployeeIssuesPage from "./pages/dashboard/EmployeDashboardComponents/IssuesPage";
import EmployeeProfilePage from "./pages/dashboard/EmployeDashboardComponents/EmployeeProfilePage";

// Client pages
import ClientReservationsPage from "./pages/dashboard/ClientDashboardComponents/ClientReservationsPage";
import ClientMessagesPage from "./pages/dashboard/ClientDashboardComponents/ClientMessagesPage";
import ClientProfilePage from "./pages/dashboard/ClientDashboardComponents/ClientProfilePage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterManagerPage />} />
        <Route path="/hotels/:hotelId/rooms" element={<PublicRoomsPage />} />

        {/* Manager */}
        <Route element={<PrivateRoute allowedRoles={["MANAGER"]} />}>
          <Route path="/dashboard/manager" element={<ManagerDashboard />}>
            <Route index element={<DashboardAccueil />} />
            <Route path="users" element={<PlaceholderUtilisateurs />} />
            <Route path="configuration" element={<HotelConfigPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="planning" element={<Planning />} />
            <Route path="pointage" element={<Pointage />} />
            <Route path="channels" element={<Channels />} />
            <Route path="issues" element={<IssuesPage />} />
            <Route path="profil" element={<ManagerProfilePage />} />
          </Route>
        </Route>

        {/* Employé */}
        <Route element={<PrivateRoute allowedRoles={["EMPLOYE"]} />}>
          <Route path="/dashboard/employe" element={<EmployeDashboard />}>
            <Route index element={<DashboardAccueilEmploye />} />
            <Route path="planning" element={<PlanningPage />} />
            <Route path="pointage" element={<PointagePage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="messages" element={<EmployeeChatPage />} />
            <Route path="issues" element={<EmployeeIssuesPage />} />
            <Route path="profil" element={<EmployeeProfilePage />} />
          </Route>
        </Route>

        {/* Client */}
        <Route element={<PrivateRoute allowedRoles={["CLIENT"]} />}>
          <Route path="/dashboard/client" element={<ClientDashboard />}>
            <Route path="reservations" element={<ClientReservationsPage />} />
            <Route path="messages" element={<ClientMessagesPage />} />
            <Route path="profil" element={<ClientProfilePage />} />
            <Route path="rooms" element={<RoomsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={<div className="p-8">404 - Page introuvable</div>}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
