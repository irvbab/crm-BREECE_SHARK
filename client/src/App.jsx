import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ContactForm from './pages/ContactForm.jsx';
import ContactDetail from './pages/ContactDetail.jsx';
import Stats from './pages/Stats.jsx';
import Account from './pages/Account.jsx';
import Privacy from './pages/Privacy.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confidentialite" element={<Privacy />} />

      {/* Pages réservées aux utilisateurs connectés */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
      <Route path="/contacts/new" element={<ProtectedRoute><ContactForm /></ProtectedRoute>} />
      <Route path="/contacts/:id" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
      <Route path="/contacts/:id/edit" element={<ProtectedRoute><ContactForm /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}