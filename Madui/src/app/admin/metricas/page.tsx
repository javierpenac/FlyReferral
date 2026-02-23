import { createClient } from '@/lib/supabase/server'

export default async function AdminMetricasPage() {
    const supabase = await createClient()

    // Total profiles by status
    const { count: totalProfiles } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: approved } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'aprobado')
    const { count: pending } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pendiente')
    const { count: rejected } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'rechazado')

    // Plan distribution
    const { count: premiumCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan_type', 'premium')
    const { count: basicCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan_type', 'basico')

    // Active offers
    const { count: activeOffers } = await supabase.from('offers').select('*', { count: 'exact', head: true }).eq('status', 'active')

    // Reviews
    const { count: totalReviews } = await supabase.from('reviews').select('*', { count: 'exact', head: true })

    // Top categories
    const { data: profiles } = await supabase.from('profiles').select('categories(name, emoji)').eq('verification_status', 'aprobado')
    const categoryCounts: Record<string, { name: string; emoji: string; count: number }> = {}
    profiles?.forEach(p => {
        const cat = p.categories as { name?: string; emoji?: string } | null
        if (cat?.name) {
            if (!categoryCounts[cat.name]) categoryCounts[cat.name] = { name: cat.name, emoji: cat.emoji || '📦', count: 0 }
            categoryCounts[cat.name].count++
        }
    })
    const topCategories = Object.values(categoryCounts).sort((a, b) => b.count - a.count).slice(0, 6)

    const conversionRate = (totalProfiles || 0) > 0 ? (((premiumCount || 0) / (totalProfiles || 1)) * 100).toFixed(1) : '0'

    const statCards = [
        { label: 'Total Registrados', value: totalProfiles || 0, icon: '👥', color: 'var(--madui-primary)' },
        { label: 'Aprobados', value: approved || 0, icon: '✅', color: 'var(--madui-success)' },
        { label: 'Pendientes', value: pending || 0, icon: '⏳', color: 'var(--madui-accent)' },
        { label: 'Rechazados', value: rejected || 0, icon: '❌', color: 'var(--madui-error)' },
    ]

    const secondaryCards = [
        { label: 'Premium', value: premiumCount || 0, icon: '⭐', color: 'var(--madui-accent)' },
        { label: 'Básico', value: basicCount || 0, icon: '📋', color: 'var(--madui-text-muted)' },
        { label: 'Conversión Premium', value: `${conversionRate}%`, icon: '📈', color: 'var(--madui-primary)' },
        { label: 'Ofertas Activas', value: activeOffers || 0, icon: '🏷️', color: '#25D366' },
        { label: 'Reseñas', value: totalReviews || 0, icon: '⭐', color: '#F59E0B' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                    Métricas de la Plataforma
                </h1>
                <p className="text-[var(--madui-text-secondary)] text-sm mt-1">
                    Vista ejecutiva del estado de zibata.services
                </p>
            </div>

            {/* Users Overview */}
            <div>
                <h2 className="text-sm font-semibold text-[var(--madui-text-muted)] uppercase tracking-wide mb-3">Emprendedores</h2>
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
            </div>

            {/* Business Metrics */}
            <div>
                <h2 className="text-sm font-semibold text-[var(--madui-text-muted)] uppercase tracking-wide mb-3">Negocio</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {secondaryCards.map(card => (
                        <div key={card.label} className="bg-white rounded-2xl border border-[var(--madui-border)] p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span>{card.icon}</span>
                                <span className="text-xs font-medium text-[var(--madui-text-muted)]">{card.label}</span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Categories */}
            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                    Categorías Más Populares
                </h2>
                {topCategories.length > 0 ? (
                    <div className="space-y-3">
                        {topCategories.map((cat, i) => (
                            <div key={cat.name} className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-[var(--madui-text-muted)] w-6">{i + 1}.</span>
                                <span className="text-lg">{cat.emoji}</span>
                                <span className="text-sm font-medium text-[var(--madui-text)] flex-1">{cat.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-[var(--madui-primary)]"
                                            style={{ width: `${(cat.count / (topCategories[0]?.count || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-[var(--madui-text)] w-8 text-right">{cat.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-[var(--madui-text-muted)] text-center py-4">Sin datos aún.</p>
                )}
            </div>

            {/* Verification Funnel */}
            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                    Funnel de Verificación
                </h2>
                <div className="flex items-end gap-4 h-40">
                    {[
                        { label: 'Registrados', value: totalProfiles || 0, color: 'var(--madui-primary-lighter)' },
                        { label: 'Pendientes', value: pending || 0, color: 'var(--madui-accent-lighter)' },
                        { label: 'Aprobados', value: approved || 0, color: '#DCFCE7' },
                        { label: 'Rechazados', value: rejected || 0, color: '#FEE2E2' },
                    ].map(step => {
                        const maxVal = totalProfiles || 1
                        const height = Math.max((step.value / maxVal) * 100, 10)
                        return (
                            <div key={step.label} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-sm font-bold text-[var(--madui-text)]">{step.value}</span>
                                <div
                                    className="w-full rounded-t-xl transition-all"
                                    style={{ height: `${height}%`, backgroundColor: step.color }}
                                />
                                <span className="text-xs text-[var(--madui-text-muted)] text-center">{step.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
