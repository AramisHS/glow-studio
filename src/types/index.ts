export interface Service {
  id: string;
  name: string;
  description: string | null;
  price_min: number;
  price_max: number | null;
  duration_minutes: number;
  category: string;
  active: boolean;
  display_order: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  service_id: string | null;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  client_name: string;
  rating: number;
  comment: string;
  service_name: string | null;
  approved: boolean;
  created_at: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export type BookingStep = 'service' | 'datetime' | 'contact' | 'confirm';
