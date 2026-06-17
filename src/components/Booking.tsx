import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Clock, User, Phone, Mail, ChevronRight, ChevronLeft, CheckCircle, Sparkles, MessageSquare, Search, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarPicker } from './Calendar';
import type { Service, Appointment } from '../types';
import { notifyClient, notifyAdmin } from '../lib/notifications';

interface BookedSlot {
  appointment_time: string;
  duration_minutes: number;
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function isSlotBlocked(slotTime: string, slotDuration: number, booked: BookedSlot[]) {
  const start = timeToMinutes(slotTime);
  const end = start + slotDuration;
  return booked.some(b => {
    const bStart = timeToMinutes(b.appointment_time);
    const bEnd = bStart + b.duration_minutes;
    return start < bEnd && end > bStart;
  });
}

const MORNING_SLOTS = ['11:00', '12:00', '13:00', '14:00'];
const AFTERNOON_SLOTS = ['16:00', '17:00', '18:00', '19:00', '20:00'];

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface BookingProps {
  preselectedService?: Service | null;
  onSuccess?: (appointment: Partial<Appointment>) => void;
}

type Step = 'service' | 'datetime' | 'contact' | 'confirm';

// Funciones de validación
const validateName = (name: string) => {
  if (!name.trim()) return 'El nombre es requerido';
  if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim())) return 'Solo letras y espacios';
  return '';
};

const validatePhone = (phone: string) => {
  if (!phone.trim()) return 'El teléfono es requerido';
  const clean = phone.replace(/[\s\-()]/g, '');
  if (!/^\d{10}$/.test(clean)) return 'Teléfono debe tener 10 dígitos (ej: 6671234567)';
  return '';
};

const validateEmail = (email: string) => {
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Correo electrónico inválido';
  return '';
};

export function Booking({ preselectedService, onSuccess }: BookingProps) {
  const [step, setStep] = useState<Step>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(preselectedService ?? null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [formErrors, setFormErrors] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');

  useEffect(() => {
    supabase.from('services').select('*').eq('active', true).order('display_order').then(({ data }) => {
      if (data) setServices(data);
    });
  }, []);

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
      setStep('datetime');
    }
  }, [preselectedService]);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime('');
    supabase
      .from('appointments')
      .select('appointment_time, services(duration_minutes)')
      .eq('appointment_date', selectedDate)
      .neq('status', 'cancelled')
      .then(({ data }) => {
        if (data) {
          setBookedSlots(
            data.map((a: any) => ({
              appointment_time: (a.appointment_time as string).slice(0, 5),
              duration_minutes: (Array.isArray(a.services) ? a.services[0] : a.services)?.duration_minutes ?? 60,
            }))
          );
        }
        setLoadingSlots(false);
      });
  }, [selectedDate]);

  const steps: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'service', label: 'Servicio', icon: Sparkles },
    { id: 'datetime', label: 'Fecha y Hora', icon: CalendarDays },
    { id: 'contact', label: 'Tus Datos', icon: User },
    { id: 'confirm', label: 'Confirmar', icon: CheckCircle },
  ];

  const stepIndex = steps.findIndex(s => s.id === step);

  const serviceCategories = useMemo(
    () => ['Todos', ...Array.from(new Set(services.map(s => s.category)))],
    [services]
  );

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === 'Todos' || s.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, filterCategory]);

  // Validar campos en tiempo real
  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
    if (field === 'name') setFormErrors({ ...formErrors, name: validateName(value) });
    if (field === 'phone') setFormErrors({ ...formErrors, phone: validatePhone(value) });
    if (field === 'email') setFormErrors({ ...formErrors, email: validateEmail(value) });
  };

  const canProceedToConfirm = () => {
    const nameError = validateName(form.name);
    const phoneError = validatePhone(form.phone);
    const emailError = validateEmail(form.email);
    setFormErrors({ name: nameError, phone: phoneError, email: emailError });
    return !nameError && !phoneError && !emailError && form.name && form.phone;
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !form.name || !form.phone) return;

    // Validar antes de enviar
    if (!canProceedToConfirm()) return;

    setSubmitting(true);
    setError('');

    const { error: err } = await supabase.from('appointments').insert({
      client_name: form.name.trim(),
      client_phone: form.phone.trim().replace(/[\s\-()]/g, ''),
      client_email: form.email.trim() || null,
      service_id: selectedService.id,
      service_name: selectedService.name,
      appointment_date: selectedDate,
      appointment_time: `${selectedTime}:00`,
      notes: form.notes.trim() || null,
      status: 'pending',
    });

    if (err) {
      setError('Ocurrió un error al agendar. Por favor intenta de nuevo.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
    onSuccess?.({
      client_name: form.name,
      service_name: selectedService.name,
      appointment_date: selectedDate,
      appointment_time: `${selectedTime}:00`,
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('¡Cita agendada! ✨', {
        body: `${selectedService.name} - ${formatDate(selectedDate)} a las ${formatTime(selectedTime)}`,
        icon: '/vite.svg',
      });
    }

    // Enviar notificaciones por WhatsApp (silenciosamente)
    try {
      const appointmentData = {
        client_name: form.name,
        client_phone: form.phone.trim().replace(/[\s\-()]/g, ''),
        service_name: selectedService.name,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
      };
      await notifyClient(appointmentData);
      await notifyAdmin(appointmentData);
    } catch (notifError) {
      // Ignorar errores de notificación (CORS o red)
      console.warn('Notificación WhatsApp (no crítica)');
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const reset = () => {
    setStep('service');
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setForm({ name: '', phone: '', email: '', notes: '' });
    setFormErrors({ name: '', phone: '', email: '' });
    setSubmitted(false);
    setError('');
  };

  if (submitted) {
    return (
      <section id="agendar" className="bg-white py-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-800 mb-3">¡Cita Agendada!</h2>
          <p className="text-stone-500 mb-6">
            Gracias <strong>{form.name}</strong>. Tu cita para <strong>{selectedService?.name}</strong> ha sido registrada para el <strong>{formatDate(selectedDate)}</strong> a las <strong>{formatTime(selectedTime)}</strong>.
          </p>
          <div className="bg-nude-50 rounded-2xl p-5 text-left mb-6 border border-nude-200">
            <p className="text-sm text-stone-600 font-medium mb-2">Detalles de tu cita:</p>
            <div className="space-y-1 text-sm text-stone-500">
              <p>📅 {formatDate(selectedDate)}</p>
              <p>🕐 {formatTime(selectedTime)}</p>
              <p>✨ {selectedService?.name}</p>
              <p>📞 Te contactaremos al {form.phone} para confirmar</p>
            </div>
          </div>
          <p className="text-xs text-stone-400 mb-6">
            Nos comunicaremos contigo para confirmar tu cita. ¡Te esperamos!
          </p>
          <button
            onClick={reset}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Agendar Otra Cita
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="agendar" className="bg-white py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-primary-500 text-sm font-semibold tracking-widest uppercase">Reservaciones en línea</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-800 mt-2 mb-3">
            Agenda tu cita
          </h2>
          <p className="text-stone-500">Elige tu servicio, fecha y hora en pocos pasos.</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isDone
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                  >
                    {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs hidden sm:block ${isActive ? 'text-primary-600 font-semibold' : isDone ? 'text-green-600' : 'text-stone-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-1 mb-4 sm:mb-5 transition-colors ${i < stepIndex ? 'bg-green-400' : 'bg-stone-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-nude-50 rounded-3xl border border-nude-200 p-6 sm:p-8">
          {step === 'service' && (
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-800 mb-4">¿Qué servicio deseas?</h3>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar servicio..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-stone-200 focus:border-primary-400 rounded-xl text-stone-800 text-sm outline-none transition-colors bg-white placeholder:text-stone-400"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {serviceCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterCategory === cat
                        ? 'bg-primary-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                {filteredServices.length === 0 ? (
                  <p className="text-center text-stone-400 text-sm py-8">No se encontraron servicios.</p>
                ) : (
                  filteredServices.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${selectedService?.id === s.id
                          ? 'border-primary-400 bg-primary-50 shadow-md'
                          : 'border-stone-200 bg-white hover:border-primary-200 hover:bg-pink-50'
                        }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-800 text-sm">{s.name}</p>
                        <p className="text-stone-400 text-xs mt-0.5">{s.category} · {s.duration_minutes} min</p>
                      </div>
                      <p className="text-primary-600 font-bold text-sm shrink-0">
                        ${s.price_min.toFixed(0)}{s.price_max ? `–$${s.price_max.toFixed(0)}` : ''} MXN
                      </p>
                    </button>
                  ))
                )}
              </div>

              <button
                disabled={!selectedService}
                onClick={() => setStep('datetime')}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold py-3.5 rounded-full transition-all"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'datetime' && (
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-800 mb-4">¿Cuándo te gustaría venir?</h3>

              {selectedService && (
                <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-xl px-3 py-2 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  <span className="text-xs text-primary-700 font-medium">{selectedService.name}</span>
                  <span className="text-xs text-primary-400 ml-auto">{selectedService.duration_minutes} min</span>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  <CalendarDays className="w-4 h-4 inline mr-1.5" />Selecciona una fecha
                </label>
                <CalendarPicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minDate={getTodayString()}
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    <Clock className="w-4 h-4 inline mr-1.5" />Horario disponible
                  </label>
                  {loadingSlots ? (
                    <div className="flex gap-2 flex-wrap">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="h-10 w-24 rounded-full bg-stone-200 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Mañana</p>
                      <div className="flex flex-wrap gap-2">
                        {MORNING_SLOTS.map(slot => {
                          const blocked = isSlotBlocked(slot, selectedService?.duration_minutes ?? 60, bookedSlots);
                          return (
                            <button
                              key={slot}
                              disabled={blocked}
                              onClick={() => setSelectedTime(slot)}
                              className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${blocked
                                  ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed line-through'
                                  : selectedTime === slot
                                    ? 'border-primary-500 bg-primary-500 text-white shadow-md'
                                    : 'border-stone-200 bg-white text-stone-700 hover:border-primary-300 hover:text-primary-600'
                                }`}
                            >
                              {formatTime(slot)}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-stone-500 font-medium uppercase tracking-wide pt-1">Tarde / Noche</p>
                      <div className="flex flex-wrap gap-2">
                        {AFTERNOON_SLOTS.map(slot => {
                          const blocked = isSlotBlocked(slot, selectedService?.duration_minutes ?? 60, bookedSlots);
                          return (
                            <button
                              key={slot}
                              disabled={blocked}
                              onClick={() => setSelectedTime(slot)}
                              className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${blocked
                                  ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed line-through'
                                  : selectedTime === slot
                                    ? 'border-primary-500 bg-primary-500 text-white shadow-md'
                                    : 'border-stone-200 bg-white text-stone-700 hover:border-primary-300 hover:text-primary-600'
                                }`}
                            >
                              {formatTime(slot)}
                            </button>
                          );
                        })}
                      </div>
                      {bookedSlots.length === 0 && (
                        <p className="text-xs text-green-600 flex items-center gap-1 pt-1">
                          <CheckCircle className="w-3 h-3" /> Todos los horarios disponibles para este día
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('service')}
                  className="flex items-center gap-1 px-5 py-3 rounded-full border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep('contact')}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold py-3 rounded-full transition-all"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'contact' && (
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-800 mb-5">Tus datos de contacto</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    <User className="w-4 h-4 inline mr-1.5" />Nombre completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={e => handleFieldChange('name', e.target.value)}
                    className={`w-full border-2 ${formErrors.name ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-primary-400'
                      } rounded-xl px-4 py-3 text-stone-800 outline-none transition-colors bg-white placeholder:text-stone-400`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    <Phone className="w-4 h-4 inline mr-1.5" />Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: 6671234567"
                    value={form.phone}
                    onChange={e => handleFieldChange('phone', e.target.value)}
                    className={`w-full border-2 ${formErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-primary-400'
                      } rounded-xl px-4 py-3 text-stone-800 outline-none transition-colors bg-white placeholder:text-stone-400`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    <Mail className="w-4 h-4 inline mr-1.5" />Correo electrónico (opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={e => handleFieldChange('email', e.target.value)}
                    className={`w-full border-2 ${formErrors.email ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-primary-400'
                      } rounded-xl px-4 py-3 text-stone-800 outline-none transition-colors bg-white placeholder:text-stone-400`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    <MessageSquare className="w-4 h-4 inline mr-1.5" />Notas adicionales (opcional)
                  </label>
                  <textarea
                    placeholder="¿Algún diseño especial, alergias, o comentario?"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full border-2 border-stone-200 focus:border-primary-400 rounded-xl px-4 py-3 text-stone-800 outline-none transition-colors bg-white placeholder:text-stone-400 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('datetime')}
                  className="flex items-center gap-1 px-5 py-3 rounded-full border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  disabled={!form.name || !form.phone || !!formErrors.name || !!formErrors.phone || !!formErrors.email}
                  onClick={() => {
                    if (canProceedToConfirm()) setStep('confirm');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold py-3 rounded-full transition-all"
                >
                  Revisar Cita <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-800 mb-5">Confirma tu cita</h3>

              <div className="bg-white rounded-2xl border-2 border-primary-100 p-5 space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-stone-500">Servicio</p>
                    <p className="font-semibold text-stone-800">{selectedService?.name}</p>
                    <p className="text-primary-600 text-sm font-bold">
                      ${selectedService?.price_min.toFixed(0)}
                      {selectedService?.price_max ? ` - $${selectedService.price_max.toFixed(0)}` : ''} MXN
                    </p>
                  </div>
                </div>
                <div className="h-px bg-stone-100" />
                <div className="flex items-start gap-3">
                  <CalendarDays className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-stone-500">Fecha y hora</p>
                    <p className="font-semibold text-stone-800 capitalize">{formatDate(selectedDate)}</p>
                    <p className="text-stone-600 text-sm">{formatTime(selectedTime)}</p>
                  </div>
                </div>
                <div className="h-px bg-stone-100" />
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-stone-500">Contacto</p>
                    <p className="font-semibold text-stone-800">{form.name}</p>
                    <p className="text-stone-600 text-sm">{form.phone}</p>
                    {form.email && <p className="text-stone-500 text-sm">{form.email}</p>}
                  </div>
                </div>
                {form.notes && (
                  <>
                    <div className="h-px bg-stone-100" />
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-stone-500">Notas</p>
                        <p className="text-stone-600 text-sm">{form.notes}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {'Notification' in window && Notification.permission === 'default' && (
                <button
                  onClick={requestNotificationPermission}
                  className="w-full mb-4 text-sm text-stone-600 bg-amber-50 border border-amber-200 rounded-xl py-2.5 px-4 hover:bg-amber-100 transition-colors"
                >
                  🔔 Activar notificaciones para recibir confirmación
                </button>
              )}

              {error && (
                <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-2.5 mb-4">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('contact')}
                  className="flex items-center gap-1 px-5 py-3 rounded-full border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-70 text-white font-semibold py-3 rounded-full transition-all shadow-lg shadow-primary-200"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Confirmar Cita
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}