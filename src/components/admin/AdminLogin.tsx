import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
            setError('Credenciales incorrectas.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-nude-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-nude-200">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-stone-800">Acceso Administrador</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Correo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-primary-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-primary-400"
                            required
                        />
                    </div>
                    {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-70 text-white font-semibold py-3 rounded-full transition-all"
                    >
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}