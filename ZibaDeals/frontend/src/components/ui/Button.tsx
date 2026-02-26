'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    icon?: ReactNode
    fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        'bg-[var(--madui-primary)] text-white hover:bg-[var(--madui-primary-light)] active:bg-[var(--madui-primary-dark)] shadow-sm',
    secondary:
        'bg-white text-[var(--madui-text)] border border-[var(--madui-border)] hover:bg-gray-50 active:bg-gray-100',
    ghost:
        'bg-transparent text-[var(--madui-text-secondary)] hover:bg-gray-100 active:bg-gray-200',
    accent:
        'bg-[var(--madui-accent)] text-[var(--madui-primary-dark)] hover:bg-[var(--madui-accent-light)] active:bg-[var(--madui-accent-dark)] shadow-sm font-semibold',
    danger:
        'bg-[var(--madui-error)] text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            icon,
            fullWidth = false,
            className = '',
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`
          inline-flex items-center justify-center font-medium
          transition-all duration-200 ease-out
          focus-ring
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
                {...props}
            >
                {loading ? (
                    <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : icon ? (
                    <span className="shrink-0">{icon}</span>
                ) : null}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize }
