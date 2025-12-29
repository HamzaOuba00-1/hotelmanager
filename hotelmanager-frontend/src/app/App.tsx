import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/authContext";
import PrivateRoute from "../router/PrivateRoute";

/* ===== Public ===== */
import PublicHomePage from "../features/public/pages/PublicHomePage";
import PublicRoomsPage from "../features/public/pages/PublicRoomsPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterManagerPage from "../features/auth/pages/RegisterManagerPage";



/* ===== Dashboard Views ===== */
import DashboardAccueil from "../features/dashboard/views/DashboardAccueil";
import DashboardAccueilEmploye from "../features/dashboard/views/DashboardAccueilEmploye";

/* ===== Manager ===== */
import ManagerHomePage from "../features/home/views/ManagerHomePage";
import HotelConfigPage from "../features/hotel/pages/HotelConfigPage";
import RoomsPage from "../features/rooms/pages/RoomsPage";
import ReservationsPage from "../features/reservations/views/ReservationsPageM";
import PlanningPageM from "../features/planning/views/PlanningPageM";
import PointagePageM from "../features/attendance/views/PointagePageM";
import ChannelsPage from "../features/chat/views/ChannelsPage";
import IssuesPageM from "../features/issues/views/IssuesPageM";
import ManagerProfilePage from "../features/profil/views/ManagerProfilePage";
import UtilisateursPage from "../features/users/pages/Utilisateurs";

/* ===== Employe ===== */
import EmployeePlanningPage from "../features/planning/views/EmployeePlanningPage";
import PointagePageE from "../features/attendance/views/PointagePageE";
import EmployeeChatPage from "../features/chat/views/EmployeeChatPage";
import IssuesPageE from "../features/issues/views/IssuesPageE";
import EmployeeProfilePage from "../features/profil/views/EmployeeProfilePage";

/* ===== Client ===== */
import ClientReservationsPage from "../features/reservations/views/ClientReservationsPage";
import ClientMessagesPage from "../features/chat/views/ClientMessagesPage";
import ClientProfilePage from "../features/profil/views/ClientProfilePage";
import ManagerDashboard from "../layouts/ManagerDashboard";
import EmployeDashboard from "../layouts/EmployeDashboard";

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ===== Public ===== */}
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterManagerPage />} />
        <Route path="/hotels/:hotelId/rooms" element={<PublicRoomsPage />} />

        {/* ===== Manager ===== */}
        <Route element={<PrivateRoute allowedRoles={["MANAGER"]} />}>
          <Route path="/dashboard/manager" element={<ManagerDashboard />}>
            <Route index element={<DashboardAccueil />} />
            <Route path="home" element={<ManagerHomePage />} />
            <Route path="users" element={<UtilisateursPage />} />
            <Route path="configuration" element={<HotelConfigPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="planning" element={<PlanningPageM />} />
            <Route path="pointage" element={<PointagePageM />} />
            <Route path="channels" element={<ChannelsPage />} />
            <Route path="issues" element={<IssuesPageM />} />
            <Route path="profil" element={<ManagerProfilePage />} />
          </Route>
        </Route>

        {/* ===== Employe ===== */}
        <Route element={<PrivateRoute allowedRoles={["EMPLOYE"]} />}>
          <Route path="/dashboard/employe" element={<EmployeDashboard />}>
            <Route index element={<DashboardAccueilEmploye />} />
            <Route path="planning" element={<EmployeePlanningPage />} />
            <Route path="pointage" element={<PointagePageE />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="messages" element={<EmployeeChatPage />} />
            <Route path="issues" element={<IssuesPageE />} />
            <Route path="profil" element={<EmployeeProfilePage />} />
          </Route>
        </Route>

        {/* ===== Client ===== */}
        <Route element={<PrivateRoute allowedRoles={["CLIENT"]} />}>
          <Route path="/dashboard/client" element={<ClientReservationsPage />}>
            <Route path="reservations" element={<ClientReservationsPage />} />
            <Route path="messages" element={<ClientMessagesPage />} />
            <Route path="profil" element={<ClientProfilePage />} />
            <Route path="rooms" element={<RoomsPage />} />
          </Route>
        </Route>

        {/* ===== 404 ===== */}
        <Route path="*" element={<div className="p-8">404 - Page introuvable</div>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
