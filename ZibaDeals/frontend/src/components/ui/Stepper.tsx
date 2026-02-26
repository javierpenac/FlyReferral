'use client'

interface StepperProps {
    steps: string[]
    currentStep: number
    className?: string
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
    return (
        <div className={`w-full ${className}`}>
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep
                    const isCurrent = index === currentStep
                    const isUpcoming = index > currentStep

                    return (
                        <div key={index} className="flex items-center flex-1 last:flex-none">
                            {/* Step circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                    w-9 h-9 rounded-full flex items-center justify-center
                    text-sm font-semibold transition-all duration-300
                    ${isCompleted
                                            ? 'bg-[var(--madui-primary)] text-white'
                                            : isCurrent
                                                ? 'bg-[var(--madui-primary)] text-white ring-4 ring-[var(--madui-primary-lighter)]'
                                                : 'bg-gray-100 text-[var(--madui-text-muted)]'
                                        }
                  `}
                                >
                                    {isCompleted ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span
                                    className={`
                    mt-2 text-xs font-medium text-center max-w-[80px] leading-tight
                    ${isCurrent ? 'text-[var(--madui-primary)]' : isCompleted ? 'text-[var(--madui-text)]' : 'text-[var(--madui-text-muted)]'}
                  `}
                                >
                                    {step}
                                </span>
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`
                    flex-1 h-0.5 mx-2 mb-6 rounded-full transition-colors duration-300
                    ${isCompleted ? 'bg-[var(--madui-primary)]' : 'bg-gray-200'}
                  `}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
