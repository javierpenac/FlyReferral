'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PLANS: Record<string, { label: string; price: number; duration: number }> = {
    '3': { label: '3 Meses', price: 299, duration: 3 },
    '6': { label: '6 Meses', price: 499, duration: 6 },
    '12': { label: '12 Meses', price: 899, duration: 12 },
}

export default function CheckoutPage() {
    const searchParams = useSearchParams()
    const planParam = searchParams.get('plan') || '6'
    const plan = PLANS[planParam] || PLANS['6']
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCheckout = async () => {
        setLoading(true)
        setError(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError('Sesión expirada. Inicia sesión de nuevo.')
                return
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ plan_duration: parseInt(planParam) }),
                }
            )

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                setError(data.error || 'Error al crear sesión de pago.')
            }
        } catch {
            setError('Error de conexión. Inténtalo de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--madui-accent-lighter)] flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">⭐</span>
                </div>
                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)] mb-2">
                    Confirmar Plan Premium
                </h1>
                <p className="text-[var(--madui-text-secondary)] mb-6">
                    Estás a punto de adquirir
                </p>

                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                    <p className="text-sm font-medium text-[var(--madui-text-secondary)] mb-1">{plan.label}</p>
                    <p className="text-4xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                        ${plan.price} <span className="text-base font-normal text-[var(--madui-text-muted)]">MXN</span>
                    </p>
                    <p className="text-xs text-[var(--madui-text-muted)] mt-1">Pago único</p>
                </div>

                <ul className="text-sm text-left text-[var(--madui-text-secondary)] space-y-2 mb-6">
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Posición destacada en directorio</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Galería de fotos + botón WhatsApp</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Hasta 4 ofertas mensuales</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Métricas y analytics</li>
                    <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Responder reseñas</li>
                </ul>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-3 bg-[var(--madui-accent)] text-[var(--madui-primary-dark)] font-semibold rounded-xl hover:bg-[var(--madui-accent-light)] transition-colors disabled:opacity-50 shadow-sm text-sm"
                >
                    {loading ? 'Redirigiendo a Stripe...' : `Pagar $${plan.price} MXN`}
                </button>

                <Link
                    href="/dashboard/plan"
                    className="block mt-3 text-sm text-[var(--madui-text-muted)] hover:text-[var(--madui-text-secondary)] transition-colors"
                >
                    ← Volver a planes
                </Link>

                <p className="text-xs text-[var(--madui-text-muted)] mt-4">
                    🔒 Pago seguro procesado por Stripe
                </p>
            </div>
        </div>
    )
}
