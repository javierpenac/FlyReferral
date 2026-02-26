'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'

interface Review {
    id: string
    rating: number
    comment: string | null
    is_approved: boolean
    created_at: string
    entrepreneur_reply: string | null
    profiles: { business_name: string | null; full_name: string | null } | null
    reviewer_profile: { full_name: string | null } | null
}

export default function AdminResenasPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    const fetchReviews = useCallback(async () => {
        setLoading(true)
        const supabase = createClient()

        let query = supabase
            .from('reviews')
            .select('id, rating, comment, is_approved, created_at, entrepreneur_reply, profile_id, reviewer_id')
            .order('created_at', { ascending: false })

        if (filter === 'pending') query = query.eq('is_approved', false)
        if (filter === 'approved') query = query.eq('is_approved', true)

        const { data } = await query

        if (data && data.length > 0) {
            // Fetch related profiles for business names and reviewer names
            const profileIds = [...new Set(data.map(r => r.profile_id))]
            const reviewerIds = [...new Set(data.map(r => r.reviewer_id))]
            const allIds = [...new Set([...profileIds, ...reviewerIds])]

            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, business_name')
                .in('id', allIds)

            const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

            const enriched = data.map(r => ({
                ...r,
                profiles: profileMap.get(r.profile_id) || null,
                reviewer_profile: profileMap.get(r.reviewer_id) || null,
            }))
            setReviews(enriched as Review[])
        } else {
            setReviews([])
        }
        setLoading(false)
    }, [filter])

    useEffect(() => { fetchReviews() }, [fetchReviews])

    const handleApprove = async (id: string) => {
        const supabase = createClient()
        await supabase.from('reviews').update({ is_approved: true }).eq('id', id)
        fetchReviews()
    }

    const handleReject = async (id: string) => {
        const supabase = createClient()
        await supabase.from('reviews').update({ is_approved: false }).eq('id', id)
        fetchReviews()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta reseña permanentemente?')) return
        const supabase = createClient()
        await supabase.from('reviews').delete().eq('id', id)
        fetchReviews()
    }

    const approvedCount = reviews.filter(r => r.is_approved).length
    const pendingCount = reviews.filter(r => !r.is_approved).length

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                    Gestión de Reseñas
                </h1>
                <p className="text-[var(--madui-text-secondary)] text-sm mt-1">
                    Aprobar, rechazar y moderar reseñas de vecinos
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--madui-primary)]">{reviews.length}</p>
                    <p className="text-xs text-[var(--madui-text-muted)]">Total</p>
                </div>
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                    <p className="text-xs text-[var(--madui-text-muted)]">Aprobadas</p>
                </div>
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                    <p className="text-xs text-[var(--madui-text-muted)]">Pendientes</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                {[
                    { value: 'all', label: 'Todas' },
                    { value: 'pending', label: '⏳ Pendientes' },
                    { value: 'approved', label: '✅ Aprobadas' },
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.value
                            ? 'bg-[var(--madui-primary)] text-white shadow-sm'
                            : 'bg-white text-[var(--madui-text-secondary)] border border-[var(--madui-border)] hover:bg-gray-50'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Review Cards */}
            {loading ? (
                <div className="text-center py-12 text-[var(--madui-text-muted)]">Cargando reseñas...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-[var(--madui-text-muted)]">No hay reseñas en esta categoría</div>
            ) : (
                <div className="space-y-3">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white rounded-xl border border-[var(--madui-border)] p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex text-[var(--madui-accent)]">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <span key={s} className={`text-sm ${s <= review.rating ? '' : 'opacity-20'}`}>★</span>
                                            ))}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.is_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {review.is_approved ? 'Aprobada' : 'Pendiente'}
                                        </span>
                                        <span className="text-xs text-[var(--madui-text-muted)]">
                                            {new Date(review.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--madui-text)] mb-1">{review.comment || 'Sin comentario'}</p>
                                    <div className="flex items-center gap-4 text-xs text-[var(--madui-text-muted)]">
                                        <span>✍️ {review.reviewer_profile?.full_name || 'Anónimo'}</span>
                                        <span>🏪 {review.profiles?.business_name || 'Sin negocio'}</span>
                                    </div>
                                    {review.entrepreneur_reply && (
                                        <div className="mt-2 ml-4 pl-3 border-l-2 border-[var(--madui-primary-lighter)]">
                                            <p className="text-xs text-[var(--madui-primary)] font-medium">Respuesta del emprendedor:</p>
                                            <p className="text-xs text-[var(--madui-text-secondary)]">{review.entrepreneur_reply}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    {!review.is_approved ? (
                                        <button onClick={() => handleApprove(review.id)} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium">
                                            ✅ Aprobar
                                        </button>
                                    ) : (
                                        <button onClick={() => handleReject(review.id)} className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium">
                                            ⏳ Desaprobar
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(review.id)} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
