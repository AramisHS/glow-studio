import { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Booking } from './components/Booking';
import { Reviews } from './components/Reviews';
import { Map } from './components/Map';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import type { Service, Appointment } from './types';

export default function App() {
  const { toasts, addToast, removeToast } = useToast();
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);

  const handleBookService = useCallback((service: Service) => {
    setPreselectedService(service);
    setTimeout(() => {
      document.querySelector('#agendar')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  const handleBookingSuccess = useCallback((appointment: Partial<Appointment>) => {
    addToast({
      type: 'success',
      title: '¡Cita agendada exitosamente!',
      message: `${appointment.service_name} registrado. Te contactaremos pronto.`,
    });
    setPreselectedService(null);
  }, [addToast]);

  return (
    <div className="min-h-screen bg-nude-50 font-sans">
      <Navbar />
      <Hero />
      <Services onBookService={handleBookService} />
      <Booking
        preselectedService={preselectedService}
        onSuccess={handleBookingSuccess}
      />
      <Reviews addToast={addToast} />
      <Map />
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
