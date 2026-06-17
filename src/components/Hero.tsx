import { Sparkles, Star, Calendar } from 'lucide-react';

export function Hero() {
  const scrollToBooking = () => {
    document.querySelector('#agendar')?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToServices = () => {
    document.querySelector('#servicios')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900/75 via-stone-800/60 to-primary-900/70" />
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white py-20 pt-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
          <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
          <span className="text-xs font-medium text-white/90 tracking-wide">Estética Profesional · Mayra Quezada</span>
          <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
        </div>

        {/* Heading */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-4 animate-slide-up">
          Tu Belleza,
          <br />
          <span className="text-primary-300 italic">Nuestra Pasión</span>
        </h1>

        <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-8 font-light animate-fade-in">
          Uñas acrílicas, gelish, cortes, depilación, maquillaje y más.
          Reserva tu cita en línea y luce espectacular.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          <button
            onClick={scrollToBooking}
            className="group flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-4 rounded-full shadow-xl hover:shadow-primary-500/40 transition-all duration-300 hover:-translate-y-1"
          >
            <Calendar className="w-5 h-5" />
            Agendar mi cita
          </button>
          <button
            onClick={scrollToServices}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-1"
          >
            <Sparkles className="w-5 h-5" />
            Ver servicios
          </button>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 40C1200 0 960 80 720 60C480 40 240 0 0 40L0 80Z" fill="#fdf8f6" />
        </svg>
      </div>
    </section>
  );
}
