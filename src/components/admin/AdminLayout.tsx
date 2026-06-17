import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CalendarDays, Star, Sparkles, LogOut } from 'lucide-react';
import { Tags } from 'lucide-react';

export default function AdminLayout() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/admin/login');
    };

    const navItems = [
        { to: '/admin/servicios', label: 'Servicios', icon: Sparkles },
        { to: '/admin/citas', label: 'Citas', icon: CalendarDays },
        { to: '/admin/reseñas', label: 'Reseñas', icon: Star },
        { to: '/admin/categorias', label: 'Categorías', icon: Tags },
    ];

    return (
        <div className="min-h-screen bg-nude-50 flex">
            <aside className="w-64 bg-white border-r border-stone-200 p-4 flex flex-col h-screen sticky top-0">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-serif font-bold text-stone-800 text-lg">Glow Studio</span>
                </div>
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-primary-50 text-primary-600 border border-primary-200'
                                    : 'text-stone-600 hover:bg-stone-50'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-auto"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                </button>
            </aside>
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}