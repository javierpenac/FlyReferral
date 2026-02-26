import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface Props {
    params: Promise<{ id: string }>
}

// Dynamic SEO metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('business_name, bio, categories(name)')
        .eq('id', id)
        .eq('verification_status', 'aprobado')
        .single()

    if (!profile) return { title: 'Emprendedor no encontrado' }

    const catName = (profile.categories as { name?: string } | null)?.name || ''

    return {
        title: profile.business_name || 'Emprendedor',
        description:
            profile.bio?.slice(0, 160) ||
            `Descubre ${profile.business_name} en Madui — ${catName} en Zibatá, Querétaro.`,
        openGraph: {
            title: `${profile.business_name} | Madui`,
            description:
                profile.bio?.slice(0, 160) ||
                `${catName} verificado en Zibatá`,
        },
    }
}

export default async function EntrepreneurProfilePage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch profile with category
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, categories(name, emoji)')
        .eq('id', id)
        .eq('verification_status', 'aprobado')
        .single()

    if (error || !profile) notFound()

    // Fetch reviews
    const { data: reviews } = await supabase
        .from('reviews')
        .select('*, reviewer:reviewer_id(full_name:raw_user_meta_data->>full_name)')
        .eq('profile_id', id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10)

    // Fetch premium features if applicable
    let premiumFeatures = null
    if (profile.plan_type === 'premium') {
        const { data } = await supabase
            .from('premium_features')
            .select('*')
            .eq('profile_id', id)
            .single()
        premiumFeatures = data
    }

    // Fetch active offers if premium
    let offers = null
    if (profile.plan_type === 'premium') {
        const { data } = await supabase
            .from('offers')
            .select('*')
            .eq('merchant_id', id)
            .gte('expiry_date', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(4)
        offers = data
    }

    // Average rating
    const avgRating =
        reviews && reviews.length > 0
            ? (
                reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(1)
            : null

    const cat = profile.categories as { name?: string; emoji?: string } | null

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
                        <Link
                            href="/directorio"
                            className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors"
                        >
                            ← Volver al Directorio
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl border border-[var(--madui-border)] overflow-hidden mb-6">
                    {/* Cover */}
                    <div className="h-40 bg-gradient-to-br from-[var(--madui-primary)] via-[var(--madui-primary-light)] to-[#4A9040] relative">
                        {profile.plan_type === 'premium' && (
                            <span className="absolute top-4 right-4 premium-badge text-sm">
                                ⭐ Premium
                            </span>
                        )}
                    </div>

                    <div className="px-6 pb-6 -mt-12">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gradient-to-br from-[var(--madui-primary-lighter)] to-gray-100 flex items-center justify-center shadow-md overflow-hidden mb-4">
                            {profile.profile_photo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profile.profile_photo_url}
                                    alt={profile.business_name || ''}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl">{cat?.emoji || '🏪'}</span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                                    {profile.business_name || profile.full_name || 'Emprendedor'}
                                </h1>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className="text-sm text-[var(--madui-text-secondary)]">
                                        {cat?.emoji} {cat?.name || 'Sin categoría'}
                                    </span>
                                    <span className="verified-badge">✓ Residente Zibatá</span>
                                    {profile.business_type && (
                                        <span className="text-sm text-[var(--madui-text-muted)] capitalize">
                                            {profile.business_type}
                                        </span>
                                    )}
                                </div>
                                {avgRating && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="text-[var(--madui-accent)]">★</span>
                                        <span className="text-sm font-semibold text-[var(--madui-text)]">
                                            {avgRating}
                                        </span>
                                        <span className="text-sm text-[var(--madui-text-muted)]">
                                            ({reviews?.length} reseña{reviews?.length !== 1 ? 's' : ''})
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex gap-3">
                                {profile.plan_type === 'premium' && profile.whatsapp_link && (
                                    <a
                                        href={profile.whatsapp_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Bio */}
                        {profile.bio && (
                            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-3 font-[family-name:var(--font-montserrat)]">
                                    Acerca del negocio
                                </h2>
                                <p className="text-[var(--madui-text-secondary)] whitespace-pre-line leading-relaxed">
                                    {profile.bio}
                                </p>
                            </div>
                        )}

                        {/* Gallery (Premium) */}
                        {premiumFeatures?.gallery_urls &&
                            (premiumFeatures.gallery_urls as string[]).length > 0 && (
                                <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                                    <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-3 font-[family-name:var(--font-montserrat)]">
                                        Galería
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {(premiumFeatures.gallery_urls as string[]).map(
                                            (url, i) => (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    key={i}
                                                    src={url}
                                                    alt={`Foto ${i + 1}`}
                                                    className="w-full aspect-square object-cover rounded-xl"
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Active Offers (Premium) */}
                        {offers && offers.length > 0 && (
                            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-3 font-[family-name:var(--font-montserrat)]">
                                    🏷️ Ofertas Activas
                                </h2>
                                <div className="space-y-3">
                                    {offers.map((offer) => (
                                        <div
                                            key={offer.id}
                                            className="p-4 bg-[var(--madui-accent-lighter)] rounded-xl border border-[var(--madui-accent)]/20"
                                        >
                                            <h3 className="font-semibold text-[var(--madui-text)]">
                                                {offer.title}
                                            </h3>
                                            <p className="text-sm text-[var(--madui-text-secondary)] mt-1">
                                                {offer.description}
                                            </p>
                                            <p className="text-xs text-[var(--madui-text-muted)] mt-2">
                                                Válido hasta{' '}
                                                {new Date(offer.expiry_date).toLocaleDateString('es-MX')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                            <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">
                                Reseñas de Vecinos
                            </h2>

                            {reviews && reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="pb-4 border-b border-[var(--madui-border-light)] last:border-0 last:pb-0"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex text-[var(--madui-accent)]">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <span key={s} className={s <= review.rating ? '' : 'opacity-20'}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-[var(--madui-text-muted)]">
                                                    {new Date(review.created_at).toLocaleDateString('es-MX')}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-[var(--madui-text-secondary)]">
                                                    {review.comment}
                                                </p>
                                            )}
                                            {review.entrepreneur_reply && (
                                                <div className="mt-2 ml-4 pl-3 border-l-2 border-[var(--madui-primary-lighter)]">
                                                    <p className="text-xs font-medium text-[var(--madui-primary)] mb-0.5">
                                                        Respuesta del emprendedor
                                                    </p>
                                                    <p className="text-sm text-[var(--madui-text-secondary)]">
                                                        {review.entrepreneur_reply}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--madui-text-muted)] text-center py-4">
                                    Aún no hay reseñas. ¡Sé el primero en dejar una!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                            <h3 className="text-sm font-semibold text-[var(--madui-text)] mb-3">
                                Contacto
                            </h3>
                            <div className="space-y-2 text-sm text-[var(--madui-text-secondary)]">
                                {profile.full_name && (
                                    <p>👤 {profile.full_name}</p>
                                )}
                                {profile.plan_type === 'premium' && profile.whatsapp_link && (
                                    <a
                                        href={profile.whatsapp_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                                    >
                                        💬 Enviar WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Business Hours (Premium) */}
                        {premiumFeatures?.business_hours &&
                            Object.keys(premiumFeatures.business_hours as Record<string, unknown>).length > 0 && (
                                <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                                    <h3 className="text-sm font-semibold text-[var(--madui-text)] mb-3">
                                        🕐 Horario
                                    </h3>
                                    <div className="space-y-1.5 text-sm">
                                        {Object.entries(premiumFeatures.business_hours as Record<string, string>).map(
                                            ([day, hours]) => (
                                                <div key={day} className="flex justify-between">
                                                    <span className="text-[var(--madui-text-secondary)] capitalize">
                                                        {day}
                                                    </span>
                                                    <span className="font-medium text-[var(--madui-text)]">
                                                        {hours}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* FAQ (Premium) */}
                        {premiumFeatures?.faq &&
                            (premiumFeatures.faq as Array<{ q: string; a: string }>).length > 0 && (
                                <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                                    <h3 className="text-sm font-semibold text-[var(--madui-text)] mb-3">
                                        ❓ Preguntas Frecuentes
                                    </h3>
                                    <div className="space-y-3">
                                        {(premiumFeatures.faq as Array<{ q: string; a: string }>).map(
                                            (item, i) => (
                                                <div key={i}>
                                                    <p className="text-sm font-medium text-[var(--madui-text)]">
                                                        {item.q}
                                                    </p>
                                                    <p className="text-sm text-[var(--madui-text-secondary)] mt-0.5">
                                                        {item.a}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </main>
        </div>
    )
}
