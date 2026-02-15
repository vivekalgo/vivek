import { useState } from 'react'
import Card from './Card'
import Badge from './Badge'

// Simple panel to show clause text from uploaded PDF
export default function ClauseTextPanel({ clauses, title, onClose }) {
    if (!clauses || clauses.length === 0) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </span>
                            {title}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1 pl-10">
                            Detected from your uploaded contract
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Clause List */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-900/50">
                    <div className="space-y-4">
                        {clauses.map((clause, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary-500/10 rounded-full flex items-center justify-center border border-primary-500/20">
                                        <span className="text-sm font-bold text-primary-400">{index + 1}</span>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-white">
                                                {clause.clause_type}
                                            </h3>
                                            {clause.risk_level && (
                                                <Badge
                                                    variant={
                                                        clause.risk_level === 'HIGH' || clause.risk_level === 'High' ? 'high' :
                                                            clause.risk_level === 'MEDIUM' || clause.risk_level === 'Medium' ? 'medium' :
                                                                'low'
                                                    }
                                                    icon="⚠️"
                                                >
                                                    {clause.risk_level} Risk
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                                            <p className="text-sm text-slate-300 leading-relaxed italic font-mono">
                                                "{clause.clause_text}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            Total: <span className="font-semibold text-white">{clauses.length} clauses</span>
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-900/20"
                        >
                            Close Panel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
