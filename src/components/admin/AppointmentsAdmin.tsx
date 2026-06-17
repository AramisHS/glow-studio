import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Appointment } from '../../types';
import { CalendarDays, Clock, Phone, XCircle, Eye } from 'lucide-react';

export default function AppointmentsAdmin() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState<Appointment | null>(null);

    const fetchAppointments = async () => {
        let query = supabase.from('appointments').select('*').order('appointment_date', { ascending: true });
        if (filter !== 'all') query = query.eq('status', filter);
        const { data } = await query;
        if (data) setAppointments(data);
        setLoading(false);
    };

    useEffect(() => { fetchAppointments(); }, [filter]);

    const handleCancel = async (id: string) => {
        if (!confirm('¿Cancelar esta cita?')) return;
        await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
        fetchAppointments();
    };

    const statusColors = {
        pending: 'bg-amber-100 text-amber-600',
        confirmed: 'bg-green-100 text-green-600',
        cancelled: 'bg-red-100 text-red-600',
    };

    if (loading) return <div className="text-center py-12">Cargando citas...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-serif text-3xl font-bold text-stone-800">Citas</h1>
                <div className="flex gap-2">
                    {['all', 'pending', 'confirmed', 'cancelled'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilter(st)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === st
                                    ? 'bg-primary-500 text-white shadow'
                                    : 'bg-white border border-stone-200 text-stone-600 hover:border-primary-300'
                                }`}
                        >
                            {st === 'all' ? 'Todas' : st.charAt(0).toUpperCase() + st.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-3">
                {appointments.map((a) => (
                    <div key={a.id} className="bg-white rounded-2xl p-4 border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div>
                                <p className="font-semibold text-stone-800">{a.client_name}</p>
                                <p className="text-sm text-stone-500">{a.service_name}</p>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-stone-600">
                                <CalendarDays className="w-4 h-4" /> {a.appointment_date}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-stone-600">
                                <Clock className="w-4 h-4" /> {a.appointment_time.slice(0, 5)}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status]}`}>
                                {a.status}
                            </span>
                            {a.client_phone && (
                                <span className="text-xs text-stone-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {a.client_phone}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelected(a)}
                                className="text-stone-400 hover:text-primary-600 transition"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
                            {a.status !== 'cancelled' && (
                                <button
                                    onClick={() => handleCancel(a.id)}
                                    className="text-stone-400 hover:text-red-500 transition"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {appointments.length === 0 && <p className="text-center text-stone-400 py-8">No hay citas con este filtro.</p>}
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-serif text-xl font-bold text-stone-800">Detalles de la cita</h3>
                            <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-600">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div><dt className="text-stone-500">Cliente</dt><dd className="font-medium text-stone-800">{selected.client_name}</dd></div>
                            <div><dt className="text-stone-500">Teléfono</dt><dd className="font-medium text-stone-800">{selected.client_phone}</dd></div>
                            {selected.client_email && <div><dt className="text-stone-500">Email</dt><dd className="font-medium text-stone-800">{selected.client_email}</dd></div>}
                            <div><dt className="text-stone-500">Servicio</dt><dd className="font-medium text-stone-800">{selected.service_name}</dd></div>
                            <div><dt className="text-stone-500">Fecha</dt><dd className="font-medium text-stone-800">{selected.appointment_date}</dd></div>
                            <div><dt className="text-stone-500">Hora</dt><dd className="font-medium text-stone-800">{selected.appointment_time.slice(0, 5)}</dd></div>
                            <div><dt className="text-stone-500">Estado</dt><dd className={`font-medium ${statusColors[selected.status]}`}>{selected.status}</dd></div>
                            {selected.notes && <div><dt className="text-stone-500">Notas</dt><dd className="font-medium text-stone-800">{selected.notes}</dd></div>}
                        </dl>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setSelected(null)} className="px-6 py-2 bg-stone-200 rounded-full text-stone-600 hover:bg-stone-300 transition">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}