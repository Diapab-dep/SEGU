import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Admission } from './pages/Admission';
import { DeprisaCheck } from './pages/DeprisaCheck';
import { Supervisor } from './pages/Supervisor';
import { Users } from './pages/Users';
import { AdmissionDetail } from './pages/AdmissionDetail';
import { PointsOfSale } from './pages/PointsOfSale';
import { ChecklistTemplates } from './pages/ChecklistTemplates';
import { ClientRestrictions } from './pages/ClientRestrictions';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="admission" element={<Admission />} />
        <Route path="deprisacheck" element={<DeprisaCheck />} />
        <Route path="supervisor" element={<Supervisor />} />
        <Route path="admissions/:id" element={<AdmissionDetail />} />
        <Route path="users" element={<Users />} />
        <Route path="points-of-sale" element={<PointsOfSale />} />
        <Route path="checklist-templates" element={<ChecklistTemplates />} />
        <Route path="client-restrictions" element={<ClientRestrictions />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
