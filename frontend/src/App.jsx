import { useState } from 'react'
import axios from 'axios'
import UploadCard from './components/UploadCard'
import RiskCard from './components/RiskCard'
import FloatingAIAssistant from './components/FloatingAIAssistant'
import ClauseTextPanel from './components/ClauseTextPanel'
import HRValidationPanel from './components/HRValidationPanel'
import Card from './components/Card'
import Badge from './components/Badge'
import ComparisonStats from './components/ComparisonStats'
import SevenAnswers from './components/SevenAnswers'
import SalaryBreakdownCard from './components/SalaryBreakdownCard'

const API_URL = 'http://localhost:8000'

function App() {
    // Mode state: 'general' or 'hr'
    const [mode, setMode] = useState('general')

    // State management
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [error, setError] = useState(null)

    // RAG Q&A state
    const [answer, setAnswer] = useState(null)
    const [askingQuestion, setAskingQuestion] = useState(false)
    const [qaError, setQaError] = useState(null)

    // Clause filtering state
    const [clauseFilter, setClauseFilter] = useState('all') // 'all' or 'risky'

    // Clause text panel state
    const [showClausePanel, setShowClausePanel] = useState(false)
    const [clausePanelData, setClausePanelData] = useState({ clauses: [], title: '' })

    // Handle file selection
    const handleFileSelect = (selectedFile) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (validTypes.includes(selectedFile.type)) {
            setFile(selectedFile)
            setError(null)
            setResults(null)
            setAnswer(null)
        } else {
            setError('Please upload a PDF or DOCX file only.')
            setFile(null)
        }
    }

    // Handle contract analysis
    const handleAnalyze = async () => {
        if (!file) {
            setError('Please select a file first.')
            return
        }

        setLoading(true)
        setError(null)
        setResults(null)
        setAnswer(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            // Endpoint depends on mode
            let endpoint
            if (mode === 'salary') {
                endpoint = `${API_URL}/salary/analyze`
            } else if (mode === 'hr') {
                endpoint = `${API_URL}/hr/validate`
            } else {
                endpoint = `${API_URL}/upload`
            }

            const response = await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setResults(response.data)
        } catch (err) {
            setError(err.response?.data?.detail || 'Error analyzing contract. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Handle RAG Q&A
    const handleAsk = async (question) => {
        if (!results) {
            setQaError('Please upload and analyze a contract first.')
            return
        }

        setAskingQuestion(true)
        setQaError(null)
        setAnswer(null)

        try {
            const response = await axios.post(`${API_URL}/ask`, {
                question: question.trim()
            })
            setAnswer(response.data)
        } catch (err) {
            setQaError(err.response?.data?.detail || 'Error getting answer. Please try again.')
        } finally {
            setAskingQuestion(false)
        }
    }

    // Handle clause filter click - Show panel with clause text
    const handleFilterClick = (filter) => {
        if (filter === 'all') {
            // Show all clauses from backend
            setClausePanelData({
                clauses: results.all_clauses || [],
                title: 'All Detected Clauses from Your PDF'
            })
        } else {
            // Show only risky clauses
            setClausePanelData({
                clauses: results.risky_clauses || [],
                title: 'Risky Clauses Detected'
            })
        }
        setShowClausePanel(true)
    }

    // Get filtered clauses
    const getFilteredClauses = () => {
        if (!results) return []
        if (clauseFilter === 'risky') {
            return results.risky_clauses || []
        }
        return results.risky_clauses || []
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">
                                    AI Legal Sentinel
                                </h1>
                                <p className="text-slate-400 text-xs font-medium">
                                    🇮🇳 India Edition
                                </p>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div className="bg-slate-800 p-1 rounded-xl flex border border-slate-700">
                            <button
                                onClick={() => { setMode('general'); setResults(null); setFile(null); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'general'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                            >
                                General Risk
                            </button>
                            <button
                                onClick={() => { setMode('hr'); setResults(null); setFile(null); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'hr'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                            >
                                Company Validation
                            </button>
                            <button
                                onClick={() => { setMode('salary'); setResults(null); setFile(null); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'salary'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                            >
                                💰 Salary Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Hero / Context Header */}
                {!results && (
                    <div className="text-center mb-10 animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">
                            {mode === 'general'
                                ? "Check Your Contract for Risks"
                                : mode === 'hr'
                                    ? "Validate Employment Contracts"
                                    : "Analyze Your Salary Annexure"}
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            {mode === 'general'
                                ? "Upload any contract to find risky clauses, unfair terms, and hidden liabilities using Indian Contract Act analysis."
                                : mode === 'hr'
                                    ? "Ensure your employment agreements comply with Indian Labour Laws. Check for mandatory clauses and forbidden terms."
                                    : "Upload your salary annexure to understand CTC breakdown, PF deductions, and get answers to 7 key questions about your compensation."}
                        </p>
                    </div>
                )}

                {/* Upload Section (shown when no results) */}
                {!results && (
                    <div className="max-w-xl mx-auto">
                        <UploadCard
                            onFileSelect={handleFileSelect}
                            selectedFile={file}
                            onAnalyze={handleAnalyze}
                            loading={loading}
                            mode={mode} // Pass mode for styling if needed
                        />
                        {error && (
                            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                                <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* RESULTS AREA */}
                {results && (
                    <>
                        {mode === 'salary' ? (
                            /* SALARY ANALYSIS DASHBOARD */
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                                {/* LEFT PANEL: Salary Breakdown */}
                                <div className="lg:col-span-1 space-y-4">
                                    <SalaryBreakdownCard breakdown={results.analysis?.salary_breakdown} />

                                    {/* Overall Verdict */}
                                    <Card>
                                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Overall Assessment</h3>
                                        <div className={`p-4 rounded-lg text-center ${results.analysis?.overall_verdict === 'GOOD' ? 'bg-green-50 border-2 border-green-200' :
                                            results.analysis?.overall_verdict === 'QUESTIONABLE' ? 'bg-amber-50 border-2 border-amber-200' :
                                                'bg-red-50 border-2 border-red-200'
                                            }`}>
                                            <p className={`text-2xl font-bold ${results.analysis?.overall_verdict === 'GOOD' ? 'text-green-700' :
                                                results.analysis?.overall_verdict === 'QUESTIONABLE' ? 'text-amber-700' :
                                                    'text-red-700'
                                                }`}>
                                                {results.analysis?.overall_verdict === 'GOOD' ? '✓ GOOD' :
                                                    results.analysis?.overall_verdict === 'QUESTIONABLE' ? '⚠ QUESTIONABLE' :
                                                        '✗ NEEDS REVIEW'}
                                            </p>
                                        </div>
                                    </Card>

                                    <button
                                        onClick={() => { setResults(null); setFile(null); setAnswer(null); }}
                                        className="w-full px-4 py-3 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border-2 border-slate-200 font-medium"
                                    >
                                        ← Analyze New Salary Document
                                    </button>
                                </div>

                                {/* RIGHT PANEL: Comparison Stats + 7 Answers */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Comparison Stats */}
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-4">📊 Comparison with Standards</h2>
                                        <ComparisonStats data={results.analysis?.comparison_stats} />
                                    </div>

                                    {/* 7 Auto-Answers */}
                                    <SevenAnswers answers={results.analysis?.seven_answers} />
                                </div>
                            </div>
                        ) : mode === 'general' ? (
                            /* GENERAL RISK DASHBOARD */
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                                {/* LEFT PANEL: Summary */}
                                <div className="lg:col-span-1 space-y-4">
                                    <Card>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                📊 Contract Summary
                                            </h2>
                                            <Badge variant="default" icon="✅">
                                                Complete
                                            </Badge>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-slate-600 mb-1">📄 File Name</p>
                                                <p className="font-medium text-slate-900 truncate">{file?.name}</p>
                                            </div>

                                            {/* Clickable Summary Cards */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Total Clauses */}
                                                <button
                                                    onClick={() => handleFilterClick('all')}
                                                    className={`bg-slate-50 hover:bg-slate-100 rounded-xl p-4 transition-all duration-200 border-2 ${clauseFilter === 'all' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'}`}
                                                >
                                                    <p className="text-2xl font-bold text-slate-900">
                                                        {results.total_clauses_analyzed}
                                                    </p>
                                                    <p className="text-xs text-slate-600 font-medium mt-1">📑 Total Clauses</p>
                                                </button>

                                                {/* Risky Clauses */}
                                                <button
                                                    onClick={() => handleFilterClick('risky')}
                                                    className={`bg-red-50 hover:bg-red-100 rounded-xl p-4 transition-all duration-200 border-2 ${clauseFilter === 'risky' ? 'border-red-500 ring-2 ring-red-200' : 'border-red-200'}`}
                                                >
                                                    <p className="text-2xl font-bold text-red-600">
                                                        {results.risky_clauses_found}
                                                    </p>
                                                    <p className="text-xs text-red-700 font-medium mt-1">⚠️ Risky Clauses</p>
                                                </button>
                                            </div>

                                            {/* Overall Risk */}
                                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                                <p className="text-sm font-semibold text-blue-900 mb-2">Overall Risk Score</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-white rounded-full h-3 shadow-inner">
                                                        <div
                                                            className={`h-3 rounded-full transition-all ${results.overall_risk_score >= 8 ? 'bg-red-500' :
                                                                results.overall_risk_score >= 5 ? 'bg-amber-500' : 'bg-green-500'
                                                                }`}
                                                            style={{ width: `${results.overall_risk_score * 10}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xl font-bold text-blue-700">
                                                        {results.overall_risk_score}/10
                                                    </span>
                                                </div>
                                                <p className="text-xs text-blue-700 mt-2 font-medium">
                                                    {results.overall_risk_category}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => { setResults(null); setFile(null); setAnswer(null); }}
                                                className="w-full px-4 py-3 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border-2 border-slate-200 font-medium"
                                            >
                                                ← Analyze New Contract
                                            </button>
                                        </div>
                                    </Card>
                                </div>

                                {/* RIGHT PANEL: Risky Clauses */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            {clauseFilter === 'risky' ? '⚠️ Risky Clauses' : '📑 All Clauses'}
                                        </h2>
                                        <Badge variant="high" icon="Target">
                                            {getFilteredClauses().length} Found
                                        </Badge>
                                    </div>

                                    <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                                        {getFilteredClauses().length === 0 ? (
                                            <Card>
                                                <div className="text-center py-8">
                                                    <p className="text-lg font-semibold text-green-800">No Risky Clauses Detected</p>
                                                    <p className="text-sm text-green-700">The contract appears safe.</p>
                                                </div>
                                            </Card>
                                        ) : (
                                            getFilteredClauses().map((clause, index) => (
                                                <RiskCard key={index} clause={clause} index={index} />
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* HR VALIDATION DASHBOARD */
                            <div className="animate-fade-in">
                                <HRValidationPanel
                                    results={results}
                                    onReset={() => { setResults(null); setFile(null); }}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-slate-700 mt-12 py-8">
                <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
                    <p>AI Legal Sentinel • Powered by Gemini • Indian Law Context</p>
                </div>
            </footer>

            {/* Floating AI Assistant (Available in both modes) */}
            {results && (
                <FloatingAIAssistant
                    onAsk={handleAsk}
                    answer={answer}
                    loading={askingQuestion}
                    error={qaError}
                />
            )}

            {/* Clause Text Panel (modal) */}
            {showClausePanel && mode === 'general' && (
                <ClauseTextPanel
                    clauses={clausePanelData.clauses}
                    title={clausePanelData.title}
                    onClose={() => setShowClausePanel(false)}
                />
            )}
        </div>
    )
}

export default App
