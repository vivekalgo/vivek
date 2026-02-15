import { useState, useRef, useEffect } from 'react'
import Button from './Button'
import Badge from './Badge'

// Floating AI Assistant with slide-in panel
export default function FloatingAIAssistant({ onAsk, answer, loading, error }) {
    const [isOpen, setIsOpen] = useState(false)
    const [question, setQuestion] = useState('')
    const [isListening, setIsListening] = useState(false)
    const messagesEndRef = useRef(null)

    const suggestedQuestions = [
        "What are the risky clauses?",
        "Can I work with other clients?",
        "Who owns the IP?",
        "Can they fire me anytime?",
        "What should I negotiate?"
    ]

    useEffect(() => {
        if (answer) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [answer, loading])

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
                        <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 animate-pulse" />
                        <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full p-4 shadow-2xl hover:shadow-primary-500/50 transition-all hover:scale-110">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                    </div>

                    {/* Label */}
                    <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="glass text-white text-sm px-4 py-2 rounded-xl shadow-lg whitespace-nowrap border border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">AI Legal Assistant</span>
                                <Badge variant="ai" icon="✨">Ask Me</Badge>
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
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col animate-slide-in-right border-l border-white/10">
                        {/* Header */}
                        <div className="bg-white/5 border-b border-white/10 text-white px-6 py-4 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold font-display">Contract Assistant</h2>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Ask questions about your uploaded document
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
                                aria-label="Close panel"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {/* Suggested Questions (shown when no answer) */}
                            {!answer && !loading && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <p className="font-semibold text-sm uppercase tracking-wide">Quick Actions</p>
                                    </div>
                                    <div className="grid gap-3">
                                        {suggestedQuestions.map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSuggestionClick(q)}
                                                className="w-full text-left px-4 py-3 text-sm text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl border border-white/5 hover:border-white/20 transition-all hover:shadow-lg hover:translate-x-1"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Answer Display */}
                            {answer && (
                                <div className="space-y-6 animate-fade-in-up">
                                    {/* Question */}
                                    <div className="flex justify-end">
                                        <div className="bg-primary-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-lg shadow-primary-900/20">
                                            <p className="text-sm font-medium">{answer.question}</p>
                                        </div>
                                    </div>

                                    {/* Answer */}
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center shadow-lg">
                                            <span className="text-white text-xs font-bold">AI</span>
                                        </div>
                                        <div className="space-y-3 flex-1">
                                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-5 shadow-lg">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <p className="text-sm font-bold text-slate-200">Analysis Result</p>
                                                    {answer.ai_enabled && (
                                                        <Badge variant="ai" icon="✨">AI</Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-300 leading-relaxed space-y-2 whitespace-pre-wrap">
                                                    {answer.answer}
                                                </div>
                                            </div>

                                            {/* Context (Collapsible) */}
                                            {answer.context_used && (
                                                <details className="group">
                                                    <summary className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-300 flex items-center gap-2 transition-colors">
                                                        <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                        Source context
                                                    </summary>
                                                    <div className="mt-2 space-y-2 text-xs pl-6">
                                                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                                            <p className="font-semibold text-indigo-300 mb-1">📜 Indian Law:</p>
                                                            <p className="text-indigo-200/80 italic">{answer.context_used.law_sections_retrieved}</p>
                                                        </div>
                                                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                                            <p className="font-semibold text-blue-300 mb-1">📄 Contract Clauses:</p>
                                                            <p className="text-blue-200/80 italic">{answer.context_used.contract_clauses_retrieved}</p>
                                                        </div>
                                                    </div>
                                                </details>
                                            )}
                                        </div>
                                    </div>

                                    {/* Disclaimer */}
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-3 items-start">
                                        <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <p className="text-xs text-amber-200/80">
                                            <span className="font-semibold text-amber-400">Disclaimer:</span> {answer.disclaimer}
                                        </p>
                                    </div>
                                    <div ref={messagesEndRef} />
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-12 animate-pulse">
                                    <div className="w-12 h-12 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4" />
                                    <p className="text-sm text-slate-400">Consulting legal database...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start">
                                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-300">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="bg-white/5 border-t border-white/10 p-4 backdrop-blur-md">
                            <div className="flex gap-2 relative">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                                    placeholder={isListening ? "Listening..." : "Ask a legal question..."}
                                    className={`flex-1 glass-input pr-12 ${isListening ? 'ring-2 ring-red-500/50 border-red-500/50' : ''}`}
                                />

                                {/* Voice Search Button */}
                                <button
                                    onClick={startListening}
                                    className={`absolute right-[4.5rem] top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${isListening ? 'text-red-400 animate-pulse bg-red-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                                    title="Voice Search"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </button>

                                <Button
                                    onClick={handleAsk}
                                    disabled={!question.trim() || loading}
                                    className="!px-3 !py-3 !rounded-xl"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
