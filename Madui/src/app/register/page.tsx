'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Stepper } from '@/components/ui/Stepper'
import { FileUpload } from '@/components/ui/FileUpload'

const STEPS = ['Identidad', 'Tu Negocio', 'Documentos', 'Seguridad']

interface CategoryOption {
    id: number
    name: string
    emoji: string | null
}

export default function RegisterPage() {
    const [currentStep, setCurrentStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [categories, setCategories] = useState<CategoryOption[]>([])
    const router = useRouter()
    const supabase = createClient()

    // Step 1: Identity
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [fullName, setFullName] = useState('')

    // Step 2: Business
    const [businessName, setBusinessName] = useState('')
    const [businessType, setBusinessType] = useState<'producto' | 'servicio' | ''>('')
    const [categoryId, setCategoryId] = useState<number | null>(null)
    const [bio, setBio] = useState('')

    // Step 3: Documents (KYC)
    const [ineFile, setIneFile] = useState<File | null>(null)
    const [addressFile, setAddressFile] = useState<File | null>(null)
    const [maintenanceFile, setMaintenanceFile] = useState<File | null>(null)

    // Step 4: Security
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Load categories
    useEffect(() => {
        supabase
            .from('categories')
            .select('id, name, emoji')
            .eq('is_active', true)
            .order('sort_order')
            .then(({ data }) => {
                if (data) setCategories(data)
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Password strength
    const getPasswordStrength = (pwd: string) => {
        let score = 0
        if (pwd.length >= 10) score++
        if (/[A-Z]/.test(pwd)) score++
        if (/[a-z]/.test(pwd)) score++
        if (/[0-9]/.test(pwd)) score++
        if (/[^A-Za-z0-9]/.test(pwd)) score++
        return score
    }

    const passwordStrength = getPasswordStrength(password)
    const strengthLabels = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte']
    const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600']

    // Validations per step
    const validateStep = (step: number): boolean => {
        setError(null)
        switch (step) {
            case 0:
                if (!email || !fullName) {
                    setError('Completa todos los campos obligatorios.')
                    return false
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setError('Ingresa un email válido.')
                    return false
                }
                return true
            case 1:
                if (!businessName || !businessType || !categoryId) {
                    setError('Selecciona el tipo de negocio y categoría.')
                    return false
                }
                return true
            case 2:
                if (!ineFile || !addressFile || !maintenanceFile) {
                    setError('Sube los 3 documentos requeridos.')
                    return false
                }
                return true
            case 3:
                if (password.length < 10) {
                    setError('La contraseña debe tener al menos 10 caracteres.')
                    return false
                }
                if (passwordStrength < 4) {
                    setError('La contraseña necesita mayúsculas, minúsculas, números y caracteres especiales.')
                    return false
                }
                if (password !== confirmPassword) {
                    setError('Las contraseñas no coinciden.')
                    return false
                }
                return true
            default:
                return true
        }
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
        }
    }

    const prevStep = () => {
        setError(null)
        setCurrentStep((prev) => Math.max(prev - 1, 0))
    }

    // Final submit
    const handleSubmit = async () => {
        if (!validateStep(3)) return
        setIsLoading(true)
        setError(null)

        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                phone: phone || undefined,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'entrepreneur',
                    },
                },
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('No se pudo crear el usuario.')

            const userId = authData.user.id

            // 2. Update profile with business info
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    business_name: businessName,
                    business_type: businessType,
                    category_id: categoryId,
                    bio: bio || null,
                    verification_status: 'pendiente',
                })
                .eq('id', userId)

            if (profileError) throw profileError

            // 3. Upload KYC documents to private storage
            const uploadDoc = async (file: File, path: string) => {
                const fileExt = file.name.split('.').pop()
                const filePath = `${userId}/${path}.${fileExt}`
                const { error } = await supabase.storage
                    .from('kyc-documents')
                    .upload(filePath, file, { upsert: true })
                if (error) throw error
                return filePath
            }

            const [inePath, addressPath, maintenancePath] = await Promise.all([
                uploadDoc(ineFile!, 'ine'),
                uploadDoc(addressFile!, 'domicilio'),
                uploadDoc(maintenanceFile!, 'mantenimiento'),
            ])

            // 4. Create verification record
            const { error: verError } = await supabase
                .from('verifications')
                .insert({
                    profile_id: userId,
                    ine_url: inePath,
                    proof_of_address_url: addressPath,
                    zibata_maintenance_url: maintenancePath,
                    status: 'pendiente',
                })

            if (verError) throw verError

            // Redirect to success page
            router.push('/register/success')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al registrarse'
            if (message.includes('already registered') || message.includes('already been registered')) {
                setError('Este email ya está registrado. ¿Quieres iniciar sesión?')
            } else {
                setError(message)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--madui-bg)]">
            {/* Header */}
            <header className="bg-white border-b border-[var(--madui-border)] py-4">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                    <Logo size="md" linkTo="/" />
                    <Link href="/login" className="text-sm text-[var(--madui-text-secondary)] hover:text-[var(--madui-primary)]">
                        Ya tengo cuenta
                    </Link>
                </div>
            </header>

            <main className="flex-1 py-8 px-4">
                <div className="max-w-xl mx-auto">
                    {/* Stepper */}
                    <Stepper steps={STEPS} currentStep={currentStep} className="mb-8" />

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-[var(--madui-shadow-md)] border border-[var(--madui-border)] p-8">
                        {/* Error */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-[var(--madui-error)] text-sm">{error}</p>
                            </div>
                        )}

                        {/* ======== STEP 1: Identity ======== */}
                        {currentStep === 0 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                                        Validación de Identidad
                                    </h2>
                                    <p className="text-sm text-[var(--madui-text-secondary)] mt-1">
                                        Ingresa tus datos de contacto para verificar tu identidad.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                                        Nombre completo <span className="text-[var(--madui-error)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm"
                                        placeholder="Juan Pérez García"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                                        Correo electrónico <span className="text-[var(--madui-error)]">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm"
                                        placeholder="tu@email.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                                        Celular (opcional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm"
                                        placeholder="+52 442 123 4567"
                                    />
                                    <p className="mt-1 text-xs text-[var(--madui-text-muted)]">
                                        Se usará para comunicación directa con vecinos.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ======== STEP 2: Business ======== */}
                        {currentStep === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                                        Datos de tu Negocio
                                    </h2>
                                    <p className="text-sm text-[var(--madui-text-secondary)] mt-1">
                                        Cuéntanos sobre tu emprendimiento.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                                        Nombre del negocio <span className="text-[var(--madui-error)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm"
                                        placeholder="Mi Negocio en Zibatá"
                                        required
                                    />
                                </div>

                                {/* Business Type Cards */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--madui-text)] mb-2">
                                        Tipo de negocio <span className="text-[var(--madui-error)]">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setBusinessType('producto')}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${businessType === 'producto'
                                                ? 'border-[var(--madui-primary)] bg-[var(--madui-primary-lighter)]'
                                                : 'border-[var(--madui-border)] hover:border-gray-400'
                                                }`}
                                        >
                                            <span className="text-3xl block mb-2">📦</span>
                                            <span className="text-sm font-semibold text-[var(--madui-text)]">Producto</span>
                                            <span className="text-xs text-[var(--madui-text-muted)] block mt-1">
                                                Vendo artículos o comida
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBusinessType('servicio')}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${businessType === 'servicio'
                                                ? 'border-[var(--madui-primary)] bg-[var(--madui-primary-lighter)]'
                                                : 'border-[var(--madui-border)] hover:border-gray-400'
                                                }`}
                                        >
                                            <span className="text-3xl block mb-2">🛎️</span>
                                            <span className="text-sm font-semibold text-[var(--madui-text)]">Servicio</span>
                                            <span className="text-xs text-[var(--madui-text-muted)] block mt-1">
                                                Ofrezco servicios profesionales
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Category Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                                        Categoría <span className="text-[var(--madui-error)]">*</span>
                                    </label>
                                    <select
                                        value={categoryId ?? ''}
                                        onChange={(e) => setCategoryId(Number(e.target.value) || null)}
                                        className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm bg-white"
                                    >
                                        <option value="">Selecciona una categoría</option>
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
                                        Descripción breve (opcional)
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={3}
                                        maxLength={500}
                                        className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm resize-none"
                                        placeholder="Cuéntale a tus vecinos de qué se trata tu negocio..."
                                    />
                                    <p className="mt-1 text-xs text-[var(--madui-text-muted)] text-right">
                                        {bio.length}/500
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ======== STEP 3: Documents ======== */}
                        {currentStep === 2 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                                        Documentación
                                    </h2>
                                    <p className="text-sm text-[var(--madui-text-secondary)] mt-1">
                                        Para verificar tu residencia en Zibatá necesitamos estos documentos. Toda tu información es confidencial.
                                    </p>
                                </div>

                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                                    <p className="text-xs text-blue-700 flex items-start gap-2">
                                        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Tus documentos se almacenan de forma segura y solo son revisados por administradores para validar tu residencia.
                                    </p>
                                </div>

                                <FileUpload
                                    label="Identificación Oficial (INE/Pasaporte)"
                                    accept="image/*,.pdf"
                                    maxSizeMB={10}
                                    onFileSelect={setIneFile}
                                    required
                                    hint="Foto o PDF de tu INE o pasaporte vigente"
                                />

                                <FileUpload
                                    label="Comprobante de Domicilio"
                                    accept="image/*,.pdf"
                                    maxSizeMB={10}
                                    onFileSelect={setAddressFile}
                                    required
                                    hint="Recibo de luz, agua o internet con domicilio en Zibatá"
                                />

                                <FileUpload
                                    label="Comprobante de Pago de Mantenimiento Zibatá"
                                    accept="image/*,.pdf"
                                    maxSizeMB={10}
                                    onFileSelect={setMaintenanceFile}
                                    required
                                    hint="Recibo reciente de mantenimiento de Zibatá"
                                />
                            </div>
                        )}

                        {/* ======== STEP 4: Security ======== */}
                        {currentStep === 3 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                                        Contraseña Segura
                                    </h2>
                                    <p className="text-sm text-[var(--madui-text-secondary)] mt-1">
                                        Crea una contraseña robusta para proteger tu cuenta.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                                        Contraseña <span className="text-[var(--madui-error)]">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-[var(--madui-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)] text-sm"
                                        placeholder="Mínimo 10 caracteres"
                                        minLength={10}
                                    />

                                    {/* Strength meter */}
                                    {password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[1, 2, 3, 4, 5].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength >= level
                                                            ? strengthColors[level]
                                                            : 'bg-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-[var(--madui-text-muted)]">
                                                Fuerza: <span className="font-medium">{strengthLabels[passwordStrength]}</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Requirements checklist */}
                                    <div className="mt-3 space-y-1.5">
                                        {[
                                            { label: 'Mínimo 10 caracteres', met: password.length >= 10 },
                                            { label: 'Una letra mayúscula', met: /[A-Z]/.test(password) },
                                            { label: 'Una letra minúscula', met: /[a-z]/.test(password) },
                                            { label: 'Un número', met: /[0-9]/.test(password) },
                                            { label: 'Un carácter especial (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
                                        ].map((req) => (
                                            <div key={req.label} className="flex items-center gap-2 text-xs">
                                                <span className={req.met ? 'text-green-500' : 'text-gray-300'}>
                                                    {req.met ? '✓' : '○'}
                                                </span>
                                                <span className={req.met ? 'text-[var(--madui-text)]' : 'text-[var(--madui-text-muted)]'}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                                        Confirmar contraseña <span className="text-[var(--madui-error)]">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-20 text-sm ${confirmPassword && confirmPassword !== password
                                            ? 'border-[var(--madui-error)] focus:ring-[var(--madui-error)] focus:border-[var(--madui-error)]'
                                            : 'border-[var(--madui-border)] focus:ring-[var(--madui-primary)] focus:border-[var(--madui-primary)]'
                                            }`}
                                        placeholder="Repite la contraseña"
                                    />
                                    {confirmPassword && confirmPassword !== password && (
                                        <p className="mt-1 text-xs text-[var(--madui-error)]">
                                            Las contraseñas no coinciden.
                                        </p>
                                    )}
                                </div>

                                {/* Terms */}
                                <div className="p-4 bg-gray-50 rounded-xl mt-4">
                                    <p className="text-xs text-[var(--madui-text-secondary)]">
                                        Al registrarte, aceptas los{' '}
                                        <Link href="#" className="text-[var(--madui-primary)] hover:underline">
                                            Términos y Condiciones
                                        </Link>{' '}
                                        y la{' '}
                                        <Link href="#" className="text-[var(--madui-primary)] hover:underline">
                                            Política de Privacidad
                                        </Link>{' '}
                                        de zibata.services.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--madui-border-light)]">
                            {currentStep > 0 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-5 py-2.5 text-sm font-medium text-[var(--madui-text-secondary)] hover:text-[var(--madui-text)] transition-colors"
                                >
                                    ← Anterior
                                </button>
                            ) : (
                                <div />
                            )}

                            {currentStep < STEPS.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2.5 bg-[var(--madui-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors shadow-sm"
                                >
                                    Siguiente →
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="px-6 py-2.5 bg-[var(--madui-primary)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-[var(--madui-text-secondary)] mt-6 text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-[var(--madui-primary)] font-semibold hover:text-[var(--madui-primary-light)]">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    )
}
