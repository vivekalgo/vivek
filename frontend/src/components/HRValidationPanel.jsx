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
        if (level === 'High Risk') return 'text-red-600 bg-red-50 border-red-200'
        if (level === 'Medium Risk') return 'text-amber-600 bg-amber-50 border-amber-200'
        return 'text-green-600 bg-green-50 border-green-200'
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 50) return 'text-amber-600'
        return 'text-red-600'
    }

    return (
        <div className="space-y-6">
            {/* Header / Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Circle */}
                <Card>
                    <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl">
                        <div className="relative mb-3">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle
                                    className="text-slate-200"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="40"
                                    cx="48"
                                    cy="48"
                                />
                                <circle
                                    className={`${getScoreColor(compliance_score)} transition-all duration-1000 ease-out`}
                                    strokeWidth="8"
                                    strokeDasharray={251.2}
                                    strokeDashoffset={251.2 * (1 - compliance_score / 100)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="40"
                                    cx="48"
                                    cy="48"
                                />
                            </svg>
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                <span className={`text-2xl font-bold ${getScoreColor(compliance_score)}`}>
                                    {compliance_score}%
                                </span>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Compliance Score</h3>
                        <p className={`text-sm font-medium px-3 py-1 rounded-full mt-2 border ${getRiskColor(risk_level)}`}>
                            {risk_level}
                        </p>
                    </div>
                </Card>

                {/* Summary Text */}
                <div className="md:col-span-2">
                    <Card>
                        <div className="h-full flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <span className="text-2xl">📋</span> Company Validation Summary
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {summary}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-2xl font-bold text-slate-900">{analysis.total_clauses}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Clauses</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-2xl font-bold text-green-600">
                                        {clause_results.filter(c => c.status === 'VALID').length}
                                    </p>
                                    <p className="text-xs text-green-600 uppercase tracking-wide">Valid</p>
                                </div>
                                <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <p className="text-2xl font-bold text-amber-600">
                                        {clause_results.filter(c => c.status === 'RISKY').length}
                                    </p>
                                    <p className="text-xs text-amber-600 uppercase tracking-wide">Risky</p>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                                    <p className="text-2xl font-bold text-red-600">
                                        {missing_clauses.length}
                                    </p>
                                    <p className="text-xs text-red-600 uppercase tracking-wide">Missing</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-6">
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'summary'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Detailed Breakdown
                </button>
                <button
                    onClick={() => setActiveTab('missing')}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'missing'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
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
                                className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${clause.status === 'VALID' ? 'bg-white border-green-100 hover:border-green-200' :
                                    clause.status === 'RISKY' ? 'bg-amber-50 border-amber-200' :
                                        'bg-red-50 border-red-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Clause {clause.clause_number}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400">•</span>
                                            <span className="text-xs font-bold text-indigo-600 uppercase">
                                                {clause.clause_type}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            clause.status === 'VALID' ? 'default' :
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

                                <p className="text-sm text-slate-800 italic mb-3 bg-white/50 p-2 rounded border border-slate-100">
                                    "{clause.clause_text}"
                                </p>

                                <div className="text-sm space-y-2">
                                    <p className="text-slate-700">
                                        <span className="font-semibold">Analysis:</span> {clause.reason}
                                    </p>
                                    <p className="text-slate-600 text-xs flex items-center gap-1">
                                        <span className="mx-1">⚖️</span>
                                        <span className="font-medium">Indian Law:</span> {clause.indian_law}
                                    </p>

                                    {clause.suggestion && (
                                        <div className="mt-2 text-sm bg-white p-3 rounded-lg border border-slate-200 text-slate-700">
                                            <span className="font-bold text-indigo-600">💡 Suggestion:</span> {clause.suggestion}
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
                            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-200">
                                <p className="text-green-800 font-medium">✨ All mandatory clauses are present!</p>
                            </div>
                        ) : (
                            missing_clauses.map((item, idx) => (
                                <div key={idx} className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-red-800 flex items-center gap-2">
                                            <span className="text-xl">🚫</span> Missing: {item.clause_type}
                                        </h3>
                                        {item.required && (
                                            <Badge variant="high" icon="❗">Mandatory</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-red-700 mt-2 mb-4">
                                        {item.reason}
                                    </p>

                                    <div className="bg-white p-4 rounded-lg border border-red-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Suggested Clause Text:</p>
                                        <p className="text-sm text-slate-800 font-mono bg-slate-50 p-3 rounded border border-slate-200">
                                            {item.suggested_text}
                                        </p>
                                        <button
                                            className="mt-2 text-xs text-indigo-600 font-medium hover:underline"
                                            onClick={() => navigator.clipboard.writeText(item.suggested_text)}
                                        >
                                            Copy to clipboard
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={onReset}
                className="w-full py-4 text-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors font-medium border-2 border-slate-200 border-dashed"
            >
                ← Validate Another Contract
            </button>
        </div>
    )
}
