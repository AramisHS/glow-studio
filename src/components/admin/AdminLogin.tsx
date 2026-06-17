import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signIn(email, password);
            navigate('/admin');
        } catch (err) {
            setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-nude-50 flex items-center justify-center p-4 relative">

            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-nude-200">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-stone-800">Acceso Administrador</h2>
                    <p className="text-stone-500 text-sm mt-1">Ingresa tus credenciales para gestionar el sitio</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-2 border-stone-200 focus:border-primary-400 rounded-xl px-4 py-3 outline-none transition-colors bg-white placeholder:text-stone-400 text-stone-800"
                            placeholder="admin@glowstudio.com"
                            required
                        />
                        <p className="text-xs text-stone-400 mt-1.5">Ingresa el correo electrónico registrado como administrador</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-2 border-stone-200 focus:border-primary-400 rounded-xl px-4 py-3 pr-12 outline-none transition-colors bg-white placeholder:text-stone-400 text-stone-800"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2">
                            <span className="text-red-500 text-lg leading-none">⚠️</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-full transition-all shadow-lg shadow-primary-200 mt-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Iniciando sesión...
                            </span>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <Link
                            to="/"
                            className="text-sm text-stone-500 hover:text-primary-600 transition-colors inline-flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Regresar a la página principal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}