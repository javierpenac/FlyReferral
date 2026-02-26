import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface SearchParams {
    q?: string
    categoria?: string
    tipo?: string
}

export default async function DirectorioPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const supabase = await createClient()

    // Fetch categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

    // Build entrepreneur query
    let query = supabase
        .from('profiles')
        .select('*, categories(name, emoji, slug)')
        .eq('verification_status', 'aprobado')
        .order('plan_type', { ascending: false })
        .order('business_name')

    // Apply filters
    if (params.q) {
        query = query.or(
            `business_name.ilike.%${params.q}%,bio.ilike.%${params.q}%,full_name.ilike.%${params.q}%`
        )
    }

    if (params.tipo) {
        query = query.eq('business_type', params.tipo)
    }

    if (params.categoria) {
        const cat = categories?.find((c) => c.slug === params.categoria)
        if (cat) {
            query = query.eq('category_id', cat.id)
        }
    }

    const { data: entrepreneurs } = await query

    const activeFilters =
        (params.q ? 1 : 0) + (params.tipo ? 1 : 0) + (params.categoria ? 1 : 0)

    return (
        <div className="min-h-screen bg-[var(--madui-bg)]">
            {/* Header */}
            <header className="bg-white border-b border-[var(--madui-border)] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[var(--madui-primary)] flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            <span className="text-xl font-bold text-[var(--madui-primary)] font-[family-name:var(--font-montserrat)]">
                                Madui
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                href="/directorio"
                                className="text-sm font-semibold text-[var(--madui-primary)]"
                            >
                                Directorio
                            </Link>
                            <Link
                                href="/#categorias"
                                className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors"
                            >
                                Categorías
                            </Link>
                        </nav>

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

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Bar + Title */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                        Directorio de Emprendedores
                    </h1>

                    <form className="flex gap-3 mb-4">
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
                                defaultValue={params.q}
                                placeholder="Busca por nombre, categoría o descripción..."
                                className="w-full pl-12 pr-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm bg-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-[var(--madui-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors shadow-sm"
                        >
                            Buscar
                        </button>
                    </form>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Type filter */}
                        <div className="flex gap-2">
                            <Link
                                href={`/directorio?${new URLSearchParams({
                                    ...(params.q ? { q: params.q } : {}),
                                    ...(params.categoria ? { categoria: params.categoria } : {}),
                                }).toString()}`}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!params.tipo
                                        ? 'bg-[var(--madui-primary)] text-white border-[var(--madui-primary)]'
                                        : 'bg-white text-[var(--madui-text-secondary)] border-[var(--madui-border)] hover:border-gray-400'
                                    }`}
                            >
                                Todos
                            </Link>
                            <Link
                                href={`/directorio?${new URLSearchParams({
                                    ...(params.q ? { q: params.q } : {}),
                                    ...(params.categoria ? { categoria: params.categoria } : {}),
                                    tipo: 'producto',
                                }).toString()}`}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.tipo === 'producto'
                                        ? 'bg-[var(--madui-primary)] text-white border-[var(--madui-primary)]'
                                        : 'bg-white text-[var(--madui-text-secondary)] border-[var(--madui-border)] hover:border-gray-400'
                                    }`}
                            >
                                📦 Productos
                            </Link>
                            <Link
                                href={`/directorio?${new URLSearchParams({
                                    ...(params.q ? { q: params.q } : {}),
                                    ...(params.categoria ? { categoria: params.categoria } : {}),
                                    tipo: 'servicio',
                                }).toString()}`}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.tipo === 'servicio'
                                        ? 'bg-[var(--madui-primary)] text-white border-[var(--madui-primary)]'
                                        : 'bg-white text-[var(--madui-text-secondary)] border-[var(--madui-border)] hover:border-gray-400'
                                    }`}
                            >
                                🛎️ Servicios
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-6 bg-[var(--madui-border)]" />

                        {/* Category pills */}
                        <div className="flex flex-wrap gap-2">
                            {(categories || []).slice(0, 8).map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/directorio?${new URLSearchParams({
                                        ...(params.q ? { q: params.q } : {}),
                                        ...(params.tipo ? { tipo: params.tipo } : {}),
                                        ...(params.categoria === cat.slug
                                            ? {}
                                            : { categoria: cat.slug }),
                                    }).toString()}`}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.categoria === cat.slug
                                            ? 'bg-[var(--madui-primary)] text-white border-[var(--madui-primary)]'
                                            : 'bg-white text-[var(--madui-text-secondary)] border-[var(--madui-border)] hover:border-gray-400'
                                        }`}
                                >
                                    {cat.emoji} {cat.name}
                                </Link>
                            ))}
                        </div>

                        {/* Clear filters */}
                        {activeFilters > 0 && (
                            <Link
                                href="/directorio"
                                className="text-xs text-[var(--madui-error)] hover:underline ml-2"
                            >
                                Limpiar filtros ({activeFilters})
                            </Link>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-[var(--madui-text-secondary)]">
                        {entrepreneurs?.length || 0} emprendedor
                        {(entrepreneurs?.length || 0) !== 1 ? 'es' : ''} encontrado
                        {(entrepreneurs?.length || 0) !== 1 ? 's' : ''}
                    </p>
                </div>

                {entrepreneurs && entrepreneurs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {entrepreneurs.map((profile) => (
                            <Link
                                key={profile.id}
                                href={`/directorio/${profile.id}`}
                                className="bento-card group"
                            >
                                <div className="aspect-[4/3] bg-gradient-to-br from-[var(--madui-primary-lighter)] to-gray-100 flex items-center justify-center relative">
                                    {profile.profile_photo_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={profile.profile_photo_url}
                                            alt={profile.business_name || ''}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-5xl">
                                            {(profile.categories as { emoji?: string } | null)
                                                ?.emoji || '🏪'}
                                        </span>
                                    )}
                                    {profile.plan_type === 'premium' && (
                                        <span className="absolute top-3 right-3 premium-badge">
                                            ⭐ Premium
                                        </span>
                                    )}
                                </div>

                                <div className="p-4">
                                    <p className="text-xs text-[var(--madui-text-muted)] mb-1">
                                        {(profile.categories as { emoji?: string; name?: string } | null)?.emoji}{' '}
                                        {(profile.categories as { name?: string } | null)?.name || 'Sin categoría'}
                                    </p>
                                    <h3 className="font-semibold text-[var(--madui-text)] group-hover:text-[var(--madui-primary)] transition-colors line-clamp-1">
                                        {profile.business_name || profile.full_name || 'Emprendedor'}
                                    </h3>
                                    {profile.bio && (
                                        <p className="text-sm text-[var(--madui-text-secondary)] mt-1 line-clamp-2">
                                            {profile.bio}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="verified-badge">✓ Verificado</span>
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
                    <div className="text-center py-16 bg-white rounded-2xl border border-[var(--madui-border)]">
                        <span className="text-5xl block mb-4">🔍</span>
                        <h3 className="text-lg font-semibold text-[var(--madui-text)] mb-2">
                            No se encontraron resultados
                        </h3>
                        <p className="text-[var(--madui-text-secondary)] mb-6 max-w-md mx-auto">
                            {params.q
                                ? `No hay emprendedores que coincidan con "${params.q}".`
                                : 'Aún no hay emprendedores aprobados en esta categoría.'}
                        </p>
                        <Link
                            href="/directorio"
                            className="inline-flex px-6 py-3 bg-[var(--madui-primary)] text-white font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors shadow-sm"
                        >
                            Ver todos
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
