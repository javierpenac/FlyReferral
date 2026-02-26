import { type ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
    as?: 'div' | 'article' | 'section'
}

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
}

export function Card({
    children,
    className = '',
    hover = false,
    padding = 'md',
    as: Component = 'div',
}: CardProps) {
    return (
        <Component
            className={`
        bg-[var(--madui-bg-card)] 
        border border-[var(--madui-border)] 
        rounded-[var(--madui-radius-lg)] 
        overflow-hidden
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
        >
            {children}
        </Component>
    )
}

/* Card sub-components for composition */
export function CardHeader({
    children,
    className = '',
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    )
}

export function CardTitle({
    children,
    className = '',
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <h3
            className={`text-lg font-semibold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)] ${className}`}
        >
            {children}
        </h3>
    )
}

export function CardContent({
    children,
    className = '',
}: {
    children: ReactNode
    className?: string
}) {
    return <div className={className}>{children}</div>
}

export function CardFooter({
    children,
    className = '',
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div
            className={`mt-4 pt-4 border-t border-[var(--madui-border-light)] ${className}`}
        >
            {children}
        </div>
    )
}
