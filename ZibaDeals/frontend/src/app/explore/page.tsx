import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ExplorePage() {
    const supabase = await createClient()

    // Fetch active offers with merchant info
    const { data: offers } = await supabase
        .from('offers')
        .select(`
      *,
      merchants (
        business_name,
        logo_url,
        category,
        address
      )
    `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    const categories = ['Todos', 'Restaurantes', 'Spa & Belleza', 'Entretenimiento', 'Tiendas', 'Servicios', 'Salud', 'Viajes']

    // Demo deals for when DB is empty
    const demoDeals = [
        { id: 1, title: "2x1 en Pastas Italianas", merchant: "La Trattoria Zibatá", category: "Restaurantes", original: 450, price: 225, discount: 50, rating: 4.5, reviews: 128, image: "🍝" },
        { id: 2, title: "Masaje Relajante 60 min + Aromaterapia", merchant: "Spa Serenidad", category: "Spa & Belleza", original: 890, price: 445, discount: 50, rating: 4.8, reviews: 89, image: "💆" },
        { id: 3, title: "2 Horas de Boliche + Bebidas", merchant: "Strike Zone", category: "Entretenimiento", original: 350, price: 175, discount: 50, rating: 4.2, reviews: 64, image: "🎳" },
        { id: 4, title: "Corte + Peinado + Tratamiento", merchant: "Salón Elegance", category: "Belleza", original: 650, price: 325, discount: 50, rating: 4.6, reviews: 156, image: "💇" },
        { id: 5, title: "Pizza Grande + Complemento", merchant: "Pizza Artesanal", category: "Restaurantes", original: 320, price: 192, discount: 40, rating: 4.4, reviews: 203, image: "🍕" },
        { id: 6, title: "Clase de Yoga + Smoothie", merchant: "Zen Studio", category: "Salud", original: 280, price: 140, discount: 50, rating: 4.7, reviews: 76, image: "🧘" },
        { id: 7, title: "Limpieza Dental Profunda", merchant: "Dental Care", category: "Salud", original: 1200, price: 600, discount: 50, rating: 4.9, reviews: 234, image: "🦷" },
        { id: 8, title: "Manicure + Pedicure Gel", merchant: "Nails Studio", category: "Belleza", original: 550, price: 330, discount: 40, rating: 4.5, reviews: 189, image: "💅" },
    ]

    const displayDeals = offers && offers.length > 0 ? offers : demoDeals

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between py-3">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">Z</span>
                            </div>
                            <span className="text-2xl font-bold text-emerald-600">ZibaDeals</span>
                        </Link>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl mx-8">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar ofertas..."
                                    className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <button className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-gray-600 hover:text-emerald-600 text-sm font-medium">
                                Mis Cupones
                            </Link>
                            <Link href="/login" className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                                Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Todas las Ofertas</h1>
                        <p className="text-gray-500">{displayDeals.length} ofertas disponibles en Zibatá</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-emerald-500">
                            <option>Más populares</option>
                            <option>Precio: bajo a alto</option>
                            <option>Precio: alto a bajo</option>
                            <option>Mayor descuento</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-64 flex-shrink-0 hidden lg:block">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-semibold text-gray-900 mb-4">Categorías</h3>
                            <ul className="space-y-2">
                                {categories.map((cat) => (
                                    <li key={cat}>
                                        <button className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${cat === 'Todos'
                                            ? 'bg-emerald-50 text-emerald-600 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}>
                                            {cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <hr className="my-6 border-gray-100" />

                            <h3 className="font-semibold text-gray-900 mb-4">Precio</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                    Menos de $200
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                    $200 - $500
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                    $500 - $1000
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                    Más de $1000
                                </label>
                            </div>

                            <hr className="my-6 border-gray-100" />

                            <h3 className="font-semibold text-gray-900 mb-4">Descuento</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                    20% o más
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                    40% o más
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                    60% o más
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Deals Grid */}
                    <div className="flex-1">
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {displayDeals.map((deal: any, i: number) => (
                                <Link
                                    key={deal.id || i}
                                    href={`/offer/${deal.id}`}
                                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center">
                                        {deal.image_url ? (
                                            <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-6xl">{deal.image || '🎫'}</span>
                                        )}
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                            -{deal.discount_percentage || deal.discount}%
                                        </div>
                                        <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer">
                                            <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                {deal.merchants?.category || deal.category}
                                            </span>
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                            {deal.title}
                                        </h3>

                                        <p className="text-gray-500 text-sm mb-3">
                                            {deal.merchants?.business_name || deal.merchant}
                                        </p>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-3">
                                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-sm text-gray-600">{deal.rating || '4.5'} ({deal.reviews || '50'})</span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-gray-400 text-sm line-through">
                                                ${deal.original_price || deal.original}
                                            </span>
                                            <span className="text-emerald-600 font-bold text-lg">
                                                ${deal.offer_price || deal.price}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Load More */}
                        <div className="text-center mt-8">
                            <button className="px-8 py-3 border border-emerald-600 text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-colors">
                                Cargar más ofertas
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
