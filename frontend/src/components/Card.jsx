import { forwardRef } from 'react'

// Reusable Card Component with ref support
const Card = forwardRef(({ children, className = '', hover = false, id }, ref) => {
    return (
        <div
            ref={ref}
            id={id}
            className={`
      bg-white rounded-xl shadow-soft border border-slate-100 p-6
      ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''}
      ${className}
    `}>
            {children}
        </div>
    )
})

Card.displayName = 'Card'

export default Card
