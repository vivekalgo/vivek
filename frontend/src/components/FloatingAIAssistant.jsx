import { useState } from 'react'
import Button from './Button'
import Badge from './Badge'

// Floating AI Assistant with slide-in panel
export default function FloatingAIAssistant({ onAsk, answer, loading, error }) {
    const [isOpen, setIsOpen] = useState(false)
    const [question, setQuestion] = useState('')
    const [isListening, setIsListening] = useState(false)

    const suggestedQuestions = [
        "What are the risky clauses?",
        "Can I work with other clients?",
        "Who owns the IP?",
        "Can they fire me anytime?",
        "What should I negotiate?"
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

    const startListening = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition()
            recognition.continuous = false
            recognition.lang = 'en-IN' // Optimized for Indian English

            recognition.onstart = () => setIsListening(true)
            recognition.onend = () => setIsListening(false)

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                setQuestion(prev => (prev ? prev + " " + transcript : transcript))
            }

            recognition.start()
        } else {
            alert("Voice search is not supported in this browser. Please use Chrome or Edge.")
        }
    }

    return (
        <>
            {/* Floating Icon (always visible) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 group"
                    aria-label="Open AI Legal Assistant"
                >
                    {/* Icon with pulsing glow */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 animate-pulse" />
                        <div className="relative bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full p-4 shadow-2xl hover:shadow-primary-500/50 transition-all hover:scale-110">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                    </div>

                    {/* Label */}
                    <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">AI Legal Assistant</span>
                                <Badge variant="ai" icon="✨">Ask Questions</Badge>
                            </div>
                            <div className="text-xs text-slate-300 mt-1">
                                Get instant answers from your contract
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* Slide-in Chat Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <h2 className="text-xl font-bold">AI Legal Assistant</h2>
                                </div>
                                <p className="text-sm text-primary-100">
                                    Answers strictly from your uploaded contract
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                aria-label="Close panel"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-slate-50">
                            {/* Suggested Questions (shown when no answer) */}
                            {!answer && !loading && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <p className="font-semibold">Quick Questions:</p>
                                    </div>
                                    {suggestedQuestions.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSuggestionClick(q)}
                                            className="block w-full text-left px-4 py-3 text-sm text-slate-700 bg-white hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 rounded-xl border-2 border-slate-200 transition-all hover:shadow-md hover:scale-[1.02]"
                                        >
                                            <span className="font-medium">"{q}"</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Answer Display */}
                            {answer && (
                                <div className="space-y-4">
                                    {/* Question */}
                                    <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4">
                                        <p className="text-xs font-semibold text-primary-600 mb-1 uppercase tracking-wide">
                                            Your Question
                                        </p>
                                        <p className="text-sm text-primary-900 font-medium">{answer.question}</p>
                                    </div>

                                    {/* Answer */}
                                    <div className="bg-white border-2 border-green-200 rounded-xl p-5 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-bold text-green-900">Answer</p>
                                            {answer.ai_enabled && (
                                                <Badge variant="ai" icon="✨">AI Generated</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                                            {answer.answer}
                                        </p>
                                    </div>

                                    {/* Context (Collapsible) */}
                                    {answer.context_used && (
                                        <details className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                                            <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                                View Retrieved Context
                                            </summary>
                                            <div className="mt-3 space-y-2 text-xs">
                                                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                                    <p className="font-semibold text-indigo-900 mb-1">📜 Indian Law:</p>
                                                    <p className="text-indigo-800">{answer.context_used.law_sections_retrieved}</p>
                                                </div>
                                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="font-semibold text-blue-900 mb-1">📄 Contract Clauses:</p>
                                                    <p className="text-blue-800">{answer.context_used.contract_clauses_retrieved}</p>
                                                </div>
                                            </div>
                                        </details>
                                    )}

                                    {/* Disclaimer */}
                                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                        <div className="flex items-start gap-2">
                                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <p className="text-xs text-amber-800">
                                                <span className="font-semibold">Disclaimer:</span> {answer.disclaimer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-4 font-medium">Analyzing your contract...</p>
                                    <p className="text-xs text-slate-500 mt-1">Retrieving relevant clauses and laws</p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-slate-200 bg-white p-4">
                            <div className="flex gap-2 relative">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                                    placeholder={isListening ? "Listening..." : "Ask about this contract..."}
                                    className={`flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm pr-12 ${isListening ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50' : 'border-slate-300'}`}
                                />

                                {/* Voice Search Button */}
                                <button
                                    onClick={startListening}
                                    className={`absolute right-[4.5rem] top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-slate-400 hover:text-primary-600 hover:bg-slate-100'}`}
                                    title="Voice Search"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </button>

                                <Button onClick={handleAsk} disabled={!question.trim() || loading}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
