import { forwardRef } from 'react'
// Optional wrapper, but sticking to CSS for now

// Reusable Card Component with ref support
const Card = forwardRef(({ children, className = '', hover = false, id }, ref) => {
    return (
        <div
            ref={ref}
            id={id}
            className={`
      glass-card p-6 text-slate-100
      ${hover ? 'hover:scale-[1.01] hover:shadow-glow' : ''}
      ${className}
    `}>
            {children}
        </div>
    )
})

Card.displayName = 'Card'

export default Card
