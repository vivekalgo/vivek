import { useState } from 'react'
import Card from './Card'
import Badge from './Badge'

// Simple panel to show clause text from uploaded PDF
export default function ClauseTextPanel({ clauses, title, onClose }) {
    if (!clauses || clauses.length === 0) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {title}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            Detected from your uploaded contract
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Clause List */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-4">
                        {clauses.map((clause, index) => (
                            <Card key={index} className="border-l-4 border-l-blue-500">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 mb-2">
                                            {clause.clause_type}
                                        </h3>
                                        <p className="text-sm text-slate-700 leading-relaxed italic">
                                            "{clause.clause_text}"
                                        </p>
                                        {clause.risk_level && (
                                            <div className="mt-2">
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
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Total: <span className="font-semibold text-slate-900">{clauses.length} clauses</span>
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
