import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export const metadata = {
    title: 'Para Emprendedores — zibata.services',
    description: 'Registra tu negocio en zibata.services y conéctate con los residentes de Zibatá, Querétaro.',
}

export default function EmprendedoresPage() {
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
                            <Link href="/promociones" className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors">
                                Promociones
                            </Link>
                            <Link href="/emprendedores" className="text-sm font-semibold text-[var(--madui-primary)]">
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
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--madui-primary-dark)] via-[var(--madui-primary)] to-[var(--madui-primary-light)] opacity-95" />
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--madui-accent)] rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-white/90 text-sm mb-6 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-[var(--madui-accent-light)] animate-pulse" />
                            Para emprendedores de Zibatá
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white font-[family-name:var(--font-montserrat)] leading-tight mb-6">
                            Haz crecer tu negocio
                            <span className="block text-[var(--madui-accent-light)]">
                                en tu comunidad
                            </span>
                        </h1>

                        <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
                            Registra tu negocio, conecta con tus vecinos y aumenta tu visibilidad en el directorio más exclusivo de Zibatá.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register" className="px-8 py-3.5 bg-[var(--madui-accent)] text-white font-bold rounded-xl hover:bg-[var(--madui-accent-light)] transition-colors shadow-lg text-lg">
                                Registrar Mi Negocio →
                            </Link>
                            <Link href="/login" className="px-8 py-3.5 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors backdrop-blur-sm text-lg border border-white/20">
                                Ya tengo cuenta
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="bg-white border-y border-[var(--madui-border)]">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                            ¿Cómo funciona?
                        </h2>
                        <p className="text-[var(--madui-text-secondary)] mt-2">Un proceso simple para emprendedores y vecinos</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { step: '01', emoji: '📋', title: 'Regístrate y Verifica', desc: 'Completa tu perfil y sube tu comprobante de residencia de Zibatá. Validamos que seas residente.' },
                            { step: '02', emoji: '🏪', title: 'Configura tu Negocio', desc: 'Personaliza tu perfil, agrega fotos, horarios y métodos de contacto para que los vecinos te encuentren.' },
                            { step: '03', emoji: '🤝', title: 'Conecta con Vecinos', desc: 'Tus vecinos te descubren en el directorio. Plan Premium te da mayor visibilidad y herramientas avanzadas.' },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--madui-primary-lighter)] flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">{item.emoji}</span>
                                </div>
                                <div className="text-xs font-bold text-[var(--madui-primary)] mb-2">PASO {item.step}</div>
                                <h3 className="text-lg font-semibold text-[var(--madui-text)] mb-2 font-[family-name:var(--font-montserrat)]">{item.title}</h3>
                                <p className="text-sm text-[var(--madui-text-secondary)]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Plans */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">Elige tu Plan</h2>
                    <p className="text-[var(--madui-text-secondary)] mt-2">Comienza gratis y escala cuando estés listo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-8">
                        <div className="text-sm font-semibold text-[var(--madui-text-muted)] mb-2 uppercase tracking-wide">Plan Básico</div>
                        <div className="text-3xl font-bold text-[var(--madui-text)] mb-1 font-[family-name:var(--font-montserrat)]">Gratis</div>
                        <p className="text-sm text-[var(--madui-text-secondary)] mb-6">Para empezar en la comunidad</p>
                        <ul className="space-y-3 text-sm text-[var(--madui-text-secondary)]">
                            {['Perfil básico en directorio', '1 foto de perfil', 'Información de contacto', 'Validación en 5 días hábiles', 'Lectura de reseñas'].map((feature) => (
                                <li key={feature} className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-[var(--madui-primary)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register" className="mt-8 block w-full py-3 text-center bg-gray-100 text-[var(--madui-text)] font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                            Comenzar Gratis
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl border-2 border-[var(--madui-accent)] p-8 relative shadow-lg">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="premium-badge text-sm">⭐ Más Popular</span>
                        </div>
                        <div className="text-sm font-semibold text-[var(--madui-accent-dark)] mb-2 uppercase tracking-wide">Plan Premium</div>
                        <div className="text-3xl font-bold text-[var(--madui-text)] mb-1 font-[family-name:var(--font-montserrat)]">
                            $299<span className="text-base font-normal text-[var(--madui-text-muted)]"> MXN / 3 meses</span>
                        </div>
                        <p className="text-sm text-[var(--madui-text-secondary)] mb-6">Máxima visibilidad y herramientas</p>
                        <ul className="space-y-3 text-sm text-[var(--madui-text-secondary)]">
                            {['Todo lo del Plan Básico', 'Posición destacada en directorio', 'Galería completa de fotos', 'Botón directo a WhatsApp', 'Hasta 4 ofertas mensuales', 'Validación express (1-2 días)', 'Responder reseñas', 'Dashboard de métricas', 'FAQs personalizadas'].map((feature) => (
                                <li key={feature} className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-[var(--madui-accent-dark)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register" className="mt-8 block w-full py-3 text-center bg-[var(--madui-accent)] text-white font-bold rounded-xl hover:bg-[var(--madui-accent-light)] transition-colors shadow-sm">
                            Obtener Premium
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-[var(--madui-primary)]">
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-montserrat)] mb-4">
                        ¿Listo para empezar?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-lg mx-auto">
                        Únete a la comunidad y haz que tus vecinos descubran tu negocio. Registro gratuito con verificación de residencia.
                    </p>
                    <Link href="/register" className="inline-flex px-8 py-3.5 bg-[var(--madui-accent)] text-white font-bold rounded-xl hover:bg-[var(--madui-accent-light)] transition-colors shadow-lg text-lg">
                        Registrar Mi Negocio →
                    </Link>
                </div>
            </section>

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
