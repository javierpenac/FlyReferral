import { createClient } from '@/lib/supabase/server'

export default async function AdminReportesPage() {
    const supabase = await createClient()

    // ─── User Metrics ───
    const { count: totalProfiles } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: approved } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'aprobado')
    const { count: pending } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pendiente')
    const { count: rejected } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'rechazado')
    const { count: premiumCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan_type', 'premium')
    const { count: basicCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('plan_type', 'basico')

    // ─── Registrations per day (last 14 days) ───
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    const { data: recentProfiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', fourteenDaysAgo.toISOString())
        .order('created_at', { ascending: true })

    const registrationsByDay: Record<string, number> = {}
    for (let i = 13; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        registrationsByDay[d.toISOString().slice(0, 10)] = 0
    }
    recentProfiles?.forEach(p => {
        const day = new Date(p.created_at).toISOString().slice(0, 10)
        if (registrationsByDay[day] !== undefined) registrationsByDay[day]++
    })
    const regDays = Object.entries(registrationsByDay)
    const maxRegs = Math.max(...regDays.map(([, v]) => v), 1)

    // ─── Payment Metrics ───
    const { data: allPayments } = await supabase
        .from('payments')
        .select('amount, status, created_at, concept')
        .order('created_at', { ascending: false })

    const completedPayments = allPayments?.filter(p => p.status === 'completed') || []
    const rejectedPayments = allPayments?.filter(p => p.status === 'rejected') || []
    const pendingPayments = allPayments?.filter(p => p.status === 'pending') || []

    const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const totalRejected = rejectedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0)

    // ─── Revenue by Period ───
    const now = new Date()

    // Today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const revenueToday = completedPayments
        .filter(p => new Date(p.created_at) >= todayStart)
        .reduce((sum, p) => sum + Number(p.amount), 0)

    // This week (Monday-based)
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
    weekStart.setHours(0, 0, 0, 0)
    const revenueWeek = completedPayments
        .filter(p => new Date(p.created_at) >= weekStart)
        .reduce((sum, p) => sum + Number(p.amount), 0)

    // This month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const revenueMonth = completedPayments
        .filter(p => new Date(p.created_at) >= monthStart)
        .reduce((sum, p) => sum + Number(p.amount), 0)

    // Revenue by hour (today)
    const hourlyRevenue: Record<number, number> = {}
    for (let h = 0; h < 24; h++) hourlyRevenue[h] = 0
    completedPayments
        .filter(p => new Date(p.created_at) >= todayStart)
        .forEach(p => {
            const hour = new Date(p.created_at).getHours()
            hourlyRevenue[hour] += Number(p.amount)
        })

    // Revenue by day (last 7 days)
    const dailyRevenue: { day: string; amount: number }[] = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayStr = d.toISOString().slice(0, 10)
        const dayAmount = completedPayments
            .filter(p => new Date(p.created_at).toISOString().slice(0, 10) === dayStr)
            .reduce((sum, p) => sum + Number(p.amount), 0)
        dailyRevenue.push({ day: dayStr, amount: dayAmount })
    }
    const maxDailyRevenue = Math.max(...dailyRevenue.map(d => d.amount), 1)

    // Revenue by week (last 4 weeks)
    const weeklyRevenue: { week: string; amount: number }[] = []
    for (let w = 3; w >= 0; w--) {
        const wStart = new Date()
        wStart.setDate(wStart.getDate() - (w * 7) - wStart.getDay() + 1)
        wStart.setHours(0, 0, 0, 0)
        const wEnd = new Date(wStart)
        wEnd.setDate(wEnd.getDate() + 7)
        const weekAmount = completedPayments
            .filter(p => {
                const d = new Date(p.created_at)
                return d >= wStart && d < wEnd
            })
            .reduce((sum, p) => sum + Number(p.amount), 0)
        weeklyRevenue.push({
            week: `${wStart.getDate()}/${wStart.getMonth() + 1} - ${new Date(wEnd.getTime() - 86400000).getDate()}/${wEnd.getMonth() + 1}`,
            amount: weekAmount
        })
    }
    const maxWeeklyRevenue = Math.max(...weeklyRevenue.map(w => w.amount), 1)

    // ─── Conversions ───
    const conversionRate = (totalProfiles || 0) > 0 ? (((premiumCount || 0) / (totalProfiles || 1)) * 100).toFixed(1) : '0'

    // ─── Offers & Reviews ───
    const { count: activeOffers } = await supabase.from('offers').select('*', { count: 'exact', head: true }).eq('status', 'active')
    const { count: totalReviews } = await supabase.from('reviews').select('*', { count: 'exact', head: true })
    const { count: pendingReviews } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false)

    // ─── Top Categories ───
    const { data: profilesWithCats } = await supabase.from('profiles').select('categories(name, emoji)').eq('verification_status', 'aprobado')
    const categoryCounts: Record<string, { name: string; emoji: string; count: number }> = {}
    profilesWithCats?.forEach(p => {
        const cat = p.categories as { name?: string; emoji?: string } | null
        if (cat?.name) {
            if (!categoryCounts[cat.name]) categoryCounts[cat.name] = { name: cat.name, emoji: cat.emoji || '📦', count: 0 }
            categoryCounts[cat.name].count++
        }
    })
    const topCategories = Object.values(categoryCounts).sort((a, b) => b.count - a.count).slice(0, 6)

    const formatMoney = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                    Reportes e Indicadores
                </h1>
                <p className="text-[var(--madui-text-secondary)] text-sm mt-1">
                    KPIs del negocio, ingresos, pagos y métricas de crecimiento
                </p>
            </div>

            {/* ═══ INGRESOS ═══ */}
            <section>
                <h2 className="text-sm font-semibold text-[var(--madui-text-muted)] uppercase tracking-wide mb-3">💰 Ingresos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Hoy', value: formatMoney(revenueToday), color: 'var(--madui-primary)', icon: '📅' },
                        { label: 'Esta Semana', value: formatMoney(revenueWeek), color: 'var(--madui-success)', icon: '📆' },
                        { label: 'Este Mes', value: formatMoney(revenueMonth), color: '#2563EB', icon: '🗓️' },
                        { label: 'Total Acumulado', value: formatMoney(totalRevenue), color: 'var(--madui-accent-dark)', icon: '🏦' },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-2xl border border-[var(--madui-border)] p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">{card.icon}</span>
                                <span className="text-xs font-medium text-[var(--madui-text-muted)] uppercase tracking-wide">{card.label}</span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ INGRESOS POR DÍA (gráfica de barras) ═══ */}
            <section className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                    Ingresos por Día (Últimos 7 días)
                </h2>
                <div className="flex items-end gap-3 h-44">
                    {dailyRevenue.map(d => {
                        const height = Math.max((d.amount / maxDailyRevenue) * 100, 5)
                        const dayLabel = new Date(d.day + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' })
                        return (
                            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-[var(--madui-text)]">{d.amount > 0 ? formatMoney(d.amount) : '—'}</span>
                                <div
                                    className="w-full rounded-t-xl bg-gradient-to-t from-[var(--madui-primary)] to-[var(--madui-primary-lighter)] transition-all"
                                    style={{ height: `${height}%` }}
                                />
                                <span className="text-[10px] text-[var(--madui-text-muted)] capitalize">{dayLabel}</span>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* ═══ INGRESOS POR SEMANA ═══ */}
            <section className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                    Ingresos por Semana (Últimas 4 semanas)
                </h2>
                <div className="flex items-end gap-4 h-40">
                    {weeklyRevenue.map((w, i) => {
                        const height = Math.max((w.amount / maxWeeklyRevenue) * 100, 5)
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-[var(--madui-text)]">{w.amount > 0 ? formatMoney(w.amount) : '—'}</span>
                                <div
                                    className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-blue-300 transition-all"
                                    style={{ height: `${height}%` }}
                                />
                                <span className="text-[10px] text-[var(--madui-text-muted)]">{w.week}</span>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* ═══ PAGOS ═══ */}
            <section>
                <h2 className="text-sm font-semibold text-[var(--madui-text-muted)] uppercase tracking-wide mb-3">💳 Pagos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Pagos Recibidos', value: completedPayments.length, sub: formatMoney(totalRevenue), color: 'var(--madui-success)', icon: '✅' },
                        { label: 'Pagos Rechazados', value: rejectedPayments.length, sub: formatMoney(totalRejected), color: 'var(--madui-error)', icon: '❌' },
                        { label: 'Pagos Pendientes', value: pendingPayments.length, sub: formatMoney(totalPending), color: 'var(--madui-accent)', icon: '⏳' },
                        { label: 'Total Transacciones', value: allPayments?.length || 0, sub: `${completedPayments.length} exitosas`, color: 'var(--madui-primary)', icon: '📊' },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-2xl border border-[var(--madui-border)] p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span>{card.icon}</span>
                                <span className="text-xs font-medium text-[var(--madui-text-muted)]">{card.label}</span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                            <p className="text-xs text-[var(--madui-text-muted)] mt-0.5">{card.sub}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ REGISTROS POR DÍA ═══ */}
            <section className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                    Registros por Día (Últimos 14 días)
                </h2>
                <div className="flex items-end gap-2 h-32">
                    {regDays.map(([day, count]) => {
                        const height = Math.max((count / maxRegs) * 100, 5)
                        const label = new Date(day + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                        return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-1">
                                {count > 0 && <span className="text-[10px] font-bold text-[var(--madui-text)]">{count}</span>}
                                <div
                                    className="w-full rounded-t-xl bg-gradient-to-t from-[var(--madui-accent)] to-[var(--madui-accent-lighter)] transition-all"
                                    style={{ height: `${height}%` }}
                                />
                                <span className="text-[8px] text-[var(--madui-text-muted)] -rotate-45 origin-top-left whitespace-nowrap">{label}</span>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* ═══ EMPRENDEDORES ═══ */}
            <section>
                <h2 className="text-sm font-semibold text-[var(--madui-text-muted)] uppercase tracking-wide mb-3">👥 Emprendedores</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: 'Total Registrados', value: totalProfiles || 0, icon: '👥', color: 'var(--madui-primary)' },
                        { label: 'Aprobados', value: approved || 0, icon: '✅', color: 'var(--madui-success)' },
                        { label: 'Pendientes', value: pending || 0, icon: '⏳', color: 'var(--madui-accent)' },
                        { label: 'Rechazados', value: rejected || 0, icon: '❌', color: 'var(--madui-error)' },
                        { label: 'Conversión Premium', value: `${conversionRate}%`, icon: '📈', color: '#2563EB' },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-2xl border border-[var(--madui-border)] p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span>{card.icon}</span>
                                <span className="text-xs font-medium text-[var(--madui-text-muted)]">{card.label}</span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ PLANES ═══ */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                    <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                        Distribución de Planes
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm">⭐</span>
                            <span className="text-sm flex-1 text-[var(--madui-text)]">Premium</span>
                            <div className="w-32 bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div className="h-full rounded-full bg-[var(--madui-accent)]" style={{ width: `${((premiumCount || 0) / (totalProfiles || 1)) * 100}%` }} />
                            </div>
                            <span className="text-sm font-bold text-[var(--madui-text)] w-8 text-right">{premiumCount}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm">📋</span>
                            <span className="text-sm flex-1 text-[var(--madui-text)]">Básico</span>
                            <div className="w-32 bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div className="h-full rounded-full bg-gray-400" style={{ width: `${((basicCount || 0) / (totalProfiles || 1)) * 100}%` }} />
                            </div>
                            <span className="text-sm font-bold text-[var(--madui-text)] w-8 text-right">{basicCount}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                    <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                        Plataforma
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-[var(--madui-text-muted)]">Ofertas Activas</p>
                            <p className="text-xl font-bold text-[var(--madui-primary)]">{activeOffers || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--madui-text-muted)]">Total Reseñas</p>
                            <p className="text-xl font-bold text-[var(--madui-accent)]">{totalReviews || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--madui-text-muted)]">Reseñas Pendientes</p>
                            <p className="text-xl font-bold text-amber-600">{pendingReviews || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--madui-text-muted)]">Ticket Promedio</p>
                            <p className="text-xl font-bold text-[var(--madui-primary)]">{completedPayments.length > 0 ? formatMoney(totalRevenue / completedPayments.length) : '$0'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CATEGORÍAS MÁS POPULARES ═══ */}
            <section className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
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
                                        <div className="h-full rounded-full bg-[var(--madui-primary)]" style={{ width: `${(cat.count / (topCategories[0]?.count || 1)) * 100}%` }} />
                                    </div>
                                    <span className="text-sm font-semibold text-[var(--madui-text)] w-8 text-right">{cat.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-[var(--madui-text-muted)] text-center py-4">Sin datos aún.</p>
                )}
            </section>

            {/* ═══ FUNNEL ═══ */}
            <section className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                    Funnel de Conversión
                </h2>
                <div className="flex items-end gap-4 h-40">
                    {[
                        { label: 'Registrados', value: totalProfiles || 0, color: 'var(--madui-primary-lighter)' },
                        { label: 'Aprobados', value: approved || 0, color: '#DCFCE7' },
                        { label: 'Premium', value: premiumCount || 0, color: 'var(--madui-accent-lighter)' },
                        { label: 'Con Ofertas', value: activeOffers || 0, color: '#DBEAFE' },
                    ].map(step => {
                        const maxVal = totalProfiles || 1
                        const height = Math.max((step.value / maxVal) * 100, 10)
                        return (
                            <div key={step.label} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-sm font-bold text-[var(--madui-text)]">{step.value}</span>
                                <div className="w-full rounded-t-xl transition-all" style={{ height: `${height}%`, backgroundColor: step.color }} />
                                <span className="text-xs text-[var(--madui-text-muted)] text-center">{step.label}</span>
                            </div>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}
