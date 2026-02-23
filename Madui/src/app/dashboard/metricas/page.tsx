'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AnalyticsSummary {
    profile_views: number
    whatsapp_clicks: number
    offer_clicks: number
    review_reads: number
}

interface DailyData {
    date: string
    views: number
}

export default function MetricasPage() {
    const supabase = createClient()
    const [summary, setSummary] = useState<AnalyticsSummary>({ profile_views: 0, whatsapp_clicks: 0, offer_clicks: 0, review_reads: 0 })
    const [dailyViews, setDailyViews] = useState<DailyData[]>([])
    const [loading, setLoading] = useState(true)
    const [isPremium, setIsPremium] = useState(false)
    const [period, setPeriod] = useState<'7' | '30'>('30')

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase.from('profiles').select('plan_type').eq('id', user.id).single()
            setIsPremium(profile?.plan_type === 'premium')

            if (profile?.plan_type !== 'premium') {
                setLoading(false)
                return
            }

            const daysAgo = parseInt(period)
            const since = new Date()
            since.setDate(since.getDate() - daysAgo)

            const { data: events } = await supabase
                .from('analytics_events')
                .select('event_type, created_at')
                .eq('profile_id', user.id)
                .gte('created_at', since.toISOString())
                .order('created_at', { ascending: true })

            if (events) {
                const counts: AnalyticsSummary = { profile_views: 0, whatsapp_clicks: 0, offer_clicks: 0, review_reads: 0 }
                const viewsByDay: Record<string, number> = {}

                events.forEach(e => {
                    if (e.event_type === 'profile_view') counts.profile_views++
                    if (e.event_type === 'whatsapp_click') counts.whatsapp_clicks++
                    if (e.event_type === 'offer_click') counts.offer_clicks++
                    if (e.event_type === 'review_read') counts.review_reads++

                    if (e.event_type === 'profile_view') {
                        const day = new Date(e.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                        viewsByDay[day] = (viewsByDay[day] || 0) + 1
                    }
                })

                setSummary(counts)
                setDailyViews(Object.entries(viewsByDay).map(([date, views]) => ({ date, views })))
            }

            setLoading(false)
        }
        load()
    }, [period, supabase])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />)}
                </div>
                <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
        )
    }

    if (!isPremium) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 rounded-2xl bg-[var(--madui-accent-lighter)] flex items-center justify-center mb-6">
                    <span className="text-4xl">📊</span>
                </div>
                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)] mb-2">
                    Métricas Premium
                </h1>
                <p className="text-[var(--madui-text-secondary)] max-w-md mb-6">
                    Accede a estadísticas detalladas de tu negocio: vistas de perfil, clics en WhatsApp, interacción con tus ofertas y más.
                </p>
                <a href="/dashboard/plan" className="px-6 py-3 bg-[var(--madui-accent)] text-[var(--madui-text)] font-semibold rounded-xl hover:bg-[var(--madui-accent-dark)] transition-colors shadow-sm">
                    ⭐ Actualizar a Premium
                </a>
            </div>
        )
    }

    const maxViews = Math.max(...dailyViews.map(d => d.views), 1)

    const statCards = [
        { label: 'Vistas de Perfil', value: summary.profile_views, icon: '👁️', color: 'var(--madui-primary)' },
        { label: 'Clics WhatsApp', value: summary.whatsapp_clicks, icon: '💬', color: '#25D366' },
        { label: 'Clics en Ofertas', value: summary.offer_clicks, icon: '🏷️', color: 'var(--madui-accent)' },
        { label: 'Lectura Reseñas', value: summary.review_reads, icon: '⭐', color: '#F59E0B' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                        Métricas
                    </h1>
                    <p className="text-[var(--madui-text-secondary)] text-sm mt-1">
                        Rendimiento de tu negocio en zibata.services
                    </p>
                </div>
                <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={() => setPeriod('7')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === '7' ? 'bg-white shadow-sm text-[var(--madui-text)]' : 'text-[var(--madui-text-muted)]'}`}
                    >
                        7 días
                    </button>
                    <button
                        onClick={() => setPeriod('30')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${period === '30' ? 'bg-white shadow-sm text-[var(--madui-text)]' : 'text-[var(--madui-text-muted)]'}`}
                    >
                        30 días
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <div key={card.label} className="bg-white rounded-2xl border border-[var(--madui-border)] p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">{card.icon}</span>
                            <span className="text-xs font-medium text-[var(--madui-text-muted)] uppercase tracking-wide">{card.label}</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Views Chart */}
            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                    👁️ Vistas de Perfil
                </h2>
                {dailyViews.length > 0 ? (
                    <div className="space-y-2">
                        {dailyViews.map(d => (
                            <div key={d.date} className="flex items-center gap-3">
                                <span className="text-xs text-[var(--madui-text-muted)] w-16 shrink-0">{d.date}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(d.views / maxViews) * 100}%`,
                                            background: `linear-gradient(90deg, var(--madui-primary), var(--madui-primary-light))`,
                                            minWidth: '24px'
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-[var(--madui-text)] w-8 text-right">{d.views}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-[var(--madui-text-muted)]">
                        <p className="text-4xl mb-3">📈</p>
                        <p className="text-sm">Aún no hay datos. Las vistas aparecerán aquí cuando vecinos visiten tu perfil.</p>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-[var(--madui-primary-lighter)] to-white rounded-2xl border border-[var(--madui-primary)]/10 p-6">
                <h3 className="font-semibold text-[var(--madui-text)] mb-2">💡 Tips para mejorar tus métricas</h3>
                <ul className="space-y-1.5 text-sm text-[var(--madui-text-secondary)]">
                    <li>• Mantén tu perfil actualizado con fotos recientes</li>
                    <li>• Publica ofertas regularmente para atraer más visitas</li>
                    <li>• Responde a las reseñas de tus clientes</li>
                    <li>• Comparte tu perfil de zibata.services en tus redes sociales</li>
                </ul>
            </div>
        </div>
    )
}
