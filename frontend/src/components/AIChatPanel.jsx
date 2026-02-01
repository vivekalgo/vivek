import { useState } from 'react'
import Card from './Card'
import Button from './Button'
import Badge from './Badge'

// AI Chat Panel for RAG Q&A
export default function AIChatPanel({ onAsk, answer, loading, error }) {
    const [question, setQuestion] = useState('')

    const suggestedQuestions = [
        "What are the risky clauses in this contract?",
        "Can I work with other clients?",
        "Who owns the intellectual property?",
        "Is there unlimited liability?",
        "What should I negotiate before signing?"
    ]

    const handleAsk = () => {
        if (question.trim()) {
            onAsk(question)
            setQuestion('')
        }
    }

    const handleSuggestionClick = (suggestion) => {
        setQuestion(suggestion)
    }

    return (
        <Card className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                        AI Legal Q&A
                    </h3>
                    <Badge variant="ai" icon="🤖">
                        RAG Powered
                    </Badge>
                </div>
                <p className="text-sm text-slate-600">
                    Ask questions about your contract
                </p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 mb-4 space-y-4 custom-scrollbar overflow-y-auto max-h-96">
                {/* Suggested Questions (shown when no answer) */}
                {!answer && !loading && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">💭 Try asking:</p>
                        {suggestedQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(q)}
                                className="block w-full text-left px-3 py-2 text-sm text-slate-600 bg-slate-50 hover:bg-primary-50 hover:text-primary-700 rounded-lg border border-slate-200 hover:border-primary-300 transition-colors"
                            >
                                "{q}"
                            </button>
                        ))}
                    </div>
                )}

                {/* Answer Display */}
                {answer && (
                    <div className="space-y-3">
                        {/* Question */}
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-primary-900 mb-1">
                                ❓ Your Question:
                            </p>
                            <p className="text-sm text-primary-800">{answer.question}</p>
                        </div>

                        {/* Answer */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <p className="text-sm font-semibold text-green-900">💡 Answer:</p>
                                {answer.ai_enabled && (
                                    <Badge variant="ai" icon="✨">
                                        AI Generated
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed">
                                {answer.answer}
                            </p>
                        </div>

                        {/* Context (Collapsible) */}
                        {answer.context_used && (
                            <details className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
                                    📚 View Retrieved Context
                                </summary>
                                <div className="mt-3 space-y-2 text-xs">
                                    <div className="p-2 bg-indigo-50 border border-indigo-200 rounded">
                                        <p className="font-semibold text-indigo-900 mb-1">📜 Indian Law:</p>
                                        <p className="text-indigo-800">{answer.context_used.law_sections_retrieved}</p>
                                    </div>
                                    <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                                        <p className="font-semibold text-blue-900 mb-1">📄 Contract Clauses:</p>
                                        <p className="text-blue-800">{answer.context_used.contract_clauses_retrieved}</p>
                                    </div>
                                </div>
                            </details>
                        )}

                        {/* Disclaimer */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-800">
                                <span className="font-semibold">⚠️ Disclaimer:</span> {answer.disclaimer}
                            </p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-3">
                            <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-sm text-slate-600">Searching contract and law sections...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 pt-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                        placeholder="Ask about this contract..."
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Button onClick={handleAsk} disabled={!question.trim() || loading}>
                        Ask
                    </Button>
                </div>
            </div>
        </Card>
    )
}
