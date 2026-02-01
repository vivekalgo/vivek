// Badge Component for Risk Levels and Status
export default function Badge({ children, variant = 'default', icon }) {
    const variants = {
        high: 'bg-red-100 text-red-700 border-red-200',
        medium: 'bg-amber-100 text-amber-700 border-amber-200',
        low: 'bg-green-100 text-green-700 border-green-200',
        law: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        ai: 'bg-blue-100 text-blue-700 border-blue-200',
        default: 'bg-slate-100 text-slate-700 border-slate-200'
    }

    return (
        <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
      ${variants[variant]}
    `}>
            {icon && <span>{icon}</span>}
            {children}
        </span>
    )
}
