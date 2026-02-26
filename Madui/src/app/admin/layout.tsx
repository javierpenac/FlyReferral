import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const userRole = user.user_metadata?.role
    if (userRole !== 'admin' && userRole !== 'analyst') redirect('/dashboard')

    const isSuperadmin = userRole === 'admin'
    const roleBadge = isSuperadmin ? 'Superadmin' : 'Analista'
    const roleBadgeColor = isSuperadmin
        ? 'bg-red-600 text-white'
        : 'bg-blue-600 text-white'

    const navItems = [
        { label: 'Verificaciones', href: '/admin/verificaciones', icon: '📋', roles: ['admin', 'analyst'] },
        { label: 'Negocios', href: '/admin/negocios', icon: '🏪', roles: ['admin', 'analyst'] },
        { label: 'Reseñas', href: '/admin/resenas', icon: '⭐', roles: ['admin', 'analyst'] },
        { label: 'Reportes', href: '/admin/reportes', icon: '📊', roles: ['admin'] },
        { label: 'Usuarios', href: '/admin/usuarios', icon: '👥', roles: ['admin'] },
    ]

    const filteredNav = navItems.filter(item => item.roles.includes(userRole))

    return (
        <div className="min-h-screen bg-[var(--madui-bg)]">
            <header className="bg-white border-b border-[var(--madui-border)] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Logo size="md" linkTo="/" />
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBadgeColor}`}>{roleBadge}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-sm text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors">
                                ← Dashboard
                            </Link>
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
                <aside className="hidden md:block w-52 shrink-0">
                    <nav className="sticky top-24 space-y-1">
                        {filteredNav.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--madui-text-secondary)] hover:bg-white hover:text-[var(--madui-primary)] hover:shadow-sm transition-all"
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 min-w-0">{children}</main>
            </div>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--madui-border)] z-50">
                <div className="flex justify-around py-2">
                    {filteredNav.slice(0, 5).map(item => (
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
