import React, { useState } from 'react'
import Card from './Card'
import Badge from './Badge'

export default function HRValidationPanel({ results, onReset }) {
    const [activeTab, setActiveTab] = useState('summary') // 'summary', 'clauses', 'missing'

    if (!results) return null

    const { analysis } = results
    const { compliance_score, risk_level, clause_results, missing_clauses, summary } = analysis

    // Helper for risk colors
    const getRiskColor = (level) => {
        if (level === 'High Risk') return 'text-red-400 bg-red-500/10 border-red-500/20'
        if (level === 'Medium Risk') return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400'
        if (score >= 50) return 'text-amber-400'
        return 'text-red-400'
    }

    return (
        <div className="space-y-6">
            {/* Header / Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Circle */}
                <Card>
                    <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-2xl border border-white/10">
                        <div className="relative mb-4">
                            <svg className="w-28 h-28 transform -rotate-90">
                                <circle
                                    className="text-slate-700"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="48"
                                    cx="56"
                                    cy="56"
                                />
                                <circle
                                    className={`${getScoreColor(compliance_score)} transition-all duration-1000 ease-out`}
                                    strokeWidth="8"
                                    strokeDasharray={301.6}
                                    strokeDashoffset={301.6 * (1 - compliance_score / 100)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="48"
                                    cx="56"
                                    cy="56"
                                />
                            </svg>
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                <span className={`text-3xl font-bold ${getScoreColor(compliance_score)}`}>
                                    {compliance_score}%
                                </span>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-white">Compliance Score</h3>
                        <p className={`text-sm font-medium px-3 py-1 rounded-full mt-2 border ${getRiskColor(risk_level)}`}>
                            {risk_level}
                        </p>
                    </div>
                </Card>

                {/* Summary Text */}
                <div className="md:col-span-2">
                    <Card className="h-full">
                        <div className="h-full flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-2xl">📋</span> Company Validation Summary
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-sm">
                                {summary}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-2xl font-bold text-white">{analysis.total_clauses}</p>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide">Clauses</p>
                                </div>
                                <div className="text-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <p className="text-2xl font-bold text-emerald-400">
                                        {clause_results.filter(c => c.status === 'VALID').length}
                                    </p>
                                    <p className="text-xs text-emerald-400 uppercase tracking-wide">Valid</p>
                                </div>
                                <div className="text-center p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                    <p className="text-2xl font-bold text-amber-400">
                                        {clause_results.filter(c => c.status === 'RISKY').length}
                                    </p>
                                    <p className="text-xs text-amber-400 uppercase tracking-wide">Risky</p>
                                </div>
                                <div className="text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                    <p className="text-2xl font-bold text-red-400">
                                        {missing_clauses.length}
                                    </p>
                                    <p className="text-xs text-red-400 uppercase tracking-wide">Missing</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 gap-6">
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'summary'
                        ? 'border-primary-500 text-primary-400'
                        : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                >
                    Detailed Breakdown
                </button>
                <button
                    onClick={() => setActiveTab('missing')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'missing'
                        ? 'border-red-500 text-red-400'
                        : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                >
                    Missing Clauses ({missing_clauses.length})
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-4">
                {activeTab === 'summary' && (
                    <div className="space-y-4">
                        {clause_results.map((clause, idx) => (
                            <div
                                key={idx}
                                className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${clause.status === 'VALID' ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20' :
                                    clause.status === 'RISKY' ? 'bg-amber-500/5 border-amber-500/10' :
                                        'bg-red-500/5 border-red-500/10'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Clause {clause.clause_number}
                                            </span>
                                            <span className="text-xs font-bold text-slate-600">•</span>
                                            <span className="text-xs font-bold text-white uppercase">
                                                {clause.clause_type}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            clause.status === 'VALID' ? 'success' :
                                                clause.status === 'RISKY' ? 'medium' : 'high'
                                        }
                                        icon={
                                            clause.status === 'VALID' ? '✅' :
                                                clause.status === 'RISKY' ? '⚠️' : '❌'
                                        }
                                    >
                                        {clause.status}
                                    </Badge>
                                </div>

                                <p className="text-sm text-slate-300 italic mb-4 bg-black/20 p-3 rounded-lg border border-white/5">
                                    "{clause.clause_text}"
                                </p>

                                <div className="text-sm space-y-3">
                                    <p className="text-slate-200">
                                        <span className="font-semibold text-primary-300">Analysis:</span> {clause.reason}
                                    </p>
                                    <p className="text-slate-400 text-xs flex items-center gap-1">
                                        <span className="mx-1">⚖️</span>
                                        <span className="font-medium">Indian Law:</span> {clause.indian_law}
                                    </p>

                                    {clause.suggestion && (
                                        <div className="mt-2 text-sm bg-white/5 p-3 rounded-lg border border-white/10 text-slate-300">
                                            <span className="font-bold text-primary-400">💡 Suggestion:</span> {clause.suggestion}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'missing' && (
                    <div className="space-y-4">
                        {missing_clauses.length === 0 ? (
                            <div className="text-center py-12 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                <p className="text-emerald-400 font-medium">✨ All mandatory clauses are present!</p>
                            </div>
                        ) : (
                            missing_clauses.map((item, idx) => (
                                <div key={idx} className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 hover:bg-red-500/10 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-red-400 flex items-center gap-2">
                                            <span className="text-xl">🚫</span> Missing: {item.clause_type}
                                        </h3>
                                        {item.required && (
                                            <Badge variant="high" icon="❗">Mandatory</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-red-200/80 mt-2 mb-4">
                                        {item.reason}
                                    </p>

                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Suggested Clause Text:</p>
                                        <div className="relative group">
                                            <p className="text-sm text-slate-300 font-mono bg-white/5 p-3 rounded-lg border border-white/10">
                                                {item.suggested_text}
                                            </p>
                                            <button
                                                className="absolute top-2 right-2 text-xs text-primary-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded"
                                                onClick={() => navigator.clipboard.writeText(item.suggested_text)}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={onReset}
                className="w-full py-4 text-center text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium border border-white/10 border-dashed"
            >
                ← Validate Another Contract
            </button>
        </div>
    )
}
