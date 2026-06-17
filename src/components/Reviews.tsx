import { useState, useEffect, useMemo } from 'react';
import { Star, Send, MessageSquare, User, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Review, Service } from '../types';

const TIME_FILTERS = [
  { label: 'Recientes', days: null },
  { label: 'Esta semana', days: 7 },
  { label: 'Este mes', days: 30 },
  { label: 'Últimos 3 meses', days: 90 },
];

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className={`w-6 h-6 transition-colors ${star <= (hover || value)
                ? 'text-gold-500 fill-gold-500'
                : onChange ? 'text-stone-300 hover:text-gold-300' : 'text-stone-300'
              }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-nude-200 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-sm">{review.client_name}</p>
            {review.service_name && (
              <p className="text-xs text-primary-500">{review.service_name}</p>
            )}
          </div>
        </div>
        <StarRating value={review.rating} />
      </div>
      <p className="text-stone-600 text-sm leading-relaxed">"{review.comment}"</p>
      <p className="text-stone-400 text-xs mt-auto">{date}</p>
    </div>
  );
}

interface ReviewModalProps {
  services: Service[];
  onClose: () => void;
  onSubmit: (data: { name: string; rating: number; comment: string; service_name: string }) => Promise<void>;
}

function ReviewModal({ services, onClose, onSubmit }: ReviewModalProps) {
  const [form, setForm] = useState({ name: '', rating: 0, comment: '', service_name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; rating?: string; comment?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; rating?: string; comment?: string } = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Nombre debe tener al menos 2 caracteres';
    }
    if (form.rating === 0) {
      newErrors.rating = 'Selecciona una calificación';
    }
    if (!form.comment.trim() || form.comment.trim().length < 5) {
      newErrors.comment = 'El comentario debe tener al menos 5 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await onSubmit({ name: form.name.trim(), rating: form.rating, comment: form.comment.trim(), service_name: form.service_name });
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-800">Comparte tu experiencia</h3>
            <p className="text-stone-500 text-sm mt-0.5">Tu opinión nos ayuda a mejorar</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Tu nombre *</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={`w-full border-2 ${errors.name ? 'border-red-400' : 'border-stone-200'} focus:border-primary-400 rounded-xl px-4 py-3 text-stone-800 outline-none transition-colors placeholder:text-stone-400 text-sm`}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Calificación *</label>
            <StarRating value={form.rating} onChange={v => { setForm(f => ({ ...f, rating: v })); if (errors.rating) setErrors({ ...errors, rating: undefined }); }} />
            {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
            {form.rating > 0 && (
              <p className="text-xs text-stone-500 mt-1">
                {['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][form.rating]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">¿Qué servicio te realizamos?</label>
            <select
              value={form.service_name}
              onChange={e => setForm(f => ({ ...f, service_name: e.target.value }))}
              className="w-full border-2 border-stone-200 focus:border-primary-400 rounded-xl px-4 py-3 text-stone-800 outline-none transition-colors bg-white text-sm appearance-none cursor-pointer"
            >
              <option value="">-- Selecciona un servicio --</option>
              {services.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Tu comentario *</label>
            <textarea
              placeholder="Cuéntanos tu experiencia..."
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              rows={4}
              className={`w-full border-2 ${errors.comment ? 'border-red-400' : 'border-stone-200'} focus:border-primary-400 rounded-xl px-4 py-3 text-stone-800 outline-none transition-colors placeholder:text-stone-400 resize-none text-sm`}
              required
            />
            {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-all text-sm"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Enviando...' : 'Publicar Reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ReviewsProps {
  addToast?: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function Reviews({ addToast }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [timeFilter, setTimeFilter] = useState<number | null>(null);

  const fetchReviews = () => {
    supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setReviews(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
    supabase.from('services').select('id, name').eq('active', true).order('display_order').then(({ data }) => {
      if (data) setServices(data as Service[]);
    });
  }, []);

  const filteredReviews = useMemo(() => {
    if (timeFilter === null) return reviews;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeFilter);
    return reviews.filter(r => new Date(r.created_at) >= cutoff);
  }, [reviews, timeFilter]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const handleSubmit = async (data: { name: string; rating: number; comment: string; service_name: string }) => {
    const { error } = await supabase.from('reviews').insert({
      client_name: data.name.trim(),
      rating: data.rating,
      comment: data.comment.trim(),
      service_name: data.service_name || null,
      approved: true,
    });

    if (error) {
      addToast?.({ type: 'error', title: 'Error al enviar', message: 'Intenta de nuevo.' });
    } else {
      addToast?.({ type: 'success', title: '¡Gracias por tu reseña!', message: 'Tu comentario ha sido publicado.' });
      setShowModal(false);
      fetchReviews();
    }
  };

  const leaveReviewButton = (
    <button
      onClick={() => setShowModal(true)}
      className="inline-flex items-center gap-2 bg-white border-2 border-primary-200 text-primary-600 font-semibold px-6 py-3 rounded-full hover:bg-primary-50 hover:border-primary-400 transition-all shadow-sm hover:shadow-md"
    >
      <MessageSquare className="w-4 h-4" />
      Dejar Mi Reseña
    </button>
  );

  return (
    <section id="resenas" className="bg-nude-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-primary-500 text-sm font-semibold tracking-widest uppercase">Lo que dicen</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-800 mt-2 mb-4">
            Reseñas de Clientes
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className="w-5 h-5 text-gold-500 fill-gold-500" />
              ))}
            </div>
            <span className="text-2xl font-bold text-stone-800">{avgRating}</span>
          </div>
        </div>

        {/* Mobile: leave review button FIRST */}
        <div className="flex justify-center mb-6 md:hidden">
          {leaveReviewButton}
        </div>

        {/* Time filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {TIME_FILTERS.map(f => (
            <button
              key={f.label}
              onClick={() => setTimeFilter(f.days)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${timeFilter === f.days
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-primary-300 hover:text-primary-600'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reviews grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay reseñas en este periodo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}

        {/* Desktop: leave review button at bottom */}
        <div className="hidden md:flex justify-center mt-10">
          {leaveReviewButton}
        </div>
      </div>

      {showModal && (
        <ReviewModal
          services={services}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}
