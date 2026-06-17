import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Review } from '../../types';
import { Trash2, Star, User } from 'lucide-react';

export default function ReviewsAdmin() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (data) setReviews(data);
        setLoading(false);
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar esta reseña permanentemente?')) {
            await supabase.from('reviews').delete().eq('id', id);
            fetchReviews();
        }
    };

    if (loading) return <div className="text-center py-12">Cargando reseñas...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-serif text-3xl font-bold text-stone-800">Reseñas</h1>
                <span className="text-sm text-stone-500">{reviews.length} reseñas</span>
            </div>

            <div className="space-y-3">
                {reviews.map((r) => (
                    <div key={r.id} className="bg-white rounded-2xl p-4 border border-stone-200 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-semibold text-stone-800">{r.client_name}</span>
                                    <div className="flex text-gold-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-gold-500' : 'text-stone-300'}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString()}</span>
                                </div>
                                {r.service_name && <span className="text-sm text-primary-500">{r.service_name}</span>}
                                <p className="text-stone-600 text-sm mt-1">"{r.comment}"</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(r.id)}
                            className="text-stone-400 hover:text-red-500 transition shrink-0"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                {reviews.length === 0 && <p className="text-center text-stone-400 py-8">No hay reseñas aún.</p>}
            </div>
        </div>
    );
}