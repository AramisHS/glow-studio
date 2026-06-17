import { useState, useEffect } from 'react';
import { Menu, X, Sparkles, LogOut, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const navLinks = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#agendar', label: 'Agendar Cita' },
  { href: '#resenas', label: 'Reseñas' },
  { href: '#ubicacion', label: 'Ubicación' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAdminClick = () => {
    setMenuOpen(false);
    navigate('/admin');
  };

  const handleLoginClick = () => {
    setMenuOpen(false);
    navigate('/admin/login');
  };

  const handleLogoutClick = async () => {
    setMenuOpen(false);
    await signOut();
    // Opcional: redirigir a inicio
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled || menuOpen
          ? 'bg-white shadow-md py-3'
          : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('#inicio')}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight text-left">
            <span
              className={`block font-serif font-bold text-base leading-none transition-colors ${scrolled || menuOpen ? 'text-stone-900' : 'text-white'
                }`}
            >
              Mayra Quezada
            </span>
            <span
              className={`block text-xs tracking-widest uppercase transition-colors ${scrolled || menuOpen ? 'text-primary-500' : 'text-pink-200'
                }`}
            >
              Estética
            </span>
          </div>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`text-sm font-medium transition-colors hover:text-primary-500 ${scrolled ? 'text-stone-700' : 'text-white/90'
                }`}
            >
              {link.label}
            </button>
          ))}

          {/* Botón de Administrador */}
          {isAdmin ? (
            <>
              <button
                onClick={handleAdminClick}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary-500 ${scrolled ? 'text-primary-600' : 'text-white'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Panel
              </button>
              <button
                onClick={handleLogoutClick}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-red-500 ${scrolled ? 'text-stone-700' : 'text-white/80'
                  }`}
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </>
          ) : (
            <button
              onClick={handleLoginClick}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary-500 ${scrolled ? 'text-stone-700' : 'text-white/90'
                }`}
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className={`md:hidden p-2 rounded-lg transition-colors ${scrolled || menuOpen
              ? 'text-stone-700 hover:bg-stone-100'
              : 'text-white hover:bg-white/10'
            }`}
          aria-label="Menú"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="bg-white border-t border-stone-100 px-4 py-3 flex flex-col gap-1">
          {navLinks.map(link => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-left text-stone-700 font-medium py-2.5 px-3 rounded-lg hover:bg-pink-50 hover:text-primary-600 transition-colors text-sm"
            >
              {link.label}
            </button>
          ))}

          {/* Opciones de administración en móvil */}
          {isAdmin ? (
            <>
              <button
                onClick={handleAdminClick}
                className="text-left flex items-center gap-2 text-primary-600 font-medium py-2.5 px-3 rounded-lg hover:bg-pink-50 transition-colors text-sm"
              >
                <LayoutDashboard className="w-4 h-4" /> Panel de Administración
              </button>
              <button
                onClick={handleLogoutClick}
                className="text-left flex items-center gap-2 text-red-600 font-medium py-2.5 px-3 rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </>
          ) : (
            <button
              onClick={handleLoginClick}
              className="text-left flex items-center gap-2 text-stone-700 font-medium py-2.5 px-3 rounded-lg hover:bg-pink-50 hover:text-primary-600 transition-colors text-sm"
            >
              <LogIn className="w-4 h-4" /> Iniciar Sesión (Admin)
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}