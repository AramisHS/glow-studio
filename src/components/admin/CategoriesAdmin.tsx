import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    display_order: number;
    created_at: string;
}

export default function CategoriesAdmin() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [formName, setFormName] = useState('');
    const [formOrder, setFormOrder] = useState(0);

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });
        if (data) setCategories(data);
        setLoading(false);
    };

    useEffect(() => { fetchCategories(); }, []);

    const openModal = (cat?: Category) => {
        if (cat) {
            setEditing(cat);
            setFormName(cat.name);
            setFormOrder(cat.display_order || 0);
        } else {
            setEditing(null);
            setFormName('');
            setFormOrder(categories.length);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setFormName('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            alert('El nombre de la categoría es obligatorio.');
            return;
        }

        const payload = { name: formName.trim(), display_order: formOrder };

        if (editing) {
            await supabase.from('categories').update(payload).eq('id', editing.id);
        } else {
            await supabase.from('categories').insert(payload);
        }
        closeModal();
        fetchCategories();
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar esta categoría? Esto no eliminará los servicios asociados.')) {
            await supabase.from('categories').delete().eq('id', id);
            fetchCategories();
        }
    };

    if (loading) return <div className="text-center py-12">Cargando categorías...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-serif text-3xl font-bold text-stone-800">Categorías</h1>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow"
                >
                    <Plus className="w-4 h-4" /> Nueva Categoría
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-nude-50 border-b border-stone-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-stone-600">Nombre</th>
                            <th className="px-4 py-3 font-semibold text-stone-600">Orden</th>
                            <th className="px-4 py-3 font-semibold text-stone-600 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((c) => (
                            <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50">
                                <td className="px-4 py-3 font-medium text-stone-800">{c.name}</td>
                                <td className="px-4 py-3 text-stone-600">{c.display_order}</td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <button onClick={() => openModal(c)} className="text-stone-500 hover:text-primary-600 transition">
                                        <Pencil className="w-4 h-4 inline" />
                                    </button>
                                    <button onClick={() => handleDelete(c.id)} className="text-stone-500 hover:text-red-600 transition">
                                        <Trash2 className="w-4 h-4 inline" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-serif text-xl font-bold text-stone-800">
                                {editing ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h3>
                            <button onClick={closeModal}><X className="w-5 h-5 text-stone-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700">Nombre *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-400"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700">Orden</label>
                                <input
                                    type="number"
                                    value={formOrder}
                                    onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                                    className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-400"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-full border-2 border-stone-200 text-stone-600 hover:bg-stone-50 transition">Cancelar</button>
                                <button type="submit" className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-full font-semibold transition">
                                    {editing ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}