// Reusable Button Component
export default function Button({
    children,
    onClick,
    variant = 'primary',
    disabled = false,
    className = ''
}) {
    const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg',
        secondary: 'bg-white text-slate-700 border-2 border-slate-200 hover:border-primary-500 hover:text-primary-600',
        ghost: 'text-slate-600 hover:bg-slate-100'
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    )
}
