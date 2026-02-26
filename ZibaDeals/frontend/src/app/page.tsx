import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // Fetch categories from DB
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  // Fetch approved entrepreneurs (premium first)
  const { data: entrepreneurs } = await supabase
    .from("profiles")
    .select("*, categories(name, emoji)")
    .eq("verification_status", "aprobado")
    .order("plan_type", { ascending: false })
    .limit(8);

  return (
    <div className="min-h-screen bg-[var(--madui-bg)]">
      {/* Top Banner */}
      <div className="bg-[var(--madui-primary)] text-white text-center py-2 px-4">
        <p className="text-sm">
          🌿 <span className="font-semibold">Comunidad exclusiva de Zibatá</span> — Emprendedores verificados por residentes
        </p>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[var(--madui-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--madui-primary)] flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[var(--madui-primary)] font-[family-name:var(--font-montserrat)] leading-none">
                  Madui
                </span>
                <span className="text-[10px] text-[var(--madui-text-muted)] leading-none mt-0.5">
                  Comunidad Zibatá
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/directorio"
                className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors"
              >
                Directorio
              </Link>
              <Link
                href="/categorias"
                className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors"
              >
                Categorías
              </Link>
              <Link
                href="/acerca"
                className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors"
              >
                ¿Qué es Madui?
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors hidden sm:block"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-[var(--madui-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors shadow-sm"
              >
                Registrar Negocio
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--madui-primary)] via-[var(--madui-primary-light)] to-[#4A9040] opacity-95" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--madui-accent)] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-white/90 text-sm mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--madui-accent)] animate-pulse" />
              Emprendedores verificados de Zibatá
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white font-[family-name:var(--font-montserrat)] leading-tight mb-6">
              Descubre lo mejor de
              <span className="block text-[var(--madui-accent-light)]">
                tu comunidad
              </span>
            </h1>

            <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
              Productos y servicios de emprendedores que viven en Zibatá.
              Verificados, confiables y a un paso de tu puerta.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form action="/directorio" method="get" className="relative">
                <div className="flex bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative flex-1">
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--madui-text-muted)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      name="q"
                      placeholder="Busca restaurantes, spas, servicios..."
                      className="w-full pl-12 pr-4 py-4 text-[var(--madui-text)] placeholder:text-[var(--madui-text-muted)] focus:outline-none text-base"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 bg-[var(--madui-primary)] text-white font-semibold hover:bg-[var(--madui-primary-light)] transition-colors hidden sm:block"
                  >
                    Buscar
                  </button>
                </div>
              </form>

              {/* Quick search tags */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["Gastronomía", "Belleza", "Mascotas", "Fitness"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/directorio?q=${tag}`}
                    className="px-3 py-1 bg-white/15 text-white/90 text-sm rounded-full hover:bg-white/25 transition-colors backdrop-blur-sm"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(categories || []).slice(0, 12).map((cat) => (
            <Link
              key={cat.id}
              href={`/directorio?categoria=${cat.slug}`}
              className="bg-white rounded-xl p-4 text-center border border-[var(--madui-border)] hover:border-[var(--madui-primary)] hover:shadow-md transition-all group"
            >
              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                {cat.emoji}
              </span>
              <span className="text-sm font-medium text-[var(--madui-text)] group-hover:text-[var(--madui-primary)] transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Entrepreneurs */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
              Emprendedores Destacados
            </h2>
            <p className="text-[var(--madui-text-secondary)] mt-1">
              Negocios verificados de tu comunidad
            </p>
          </div>
          <Link
            href="/directorio"
            className="text-sm font-medium text-[var(--madui-primary)] hover:text-[var(--madui-primary-light)] transition-colors hidden sm:block"
          >
            Ver todos →
          </Link>
        </div>

        {entrepreneurs && entrepreneurs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {entrepreneurs.map((profile) => (
              <Link
                key={profile.id}
                href={`/directorio/${profile.id}`}
                className="bento-card group"
              >
                {/* Photo */}
                <div className="aspect-[4/3] bg-gradient-to-br from-[var(--madui-primary-lighter)] to-gray-100 flex items-center justify-center relative">
                  {profile.profile_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.profile_photo_url}
                      alt={profile.business_name || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">
                      {(profile.categories as { emoji?: string } | null)?.emoji || "🏪"}
                    </span>
                  )}
                  {/* Premium badge */}
                  {profile.plan_type === "premium" && (
                    <span className="absolute top-3 right-3 premium-badge">
                      ⭐ Premium
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-[var(--madui-text-muted)] mb-1 flex items-center gap-1">
                    {(profile.categories as { emoji?: string; name?: string } | null)?.emoji}{" "}
                    {(profile.categories as { name?: string } | null)?.name || "Sin categoría"}
                  </p>
                  <h3 className="font-semibold text-[var(--madui-text)] group-hover:text-[var(--madui-primary)] transition-colors line-clamp-1">
                    {profile.business_name || profile.full_name || "Emprendedor"}
                  </h3>
                  {profile.bio && (
                    <p className="text-sm text-[var(--madui-text-secondary)] mt-1 line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="verified-badge">
                      ✓ Residente Zibatá
                    </span>
                    {profile.business_type && (
                      <span className="text-xs text-[var(--madui-text-muted)] capitalize">
                        {profile.business_type}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-12 bg-white rounded-2xl border border-[var(--madui-border)]">
            <span className="text-5xl block mb-4">🌱</span>
            <h3 className="text-lg font-semibold text-[var(--madui-text)] mb-2">
              ¡Sé el primer emprendedor!
            </h3>
            <p className="text-[var(--madui-text-secondary)] mb-6 max-w-md mx-auto">
              Aún no hay emprendedores registrados. Registra tu negocio y
              forma parte de la comunidad Madui.
            </p>
            <Link
              href="/register"
              className="inline-flex px-6 py-3 bg-[var(--madui-primary)] text-white font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors shadow-sm"
            >
              Registrar mi Negocio
            </Link>
          </div>
        )}
      </section>

      {/* How it Works */}
      <section className="bg-white border-y border-[var(--madui-border)]">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
              ¿Cómo funciona Madui?
            </h2>
            <p className="text-[var(--madui-text-secondary)] mt-2">
              Un proceso simple para emprendedores y vecinos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                emoji: "📋",
                title: "Regístrate y Verifica",
                desc: "Completa tu perfil y sube tu comprobante de residencia de Zibatá. Validamos que seas residente.",
              },
              {
                step: "02",
                emoji: "🏪",
                title: "Configura tu Negocio",
                desc: "Personaliza tu perfil, agrega fotos, horarios y métodos de contacto para que los vecinos te encuentren.",
              },
              {
                step: "03",
                emoji: "🤝",
                title: "Conecta con Vecinos",
                desc: "Tus vecinos te descubren en el directorio. Plan Premium te da mayor visibilidad y herramientas avanzadas.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--madui-primary-lighter)] flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{item.emoji}</span>
                </div>
                <div className="text-xs font-bold text-[var(--madui-primary)] mb-2">
                  PASO {item.step}
                </div>
                <h3 className="text-lg font-semibold text-[var(--madui-text)] mb-2 font-[family-name:var(--font-montserrat)]">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--madui-text-secondary)]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
            Elige tu Plan
          </h2>
          <p className="text-[var(--madui-text-secondary)] mt-2">
            Comienza gratis y escala cuando estés listo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-8">
            <div className="text-sm font-semibold text-[var(--madui-text-muted)] mb-2 uppercase tracking-wide">
              Plan Básico
            </div>
            <div className="text-3xl font-bold text-[var(--madui-text)] mb-1 font-[family-name:var(--font-montserrat)]">
              Gratis
            </div>
            <p className="text-sm text-[var(--madui-text-secondary)] mb-6">
              Para empezar en la comunidad
            </p>
            <ul className="space-y-3 text-sm text-[var(--madui-text-secondary)]">
              {[
                "Perfil básico en directorio",
                "1 foto de perfil",
                "Información de contacto",
                "Validación en 5 días hábiles",
                "Lectura de reseñas",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[var(--madui-primary)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block w-full py-3 text-center bg-gray-100 text-[var(--madui-text)] font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Comenzar Gratis
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-2xl border-2 border-[var(--madui-accent)] p-8 relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="premium-badge text-sm">⭐ Más Popular</span>
            </div>
            <div className="text-sm font-semibold text-[var(--madui-accent-dark)] mb-2 uppercase tracking-wide">
              Plan Premium
            </div>
            <div className="text-3xl font-bold text-[var(--madui-text)] mb-1 font-[family-name:var(--font-montserrat)]">
              $299<span className="text-base font-normal text-[var(--madui-text-muted)]"> MXN / 3 meses</span>
            </div>
            <p className="text-sm text-[var(--madui-text-secondary)] mb-6">
              Máxima visibilidad y herramientas
            </p>
            <ul className="space-y-3 text-sm text-[var(--madui-text-secondary)]">
              {[
                "Todo lo del Plan Básico",
                "Posición destacada en directorio",
                "Galería completa de fotos",
                "Botón directo a WhatsApp",
                "Hasta 4 ofertas mensuales",
                "Validación express (1-2 días)",
                "Responder reseñas",
                "Dashboard de métricas",
                "FAQs personalizadas",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-[var(--madui-accent-dark)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block w-full py-3 text-center bg-[var(--madui-accent)] text-[var(--madui-primary-dark)] font-bold rounded-xl hover:bg-[var(--madui-accent-light)] transition-colors shadow-sm"
            >
              Obtener Premium
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--madui-primary)]">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-montserrat)] mb-4">
            ¿Eres emprendedor en Zibatá?
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Únete a la comunidad y haz que tus vecinos descubran tu negocio.
            Registro gratuito con verificación de residencia.
          </p>
          <Link
            href="/register"
            className="inline-flex px-8 py-3.5 bg-[var(--madui-accent)] text-[var(--madui-primary-dark)] font-bold rounded-xl hover:bg-[var(--madui-accent-light)] transition-colors shadow-lg text-lg"
          >
            Registrar Mi Negocio →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[var(--madui-border)]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[var(--madui-primary)] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-[var(--madui-primary)] font-[family-name:var(--font-montserrat)]">
                  Madui
                </span>
              </div>
              <p className="text-sm text-[var(--madui-text-secondary)] max-w-sm">
                Ecosistema digital exclusivo para la comunidad de Zibatá,
                Querétaro. Conectamos emprendedores residentes con sus vecinos
                en un ambiente de confianza.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-[var(--madui-text)] mb-3 text-sm">
                Explorar
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "Directorio", href: "/directorio" },
                  { label: "Categorías", href: "/categorias" },
                  { label: "¿Qué es Madui?", href: "/acerca" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[var(--madui-text)] mb-3 text-sm">
                Emprendedores
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "Registrar Negocio", href: "/register" },
                  { label: "Iniciar Sesión", href: "/login" },
                  { label: "Plan Premium", href: "/register" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-[var(--madui-border)] mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--madui-text-muted)]">
              © 2026 Madui. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-xs text-[var(--madui-text-muted)] hover:text-[var(--madui-primary)]">
                Términos
              </Link>
              <Link href="#" className="text-xs text-[var(--madui-text-muted)] hover:text-[var(--madui-primary)]">
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
