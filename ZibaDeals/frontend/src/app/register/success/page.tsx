import Link from 'next/link'

export default function RegisterSuccessPage() {
    return (
        <div className="min-h-screen bg-[var(--madui-bg)] flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-[var(--madui-border)] py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <Link href="/" className="flex items-center gap-2.5 w-fit">
                        <div className="w-9 h-9 rounded-xl bg-[var(--madui-primary)] flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-lg">M</span>
                        </div>
                        <span className="text-xl font-bold text-[var(--madui-primary)] font-[family-name:var(--font-montserrat)]">
                            Madui
                        </span>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--madui-primary-lighter)] flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🎉</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--madui-text)] mb-3 font-[family-name:var(--font-montserrat)]">
                        ¡Registro Exitoso!
                    </h1>
                    <p className="text-[var(--madui-text-secondary)] mb-8">
                        Tu cuenta ha sido creada. Nuestro equipo revisará tus documentos
                        para verificar tu residencia en Zibatá. Te notificaremos por email
                        cuando tu perfil sea aprobado.
                    </p>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl border border-[var(--madui-border)] p-6 text-left mb-8">
                        <h3 className="text-sm font-semibold text-[var(--madui-text)] mb-4">
                            ¿Qué sigue?
                        </h3>
                        <div className="space-y-4">
                            {[
                                {
                                    icon: '📧',
                                    title: 'Confirma tu email',
                                    desc: 'Revisa tu bandeja de entrada y confirma tu correo electrónico.',
                                    status: 'active',
                                },
                                {
                                    icon: '🔍',
                                    title: 'Revisión de documentos',
                                    desc: 'Nuestro equipo validará tu identificación y comprobante de Zibatá.',
                                    status: 'pending',
                                },
                                {
                                    icon: '✅',
                                    title: 'Perfil aprobado',
                                    desc: 'Recibirás un email de confirmación y tu perfil aparecerá en el directorio.',
                                    status: 'pending',
                                },
                            ].map((step, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${step.status === 'active'
                                            ? 'bg-[var(--madui-primary-lighter)]'
                                            : 'bg-gray-100'
                                        }`}>
                                        <span className="text-lg">{step.icon}</span>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${step.status === 'active'
                                                ? 'text-[var(--madui-primary)]'
                                                : 'text-[var(--madui-text)]'
                                            }`}>
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-[var(--madui-text-muted)] mt-0.5">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/login"
                            className="px-6 py-3 bg-[var(--madui-primary)] text-white font-semibold rounded-xl hover:bg-[var(--madui-primary-light)] transition-colors shadow-sm"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-gray-100 text-[var(--madui-text)] font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
