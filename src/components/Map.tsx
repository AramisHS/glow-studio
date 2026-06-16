import { MapPin, Clock, Instagram, Facebook, Navigation } from 'lucide-react';

const ADDRESS = 'Vicente Guerrero 3, 46170 Totatiche, Jal.';
const MAPS_SEARCH = 'Vicente+Guerrero+3,+46170+Totatiche,+Jalisco,+Mexico';
const MAPS_OPEN_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_SEARCH}`;
const MAPS_EMBED_URL = `https://maps.google.com/maps?q=${MAPS_SEARCH}&hl=es&z=16&output=embed`;

const BUSINESS_HOURS = [
  { day: 'Lunes – Viernes', hours: '11:00 AM – 2:00 PM  ·  4:00 PM – 8:00 PM' },
  { day: 'Sábado', hours: '11:00 AM – 2:00 PM  ·  4:00 PM – 8:00 PM' },
  { day: 'Domingo', hours: 'Con cita previa' },
];

export function Map() {
  return (
    <section id="ubicacion" className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary-500 text-sm font-semibold tracking-widest uppercase">Encuéntrame</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-800 mt-2 mb-3">
            Ubicación y Horarios
          </h2>
          <p className="text-stone-500">Te esperamos con gusto.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Map */}
          <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200 h-96 lg:h-[460px] relative bg-nude-50">
            <iframe
              title="Ubicación Mayra Quezada Estética"
              src={MAPS_EMBED_URL}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Fallback overlay — visible only if iframe fails to load via CSS */}
            <noscript>
              <div className="absolute inset-0 flex items-center justify-center bg-nude-50">
                <a
                  href={MAPS_OPEN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold"
                >
                  Ver en Google Maps
                </a>
              </div>
            </noscript>
          </div>

          {/* Info cards */}
          <div className="space-y-5">
            {/* Address */}
            <div className="bg-nude-50 rounded-2xl p-5 border border-nude-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 mb-1">Dirección</h3>
                  <p className="text-stone-600 text-sm font-medium">{ADDRESS}</p>
                  <p className="text-stone-500 text-xs mt-0.5">Totatiche, Jalisco, México</p>
                  <a
                    href={MAPS_OPEN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    Cómo llegar
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-nude-50 rounded-2xl p-5 border border-nude-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary-600" />
                </div>
                <div className="w-full">
                  <h3 className="font-semibold text-stone-800 mb-3">Horario de Atención</h3>
                  <div className="space-y-2">
                    {BUSINESS_HOURS.map(({ day, hours }) => (
                      <div key={day} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 text-sm">
                        <span className="text-stone-700 font-medium">{day}</span>
                        <span className="text-stone-500 text-xs">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="bg-nude-50 rounded-2xl p-5 border border-nude-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <Instagram className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 mb-1">Sígueme en redes</h3>
                  <p className="text-stone-500 text-sm mb-3">Mándame un mensaje para más info o preguntas.</p>
                  <div className="flex gap-3 flex-wrap">
                    <a
                      href="https://www.instagram.com/mayra_quezada20/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      @mayra_quezada20
                    </a>
                    <a
                      href="https://www.facebook.com/mayra.quezada.405285"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      Mayra Quezada
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
