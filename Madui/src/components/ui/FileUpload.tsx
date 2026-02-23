'use client'

import { useCallback, useState, useRef, type ReactNode } from 'react'

interface FileUploadProps {
    label: string
    accept?: string
    maxSizeMB?: number
    onFileSelect: (file: File) => void
    preview?: string | null
    error?: string
    hint?: string
    icon?: ReactNode
    required?: boolean
}

export function FileUpload({
    label,
    accept = 'image/*,.pdf',
    maxSizeMB = 10,
    onFileSelect,
    preview,
    error,
    hint,
    icon,
    required,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [localError, setLocalError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback(
        (file: File) => {
            setLocalError(null)
            if (file.size > maxSizeMB * 1024 * 1024) {
                setLocalError(`El archivo excede ${maxSizeMB}MB`)
                return
            }
            setFileName(file.name)
            onFileSelect(file)
        },
        [maxSizeMB, onFileSelect]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
        },
        [handleFile]
    )

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => setIsDragging(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }

    const displayError = error || localError

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-[var(--madui-text)] mb-1.5">
                {label}
                {required && <span className="text-[var(--madui-error)] ml-0.5">*</span>}
            </label>

            <div
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-6
          transition-all duration-200 text-center
          ${isDragging
                        ? 'border-[var(--madui-primary)] bg-[var(--madui-primary-lighter)]'
                        : displayError
                            ? 'border-[var(--madui-error)] bg-red-50'
                            : fileName || preview
                                ? 'border-[var(--madui-primary)] bg-[var(--madui-primary-lighter)]'
                                : 'border-[var(--madui-border)] bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                    }
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className="hidden"
                />

                {preview ? (
                    <div className="flex flex-col items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-lg"
                        />
                        <p className="text-sm text-[var(--madui-primary)] font-medium truncate max-w-full">
                            {fileName || 'Archivo cargado'}
                        </p>
                        <p className="text-xs text-[var(--madui-text-muted)]">
                            Clic para cambiar
                        </p>
                    </div>
                ) : fileName ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-[var(--madui-primary)] flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm text-[var(--madui-primary)] font-medium truncate max-w-full">
                            {fileName}
                        </p>
                        <p className="text-xs text-[var(--madui-text-muted)]">
                            Clic para cambiar
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        {icon || (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <svg className="w-6 h-6 text-[var(--madui-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-[var(--madui-text)]">
                                Arrastra o <span className="text-[var(--madui-primary)]">selecciona un archivo</span>
                            </p>
                            <p className="text-xs text-[var(--madui-text-muted)] mt-1">
                                Máx. {maxSizeMB}MB • PDF, JPG, PNG
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {displayError && (
                <p className="mt-1.5 text-xs text-[var(--madui-error)]" role="alert">
                    {displayError}
                </p>
            )}

            {hint && !displayError && (
                <p className="mt-1.5 text-xs text-[var(--madui-text-muted)]">{hint}</p>
            )}
        </div>
    )
}
