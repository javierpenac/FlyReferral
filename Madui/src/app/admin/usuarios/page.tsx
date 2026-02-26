'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'

interface User {
    id: string
    full_name: string | null
    business_name: string | null
    user_role: string
    verification_status: string
    plan_type: string | null
    created_at: string
}

export default function AdminUsuariosPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        const supabase = createClient()
        let query = supabase
            .from('profiles')
            .select('id, full_name, business_name, user_role, verification_status, plan_type, created_at')
            .order('created_at', { ascending: false })

        if (roleFilter !== 'all') {
            query = query.eq('user_role', roleFilter)
        }

        const { data } = await query
        setUsers(data || [])
        setLoading(false)
    }, [roleFilter])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    const filtered = users.filter(u =>
        (u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            u.business_name?.toLowerCase().includes(search.toLowerCase())) ?? true
    )

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`¿Cambiar el rol de este usuario a "${newRole}"?`)) return
        const supabase = createClient()

        // Update profile role
        await supabase.from('profiles').update({ user_role: newRole }).eq('id', userId)
        fetchUsers()
    }

    const roleColors: Record<string, string> = {
        superadmin: 'bg-red-100 text-red-800',
        analyst: 'bg-blue-100 text-blue-800',
        entrepreneur: 'bg-gray-100 text-gray-700',
    }

    const roleLabels: Record<string, string> = {
        superadmin: '🔴 Superadmin',
        analyst: '🔵 Analista',
        entrepreneur: '🟢 Emprendedor',
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                    Gestión de Usuarios
                </h1>
                <p className="text-[var(--madui-text-secondary)] text-sm mt-1">
                    Administrar roles y permisos de todos los usuarios
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-4 text-center">
                    <p className="text-2xl font-bold text-[var(--madui-primary)]">{users.length}</p>
                    <p className="text-xs text-[var(--madui-text-muted)]">Total Usuarios</p>
                </div>
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{users.filter(u => u.user_role === 'superadmin').length}</p>
                    <p className="text-xs text-[var(--madui-text-muted)]">Superadmins</p>
                </div>
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.user_role === 'analyst').length}</p>
                    <p className="text-xs text-[var(--madui-text-muted)]">Analistas</p>
                </div>
                <div className="bg-white rounded-xl border border-[var(--madui-border)] p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{users.filter(u => u.user_role === 'entrepreneur').length}</p>
                    <p className="text-xs text-[var(--madui-text-muted)]">Emprendedores</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-[var(--madui-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30"
                />
                <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="px-4 py-2.5 border border-[var(--madui-border)] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30"
                >
                    <option value="all">Todos los roles</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="analyst">Analista</option>
                    <option value="entrepreneur">Emprendedor</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-[var(--madui-text-muted)]">Cargando usuarios...</div>
            ) : (
                <div className="bg-white rounded-2xl border border-[var(--madui-border)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-[var(--madui-border)]">
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Usuario</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Rol Actual</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Estado</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Plan</th>
                                    <th className="text-left px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Registro</th>
                                    <th className="text-right px-4 py-3 font-semibold text-[var(--madui-text-muted)] text-xs uppercase">Cambiar Rol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--madui-border-light)]">
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-[var(--madui-text)]">{u.full_name || 'Sin nombre'}</p>
                                            <p className="text-xs text-[var(--madui-text-muted)]">{u.business_name || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[u.user_role] || ''}`}>
                                                {roleLabels[u.user_role] || u.user_role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.verification_status === 'aprobado' ? 'bg-green-100 text-green-800' : u.verification_status === 'pendiente' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                                {u.verification_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium ${u.plan_type === 'premium' ? 'text-[var(--madui-accent-dark)]' : 'text-[var(--madui-text-muted)]'}`}>
                                                {u.plan_type === 'premium' ? '⭐ Premium' : 'Básico'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[var(--madui-text-muted)]">
                                            {new Date(u.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <select
                                                value={u.user_role}
                                                onChange={e => handleRoleChange(u.id, e.target.value)}
                                                className="px-3 py-1.5 border border-[var(--madui-border)] rounded-lg text-xs bg-white hover:border-[var(--madui-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)]/30"
                                            >
                                                <option value="entrepreneur">🟢 Emprendedor</option>
                                                <option value="analyst">🔵 Analista</option>
                                                <option value="superadmin">🔴 Superadmin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <div className="text-center py-8 text-[var(--madui-text-muted)]">No se encontraron usuarios</div>
                    )}
                </div>
            )}
        </div>
    )
}
