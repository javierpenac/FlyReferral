'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewOfferPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [merchantId, setMerchantId] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        originalPrice: '',
        offerPrice: '',
        stockLimit: '',
        validFrom: '',
        validUntil: '',
        termsConditions: '',
    })

    useEffect(() => {
        // Get merchant ID
        const getMerchant = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: merchant } = await supabase
                .from('merchants')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (merchant) {
                setMerchantId(merchant.id)
            } else {
                router.push('/merchant/register')
            }
        }
        getMerchant()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const discountPercentage = formData.originalPrice && formData.offerPrice
        ? Math.round((1 - parseFloat(formData.offerPrice) / parseFloat(formData.originalPrice)) * 100)
        : 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!merchantId) return

        setIsLoading(true)
        setError(null)

        try {
            const { error: insertError } = await supabase
                .from('offers')
                .insert({
                    merchant_id: merchantId,
                    title: formData.title,
                    description: formData.description,
                    original_price: parseFloat(formData.originalPrice),
                    offer_price: parseFloat(formData.offerPrice),
                    discount_percentage: discountPercentage,
                    stock_limit: formData.stockLimit ? parseInt(formData.stockLimit) : null,
                    stock_sold: 0,
                    valid_from: formData.validFrom,
                    valid_until: formData.validUntil,
                    terms_conditions: formData.termsConditions,
                    status: 'pending_approval',
                })

            if (insertError) throw insertError

            router.push('/merchant/dashboard?created=true')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 py-12 px-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/merchant/dashboard" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
                            ← Volver al Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Nueva Oferta</h1>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Título de la Oferta *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="Ej: 2x1 en Pizzas los Martes"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Descripción *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                placeholder="Describe qué incluye la oferta..."
                            />
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Precio Original *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                                        placeholder="450.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Precio con Descuento *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input
                                        type="number"
                                        name="offerPrice"
                                        value={formData.offerPrice}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                                        placeholder="315.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Discount Badge */}
                        {discountPercentage > 0 && (
                            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <div className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                                    -{discountPercentage}%
                                </div>
                                <span className="text-green-300">Descuento que verán los clientes</span>
                            </div>
                        )}

                        {/* Stock */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">
                                Límite de Stock <span className="text-slate-500">(opcional)</span>
                            </label>
                            <input
                                type="number"
                                name="stockLimit"
                                value={formData.stockLimit}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="Dejar vacío para ilimitado"
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Válido Desde *</label>
                                <input
                                    type="date"
                                    name="validFrom"
                                    value={formData.validFrom}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Válido Hasta *</label>
                                <input
                                    type="date"
                                    name="validUntil"
                                    value={formData.validUntil}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Terms */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">
                                Términos y Condiciones <span className="text-slate-500">(opcional)</span>
                            </label>
                            <textarea
                                name="termsConditions"
                                value={formData.termsConditions}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                                placeholder="Ej: Válido solo para consumo en restaurante. No acumulable con otras promociones."
                            />
                        </div>

                        {/* Info Box */}
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                            <p className="text-purple-300 text-sm">
                                💡 Tu oferta será revisada antes de publicarse. La revisión toma menos de 24 horas.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creando...' : 'Publicar Oferta'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
