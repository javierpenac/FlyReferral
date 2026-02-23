'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            if (error.message === 'Invalid login credentials') {
                setError('Credenciales incorrectas. Verifica tu email y contraseña.')
            } else {
                setError(error.message)
            }
            setIsLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Ingresa tu email primero para recuperar tu contraseña.')
            return
        }
        setIsLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        if (error) {
            setError(error.message)
        } else {
            setError(null)
            alert('Se envió un enlace de recuperación a tu email.')
        }
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-[var(--madui-bg)] flex flex-col">
            <header className="bg-white border-b border-[var(--madui-border)] py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <Logo size="md" linkTo="/" />
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-[var(--madui-shadow-md)] border border-[var(--madui-border)] p-8">
                        <h1 className="text-2xl font-bold text-[var(--madui-text)] text-center mb-2 font-[family-name:var(--font-montserrat)]">
                            Bienvenido a zibata.services
                        </h1>
                        <p className="text-[var(--madui-text-secondary)] text-center mb-8 text-sm">
                            Accede a tu dashboard de emprendedor
                        </p>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-[var(--madui-error)] text-sm text-center">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">Correo electrónico</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm" placeholder="tu@email.com" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-medium text-[var(--madui-text)]">Contraseña</label>
                                    <button type="button" onClick={handleForgotPassword} className="text-xs text-[var(--madui-primary)] hover:text-[var(--madui-primary-light)] font-medium">
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm" placeholder="Tu contraseña" />
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full py-3 bg-[var(--madui-primary)] text-white font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors disabled:opacity-50 shadow-sm">
                                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-[var(--madui-text-secondary)] mt-6 text-sm">
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" className="text-[var(--madui-primary)] hover:text-[var(--madui-primary-light)] font-semibold">
                            Registra tu negocio
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    )
}
