'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Verification {
    id: string
    profile_id: string
    status: string
    ine_url: string
    proof_of_address_url: string
    zibata_doc_url: string
    submitted_at: string
    profiles: {
        full_name: string | null
        business_name: string | null
        business_type: string | null
        verification_status: string
    }
}

export default function AdminVerificationsPage() {
    const [verifications, setVerifications] = useState<Verification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [processing, setProcessing] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const loadVerifications = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.user_metadata?.role !== 'admin') {
            router.push('/dashboard')
            return
        }
        const { data } = await supabase
            .from('verifications')
            .select('*, profiles(full_name, business_name, business_type, verification_status)')
            .order('submitted_at', { ascending: true })
        setVerifications(data as unknown as Verification[] || [])
        setIsLoading(false)
    }, [supabase, router])

    useEffect(() => { loadVerifications() }, [loadVerifications])

    const handleApprove = async (v: Verification) => {
        setProcessing(true)
        const now = new Date().toISOString()
        await Promise.all([
            supabase.from('verifications').update({ status: 'aprobado', reviewed_at: now }).eq('id', v.id),
            supabase.from('profiles').update({ verification_status: 'aprobado', approved_at: now, rejection_reason: null }).eq('id', v.profile_id),
        ])
        await loadVerifications()
        setProcessing(false)
    }

    const handleReject = async (v: Verification) => {
        if (!rejectionReason.trim()) return
        setProcessing(true)
        const now = new Date().toISOString()
        await Promise.all([
            supabase.from('verifications').update({ status: 'rechazado', reviewed_at: now, rejection_reason: rejectionReason }).eq('id', v.id),
            supabase.from('profiles').update({ verification_status: 'rechazado', rejection_reason: rejectionReason }).eq('id', v.profile_id),
        ])
        setRejectionReason('')
        setSelectedId(null)
        await loadVerifications()
        setProcessing(false)
    }

    const pending = verifications.filter((v) => v.status === 'pendiente' || v.status === 'en_revision')
    const processed = verifications.filter((v) => v.status === 'aprobado' || v.status === 'rechazado')

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-24 rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--madui-bg)]">
            <header className="bg-white border-b border-[var(--madui-border)] py-4">
                <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="/" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-[var(--madui-primary)] flex items-center justify-center">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                        </a>
                        <div>
                            <h1 className="text-lg font-bold text-[var(--madui-text)]">Panel Admin</h1>
                            <p className="text-xs text-[var(--madui-text-muted)]">Validación KYC</p>
                        </div>
                    </div>
                    <span className="text-xs font-medium bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                        {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                <section>
                    <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4">Pendientes de Revisión</h2>
                    {pending.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-xl border border-[var(--madui-border)]">
                            <span className="text-3xl block mb-2">✅</span>
                            <p className="text-sm text-[var(--madui-text-muted)]">No hay verificaciones pendientes</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pending.map((v) => (
                                <div key={v.id} className="bg-white rounded-xl border border-[var(--madui-border)] overflow-hidden">
                                    <div className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--madui-text)]">{v.profiles?.full_name || 'Sin nombre'}</p>
                                            <p className="text-xs text-[var(--madui-text-muted)]">
                                                {v.profiles?.business_name} · {v.profiles?.business_type} · Enviado {new Date(v.submitted_at).toLocaleDateString('es-MX')}
                                            </p>
                                        </div>
                                        <button onClick={() => setSelectedId(selectedId === v.id ? null : v.id)} className="text-sm font-medium text-[var(--madui-primary)] hover:underline">
                                            {selectedId === v.id ? 'Cerrar' : 'Revisar →'}
                                        </button>
                                    </div>
                                    {selectedId === v.id && (
                                        <div className="border-t border-[var(--madui-border)] p-4 bg-gray-50">
                                            <p className="text-sm font-semibold text-[var(--madui-text)] mb-3">Documentos</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                                {[
                                                    { label: 'INE/Pasaporte', url: v.ine_url },
                                                    { label: 'Comprobante Domicilio', url: v.proof_of_address_url },
                                                    { label: 'Mantenimiento Zibatá', url: v.zibata_doc_url },
                                                ].map((doc) => (
                                                    <a key={doc.label} href={doc.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-white rounded-lg border border-[var(--madui-border)] hover:border-[var(--madui-primary)] transition-colors text-center">
                                                        <span className="text-2xl block mb-1">📄</span>
                                                        <span className="text-xs font-medium text-[var(--madui-primary)]">{doc.label}</span>
                                                    </a>
                                                ))}
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button onClick={() => handleApprove(v)} disabled={processing} className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50">✓ Aprobar</button>
                                                <div className="flex-1 flex gap-2">
                                                    <input type="text" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Razón del rechazo..." className="flex-1 px-4 py-2.5 border border-[var(--madui-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                                                    <button onClick={() => handleReject(v)} disabled={processing || !rejectionReason.trim()} className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50">✕ Rechazar</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                <section>
                    <h2 className="text-lg font-semibold text-[var(--madui-text)] mb-4">Historial ({processed.length})</h2>
                    {processed.length > 0 && (
                        <div className="bg-white rounded-xl border border-[var(--madui-border)] divide-y divide-[var(--madui-border)]">
                            {processed.slice(0, 20).map((v) => (
                                <div key={v.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-[var(--madui-text)]">{v.profiles?.full_name}</p>
                                        <p className="text-xs text-[var(--madui-text-muted)]">{v.profiles?.business_name}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${v.status === 'aprobado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {v.status === 'aprobado' ? '✓ Aprobado' : '✕ Rechazado'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}
