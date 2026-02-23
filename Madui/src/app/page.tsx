import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
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
            <Logo size="md" linkTo="/" />

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/directorio" className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors">
                Directorio
              </Link>
              <Link href="/promociones" className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors">
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--madui-primary-dark)] via-[var(--madui-primary)] to-[var(--madui-primary-light)] opacity-95" />
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
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--madui-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" name="q" placeholder="Busca restaurantes, spas, servicios..." className="w-full pl-12 pr-4 py-4 text-[var(--madui-text)] placeholder:text-[var(--madui-text-muted)] focus:outline-none text-base" />
                  </div>
                  <button type="submit" className="px-8 bg-[var(--madui-primary)] text-white font-semibold hover:bg-[var(--madui-primary-light)] transition-colors hidden sm:block">
                    Buscar
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["Gastronomía", "Belleza", "Mascotas", "Fitness"].map((tag) => (
                  <Link key={tag} href={`/directorio?q=${tag}`} className="px-3 py-1 bg-white/15 text-white/90 text-sm rounded-full hover:bg-white/25 transition-colors backdrop-blur-sm">
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
            <Link key={cat.id} href={`/directorio?categoria=${cat.slug}`} className="bg-white rounded-xl p-4 text-center border border-[var(--madui-border)] hover:border-[var(--madui-primary)] hover:shadow-md transition-all group">
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
          <Link href="/directorio" className="text-sm font-medium text-[var(--madui-primary)] hover:text-[var(--madui-primary-light)] transition-colors hidden sm:block">
            Ver todos →
          </Link>
        </div>

        {entrepreneurs && entrepreneurs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {entrepreneurs.map((profile) => (
              <Link key={profile.id} href={`/directorio/${profile.id}`} className="bento-card group">
                <div className="aspect-[4/3] bg-gradient-to-br from-[var(--madui-primary-lighter)] to-gray-100 flex items-center justify-center relative">
                  {profile.profile_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.profile_photo_url} alt={profile.business_name || ""} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">
                      {(profile.categories as { emoji?: string } | null)?.emoji || "🏪"}
                    </span>
                  )}
                  {profile.plan_type === "premium" && (
                    <span className="absolute top-3 right-3 premium-badge">⭐ Premium</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-[var(--madui-text-muted)] mb-1 flex items-center gap-1">
                    {(profile.categories as { emoji?: string; name?: string } | null)?.emoji}{" "}
                    {(profile.categories as { name?: string } | null)?.name || "Sin categoría"}
                  </p>
                  <h3 className="font-semibold text-[var(--madui-text)] group-hover:text-[var(--madui-primary)] transition-colors line-clamp-1">
                    {profile.business_name || profile.full_name || "Emprendedor"}
                  </h3>
                  {profile.bio && (
                    <p className="text-sm text-[var(--madui-text-secondary)] mt-1 line-clamp-2">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="verified-badge">✓ Residente Zibatá</span>
                    {profile.business_type && (
                      <span className="text-xs text-[var(--madui-text-muted)] capitalize">{profile.business_type}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-[var(--madui-border)]">
            <span className="text-5xl block mb-4">🌱</span>
            <h3 className="text-lg font-semibold text-[var(--madui-text)] mb-2">¡Sé el primer emprendedor!</h3>
            <p className="text-[var(--madui-text-secondary)] mb-6 max-w-md mx-auto">
              Aún no hay emprendedores registrados. Registra tu negocio y forma parte de la comunidad zibata.services.
            </p>
            <Link href="/register" className="inline-flex px-6 py-3 bg-[var(--madui-primary)] text-white font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors shadow-sm">
              Registrar mi Negocio
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--madui-primary)]">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-montserrat)] mb-4">
            ¿Eres emprendedor en Zibatá?
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Únete a la comunidad y haz que tus vecinos descubran tu negocio. Registro gratuito con verificación de residencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex px-8 py-3.5 bg-[var(--madui-accent)] text-white font-bold rounded-xl hover:bg-[var(--madui-accent-light)] transition-colors shadow-lg text-lg">
              Registrar Mi Negocio →
            </Link>
            <Link href="/emprendedores" className="inline-flex px-8 py-3.5 bg-white/15 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors backdrop-blur-sm text-lg border border-white/20">
              Conocer más
            </Link>
          </div>
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
                {[{ label: "Directorio", href: "/directorio" }, { label: "Promociones", href: "/promociones" }, { label: "Emprendedores", href: "/emprendedores" }].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[var(--madui-text)] mb-3 text-sm">Emprendedores</h4>
              <ul className="space-y-2">
                {[{ label: "Registrar Negocio", href: "/register" }, { label: "Iniciar Sesión", href: "/login" }, { label: "Plan Premium", href: "/emprendedores" }].map((link) => (
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
  );
}
