'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    hint?: string
    icon?: ReactNode
    rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, icon, rightIcon, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-[var(--madui-text)] mb-1.5"
                    >
                        {label}
                        {props.required && (
                            <span className="text-[var(--madui-error)] ml-0.5">*</span>
                        )}
                    </label>
                )}

                <div className="relative">
                    {icon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--madui-text-muted)]">
                            {icon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={`
              w-full px-4 py-3 
              bg-white
              border rounded-xl
              text-[var(--madui-text)] text-sm
              placeholder:text-[var(--madui-text-muted)]
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[var(--madui-primary)] focus:ring-opacity-20 focus:border-[var(--madui-primary)]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
              ${icon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error
                                ? 'border-[var(--madui-error)] focus:ring-[var(--madui-error)] focus:ring-opacity-20 focus:border-[var(--madui-error)]'
                                : 'border-[var(--madui-border)] hover:border-gray-400'
                            }
              ${className}
            `}
                        aria-invalid={error ? 'true' : undefined}
                        aria-describedby={
                            error
                                ? `${inputId}-error`
                                : hint
                                    ? `${inputId}-hint`
                                    : undefined
                        }
                        {...props}
                    />

                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--madui-text-muted)]">
                            {rightIcon}
                        </span>
                    )}
                </div>

                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="mt-1.5 text-xs text-[var(--madui-error)] flex items-center gap-1"
                        role="alert"
                    >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}

                {hint && !error && (
                    <p
                        id={`${inputId}-hint`}
                        className="mt-1.5 text-xs text-[var(--madui-text-muted)]"
                    >
                        {hint}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
