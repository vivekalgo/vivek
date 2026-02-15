import { useState, useRef, useEffect } from 'react'
import Card from './Card'
import Badge from './Badge'

// Professional Risk Card Component with collapsible sections
export default function RiskCard({ clause, index }) {
    const [expandedOriginal, setExpandedOriginal] = useState(false)
    const [expandedWhy, setExpandedWhy] = useState(false)
    const [expandedActions, setExpandedActions] = useState(false)
    const [expandedSafer, setExpandedSafer] = useState(false)
    const [highlighted, setHighlighted] = useState(false)
    const cardRef = useRef(null)

    // Listen for highlight events (could be triggered by AI chat)
    useEffect(() => {
        const handleHighlight = (event) => {
            if (event.detail.clauseIndex === index) {
                setHighlighted(true)
                cardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
                setTimeout(() => setHighlighted(false), 2000)
            }
        }

        window.addEventListener('highlightClause', handleHighlight)
        return () => window.removeEventListener('highlightClause', handleHighlight)
    }, [index])

    const getRiskVariant = (level) => {
        if (level === 'HIGH' || level === 'High') return 'high'
        if (level === 'MEDIUM' || level === 'Medium') return 'medium'
        return 'low'
    }

    const getRiskColor = (level) => {
        if (level === 'HIGH' || level === 'High') return 'from-red-500 to-red-600'
        if (level === 'MEDIUM' || level === 'Medium') return 'from-amber-500 to-amber-600'
        return 'from-emerald-500 to-emerald-600'
    }

    // Collapsible Section Component
    const CollapsibleSection = ({ title, icon, isExpanded, onToggle, children, bgColor = "bg-white/5", borderColor = "border-white/10" }) => (
        <div className={`${bgColor} border ${borderColor} rounded-xl overflow-hidden transition-all duration-200`}>
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-all"
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="font-semibold text-sm text-slate-200">{title}</span>
                </div>
                <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isExpanded && (
                <div className="px-4 pb-4 animate-slide-down">
                    {children}
                </div>
            )}
        </div>
    )

    return (
        <Card
            ref={cardRef}
            id={`clause-${index}`}
            hover
            className={`mb-4 transition-all duration-300 border-l-4 ${highlighted ? 'ring-2 ring-primary-500 shadow-glow border-l-primary-500' :
                clause.risk_level === 'HIGH' || clause.risk_level === 'High' ? 'border-l-red-500' :
                    clause.risk_level === 'MEDIUM' || clause.risk_level === 'Medium' ? 'border-l-amber-500' :
                        'border-l-emerald-500'
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRiskColor(clause.risk_level)} flex items-center justify-center shadow-lg`}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white">
                            {clause.clause_type}
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={getRiskVariant(clause.risk_level)} icon="⚠️">
                            {clause.risk_level} Risk - {clause.risk_score}/10
                        </Badge>
                        {clause.applicable_law_section && (
                            <Badge variant="law" icon="📘">
                                {clause.applicable_law_section}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-3">
                {/* Why This is Risky - Collapsible */}
                <CollapsibleSection
                    title="Why This is Risky"
                    icon="🚨"
                    isExpanded={expandedWhy}
                    onToggle={() => setExpandedWhy(!expandedWhy)}
                    bgColor="bg-red-500/5"
                    borderColor="border-red-500/10"
                >
                    <p className="text-sm text-red-200/90 leading-relaxed">
                        {clause.why_risky_ai || clause.why_risky || clause.explanation}
                    </p>
                </CollapsibleSection>

                {/* What You Can Do - Collapsible */}
                {clause.what_user_can_do && clause.what_user_can_do.length > 0 && (
                    <CollapsibleSection
                        title="What You Can Do"
                        icon="✅"
                        isExpanded={expandedActions}
                        onToggle={() => setExpandedActions(!expandedActions)}
                        bgColor="bg-blue-500/5"
                        borderColor="border-blue-500/10"
                    >
                        <ul className="space-y-2">
                            {clause.what_user_can_do.map((action, idx) => (
                                <li key={idx} className="text-sm text-blue-200/90 flex items-start gap-2">
                                    <span className="font-bold text-blue-400 mt-0.5">{idx + 1}.</span>
                                    <span className="flex-1">{action}</span>
                                </li>
                            ))}
                        </ul>
                    </CollapsibleSection>
                )}

                {/* Safer Rewrite - Collapsible */}
                {clause.safer_rewrite && (
                    <CollapsibleSection
                        title="Suggested Safer Version"
                        icon="💡"
                        isExpanded={expandedSafer}
                        onToggle={() => setExpandedSafer(!expandedSafer)}
                        bgColor="bg-emerald-500/5"
                        borderColor="border-emerald-500/10"
                    >
                        <p className="text-sm text-emerald-200/90 italic leading-relaxed">
                            "{clause.safer_rewrite}"
                        </p>
                    </CollapsibleSection>
                )}

                {/* Original Clause - Collapsible */}
                <CollapsibleSection
                    title="View Original Clause Text"
                    icon="📄"
                    isExpanded={expandedOriginal}
                    onToggle={() => setExpandedOriginal(!expandedOriginal)}
                    bgColor="bg-white/5"
                    borderColor="border-white/10"
                >
                    <p className="text-sm text-slate-400 italic leading-relaxed">
                        "{clause.clause_text}"
                    </p>
                </CollapsibleSection>
            </div>
        </Card>
    )
}
