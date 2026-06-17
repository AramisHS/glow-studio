import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Booking } from './components/Booking';
import { Reviews } from './components/Reviews';
import { Map } from './components/Map';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import ServicesAdmin from './components/admin/ServicesAdmin';
import ReviewsAdmin from './components/admin/ReviewsAdmin';
import AppointmentsAdmin from './components/admin/AppointmentsAdmin';
import CategoriesAdmin from './components/admin/CategoriesAdmin';
import type { Appointment } from './types';

function HomePage() {
  const { toasts, addToast, removeToast } = useToast();

  const handleBookingSuccess = (appointment: Partial<Appointment>) => {
    addToast({
      type: 'success',
      title: '¡Cita agendada exitosamente!',
      message: `${appointment.service_name} registrado. Te contactaremos pronto.`,
    });
  };

  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <Booking onSuccess={handleBookingSuccess} />
      <Reviews addToast={addToast} />
      <Map />
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/servicios" replace />} />
            <Route path="categorias" element={<CategoriesAdmin />} />
            <Route path="servicios" element={<ServicesAdmin />} />
            <Route path="citas" element={<AppointmentsAdmin />} />
            <Route path="reseñas" element={<ReviewsAdmin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}