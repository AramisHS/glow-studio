import { useEffect, useState } from 'react';
import { Scissors, Sparkles, Zap, Palette, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Service } from '../types';

const CATEGORY_META: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  iconBg: string;
  badge: string;
}> = {
  'Uñas': {
    icon: Sparkles,
    accent: 'border-pink-200',
    iconBg: 'bg-pink-100 text-pink-600',
    badge: 'bg-pink-50 text-pink-600 border-pink-200',
  },
  'Cabello': {
    icon: Scissors,
    accent: 'border-amber-200',
    iconBg: 'bg-amber-100 text-amber-600',
    badge: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  'Depilación': {
    icon: Zap,
    accent: 'border-purple-200',
    iconBg: 'bg-purple-100 text-purple-600',
    badge: 'bg-purple-50 text-purple-600 border-purple-200',
  },
  'Maquillaje & Peinado': {
    icon: Palette,
    accent: 'border-red-200',
    iconBg: 'bg-red-100 text-red-600',
    badge: 'bg-red-50 text-red-600 border-red-200',
  },
};

function formatPrice(min: number, max: number | null) {
  return max ? `$${min.toFixed(0)} – $${max.toFixed(0)}` : `$${min.toFixed(0)}`;
}

function ServiceRow({
  service,
  onBook,
}: {
  service: Service;
  onBook: (service: Service) => void;
}) {
  const meta = CATEGORY_META[service.category];
  const Icon = meta?.icon ?? Sparkles;

  return (
    <div className="group bg-white rounded-2xl px-4 sm:px-5 py-4 border border-stone-100 hover:border-primary-200 hover:shadow-md transition-all duration-200">
      {/* Row 1: icon + name + price */}
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-110 ${meta?.iconBg ?? 'bg-stone-100 text-stone-500'}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-800 text-sm leading-snug">{service.name}</p>
          {service.description && (
            <p className="text-stone-400 text-xs mt-1 leading-relaxed">{service.description}</p>
          )}
        </div>

        <div className="text-right shrink-0 ml-1">
          <p className="font-bold text-stone-800 text-sm leading-none whitespace-nowrap">
            {formatPrice(service.price_min, service.price_max)}
          </p>
          <p className="text-stone-400 text-xs mt-0.5">MXN</p>
        </div>
      </div>

      {/* Row 2: duration + agendar button */}
      <div className="flex items-center justify-between mt-3 pl-12 sm:pl-14">
        <span className="inline-flex items-center gap-1 text-stone-400 text-xs">
          <Clock className="w-3 h-3" />
          {service.duration_minutes} min
        </span>
        <button
          onClick={() => onBook(service)}
          className="flex items-center gap-1 bg-primary-50 hover:bg-primary-500 text-primary-600 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-primary-200 hover:border-primary-500 transition-all duration-200 whitespace-nowrap"
        >
          Agendar <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

interface ServicesProps {
  onBookService?: (service: Service) => void;
}

export function Services({ onBookService }: ServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('display_order')
      .then(({ data }) => {
        if (data) {
          setServices(data);
          const first = data[0]?.category;
          if (first) setActiveCategory(first);
        }
        setLoading(false);
      });
  }, []);

  const categories = Array.from(new Set(services.map(s => s.category)));
  const filtered = services.filter(s => s.category === activeCategory);

  const grouped = filtered.reduce<Record<string, Service[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const handleBook = (service: Service) => {
    onBookService?.(service);
    setTimeout(() => {
      document.querySelector('#agendar')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <section id="servicios" className="bg-nude-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary-500 text-sm font-semibold tracking-widest uppercase">Menú de servicios</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-800 mt-2 mb-4">
            Nuestros servicios
          </h2>
          <p className="text-stone-500 max-w-md mx-auto text-sm">
            Todos realizados con productos de calidad.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => {
            const meta = CATEGORY_META[cat];
            const Icon = meta?.icon;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Service list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/70 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => {
              const meta = CATEGORY_META[category];
              const Icon = meta?.icon ?? Sparkles;
              return (
                <div key={category}>
                  {/* Category header */}
                  {activeCategory === 'Todos' && (
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta?.iconBg ?? 'bg-stone-100 text-stone-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif font-bold text-stone-700 text-lg">{category}</h3>
                      <div className={`h-px flex-1 ${meta?.accent ?? 'border-stone-200'} border-t`} />
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${meta?.badge ?? ''}`}>
                        {items.length} {items.length === 1 ? 'servicio' : 'servicios'}
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {items.map(s => (
                      <ServiceRow key={s.id} service={s} onBook={handleBook} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
