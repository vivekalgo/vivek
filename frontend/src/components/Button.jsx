// Reusable Button Component
export default function Button({
    children,
    onClick,
    variant = 'primary',
    disabled = false,
    className = '',
    type = 'button'
}) {
    const baseStyles = 'px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

    const variants = {
        primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-0.5',
        secondary: 'bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm',
        ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
        danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
        >
            {children}
        </button>
    )
}
