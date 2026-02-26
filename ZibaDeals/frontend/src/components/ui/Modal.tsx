'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = '',
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose()
    }

    if (!isOpen) return null

    return (
        <div
            ref={overlayRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div
                ref={contentRef}
                className={`
          bg-white rounded-2xl shadow-xl w-full
          animate-in zoom-in-95 duration-200
          ${sizeStyles[size]}
          ${className}
        `}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-6 pb-0">
                        <h2 className="text-lg font-semibold text-[var(--madui-text)] font-[family-name:var(--font-montserrat)]">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-gray-100 text-[var(--madui-text-muted)] hover:text-[var(--madui-text)] transition-colors focus-ring"
                            aria-label="Cerrar"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    )
}
