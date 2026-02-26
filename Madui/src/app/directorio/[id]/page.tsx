import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/ui/Logo'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

const categoryImages: Record<string, string> = {
    'comida-bebidas': '/categories/comida-bebidas.png',
    'belleza-bienestar': '/categories/belleza-bienestar.png',
    'salud': '/categories/salud.png',
    'educacion': '/categories/educacion.png',
    'tecnologia': '/categories/tecnologia.png',
    'hogar-jardin': '/categories/hogar-jardin.png',
    'moda-accesorios': '/categories/moda-accesorios.png',
    'deportes-fitness': '/categories/deportes-fitness.png',
    'mascotas': '/categories/mascotas.png',
    'arte-cultura': '/categories/arte-cultura.png',
    'servicios-profesionales': '/categories/servicios-profesionales.png',
    'otro': '/categories/otro.png',
}

interface Props {
    params: Promise<{ id: string }>
}

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
        description: profile.bio?.slice(0, 160) || `Descubre ${profile.business_name} en zibata.services — ${catName} en Zibatá, Querétaro.`,
        openGraph: {
            title: `${profile.business_name} | zibata.services`,
            description: profile.bio?.slice(0, 160) || `${catName} verificado en Zibatá`,
        },
    }
}

export default async function EntrepreneurProfilePage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, categories(name, emoji, slug)')
        .eq('id', id)
        .eq('verification_status', 'aprobado')
        .single()

    if (error || !profile) notFound()

    const { data: reviews } = await supabase
        .from('reviews')
        .select('id, rating, comment, is_approved, entrepreneur_reply, replied_at, created_at, updated_at, reviewer_id, profile_id')
        .eq('profile_id', id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10)

    // Fetch reviewer names from profiles since reviewer_id FK goes to auth.users (not accessible from client)
    let reviewsWithNames = null
    if (reviews && reviews.length > 0) {
        const reviewerIds = [...new Set(reviews.map(r => r.reviewer_id))]
        const { data: reviewerProfiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', reviewerIds)

        const reviewerMap = new Map(reviewerProfiles?.map(p => [p.id, p.full_name]) || [])
        reviewsWithNames = reviews.map(r => ({
            ...r,
            reviewer: { full_name: reviewerMap.get(r.reviewer_id) || 'Vecino de Zibatá' }
        }))
    }

    let premiumFeatures = null
    if (profile.plan_type === 'premium') {
        const { data } = await supabase.from('premium_features').select('*').eq('profile_id', id).single()
        premiumFeatures = data
    }

    let offers = null
    if (profile.plan_type === 'premium') {
        const { data } = await supabase.from('offers').select('*').eq('merchant_id', id).gte('expiry_date', new Date().toISOString()).order('created_at', { ascending: false }).limit(4)
        offers = data
    }

    const avgRating = reviewsWithNames && reviewsWithNames.length > 0 ? (reviewsWithNames.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsWithNames.length).toFixed(1) : null
    const cat = profile.categories as { name?: string; emoji?: string } | null

    return (
        <div className="min-h-screen bg-[var(--madui-bg)]">
            <header className="bg-white border-b border-[var(--madui-border)] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Logo size="md" linkTo="/" />
                        <Link href="/directorio" className="text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)] transition-colors">← Volver al Directorio</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl border border-[var(--madui-border)] overflow-hidden mb-6">
                    <div className="h-40 bg-gradient-to-br from-[var(--madui-primary-dark)] via-[var(--madui-primary)] to-[var(--madui-primary-light)] relative">
                        {profile.plan_type === 'premium' && <span className="absolute top-4 right-4 premium-badge text-sm">⭐ Premium</span>}
                    </div>
                    <div className="px-6 pb-6 -mt-12">
                        <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gradient-to-br from-[var(--madui-primary-lighter)] to-gray-100 flex items-center justify-center shadow-md overflow-hidden mb-4 relative">
                            {profile.profile_photo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profile.profile_photo_url} alt={profile.business_name || ''} className="w-full h-full object-cover" />
                            ) : (
                                <Image
                                    src={categoryImages[(cat as { slug?: string } | null)?.slug || 'otro'] || '/categories/otro.png'}
                                    alt={cat?.name || 'Negocio'}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            )}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">{profile.business_name || profile.full_name || 'Emprendedor'}</h1>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className="text-sm text-[var(--madui-text-secondary)]">{cat?.emoji} {cat?.name || 'Sin categoría'}</span>
                                    <span className="verified-badge">✓ Residente Zibatá</span>
                                    {profile.business_type && <span className="text-sm text-[var(--madui-text-muted)] capitalize">{profile.business_type}</span>}
                                </div>
                                {avgRating && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="text-[var(--madui-accent)]">★</span>
                                        <span className="text-sm font-semibold text-[var(--madui-text)]">{avgRating}</span>
                                        <span className="text-sm text-[var(--madui-text-muted)]">({reviewsWithNames?.length || 0} reseña{(reviewsWithNames?.length || 0) !== 1 ? 's' : ''})</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                {profile.plan_type === 'premium' && profile.whatsapp_link && (
                                    <a href={profile.whatsapp_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-sm">
                                        💬 WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        {profile.bio && (
                            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-3 font-[family-name:var(--font-montserrat)]">Acerca del negocio</h2>
                                <p className="text-[var(--madui-text-secondary)] whitespace-pre-line leading-relaxed">{profile.bio}</p>
                            </div>
                        )}

                        {premiumFeatures?.gallery_urls && (premiumFeatures.gallery_urls as string[]).length > 0 && (
                            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-3 font-[family-name:var(--font-montserrat)]">Galería</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {(premiumFeatures.gallery_urls as string[]).map((url, i) => (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img key={i} src={url} alt={`Foto ${i + 1}`} className="w-full aspect-square object-cover rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {offers && offers.length > 0 && (
                            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-3 font-[family-name:var(--font-montserrat)]">🏷️ Ofertas Activas</h2>
                                <div className="space-y-3">
                                    {offers.map((offer) => (
                                        <div key={offer.id} className="p-4 bg-[var(--madui-accent-lighter)] rounded-xl border border-[var(--madui-accent)]/20">
                                            <h3 className="font-semibold text-[var(--madui-text)]">{offer.title}</h3>
                                            <p className="text-sm text-[var(--madui-text-secondary)] mt-1">{offer.description}</p>
                                            <p className="text-xs text-[var(--madui-text-muted)] mt-2">Válido hasta {new Date(offer.expiry_date).toLocaleDateString('es-MX')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                            <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4 font-[family-name:var(--font-montserrat)]">Reseñas de Vecinos</h2>
                            {reviewsWithNames && reviewsWithNames.length > 0 ? (
                                <div className="space-y-4">
                                    {reviewsWithNames.map((review: { id: string; rating: number; comment: string; reviewer: { full_name: string }; entrepreneur_reply?: string; replied_at?: string; created_at: string }) => (
                                        <div key={review.id} className="pb-4 border-b border-[var(--madui-border-light)] last:border-0 last:pb-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex text-[var(--madui-accent)]">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <span key={s} className={s <= review.rating ? '' : 'opacity-20'}>★</span>
                                                    ))}
                                                </div>
                                                <span className="text-sm font-medium text-[var(--madui-text)]">{review.reviewer?.full_name || 'Vecino de Zibatá'}</span>
                                                <span className="text-xs text-[var(--madui-text-muted)]">· {new Date(review.created_at).toLocaleDateString('es-MX')}</span>
                                            </div>
                                            {review.comment && <p className="text-sm text-[var(--madui-text-secondary)]">{review.comment}</p>}
                                            {review.entrepreneur_reply && (
                                                <div className="mt-2 ml-4 pl-3 border-l-2 border-[var(--madui-primary-lighter)]">
                                                    <p className="text-xs font-medium text-[var(--madui-primary)] mb-0.5">Respuesta del emprendedor</p>
                                                    <p className="text-sm text-[var(--madui-text-secondary)]">{review.entrepreneur_reply}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--madui-text-muted)] text-center py-4">Aún no hay reseñas. ¡Sé el primero en dejar una!</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                            <h3 className="text-sm font-semibold text-[var(--madui-text)] mb-3">Contacto</h3>
                            <div className="space-y-2 text-sm text-[var(--madui-text-secondary)]">
                                {profile.full_name && <p>👤 {profile.full_name}</p>}
                                {profile.plan_type === 'premium' && profile.whatsapp_link && (
                                    <a href={profile.whatsapp_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">💬 Enviar WhatsApp</a>
                                )}
                            </div>
                        </div>

                        {premiumFeatures?.business_hours && Object.keys(premiumFeatures.business_hours as Record<string, unknown>).length > 0 && (
                            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                                <h3 className="text-sm font-semibold text-[var(--madui-text)] mb-3">🕐 Horario</h3>
                                <div className="space-y-1.5 text-sm">
                                    {Object.entries(premiumFeatures.business_hours as Record<string, string>).map(([day, hours]) => (
                                        <div key={day} className="flex justify-between">
                                            <span className="text-[var(--madui-text-secondary)] capitalize">{day}</span>
                                            <span className="font-medium text-[var(--madui-text)]">{hours}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {premiumFeatures?.faq && (premiumFeatures.faq as Array<{ q: string; a: string }>).length > 0 && (
                            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6">
                                <h3 className="text-sm font-semibold text-[var(--madui-text)] mb-3">❓ Preguntas Frecuentes</h3>
                                <div className="space-y-3">
                                    {(premiumFeatures.faq as Array<{ q: string; a: string }>).map((item, i) => (
                                        <div key={i}>
                                            <p className="text-sm font-medium text-[var(--madui-text)]">{item.q}</p>
                                            <p className="text-sm text-[var(--madui-text-secondary)] mt-0.5">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
