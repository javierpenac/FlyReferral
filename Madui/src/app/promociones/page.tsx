import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/server'

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
    merchant_id: string
    profiles: {
        business_name: string | null
        full_name: string | null
        profile_photo_url: string | null
        categories: { name: string; emoji: string } | null
    } | null
}

export const metadata = {
    title: 'Promociones — zibata.services',
    description: 'Aprovecha las mejores ofertas y promociones de emprendedores verificados en Zibatá.',
}

export default async function PromocionesPage() {
    const supabase = await createClient()

    const today = new Date().toISOString().split('T')[0]

    const { data: offers } = await supabase
        .from('offers')
        .select('*, profiles(business_name, full_name, profile_photo_url, categories(name, emoji))')
        .eq('status', 'active')
        .gte('expiry_date', today)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-[var(--madui-bg)]">
            {/* Header */}
            <header className="bg-white border-b border-[var(--madui-border)] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Logo size="md" linkTo="/" />

                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/directorio" className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors">
                                Directorio
                            </Link>
                            <Link href="/promociones" className="text-sm font-semibold text-[var(--madui-primary)]">
                                Promociones
                            </Link>
                            <Link href="/emprendedores" className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors">
                                Emprendedores
                            </Link>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors hidden sm:block">
                                Iniciar Sesión
                            </Link>
                            <Link href="/register" className="px-4 py-2 bg-[var(--madui-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors shadow-sm">
                                Registrar Negocio
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-[var(--madui-primary-lighter)] to-[var(--madui-bg)] py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full text-[var(--madui-primary)] text-sm mb-4 shadow-sm border border-[var(--madui-border)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--madui-accent)] animate-pulse" />
                        Ofertas de la comunidad
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)] mb-4">
                        Promociones y Ofertas
                    </h1>
                    <p className="text-[var(--madui-text-secondary)] max-w-xl mx-auto text-lg">
                        Las mejores ofertas de emprendedores verificados de Zibatá. Descuentos exclusivos para la comunidad.
                    </p>
                </div>
            </section>

            {/* Offers Grid */}
            <main className="max-w-7xl mx-auto px-4 py-10">
                {offers && offers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {(offers as Offer[]).map((offer) => {
                            const discount = offer.original_price > 0
                                ? Math.round(((offer.original_price - offer.offer_price) / offer.original_price) * 100)
                                : 0
                            const profile = offer.profiles
                            const expiryDate = new Date(offer.expiry_date)

                            return (
                                <div key={offer.id} className="bg-white rounded-2xl border border-[var(--madui-border)] overflow-hidden hover:shadow-lg transition-all group">
                                    {/* Discount Banner */}
                                    <div className="bg-gradient-to-r from-[var(--madui-accent)] to-[var(--madui-accent-light)] px-5 py-3 flex items-center justify-between">
                                        <span className="text-white font-bold text-lg">-{discount}%</span>
                                        <span className="text-white/80 text-xs">
                                            Válido hasta {expiryDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>

                                    <div className="p-5">
                                        {/* Offer Title & Description */}
                                        <h3 className="font-semibold text-[var(--madui-text)] text-lg mb-1 group-hover:text-[var(--madui-primary)] transition-colors">
                                            {offer.title}
                                        </h3>
                                        {offer.description && (
                                            <p className="text-sm text-[var(--madui-text-secondary)] mb-4 line-clamp-2">{offer.description}</p>
                                        )}

                                        {/* Pricing */}
                                        <div className="flex items-baseline gap-3 mb-4">
                                            <span className="text-2xl font-bold text-[var(--madui-primary)]">
                                                ${offer.offer_price.toLocaleString('es-MX')}
                                            </span>
                                            <span className="text-sm text-[var(--madui-text-muted)] line-through">
                                                ${offer.original_price.toLocaleString('es-MX')}
                                            </span>
                                        </div>

                                        {/* Business Info */}
                                        {profile && (
                                            <Link
                                                href={`/directorio/${offer.merchant_id}`}
                                                className="flex items-center gap-3 pt-4 border-t border-[var(--madui-border-light)]"
                                            >
                                                <div className="w-9 h-9 rounded-full bg-[var(--madui-primary-lighter)] flex items-center justify-center shrink-0 overflow-hidden">
                                                    {profile.profile_photo_url ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={profile.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm">
                                                            {(profile.categories as { emoji?: string } | null)?.emoji || '🏪'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-[var(--madui-text)] truncate">
                                                        {profile.business_name || profile.full_name || 'Emprendedor'}
                                                    </p>
                                                    <p className="text-xs text-[var(--madui-text-muted)]">
                                                        {(profile.categories as { emoji?: string; name?: string } | null)?.name || 'Negocio verificado'}
                                                    </p>
                                                </div>
                                                <span className="ml-auto text-xs text-[var(--madui-primary)] font-medium">Ver perfil →</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-[var(--madui-border)]">
                        <span className="text-5xl block mb-4">🏷️</span>
                        <h3 className="text-lg font-semibold text-[var(--madui-text)] mb-2">Aún no hay promociones activas</h3>
                        <p className="text-[var(--madui-text-secondary)] max-w-md mx-auto mb-6">
                            Los emprendedores premium de Zibatá pueden publicar ofertas y descuentos especiales para la comunidad.
                        </p>
                        <Link href="/directorio" className="inline-flex px-6 py-3 bg-[var(--madui-primary)] text-white font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors shadow-sm">
                            Explorar Directorio
                        </Link>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-[var(--madui-border)]">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <div className="mb-4">
                                <Logo size="md" />
                            </div>
                            <p className="text-sm text-[var(--madui-text-secondary)] max-w-sm">
                                Ecosistema digital exclusivo para la comunidad de Zibatá, Querétaro. Conectamos emprendedores residentes con sus vecinos en un ambiente de confianza.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[var(--madui-text)] mb-3 text-sm">Explorar</h4>
                            <ul className="space-y-2">
                                {[{ label: 'Directorio', href: '/directorio' }, { label: 'Promociones', href: '/promociones' }, { label: 'Emprendedores', href: '/emprendedores' }].map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="text-sm text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors">{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[var(--madui-text)] mb-3 text-sm">Emprendedores</h4>
                            <ul className="space-y-2">
                                {[{ label: 'Registrar Negocio', href: '/register' }, { label: 'Iniciar Sesión', href: '/login' }, { label: 'Plan Premium', href: '/emprendedores' }].map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors">{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-[var(--madui-border)] mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-[var(--madui-text-muted)]">© 2026 zibata.services. Todos los derechos reservados.</p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="text-xs text-[var(--madui-text-muted)] hover:text-[var(--madui-primary)]">Términos</Link>
                            <Link href="#" className="text-xs text-[var(--madui-text-muted)] hover:text-[var(--madui-primary)]">Privacidad</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
