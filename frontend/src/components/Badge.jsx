// Badge Component for Risk Levels and Status
export default function Badge({ children, variant = 'default', icon }) {
    const variants = {
        high: 'bg-red-500/10 text-red-400 border-red-500/20',
        medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        law: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        ai: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        default: 'bg-white/10 text-slate-300 border-white/10',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    }

    return (
        <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm
      ${variants[variant] || variants.default}
    `}>
            {icon && <span>{icon}</span>}
            {children}
        </span>
    )
}
