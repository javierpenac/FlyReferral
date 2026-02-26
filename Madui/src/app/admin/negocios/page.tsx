'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'

interface Business {
    id: string
    full_name: string | null
    phone: string | null
    business_name: string | null
    business_type: string | null
    verification_status: string
    plan_type: string | null
    plan_expires_at: string | null
    user_role: string
    bio: string | null
    whatsapp_link: string | null
    profile_photo_url: string | null
    category_id: number | null
    rejection_reason: string | null
    onboarding_completed: boolean | null
    created_at: string
    updated_at: string
    categories: { name?: string; emoji?: string } | null
}

const CATEGORIES = [
    { id: 1, name: 'Comida y Bebidas', emoji: '🍽️' },
    { id: 2, name: 'Belleza y Bienestar', emoji: '💆' },
    { id: 3, name: 'Salud', emoji: '🏥' },
    { id: 4, name: 'Educación', emoji: '📚' },
    { id: 5, name: 'Tecnología', emoji: '💻' },
    { id: 6, name: 'Hogar y Jardín', emoji: '🏡' },
    { id: 7, name: 'Moda y Accesorios', emoji: '👗' },
    { id: 8, name: 'Deportes y Fitness', emoji: '🏃' },
    { id: 9, name: 'Mascotas', emoji: '🐾' },
    { id: 10, name: 'Arte y Cultura', emoji: '🎨' },
    { id: 11, name: 'Servicios Profesionales', emoji: '💼' },
    { id: 12, name: 'Otro', emoji: '📦' },
]

export default function AdminNegociosPage() {
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [editing, setEditing] = useState<Business | null>(null)
    const [saving, setSaving] = useState(false)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const fetchBusinesses = useCallback(async () => {
        setLoading(true)
        const supabase = createClient()
        let query = supabase
            .from('profiles')
            .select('*, categories(name, emoji)')
            .eq('user_role', 'entrepreneur')
            .order('created_at', { ascending: false })

        if (statusFilter !== 'all') {
            query = query.eq('verification_status', statusFilter)
        }

        const { data } = await query
        setBusinesses(data || [])
        setLoading(false)
    }, [statusFilter])

    useEffect(() => { fetchBusinesses() }, [fetchBusinesses])

    const filtered = businesses.filter(b =>
        (b.business_name?.toLowerCase().includes(search.toLowerCase()) ||
            b.full_name?.toLowerCase().includes(search.toLowerCase())) ?? true
    )

    const handleSave = async () => {
        if (!editing) return
        setSaving(true)
        const supabase = createClient()
        const { error } = await supabase.from('profiles').update({
            full_name: editing.full_name,
            phone: editing.phone,
            business_name: editing.business_name,
            business_type: editing.business_type,
            bio: editing.bio,
            whatsapp_link: editing.whatsapp_link,
            category_id: editing.category_id,
            verification_status: editing.verification_status,
            plan_type: editing.plan_type,
            plan_expires_at: editing.plan_expires_at,
            rejection_reason: editing.rejection_reason,
            profile_photo_url: editing.profile_photo_url,
            onboarding_completed: editing.onboarding_completed,
            updated_at: new Date().toISOString(),
        }).eq('id', editing.id)

        setSaving(false)
        if (!error) {
            setSuccessMsg(`"${editing.business_name}" actualizado correctamente`)
            setTimeout(() => setSuccessMsg(null), 3000)
            setEditing(null)
            fetchBusinesses()
        } else {
            alert('Error al guardar: ' + error.message)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`)) return
        const supabase = createClient()
        await supabase.from('profiles').delete().eq('id', id)
        fetchBusinesses()
    }

    const handleQuickApprove = async (id: string) => {
        const supabase = createClient()
        await supabase.from('profiles').update({
            verification_status: 'aprobado',
            approved_at: new Date().toISOString(),
        }).eq('id', id)
        fetchBusinesses()
    }

    const statusColors: Record<string, string> = {
        aprobado: 'bg-green-100 text-green-800',
        pendiente: 'bg-amber-100 text-amber-800',
        rechazado: 'bg-red-100 text-red-800',
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                    Gestión de Negocios
                </h1>
                <p className="text-[var(--madui-text-secondary)] text-sm mt-1">
                    Alta, baja y modificación de todos los negocios y emprendedores
                </p>
            </div>

            {/* Success notification */}
            {successMsg && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-green-700 text-sm text-center font-medium">✅ {successMsg}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Buscar por nombre de negocio o emprendedor..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-[var(--madui-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30"
                />
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 border border-[var(--madui-border)] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30"
                >
                    <option value="all">Todos los estados</option>
                    <option value="aprobado">Aprobados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="rechazado">Rechazados</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--madui-primary)]">{businesses.length}</p>
                    <p className="text-xs text-[var(--madui-text-muted)]">Total</p>
                </div>
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-4 text-center">
                    <p className="print-2xl font-bold text-green-600">{businesses.filter(b => b.verification_status === 'aprobado').length}</p>
                    <p className="text-xs text-[var(--madui-text-muted)]">Aprobados</p>
                </div>
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{businesses.filter(b => b.verification_status === 'pendiente').length}</p>
                    <p className="text-xs text-[var(--madui-text-muted)]">Pendientes</p>
                </div>
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--madui-accent)]">{businesses.filter(b => b.plan_type === 'premium').length}</p>
                    <p className="text-xs text-[var(--madui-text-muted)]">Premium</p>
                </div>
            </div>

            {/* ═══ Edit Panel (Modal) ═══ */}
            {editing && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-[var(--madui-border)] p-5 rounded-t-2xl flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                                    Editar Negocio
                                </h2>
                                <p className="text-xs text-[var(--madui-text-muted)]">ID: {editing.id}</p>
                            </div>
                            <button onClick={() => setEditing(null)} className="text-[var(--madui-text-muted)] hover:text-[var(--madui-text)] text-xl">✕</button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Sección: Información del Emprendedor */}
                            <fieldset className="border border-[var(--madui-border)] rounded-xl p-4">
                                <legend className="text-xs font-semibold text-[var(--madui-text-muted)] uppercase tracking-wide px-2">👤 Emprendedor</legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">Nombre completo</label>
                                        <input value={editing.full_name || ''} onChange={e => setEditing({ ...editing, full_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">Teléfono</label>
                                        <input value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30" />
                                    </div>
                                </div>
                            </fieldset>

                            {/* Sección: Información del Negocio */}
                            <fieldset className="border border-[var(--madui-border)] rounded-xl p-4">
                                <legend className="text-xs font-semibold text-[var(--madui-text-muted)] uppercase tracking-wide px-2">🏪 Negocio</legend>
                                <div className="space-y-4 mt-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">Nombre del negocio</label>
                                            <input value={editing.business_name || ''} onChange={e => setEditing({ ...editing, business_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">Tipo de negocio</label>
                                            <select value={editing.business_type || ''} onChange={e => setEditing({ ...editing, business_type: e.target.value })}
                                                className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30">
                                                <option value="">Seleccionar...</option>
                                                <option value="Producto">Producto</option>
                                                <option value="Servicio">Servicio</option>
                                                <option value="Producto y Servicio">Producto y Servicio</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">Categoría</label>
                                        <select value={editing.category_id || ''} onChange={e => setEditing({ ...editing, category_id: e.target.value ? Number(e.target.value) : null })}
                                            className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30">
                                            <option value="">Sin categoría</option>
                                            {CATEGORIES.map(c => (
                                                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">Descripción / Bio</label>
                                        <textarea value={editing.bio || ''} onChange={e => setEditing({ ...editing, bio: e.target.value })} rows={3}
                                            className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30 resize-none" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">WhatsApp Link</label>
                                            <input value={editing.whatsapp_link || ''} onChange={e => setEditing({ ...editing, whatsapp_link: e.target.value })}
                                                placeholder="https://wa.me/52..."
                                                className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">URL Foto de Perfil</label>
                                            <input value={editing.profile_photo_url || ''} onChange={e => setEditing({ ...editing, profile_photo_url: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30" />
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            {/* Sección: Estado y Plan */}
                            <fieldset className="border border-[var(--madui-border)] rounded-xl p-4">
                                <legend className="text-xs font-semibold text-[var(--madui-text-muted)] uppercase tracking-wide px-2">⚙️ Estado y Plan</legend>
                                <div className="space-y-4 mt-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">Estado de verificación</label>
                                            <select value={editing.verification_status || ''} onChange={e => setEditing({ ...editing, verification_status: e.target.value })}
                                                className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30">
                                                <option value="pendiente">⏳ Pendiente</option>
                                                <option value="aprobado">✅ Aprobado</option>
                                                <option value="rechazado">❌ Rechazado</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">Plan</label>
                                            <select value={editing.plan_type || ''} onChange={e => setEditing({ ...editing, plan_type: e.target.value })}
                                                className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30">
                                                <option value="basico">📋 Básico</option>
                                                <option value="premium">⭐ Premium</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">Vencimiento del plan</label>
                                            <input type="date" value={editing.plan_expires_at ? editing.plan_expires_at.slice(0, 10) : ''} onChange={e => setEditing({ ...editing, plan_expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                                className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--madui-text)] mb-1">Motivo de rechazo</label>
                                        <textarea value={editing.rejection_reason || ''} onChange={e => setEditing({ ...editing, rejection_reason: e.target.value })} rows={2}
                                            placeholder="Solo si el estado es 'rechazado'"
                                            className="w-full px-3 py-2 border border-[var(--madui-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30 resize-none" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="onboarding" checked={editing.onboarding_completed || false} onChange={e => setEditing({ ...editing, onboarding_completed: e.target.checked })}
                                            className="w-4 h-4 accent-[var(--madui-primary)]" />
                                        <label htmlFor="onboarding" className="text-sm text-[var(--madui-text)]">Onboarding completado</label>
                                    </div>
                                </div>
                            </fieldset>

                            {/* Meta info */}
                            <div className="text-xs text-[var(--madui-text-muted)] flex gap-4">
                                <span>Registrado: {new Date(editing.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <span>Actualizado: {new Date(editing.updated_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="sticky bottom-0 bg-white border-t border-[var(--madui-border)] p-5 rounded-b-2xl flex justify-between">
                            <button onClick={() => setEditing(null)} className="px-5 py-2.5 text-sm font-medium text-[var(--madui-text-secondary)] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--madui-primary)] rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 shadow-sm">
                                {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-[var(--madui-text-muted)]">Cargando negocios...</div>
            ) : (
                <div className="bg-white rounded-2xl border border-[var(--madui-border)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-[var(--madui-border)]">
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Negocio</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Categoría</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Estado</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Plan</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Registro</th>
                                    <th className="text-right px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--madui-border-light)]">
                                {filtered.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-[var(--madui-text)]">{b.business_name || 'Sin nombre'}</p>
                                            <p className="text-xs text-[var(--madui-text-muted)]">{b.full_name}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs">{b.categories?.emoji} {b.categories?.name || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.verification_status] || ''}`}>
                                                {b.verification_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium ${b.plan_type === 'premium' ? 'text-[var(--madui-accent-dark)]' : 'text-[var(--madui-text-muted)]'}`}>
                                                {b.plan_type === 'premium' ? '⭐ Premium' : 'Básico'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[var(--madui-text-muted)]">
                                            {new Date(b.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setEditing({ ...b })} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                                                    ✏️ Editar
                                                </button>
                                                {b.verification_status === 'pendiente' && (
                                                    <button onClick={() => handleQuickApprove(b.id)} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium">
                                                        ✅ Aprobar
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(b.id, b.business_name || 'este negocio')} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <div className="text-center py-8 text-[var(--madui-text-muted)]">No se encontraron negocios</div>
                    )}
                </div>
            )}
        </div>
    )
}
