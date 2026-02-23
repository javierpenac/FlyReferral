import Link from 'next/link'

interface LogoProps {
    size?: 'sm' | 'md' | 'lg'
    linkTo?: string
    className?: string
}

const sizeConfig = {
    sm: {
        icon: 'w-7 h-7 text-sm',
        text: 'text-lg',
        suffix: 'text-sm',
        gap: 'gap-2',
    },
    md: {
        icon: 'w-9 h-9 text-base',
        text: 'text-xl',
        suffix: 'text-base',
        gap: 'gap-2.5',
    },
    lg: {
        icon: 'w-11 h-11 text-lg',
        text: 'text-2xl',
        suffix: 'text-lg',
        gap: 'gap-3',
    },
}

function LogoContent({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const s = sizeConfig[size]
    return (
        <div className={`flex items-center ${s.gap}`}>
            {/* Location pin + checkmark icon */}
            <div className={`${s.icon} rounded-xl bg-[#5B6B53] flex items-center justify-center shadow-sm shrink-0`}>
                <svg viewBox="0 0 24 24" fill="none" className="w-[60%] h-[60%]">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" fillOpacity="0.25" />
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="white" strokeWidth="1.5" fill="none" />
                    <path d="M8.5 9.5l2.5 2.5 4.5-5" stroke="#D9E9CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            {/* Brand text */}
            <div className="flex items-baseline">
                <span className={`${s.text} font-bold text-[#3D4D36] font-[family-name:var(--font-montserrat)] tracking-tight`}>
                    zibata
                </span>
                <span className={`${s.suffix} font-semibold text-[#A67B52] font-[family-name:var(--font-montserrat)]`}>
                    .services
                </span>
            </div>
        </div>
    )
}

export function Logo({ size = 'md', linkTo, className = '' }: LogoProps) {
    if (linkTo) {
        return (
            <Link href={linkTo} className={`flex items-center w-fit ${className}`}>
                <LogoContent size={size} />
            </Link>
        )
    }
    return (
        <div className={`flex items-center w-fit ${className}`}>
            <LogoContent size={size} />
        </div>
    )
}
