import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, categories(name, emoji)')
        .eq('id', user.id)
        .single()

    const isPremium = profile?.plan_type === 'premium'
    const isAdmin = user.user_metadata?.role === 'admin'

    const navItems = [
        { label: 'Resumen', href: '/dashboard', icon: '📊', always: true },
        { label: 'Mi Perfil', href: '/dashboard/perfil', icon: '👤', always: true },
        { label: 'Ofertas', href: '/dashboard/ofertas', icon: '🏷️', always: false, premiumOnly: true },
        { label: 'Métricas', href: '/dashboard/metricas', icon: '📈', always: false, premiumOnly: true },
        { label: 'Plan', href: '/dashboard/plan', icon: '⭐', always: true },
    ]

    return (
        <div className="min-h-screen bg-[var(--madui-bg)]">
            {/* Top header */}
            <header className="bg-white border-b border-[var(--madui-border)] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Logo size="md" linkTo="/" />

                        <div className="flex items-center gap-4">
                            {isAdmin && (
                                <Link href="/admin" className="text-xs font-medium text-[var(--madui-accent-dark)] bg-[var(--madui-accent-lighter)] px-3 py-1 rounded-full">
                                    Admin
                                </Link>
                            )}
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-[var(--madui-text)] leading-none">
                                    {profile?.business_name || profile?.full_name || user.email}
                                </p>
                                <p className="text-xs text-[var(--madui-text-muted)] mt-0.5">
                                    {isPremium ? '⭐ Premium' : 'Plan Básico'}
                                </p>
                            </div>
                            <form action="/auth/signout" method="post">
                                <button type="submit" className="text-xs text-[var(--madui-text-muted)] hover:text-[var(--madui-error)] transition-colors">
                                    Cerrar Sesión
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
                {/* Sidebar */}
                <aside className="hidden md:block w-56 shrink-0">
                    <nav className="sticky top-24 space-y-1">
                        {navItems
                            .filter((item) => item.always || (item.premiumOnly && isPremium))
                            .map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--madui-text-secondary)] hover:bg-white hover:text-[var(--madui-primary)] hover:shadow-sm transition-all"
                                >
                                    <span>{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}

                        {/* Upgrade CTA */}
                        {!isPremium && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-[var(--madui-accent-lighter)] to-white rounded-xl border border-[var(--madui-accent)]/20">
                                <p className="text-sm font-semibold text-[var(--madui-text)] mb-1">
                                    ⭐ Upgrade a Premium
                                </p>
                                <p className="text-xs text-[var(--madui-text-secondary)] mb-3">
                                    Más visibilidad, ofertas y métricas.
                                </p>
                                <Link
                                    href="/dashboard/plan"
                                    className="block text-center text-xs font-semibold text-[var(--madui-primary-dark)] bg-[var(--madui-accent)] py-2 rounded-lg hover:bg-[var(--madui-accent-light)] transition-colors"
                                >
                                    Ver Planes
                                </Link>
                            </div>
                        )}
                    </nav>
                </aside>

                {/* Main content */}
                <main className="flex-1 min-w-0">{children}</main>
            </div>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--madui-border)] z-50">
                <div className="flex justify-around py-2">
                    {navItems
                        .filter((item) => item.always || (item.premiumOnly && isPremium))
                        .slice(0, 5)
                        .map((item) => (
                            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-2 py-1 text-[var(--madui-text-muted)]">
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-[10px]">{item.label}</span>
                            </Link>
                        ))}
                </div>
            </nav>
        </div>
    )
}
