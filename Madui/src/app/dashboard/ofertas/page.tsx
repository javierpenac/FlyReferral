'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Offer {
    id: string
    title: string
    description: string | null
    original_price: number
    offer_price: number
    image_url: string | null
    expiry_date: string
    status: string
    created_at: string
}

export default function OfertasPage() {
    const supabase = createClient()
    const [offers, setOffers] = useState<Offer[]>([])
    const [loading, setLoading] = useState(true)
    const [isPremium, setIsPremium] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)

    const [form, setForm] = useState({
        title: '',
        description: '',
        original_price: '',
        offer_price: '',
        expiry_date: '',
    })

    // Count offers this month
    const thisMonthCount = offers.filter(o => {
        const created = new Date(o.created_at)
        const now = new Date()
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            setUserId(user.id)

            const { data: profile } = await supabase.from('profiles').select('plan_type').eq('id', user.id).single()
            setIsPremium(profile?.plan_type === 'premium')

            if (profile?.plan_type === 'premium') {
                const { data } = await supabase
                    .from('offers')
                    .select('*')
                    .eq('merchant_id', user.id)
                    .order('created_at', { ascending: false })
                setOffers(data || [])
            }
            setLoading(false)
        }
        load()
    }, [supabase])

    const resetForm = () => {
        setForm({ title: '', description: '', original_price: '', offer_price: '', expiry_date: '' })
        setEditingId(null)
        setShowForm(false)
    }

    const handleSave = async () => {
        if (!userId || !form.title || !form.original_price || !form.offer_price || !form.expiry_date) return

        if (!editingId && thisMonthCount >= 4) {
            alert('Has alcanzado el límite de 4 ofertas por mes.')
            return
        }

        setSaving(true)

        const payload = {
            merchant_id: userId,
            title: form.title,
            description: form.description || null,
            original_price: parseFloat(form.original_price),
            offer_price: parseFloat(form.offer_price),
            expiry_date: form.expiry_date,
            status: 'active',
        }

        if (editingId) {
            await supabase.from('offers').update(payload).eq('id', editingId)
        } else {
            await supabase.from('offers').insert(payload)
        }

        // Reload
        const { data } = await supabase
            .from('offers')
            .select('*')
            .eq('merchant_id', userId)
            .order('created_at', { ascending: false })
        setOffers(data || [])
        resetForm()
        setSaving(false)
    }

    const handleEdit = (offer: Offer) => {
        setForm({
            title: offer.title,
            description: offer.description || '',
            original_price: String(offer.original_price),
            offer_price: String(offer.offer_price),
            expiry_date: offer.expiry_date,
        })
        setEditingId(offer.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta oferta?')) return
        await supabase.from('offers').delete().eq('id', id)
        setOffers(prev => prev.filter(o => o.id !== id))
    }

    const getStatusBadge = (offer: Offer) => {
        const isExpired = new Date(offer.expiry_date) < new Date()
        if (isExpired) return { label: 'Expirada', color: 'var(--madui-error)', bg: '#FEE2E2' }
        return { label: 'Activa', color: 'var(--madui-success)', bg: '#DCFCE7' }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />)}
                </div>
            </div>
        )
    }

    if (!isPremium) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 rounded-2xl bg-[var(--madui-accent-lighter)] flex items-center justify-center mb-6">
                    <span className="text-4xl">🏷️</span>
                </div>
                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)] mb-2">
                    Ofertas Premium
                </h1>
                <p className="text-[var(--madui-text-secondary)] max-w-md mb-6">
                    Crea hasta 4 ofertas mensuales con descuentos especiales para tus vecinos de Zibatá. ¡Aumenta tus ventas!
                </p>
                <a href="/dashboard/plan" className="px-6 py-3 bg-[var(--madui-accent)] text-[var(--madui-text)] font-semibold rounded-xl hover:bg-[var(--madui-accent-dark)] transition-colors shadow-sm">
                    ⭐ Actualizar a Premium
                </a>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                        Mis Ofertas
                    </h1>
                    <p className="text-[var(--madui-text-secondary)] text-sm mt-1">
                        {thisMonthCount}/4 ofertas este mes
                    </p>
                </div>
                {!showForm && thisMonthCount < 4 && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-5 py-2.5 bg-[var(--madui-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors shadow-sm"
                    >
                        + Nueva Oferta
                    </button>
                )}
            </div>

            {/* Monthly Counter */}
            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-4">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-[var(--madui-text)]">Ofertas este mes</span>
                    <span className="text-xs text-[var(--madui-text-muted)]">{thisMonthCount} de 4</span>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="flex-1 h-2 rounded-full transition-colors"
                            style={{
                                backgroundColor: i <= thisMonthCount ? 'var(--madui-primary)' : '#E5E7EB'
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Create / Edit Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                    <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                        {editingId ? 'Editar Oferta' : 'Nueva Oferta'}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--madui-text)] mb-1">Título *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                placeholder="Ej: 2x1 en pasteles de temporada"
                                className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--madui-text)] mb-1">Descripción</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Detalla tu oferta..."
                                rows={3}
                                className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--madui-text)] mb-1">Precio Original *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--madui-text-muted)] text-sm">$</span>
                                    <input
                                        type="number"
                                        value={form.original_price}
                                        onChange={e => setForm(p => ({ ...p, original_price: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--madui-text)] mb-1">Precio Oferta *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--madui-text-muted)] text-sm">$</span>
                                    <input
                                        type="number"
                                        value={form.offer_price}
                                        onChange={e => setForm(p => ({ ...p, offer_price: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--madui-text)] mb-1">Válido Hasta *</label>
                                <input
                                    type="date"
                                    value={form.expiry_date}
                                    onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))}
                                    className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm"
                                />
                            </div>
                        </div>
                        {form.original_price && form.offer_price && parseFloat(form.offer_price) < parseFloat(form.original_price) && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                                <span className="text-green-600 font-bold text-lg">
                                    {Math.round(((parseFloat(form.original_price) - parseFloat(form.offer_price)) / parseFloat(form.original_price)) * 100)}%
                                </span>
                                <span className="text-sm text-green-700">de descuento</span>
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2.5 bg-[var(--madui-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Publicar Oferta'}
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-6 py-2.5 border border-[var(--madui-border)] text-[var(--madui-text-secondary)] text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Offers List */}
            {offers.length > 0 ? (
                <div className="space-y-3">
                    {offers.map(offer => {
                        const badge = getStatusBadge(offer)
                        const discount = offer.original_price > 0
                            ? Math.round(((offer.original_price - offer.offer_price) / offer.original_price) * 100)
                            : 0
                        return (
                            <div key={offer.id} className="bg-white rounded-2xl border border-[var(--madui-border)] p-5">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-[var(--madui-text)]">{offer.title}</h3>
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: badge.color, backgroundColor: badge.bg }}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        {offer.description && (
                                            <p className="text-sm text-[var(--madui-text-secondary)] mb-2">{offer.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-[var(--madui-text-muted)] line-through">${offer.original_price}</span>
                                            <span className="text-lg font-bold text-[var(--madui-primary)]">${offer.offer_price}</span>
                                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">-{discount}%</span>
                                        </div>
                                        <p className="text-xs text-[var(--madui-text-muted)] mt-2">
                                            Válido hasta {new Date(offer.expiry_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => handleEdit(offer)} className="text-xs text-[var(--madui-primary)] hover:text-[var(--madui-primary-dark)] font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--madui-primary-lighter)] transition-colors">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(offer.id)} className="text-xs text-[var(--madui-error)] hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-12 text-center">
                    <p className="text-4xl mb-3">🏷️</p>
                    <h3 className="font-semibold text-[var(--madui-text)] mb-1">Sin ofertas aún</h3>
                    <p className="text-sm text-[var(--madui-text-muted)]">Crea tu primera oferta para atraer más clientes de la comunidad.</p>
                </div>
            )}
        </div>
    )
}
