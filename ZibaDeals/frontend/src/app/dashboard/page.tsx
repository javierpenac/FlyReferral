import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, categories(name, emoji)')
        .eq('id', user.id)
        .single()

    const { data: verification } = await supabase
        .from('verifications')
        .select('*')
        .eq('profile_id', user.id)
        .single()

    const isPremium = profile?.plan_type === 'premium'

    // Verification timeline status
    const verSteps = [
        {
            label: 'Cuenta creada',
            status: 'done' as const,
            date: profile?.created_at,
        },
        {
            label: 'Documentos enviados',
            status: verification ? ('done' as const) : ('pending' as const),
            date: verification?.submitted_at,
        },
        {
            label: 'En revisión',
            status:
                verification?.status === 'en_revision' ||
                    verification?.status === 'aprobado'
                    ? ('done' as const)
                    : verification?.status === 'rechazado'
                        ? ('done' as const)
                        : ('pending' as const),
            date: null,
        },
        {
            label:
                profile?.verification_status === 'rechazado'
                    ? 'Rechazado'
                    : 'Perfil aprobado',
            status:
                profile?.verification_status === 'aprobado'
                    ? ('done' as const)
                    : profile?.verification_status === 'rechazado'
                        ? ('error' as const)
                        : ('pending' as const),
            date: profile?.approved_at,
        },
    ]

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                    ¡Hola, {profile?.full_name?.split(' ')[0] || 'Emprendedor'}! 👋
                </h1>
                <p className="text-[var(--madui-text-secondary)] mt-1">
                    Gestiona tu presencia en la comunidad Madui.
                </p>
            </div>

            {/* Rejection Banner */}
            {profile?.verification_status === 'rechazado' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm font-semibold text-[var(--madui-error)] mb-1">
                        Tu verificación fue rechazada
                    </p>
                    <p className="text-sm text-[var(--madui-text-secondary)]">
                        {profile.rejection_reason || 'Contacta a soporte para más detalles.'}
                    </p>
                </div>
            )}

            {/* Status Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-5">
                    <p className="text-xs text-[var(--madui-text-muted)] mb-1">Estado</p>
                    <div className="flex items-center gap-2">
                        <span
                            className={`w-2 h-2 rounded-full ${profile?.verification_status === 'aprobado'
                                    ? 'bg-green-500'
                                    : profile?.verification_status === 'rechazado'
                                        ? 'bg-red-500'
                                        : 'bg-amber-500 animate-pulse'
                                }`}
                        />
                        <span className="text-sm font-semibold text-[var(--madui-text)] capitalize">
                            {profile?.verification_status || 'Pendiente'}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-5">
                    <p className="text-xs text-[var(--madui-text-muted)] mb-1">Plan</p>
                    <span
                        className={`text-sm font-semibold ${isPremium
                                ? 'text-[var(--madui-accent-dark)]'
                                : 'text-[var(--madui-text)]'
                            }`}
                    >
                        {isPremium ? '⭐ Premium' : 'Básico'}
                    </span>
                    {profile?.plan_expires_at && isPremium && (
                        <p className="text-xs text-[var(--madui-text-muted)] mt-0.5">
                            Vence:{' '}
                            {new Date(profile.plan_expires_at).toLocaleDateString('es-MX')}
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-5">
                    <p className="text-xs text-[var(--madui-text-muted)] mb-1">
                        Categoría
                    </p>
                    <span className="text-sm font-semibold text-[var(--madui-text)]">
                        {(profile?.categories as { emoji?: string; name?: string } | null)
                            ?.emoji}{' '}
                        {(profile?.categories as { name?: string } | null)?.name ||
                            'Sin categoría'}
                    </span>
                </div>
            </div>

            {/* Verification Timeline */}
            <div className="bg-white rounded-xl border border-[var(--madui-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                    Estado de Verificación
                </h2>

                <div className="space-y-4">
                    {verSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${step.status === 'done'
                                            ? 'bg-[var(--madui-primary)] text-white'
                                            : step.status === 'error'
                                                ? 'bg-[var(--madui-error)] text-white'
                                                : 'bg-gray-100 text-[var(--madui-text-muted)]'
                                        }`}
                                >
                                    {step.status === 'done'
                                        ? '✓'
                                        : step.status === 'error'
                                            ? '✕'
                                            : i + 1}
                                </div>
                                {i < verSteps.length - 1 && (
                                    <div
                                        className={`w-0.5 h-6 mt-1 ${step.status === 'done'
                                                ? 'bg-[var(--madui-primary)]'
                                                : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                            <div className="pt-1">
                                <p
                                    className={`text-sm font-medium ${step.status === 'error'
                                            ? 'text-[var(--madui-error)]'
                                            : step.status === 'done'
                                                ? 'text-[var(--madui-text)]'
                                                : 'text-[var(--madui-text-muted)]'
                                        }`}
                                >
                                    {step.label}
                                </p>
                                {step.date && (
                                    <p className="text-xs text-[var(--madui-text-muted)]">
                                        {new Date(step.date).toLocaleDateString('es-MX', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-[var(--madui-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                    Acciones Rápidas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        href="/dashboard/perfil"
                        className="flex items-center gap-3 p-4 rounded-xl border border-[var(--madui-border)] hover:border-[var(--madui-primary)] hover:shadow-sm transition-all"
                    >
                        <span className="text-2xl">👤</span>
                        <div>
                            <p className="text-sm font-semibold text-[var(--madui-text)]">
                                Editar Perfil
                            </p>
                            <p className="text-xs text-[var(--madui-text-muted)]">
                                Actualiza tu información
                            </p>
                        </div>
                    </Link>

                    <Link
                        href={`/directorio/${user.id}`}
                        className="flex items-center gap-3 p-4 rounded-xl border border-[var(--madui-border)] hover:border-[var(--madui-primary)] hover:shadow-sm transition-all"
                    >
                        <span className="text-2xl">👁️</span>
                        <div>
                            <p className="text-sm font-semibold text-[var(--madui-text)]">
                                Ver mi Perfil Público
                            </p>
                            <p className="text-xs text-[var(--madui-text-muted)]">
                                Así te ven los vecinos
                            </p>
                        </div>
                    </Link>

                    {!isPremium && (
                        <Link
                            href="/dashboard/plan"
                            className="flex items-center gap-3 p-4 rounded-xl border border-[var(--madui-accent)]/30 bg-[var(--madui-accent-lighter)] hover:shadow-sm transition-all"
                        >
                            <span className="text-2xl">⭐</span>
                            <div>
                                <p className="text-sm font-semibold text-[var(--madui-text)]">
                                    Upgrade a Premium
                                </p>
                                <p className="text-xs text-[var(--madui-text-muted)]">
                                    Más visibilidad y funciones
                                </p>
                            </div>
                        </Link>
                    )}

                    {isPremium && (
                        <Link
                            href="/dashboard/ofertas"
                            className="flex items-center gap-3 p-4 rounded-xl border border-[var(--madui-border)] hover:border-[var(--madui-primary)] hover:shadow-sm transition-all"
                        >
                            <span className="text-2xl">🏷️</span>
                            <div>
                                <p className="text-sm font-semibold text-[var(--madui-text)]">
                                    Crear Oferta
                                </p>
                                <p className="text-xs text-[var(--madui-text-muted)]">
                                    Hasta 4 ofertas mensuales
                                </p>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
