'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MerchantRegisterPage() {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        businessName: '',
        legalName: '',
        category: '',
        email: '',
        phone: '',
        address: '',
        rfc: '',
        clabe: '',
        description: '',
    })

    const categories = [
        'Restaurantes',
        'Spa & Belleza',
        'Entretenimiento',
        'Tiendas',
        'Servicios',
        'Salud',
        'Educación',
        'Otro'
    ]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login?redirect=/merchant/register')
                return
            }

            const { error: insertError } = await supabase
                .from('merchants')
                .insert({
                    user_id: user.id,
                    business_name: formData.businessName,
                    legal_name: formData.legalName,
                    category: formData.category,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    rfc: formData.rfc,
                    clabe_account: formData.clabe,
                    description: formData.description,
                    kyc_status: 'pending',
                    is_active: false,
                })

            if (insertError) throw insertError

            await supabase
                .from('profiles')
                .update({ is_merchant: true })
                .eq('id', user.id)

            router.push('/merchant/dashboard?welcome=true')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <Link href="/" className="flex items-center gap-2 w-fit">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Z</span>
                        </div>
                        <span className="text-2xl font-bold text-emerald-600">ZibaDeals</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-12">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Registra tu Negocio</h1>
                    <p className="text-gray-500">Únete a ZibaDeals y atrae más clientes con ofertas exclusivas</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[
                        { num: 1, label: 'Negocio' },
                        { num: 2, label: 'Fiscal' },
                        { num: 3, label: 'Bancario' },
                    ].map((s, i) => (
                        <div key={s.num} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= s.num
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {step > s.num ? '✓' : s.num}
                                </div>
                                <span className={`text-xs mt-1 ${step >= s.num ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < 2 && <div className={`w-16 h-1 mx-2 rounded ${step > s.num ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Business Info */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Información del Negocio</h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial *</label>
                                    <input
                                        type="text"
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Ej: La Trattoria Zibatá"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                        placeholder="Describe brevemente tu negocio..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="contacto@negocio.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            placeholder="442 123 4567"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Av. Principal #123, Zibatá"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Legal Info */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Información Fiscal</h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
                                    <input
                                        type="text"
                                        name="legalName"
                                        value={formData.legalName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Ej: Restaurante La Trattoria S.A. de C.V."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RFC *</label>
                                    <input
                                        type="text"
                                        name="rfc"
                                        value={formData.rfc}
                                        onChange={handleChange}
                                        required
                                        maxLength={13}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 uppercase"
                                        placeholder="XAXX010101000"
                                    />
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-blue-700 text-sm">
                                        💡 Tu RFC se utilizará exclusivamente para fines fiscales de facturación.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Bank Info */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Información Bancaria</h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CLABE Interbancaria *</label>
                                    <input
                                        type="text"
                                        name="clabe"
                                        value={formData.clabe}
                                        onChange={handleChange}
                                        required
                                        maxLength={18}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                                        placeholder="000000000000000000"
                                    />
                                    <p className="text-gray-500 text-xs mt-1">18 dígitos. Aquí recibirás tus pagos.</p>
                                </div>

                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <p className="text-emerald-700 text-sm font-medium mb-2">Comisiones ZibaDeals</p>
                                    <ul className="text-emerald-600 text-sm space-y-1">
                                        <li>✓ Sin cuota mensual fija</li>
                                        <li>✓ 10% de comisión por venta realizada</li>
                                        <li>✓ Pagos semanales a tu cuenta</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 mt-8">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(s => s - 1)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Anterior
                                </button>
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(s => s + 1)}
                                    className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Siguiente
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Registrando...' : 'Completar Registro'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Login Link */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    ¿Ya tienes una cuenta de comercio?{' '}
                    <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Iniciar sesión
                    </Link>
                </p>
            </main>
        </div>
    )
}
