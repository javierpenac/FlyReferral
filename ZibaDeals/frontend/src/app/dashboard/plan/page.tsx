import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PlanPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type, plan_expires_at')
        .eq('id', user.id)
        .single()

    const isPremium = profile?.plan_type === 'premium'

    const plans = [
        { duration: 3, price: 299, label: '3 Meses', perMonth: 100 },
        { duration: 6, price: 499, label: '6 Meses', perMonth: 83, popular: true },
        { duration: 12, price: 899, label: '12 Meses', perMonth: 75, bestValue: true },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                    Tu Plan
                </h1>
                <p className="text-[var(--madui-text-secondary)] mt-1">
                    {isPremium
                        ? `Tu plan Premium vence el ${new Date(
                            profile.plan_expires_at!
                        ).toLocaleDateString('es-MX')}`
                        : 'Mejora tu visibilidad con Premium'}
                </p>
            </div>

            {/* Current Plan */}
            <div className={`rounded-xl border p-6 ${isPremium
                    ? 'bg-gradient-to-r from-[var(--madui-accent-lighter)] to-white border-[var(--madui-accent)]/30'
                    : 'bg-white border-[var(--madui-border)]'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{isPremium ? '⭐' : '📋'}</span>
                    <h2 className="text-lg font-semibold text-[var(--madui-text)]">
                        Plan {isPremium ? 'Premium' : 'Básico'}
                    </h2>
                </div>
                <p className="text-sm text-[var(--madui-text-secondary)]">
                    {isPremium
                        ? 'Disfrutas de todas las funciones premium. ¡Gracias por tu apoyo!'
                        : 'Tienes acceso a funcionalidades básicas. Upgrade para desbloquear todo.'}
                </p>
            </div>

            {/* Premium Comparison */}
            {!isPremium && (
                <>
                    <div className="bg-white rounded-xl border border-[var(--madui-border)] p-6">
                        <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                            ¿Por qué Premium?
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { icon: '🔝', label: 'Posición destacada', desc: 'Apareces primero en el directorio' },
                                { icon: '📸', label: 'Galería de fotos', desc: 'Muestra tu trabajo con imágenes' },
                                { icon: '💬', label: 'Botón WhatsApp', desc: 'Contacto directo con clientes' },
                                { icon: '🏷️', label: '4 ofertas/mes', desc: 'Publica promotions para vecinos' },
                                { icon: '📊', label: 'Métricas', desc: 'Vistas, clics y engagement' },
                                { icon: '💬', label: 'Responder reseñas', desc: 'Interactúa con tus clientes' },
                                { icon: '🕐', label: 'Horarios', desc: 'Publica tus horarios de operación' },
                                { icon: '⚡', label: 'Validación express', desc: '1-2 días hábiles vs 5 días' },
                            ].map((feature) => (
                                <div key={feature.label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                    <span className="text-xl">{feature.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--madui-text)]">{feature.label}</p>
                                        <p className="text-xs text-[var(--madui-text-muted)]">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                            <div
                                key={plan.duration}
                                className={`rounded-xl border p-6 text-center relative ${plan.popular
                                        ? 'border-2 border-[var(--madui-accent)] shadow-lg'
                                        : 'border-[var(--madui-border)]'
                                    } bg-white`}
                            >
                                {plan.popular && (
                                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 premium-badge text-xs">
                                        Más Popular
                                    </span>
                                )}
                                {plan.bestValue && (
                                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs bg-[var(--madui-primary)] text-white font-semibold px-3 py-0.5 rounded-full">
                                        Mejor Valor
                                    </span>
                                )}
                                <p className="text-sm font-semibold text-[var(--madui-text-secondary)] mb-2">
                                    {plan.label}
                                </p>
                                <p className="text-3xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                                    ${plan.price}
                                    <span className="text-sm font-normal text-[var(--madui-text-muted)]"> MXN</span>
                                </p>
                                <p className="text-xs text-[var(--madui-text-muted)] mt-1">
                                    ~${plan.perMonth}/mes
                                </p>
                                <Link
                                    href={`/dashboard/plan/checkout?plan=${plan.duration}`}
                                    className={`mt-4 block w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.popular
                                            ? 'bg-[var(--madui-accent)] text-[var(--madui-primary-dark)] hover:bg-[var(--madui-accent-light)]'
                                            : 'bg-[var(--madui-primary)] text-white hover:bg-[var(--madui-primary-light)]'
                                        }`}
                                >
                                    Elegir Plan
                                </Link>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
