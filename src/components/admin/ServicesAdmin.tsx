import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Service } from '../../types';
import { Plus, Pencil, Trash2, X, AlertCircle } from 'lucide-react';

interface Category {
    id: string;
    name: string;
}

export default function ServicesAdmin() {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Service | null>(null);
    const [form, setForm] = useState<Partial<Service>>({
        name: '',
        description: '',
        price_min: 0,
        price_max: null,
        duration_minutes: 60,
        category: '',
        active: true,
        display_order: 0,
    });
    const [formErrors, setFormErrors] = useState({
        name: '',
        price_min: '',
        duration_minutes: '',
        category: '',
    });
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [categoryError, setCategoryError] = useState('');

    const fetchServices = async () => {
        const { data } = await supabase.from('services').select('*').order('display_order');
        if (data) setServices(data);
        setLoading(false);
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data) setCategories(data);
    };

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const validateForm = () => {
        const errors = {
            name: '',
            price_min: '',
            duration_minutes: '',
            category: '',
        };
        let isValid = true;

        if (!form.name || form.name.trim().length < 2) {
            errors.name = 'El nombre debe tener al menos 2 caracteres';
            isValid = false;
        }

        if (!form.price_min || form.price_min < 0) {
            errors.price_min = 'El precio mínimo debe ser mayor a 0';
            isValid = false;
        }

        if (!form.duration_minutes || form.duration_minutes < 1) {
            errors.duration_minutes = 'La duración debe ser al menos 1 minuto';
            isValid = false;
        }

        if (!form.category) {
            errors.category = 'Selecciona una categoría';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const openModal = (service?: Service) => {
        if (service) {
            setEditing(service);
            setForm(service);
        } else {
            setEditing(null);
            setForm({
                name: '',
                description: '',
                price_min: 0,
                price_max: null,
                duration_minutes: 60,
                category: categories.length > 0 ? categories[0].name : '',
                active: true,
                display_order: 0,
            });
        }
        setFormErrors({ name: '', price_min: '', duration_minutes: '', category: '' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = {
            name: form.name!.trim(),
            description: form.description?.trim() || null,
            price_min: Number(form.price_min),
            price_max: form.price_max ? Number(form.price_max) : null,
            duration_minutes: Number(form.duration_minutes),
            category: form.category!,
            active: form.active !== undefined ? form.active : true,
            display_order: Number(form.display_order) || 0,
        };

        if (editing) {
            await supabase.from('services').update(payload).eq('id', editing.id);
        } else {
            await supabase.from('services').insert(payload);
        }
        closeModal();
        fetchServices();
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar este servicio permanentemente?')) {
            await supabase.from('services').delete().eq('id', id);
            fetchServices();
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            setCategoryError('El nombre de la categoría es requerido');
            return;
        }
        if (categories.some(c => c.name.toLowerCase() === newCategory.trim().toLowerCase())) {
            setCategoryError('Esta categoría ya existe');
            return;
        }

        const { data, error } = await supabase
            .from('categories')
            .insert({ name: newCategory.trim() })
            .select()
            .single();

        if (error) {
            setCategoryError('Error al crear categoría');
            return;
        }

        setCategories([...categories, data]);
        setForm({ ...form, category: data.name });
        setNewCategory('');
        setCategoryError('');
        setShowCategoryModal(false);
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        // Verificar si hay servicios usando esta categoría
        const { data } = await supabase
            .from('services')
            .select('id')
            .eq('category', name)
            .limit(1);

        if (data && data.length > 0) {
            alert(`No puedes eliminar "${name}" porque hay servicios que la usan.`);
            return;
        }

        if (confirm(`¿Eliminar la categoría "${name}"?`)) {
            await supabase.from('categories').delete().eq('id', id);
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    if (loading) return <div className="text-center py-12">Cargando servicios...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-serif text-3xl font-bold text-stone-800">Servicios</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="flex items-center gap-2 bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-full text-sm font-semibold transition"
                    >
                        <Plus className="w-4 h-4" /> Gestionar Categorías
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Servicio
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-nude-50 border-b border-stone-200">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-stone-600">Nombre</th>
                                <th className="px-4 py-3 font-semibold text-stone-600">Categoría</th>
                                <th className="px-4 py-3 font-semibold text-stone-600">Precio</th>
                                <th className="px-4 py-3 font-semibold text-stone-600">Duración</th>
                                <th className="px-4 py-3 font-semibold text-stone-600">Estado</th>
                                <th className="px-4 py-3 font-semibold text-stone-600 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((s) => (
                                <tr key={s.id} className="border-b border-stone-100 hover:bg-stone-50">
                                    <td className="px-4 py-3 font-medium text-stone-800">{s.name}</td>
                                    <td className="px-4 py-3 text-stone-600">
                                        <span className="px-2 py-1 bg-nude-100 rounded-full text-xs">{s.category}</span>
                                    </td>
                                    <td className="px-4 py-3 text-stone-600">
                                        ${s.price_min}{s.price_max ? ` - $${s.price_max}` : ''}
                                    </td>
                                    <td className="px-4 py-3 text-stone-600">{s.duration_minutes} min</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.active ? 'bg-green-100 text-green-600' : 'bg-stone-200 text-stone-500'}`}>
                                            {s.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => openModal(s)} className="text-stone-500 hover:text-primary-600 transition">
                                            <Pencil className="w-4 h-4 inline" />
                                        </button>
                                        <button onClick={() => handleDelete(s.id)} className="text-stone-500 hover:text-red-600 transition">
                                            <Trash2 className="w-4 h-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de categorías */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-serif text-xl font-bold text-stone-800">Gestionar Categorías</h3>
                            <button onClick={() => setShowCategoryModal(false)} className="text-stone-500 hover:text-stone-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Nueva categoría..."
                                value={newCategory}
                                onChange={e => {
                                    setNewCategory(e.target.value);
                                    setCategoryError('');
                                }}
                                className="flex-1 border-2 border-stone-200 rounded-xl px-4 py-2 outline-none focus:border-primary-400"
                            />
                            <button
                                onClick={handleAddCategory}
                                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-semibold transition"
                            >
                                Agregar
                            </button>
                        </div>
                        {categoryError && <p className="text-red-500 text-xs mb-3">{categoryError}</p>}

                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex justify-between items-center bg-nude-50 px-4 py-2 rounded-xl">
                                    <span className="text-stone-700">{cat.name}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                        className="text-stone-400 hover:text-red-500 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowCategoryModal(false)}
                            className="mt-4 w-full py-2 bg-stone-200 rounded-xl text-stone-600 hover:bg-stone-300 transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de servicio */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-serif text-xl font-bold text-stone-800">
                                {editing ? 'Editar Servicio' : 'Nuevo Servicio'}
                            </h3>
                            <button onClick={closeModal}><X className="w-5 h-5 text-stone-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700">Nombre *</label>
                                <input
                                    type="text"
                                    value={form.name || ''}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className={`w-full border-2 ${formErrors.name ? 'border-red-400' : 'border-stone-200'} rounded-xl px-4 py-2.5 outline-none focus:border-primary-400`}
                                />
                                {formErrors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700">Descripción</label>
                                <textarea
                                    value={form.description || ''}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-400 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700">Precio mín. *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price_min || ''}
                                        onChange={(e) => setForm({ ...form, price_min: parseFloat(e.target.value) || 0 })}
                                        className={`w-full border-2 ${formErrors.price_min ? 'border-red-400' : 'border-stone-200'} rounded-xl px-4 py-2.5 outline-none focus:border-primary-400`}
                                    />
                                    {formErrors.price_min && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.price_min}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700">Precio máx. (opcional)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price_max || ''}
                                        onChange={(e) => setForm({ ...form, price_max: parseFloat(e.target.value) || null })}
                                        className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700">Duración (min) *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.duration_minutes || ''}
                                        onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
                                        className={`w-full border-2 ${formErrors.duration_minutes ? 'border-red-400' : 'border-stone-200'} rounded-xl px-4 py-2.5 outline-none focus:border-primary-400`}
                                    />
                                    {formErrors.duration_minutes && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.duration_minutes}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700">Categoría *</label>
                                    <select
                                        value={form.category || ''}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className={`w-full border-2 ${formErrors.category ? 'border-red-400' : 'border-stone-200'} rounded-xl px-4 py-2.5 outline-none focus:border-primary-400 bg-white`}
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.category && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.category}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.active !== undefined ? form.active : true}
                                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                    className="w-4 h-4 accent-primary-500"
                                />
                                <label className="text-sm text-stone-700">Activo (visible para clientes)</label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700">Orden de visualización</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.display_order || 0}
                                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
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