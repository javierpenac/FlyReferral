'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
    id: number
    name: string
    emoji: string | null
}

interface Profile {
    id: string
    full_name: string | null
    business_name: string | null
    business_type: string | null
    category_id: number | null
    bio: string | null
    whatsapp_link: string | null
    plan_type: string
}

export default function PerfilPage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const loadData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const [profileRes, catsRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('categories').select('id, name, emoji').eq('is_active', true).order('sort_order'),
        ])

        if (profileRes.data) setProfile(profileRes.data as Profile)
        if (catsRes.data) setCategories(catsRes.data)
        setIsLoading(false)
    }, [supabase, router])

    useEffect(() => { loadData() }, [loadData])

    const handleSave = async () => {
        if (!profile) return
        setIsSaving(true)
        setMessage(null)

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: profile.full_name,
                business_name: profile.business_name,
                business_type: profile.business_type,
                category_id: profile.category_id,
                bio: profile.bio,
                whatsapp_link: profile.whatsapp_link,
            })
            .eq('id', profile.id)

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' })
            router.refresh()
        }
        setIsSaving(false)
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
            </div>
        )
    }

    if (!profile) return null

    const isPremium = profile.plan_type === 'premium'

    const updateField = <K extends keyof Profile>(key: K, value: Profile[K]) => {
        setProfile((prev) => prev ? { ...prev, [key]: value } : prev)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                    Mi Perfil
                </h1>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[var(--madui-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors disabled:opacity-50 shadow-sm"
                >
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {message && (
                <div className={`p-3 rounded-xl border text-sm ${message.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-[var(--madui-error)]'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Personal Info */}
            <div className="bg-white rounded-xl border border-[var(--madui-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4">
                    Información Personal
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                            Nombre completo
                        </label>
                        <input
                            type="text"
                            value={profile.full_name || ''}
                            onChange={(e) => updateField('full_name', e.target.value)}
                            className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                            Nombre del negocio
                        </label>
                        <input
                            type="text"
                            value={profile.business_name || ''}
                            onChange={(e) => updateField('business_name', e.target.value)}
                            className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-xl border border-[var(--madui-border)] p-6">
                <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4">
                    Datos del Negocio
                </h2>
                <div className="space-y-4">
                    {/* Business Type */}
                    <div className="grid grid-cols-2 gap-3">
                        {(['producto', 'servicio'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => updateField('business_type', type)}
                                className={`p-3 rounded-xl border-2 text-center text-sm font-semibold transition-all capitalize ${profile.business_type === type
                                    ? 'border-[var(--madui-primary)] bg-[var(--madui-primary-lighter)] text-[var(--madui-primary)]'
                                    : 'border-[var(--madui-border)] hover:border-gray-400 text-[var(--madui-text-secondary)]'
                                    }`}
                            >
                                {type === 'producto' ? '📦' : '🛎️'} {type}
                            </button>
                        ))}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                            Categoría
                        </label>
                        <select
                            value={profile.category_id ?? ''}
                            onChange={(e) => updateField('category_id', Number(e.target.value) || null)}
                            className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm bg-white"
                        >
                            <option value="">Selecciona</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.emoji} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                            Descripción
                        </label>
                        <textarea
                            value={profile.bio || ''}
                            onChange={(e) => updateField('bio', e.target.value)}
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm resize-none"
                            placeholder="Describe tu negocio..."
                        />
                        <p className="text-xs text-[var(--madui-text-muted)] text-right mt-1">
                            {(profile.bio || '').length}/500
                        </p>
                    </div>

                    {/* WhatsApp (Premium) */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                            WhatsApp Link
                            {!isPremium && (
                                <span className="ml-2 text-xs text-[var(--madui-accent-dark)] bg-[var(--madui-accent-lighter)] px-2 py-0.5 rounded-full">
                                    Premium
                                </span>
                            )}
                        </label>
                        <input
                            type="url"
                            value={profile.whatsapp_link || ''}
                            onChange={(e) => updateField('whatsapp_link', e.target.value)}
                            disabled={!isPremium}
                            className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm disabled:opacity-50 disabled:bg-gray-50"
                            placeholder="https://wa.me/5214421234567"
                        />
                        <p className="text-xs text-[var(--madui-text-muted)] mt-1">
                            Formato: https://wa.me/5214421234567
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
