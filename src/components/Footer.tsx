import { Sparkles, Instagram, Facebook, Heart } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-white">
      {/* Top wave */}
      <div className="overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L1440 0L1440 20C1200 60 960 0 720 20C480 40 240 60 0 20L0 0Z" fill="white" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-serif font-bold text-white">Mayra Quezada</p>
                <p className="text-primary-400 text-xs tracking-widest uppercase">Estética</p>
              </div>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Tu belleza es mi pasión. Ofrezco servicios profesionales de estética con productos de calidad y un ambiente acogedor.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="https://www.instagram.com/mayra_quezada20/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/mayra.quezada.405285"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Servicios</h4>
            <ul className="space-y-2">
              {[
                'Uñas Acrílicas',
                'Gelish',
                'Corte de Cabello',
                'Depilación',
                'Maquillaje',
                'Peinado',
                'Permanentes',
              ].map(s => (
                <li key={s}>
                  <button
                    onClick={() => scrollTo('#servicios')}
                    className="text-stone-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Accesos Rápidos</h4>
            <ul className="space-y-2">
              {[
                { label: 'Inicio', id: '#inicio' },
                { label: 'Servicios y Precios', id: '#servicios' },
                { label: 'Agendar cita', id: '#agendar' },
                { label: 'Reseñas', id: '#resenas' },
                { label: 'Ubicación', id: '#ubicacion' },
              ].map(link => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollTo(link.id)}
                    className="text-stone-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-stone-500 text-xs">
          <p>© {year} Mayra Quezada Estética. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con <Heart className="w-3 h-3 text-primary-500 fill-primary-500" /> para ti
          </p>
        </div>
      </div>
    </footer>
  );
}
