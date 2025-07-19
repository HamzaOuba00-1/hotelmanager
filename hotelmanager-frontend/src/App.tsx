import { Routes, Route } from 'react-router-dom';
import RegisterManagerPage from './pages/register/RegisterManagerPage';
import LoginPage from './pages/login/LoginPage';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import PrivateRoute from './router/PrivateRoute';
import UserList from '../src/pages/user/UserList';
import EmployeDashboard from './pages/dashboard/EmployeDashboard';
import ClientDashboard from './pages/dashboard/ClientDashboard';


function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterManagerPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard/manager" element={<ManagerDashboard />} />
      <Route path="/users" element={<PrivateRoute allowedRoles={['MANAGER']} />}>
        <Route index element={<UserList />} />
      </Route>
      <Route path="/manager" element={<ManagerDashboard />} />
      <Route path="/employe" element={<EmployeDashboard />} />
      <Route path="/client" element={<ClientDashboard />} />

    </Routes>
  );
}

export default App;
