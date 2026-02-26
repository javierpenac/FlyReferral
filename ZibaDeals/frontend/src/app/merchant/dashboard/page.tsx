import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MerchantDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ welcome?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirect=/merchant/dashboard')
    }

    const { data: merchant } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!merchant) {
        redirect('/merchant/register')
    }

    const { data: offers } = await supabase
        .from('offers')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })

    const { data: transactions } = await supabase
        .from('transactions')
        .select('total_amount, merchant_payout, status')
        .eq('merchant_id', merchant.id)

    const stats = {
        totalOffers: offers?.length || 0,
        activeOffers: offers?.filter(o => o.status === 'active').length || 0,
        totalSales: transactions?.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.total_amount, 0) || 0,
        pendingPayout: transactions?.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.merchant_payout, 0) || 0,
    }

    const isWelcome = params.welcome === 'true'

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">Z</span>
                                </div>
                                <span className="text-2xl font-bold text-emerald-600">ZibaDeals</span>
                            </Link>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                Centro de Comerciantes
                            </span>
                        </div>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/merchant/dashboard" className="text-emerald-600 font-medium text-sm">
                                Dashboard
                            </Link>
                            <Link href="/merchant/offers" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                                Mis Ofertas
                            </Link>
                            <Link href="/merchant/scanner" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                                Escanear QR
                            </Link>
                        </nav>

                        <div className="flex items-center gap-3">
                            <span className="text-gray-700 text-sm font-medium hidden sm:block">{merchant.business_name}</span>
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-600 font-semibold text-sm">
                                    {merchant.business_name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Banner */}
                {isWelcome && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4">
                        <span className="text-2xl">🎉</span>
                        <div>
                            <h2 className="text-emerald-800 font-semibold">¡Bienvenido a ZibaDeals!</h2>
                            <p className="text-emerald-600 text-sm">Tu cuenta está en revisión. Te notificaremos cuando esté aprobada.</p>
                        </div>
                    </div>
                )}

                {/* KYC Status */}
                {merchant.kyc_status === 'pending' && !isWelcome && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p className="text-yellow-700 text-sm">
                            ⏳ Tu cuenta está en proceso de verificación. Esto puede tomar 24-48 horas.
                        </p>
                    </div>
                )}

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
                    <p className="text-gray-500">Administra tus ofertas y revisa tus ventas</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <p className="text-3xl font-bold text-gray-900">{stats.totalOffers}</p>
                        <p className="text-gray-500 text-sm">Total Ofertas</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <p className="text-3xl font-bold text-emerald-600">{stats.activeOffers}</p>
                        <p className="text-gray-500 text-sm">Ofertas Activas</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <p className="text-3xl font-bold text-gray-900">${stats.totalSales.toLocaleString()}</p>
                        <p className="text-gray-500 text-sm">Ventas Totales</p>
                    </div>
                    <div className="bg-emerald-600 rounded-xl p-6">
                        <p className="text-3xl font-bold text-white">${stats.pendingPayout.toLocaleString()}</p>
                        <p className="text-emerald-100 text-sm">Por Recibir</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <Link
                        href="/merchant/offers/new"
                        className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Crear Nueva Oferta</h3>
                            <p className="text-gray-500 text-sm">Publica un cupón exclusivo</p>
                        </div>
                    </Link>

                    <Link
                        href="/merchant/scanner"
                        className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Escanear QR</h3>
                            <p className="text-gray-500 text-sm">Canjear cupón de cliente</p>
                        </div>
                    </Link>
                </div>

                {/* Offers Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Mis Ofertas</h2>
                        <Link href="/merchant/offers" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                            Ver todas →
                        </Link>
                    </div>

                    {offers && offers.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {offers.slice(0, 6).map((offer: any) => (
                                <div key={offer.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                                        {offer.image_url ? (
                                            <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-5xl">🎫</span>
                                        )}
                                        <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${offer.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                                                offer.status === 'paused' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {offer.status === 'active' ? 'Activo' :
                                                offer.status === 'paused' ? 'Pausado' :
                                                    offer.status === 'pending_approval' ? 'En Revisión' : offer.status}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{offer.title}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-emerald-600 font-bold">${offer.offer_price} MXN</span>
                                            <span className="text-gray-400 text-sm">{offer.stock_sold || 0}/{offer.stock_limit || '∞'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Crea tu primera oferta</h3>
                            <p className="text-gray-500 text-sm mb-4">Empieza a atraer clientes con cupones exclusivos</p>
                            <Link
                                href="/merchant/offers/new"
                                className="inline-block px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                Crear Oferta
                            </Link>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
