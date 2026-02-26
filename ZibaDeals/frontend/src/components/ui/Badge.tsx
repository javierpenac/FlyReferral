import { type ReactNode } from 'react'

type BadgeVariant =
    | 'default'
    | 'primary'
    | 'premium'
    | 'verified'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'

interface BadgeProps {
    children: ReactNode
    variant?: BadgeVariant
    size?: 'sm' | 'md'
    icon?: ReactNode
    className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
    default:
        'bg-gray-100 text-[var(--madui-text-secondary)]',
    primary:
        'bg-[var(--madui-primary-lighter)] text-[var(--madui-primary)]',
    premium:
        'bg-gradient-to-r from-[var(--madui-accent)] to-[var(--madui-accent-light)] text-[var(--madui-primary-dark)] shadow-[0_0_12px_rgba(230,179,37,0.3)]',
    verified:
        'bg-[var(--madui-primary-lighter)] text-[var(--madui-primary)]',
    success:
        'bg-green-50 text-[var(--madui-success)]',
    warning:
        'bg-amber-50 text-[var(--madui-warning)]',
    error:
        'bg-red-50 text-[var(--madui-error)]',
    info:
        'bg-blue-50 text-[var(--madui-info)]',
}

const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
}

export function Badge({
    children,
    variant = 'default',
    size = 'sm',
    icon,
    className = '',
}: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center gap-1 
        font-semibold rounded-full
        leading-none whitespace-nowrap
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
        </span>
    )
}

/* Pre-built badge shortcuts */
export function PremiumBadge() {
    return (
        <Badge variant="premium" size="md" icon={<span>⭐</span>}>
            Premium
        </Badge>
    )
}

export function VerifiedBadge() {
    return (
        <Badge variant="verified" size="md" icon={<span>✓</span>}>
            Verificado
        </Badge>
    )
}

export function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { variant: BadgeVariant; label: string }> = {
        pendiente: { variant: 'warning', label: 'Pendiente' },
        en_revision: { variant: 'info', label: 'En Revisión' },
        aprobado: { variant: 'success', label: 'Aprobado' },
        rechazado: { variant: 'error', label: 'Rechazado' },
    }
    const { variant, label } = config[status] || config.pendiente
    return <Badge variant={variant}>{label}</Badge>
}
