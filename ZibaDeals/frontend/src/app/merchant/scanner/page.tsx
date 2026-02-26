'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function MerchantScannerPage() {
    const [manualCode, setManualCode] = useState('')
    const [isScanning, setIsScanning] = useState(false)
    const [result, setResult] = useState<{
        success: boolean
        message: string
        coupon?: any
    } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const supabase = createClient()

    const handleManualRedeem = async () => {
        if (!manualCode.trim()) return

        setIsLoading(true)
        setResult(null)

        try {
            // Find coupon by QR token or OTP code
            const { data: coupon, error: fetchError } = await supabase
                .from('coupons_purchased')
                .select(`
          *,
          offers (
            title,
            merchant_id,
            merchants (
              id,
              user_id,
              business_name
            )
          )
        `)
                .or(`qr_token.eq.${manualCode},otp_code.eq.${manualCode}`)
                .single()

            if (fetchError || !coupon) {
                setResult({
                    success: false,
                    message: 'Cupón no encontrado. Verifica el código e intenta de nuevo.',
                })
                return
            }

            // Verify merchant owns this offer
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || coupon.offers?.merchants?.user_id !== user.id) {
                setResult({
                    success: false,
                    message: 'Este cupón no pertenece a tu negocio.',
                })
                return
            }

            // Check coupon status
            if (coupon.status === 'REDEEMED') {
                setResult({
                    success: false,
                    message: 'Este cupón ya fue canjeado anteriormente.',
                    coupon,
                })
                return
            }

            if (coupon.status === 'EXPIRED') {
                setResult({
                    success: false,
                    message: 'Este cupón ha expirado.',
                    coupon,
                })
                return
            }

            if (coupon.status !== 'ACTIVE' && coupon.status !== 'PURCHASED') {
                setResult({
                    success: false,
                    message: `Este cupón tiene estado: ${coupon.status}`,
                    coupon,
                })
                return
            }

            // Redeem the coupon
            const { error: updateError } = await supabase
                .from('coupons_purchased')
                .update({
                    status: 'REDEEMED',
                    redeemed_at: new Date().toISOString(),
                })
                .eq('id', coupon.id)

            if (updateError) throw updateError

            setResult({
                success: true,
                message: '¡Cupón canjeado exitosamente!',
                coupon,
            })

            setManualCode('')
        } catch (err: any) {
            setResult({
                success: false,
                message: err.message || 'Error al procesar el cupón',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">Z</span>
                            </div>
                            <span className="text-white font-bold text-xl">ZibaDeals</span>
                        </Link>
                        <span className="hidden md:block px-3 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full">
                            Escanear QR
                        </span>
                    </div>

                    <Link href="/merchant/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
                        ← Volver al Dashboard
                    </Link>
                </div>
            </header>

            <main className="pt-24 pb-12 px-6">
                <div className="max-w-xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Canjear Cupón</h1>
                        <p className="text-slate-400">Escanea el código QR o ingresa el código manualmente</p>
                    </div>

                    {/* Result Banner */}
                    {result && (
                        <div className={`mb-8 p-6 rounded-2xl border ${result.success
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                            }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.success ? 'bg-green-500/20' : 'bg-red-500/20'
                                    }`}>
                                    <span className="text-2xl">{result.success ? '✓' : '✗'}</span>
                                </div>
                                <div>
                                    <h3 className={`font-bold ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                                        {result.success ? '¡Éxito!' : 'Error'}
                                    </h3>
                                    <p className={result.success ? 'text-green-200' : 'text-red-200'}>
                                        {result.message}
                                    </p>
                                    {result.coupon && (
                                        <p className="text-slate-400 text-sm mt-1">
                                            {result.coupon.offers?.title}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {result.success && (
                                <button
                                    onClick={() => setResult(null)}
                                    className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors"
                                >
                                    Escanear Otro Cupón
                                </button>
                            )}
                        </div>
                    )}

                    {/* Scanner Card */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                        {/* Camera Preview (placeholder for now) */}
                        <div className="aspect-square bg-slate-900 relative flex items-center justify-center">
                            {isScanning ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                        autoPlay
                                        playsInline
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-64 h-64 border-2 border-purple-500 rounded-2xl">
                                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-xl" />
                                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-xl" />
                                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-xl" />
                                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-xl" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2">Escáner de Código QR</h3>
                                    <p className="text-slate-400 text-sm mb-6">
                                        Presiona el botón para activar la cámara y escanear el código QR del cliente
                                    </p>
                                    <button
                                        onClick={() => setIsScanning(true)}
                                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors"
                                    >
                                        Activar Cámara
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Manual Input */}
                        <div className="p-6 border-t border-white/5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-slate-500 text-sm">o ingresa el código</span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                    placeholder="Código de 6 dígitos"
                                    maxLength={10}
                                    className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-center font-mono text-lg tracking-widest placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                                <button
                                    onClick={handleManualRedeem}
                                    disabled={isLoading || !manualCode.trim()}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? '...' : 'Canjear'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-8 p-6 bg-slate-800/30 rounded-2xl border border-white/5">
                        <h3 className="text-white font-semibold mb-4">Instrucciones</h3>
                        <ol className="space-y-3 text-slate-400 text-sm">
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                <span>Pide al cliente que muestre su cupón desde la app</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                <span>Escanea el código QR o ingresa el código de 6 dígitos</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                <span>Confirma que el cupón fue canjeado exitosamente</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                                <span>Entrega el producto o servicio al cliente</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </main>
        </div>
    )
}
