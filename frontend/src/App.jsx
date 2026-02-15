import { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
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

const API_URL = 'https://vivek-9o1q.onrender.com'

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 animate-pulse">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" />
    }

    return children
}

function Home() {
    const { user, signOut } = useAuth()

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
                title: 'All Detected Clauses'
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
        <div className="min-h-screen text-slate-100 flex flex-col font-sans">
            {/* Glass Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold font-display tracking-tight text-white">
                                    AI Legal Sentinel
                                </h1>
                                <p className="text-primary-200 text-xs font-medium">
                                    Trusted Contract Analysis
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Mode Switcher Tabs */}
                            <div className="glass-card p-1 flex w-full md:w-auto overflow-x-auto no-scrollbar">
                                {[
                                    { id: 'general', label: 'General Risk', emoji: '🛡️' },
                                    { id: 'hr', label: 'HR Check', emoji: '👔' },
                                    { id: 'salary', label: 'Salary', emoji: '💰' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setMode(tab.id); setResults(null); setFile(null); }}
                                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${mode === tab.id
                                            ? 'bg-primary-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="mr-2">{tab.emoji}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* User Profile / Logout */}
                            <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
                                <div className="flex flex-col items-end hidden sm:flex">
                                    <span className="text-sm font-bold text-white">
                                        {user.user_metadata?.full_name || user.email.split('@')[0]}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {user.email}
                                    </span>
                                </div>
                                {/* Profile Icon */}
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/30 text-white font-bold text-sm">
                                    {(user.user_metadata?.full_name?.[0] || user.email[0]).toUpperCase()}
                                </div>

                                <button
                                    onClick={signOut}
                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    title="Sign Out"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
                {/* Hero / Context Header */}
                {!results && (
                    <div className="text-center mb-10 animate-fade-in-up">
                        <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-4 leading-tight">
                            {mode === 'general'
                                ? "Uncover Hidden Risks in Contracts"
                                : mode === 'hr'
                                    ? "Validate Employment Agreements"
                                    : "Decode Your Salary Structure"}
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            {mode === 'general'
                                ? "Instant analysis using Indian Contract Act standards. Detect unfair terms and liabilities in seconds."
                                : mode === 'hr'
                                    ? "Ensure compliance with Indian Labour Laws. We check for mandatory clauses and forbiddden terms."
                                    : "Visualize your in-hand salary, PF deductions, and tax implications clearly."}
                        </p>
                    </div>
                )}

                {/* Upload Section (shown when no results) */}
                {!results && (
                    <div className="max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <UploadCard
                            onFileSelect={handleFileSelect}
                            selectedFile={file}
                            onAnalyze={handleAnalyze}
                            loading={loading}
                            mode={mode} // Pass mode for styling if needed
                        />
                        {error && (
                            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-pulse-slow">
                                <p className="text-sm text-red-300 font-medium flex items-center gap-2">
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
                    <div className="animate-fade-in-up">
                        {mode === 'salary' ? (
                            /* SALARY ANALYSIS DASHBOARD */
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* LEFT PANEL: Salary Breakdown */}
                                <div className="lg:col-span-1 space-y-4">
                                    <SalaryBreakdownCard breakdown={results.analysis?.salary_breakdown} />

                                    {/* Overall Verdict */}
                                    <Card>
                                        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Overall Assessment</h3>
                                        <div className={`p-4 rounded-xl text-center border ${results.analysis?.overall_verdict === 'GOOD' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                            results.analysis?.overall_verdict === 'QUESTIONABLE' ? 'bg-amber-500/10 border-amber-500/20' :
                                                'bg-red-500/10 border-red-500/20'
                                            }`}>
                                            <p className={`text-2xl font-bold ${results.analysis?.overall_verdict === 'GOOD' ? 'text-emerald-400' :
                                                results.analysis?.overall_verdict === 'QUESTIONABLE' ? 'text-amber-400' :
                                                    'text-red-400'
                                                }`}>
                                                {results.analysis?.overall_verdict === 'GOOD' ? '✓ GOOD' :
                                                    results.analysis?.overall_verdict === 'QUESTIONABLE' ? '⚠ QUESTIONABLE' :
                                                        '✗ NEEDS REVIEW'}
                                            </p>
                                        </div>
                                    </Card>

                                    <button
                                        onClick={() => { setResults(null); setFile(null); setAnswer(null); }}
                                        className="w-full btn-secondary text-sm"
                                    >
                                        ← Analyze Another
                                    </button>
                                </div>

                                {/* RIGHT PANEL: Comparison Stats + 7 Answers */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Comparison Stats */}
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-4">📊 Market Comparison</h2>
                                        <ComparisonStats data={results.analysis?.comparison_stats} />
                                    </div>

                                    {/* 7 Auto-Answers */}
                                    <SevenAnswers answers={results.analysis?.seven_answers} />
                                </div>
                            </div>
                        ) : mode === 'general' ? (
                            /* GENERAL RISK DASHBOARD */
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* LEFT PANEL: Summary */}
                                <div className="lg:col-span-1 space-y-6">
                                    <Card>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-semibold text-white">
                                                Analysis Report
                                            </h2>
                                            <Badge variant="success" icon="✓">
                                                Done
                                            </Badge>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">File Analyzed</p>
                                                <div className="text-sm font-medium text-slate-300 break-all bg-white/5 p-3 rounded-lg border border-white/5">
                                                    {file?.name}
                                                </div>
                                            </div>

                                            {/* Clickable Summary Cards */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Total Clauses */}
                                                <button
                                                    onClick={() => handleFilterClick('all')}
                                                    className={`glass rounded-xl p-4 transition-all duration-300 hover:bg-white/10 text-left group ${clauseFilter === 'all' ? 'ring-2 ring-primary-500/50' : ''}`}
                                                >
                                                    <p className="text-3xl font-bold text-white group-hover:scale-110 transition-transform origin-left">
                                                        {results.total_clauses_analyzed}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase">Total Clauses</p>
                                                </button>

                                                {/* Risky Clauses */}
                                                <button
                                                    onClick={() => handleFilterClick('risky')}
                                                    className={`glass rounded-xl p-4 transition-all duration-300 hover:bg-white/10 text-left group border-red-500/20 ${clauseFilter === 'risky' ? 'ring-2 ring-red-500/50' : ''}`}
                                                >
                                                    <p className="text-3xl font-bold text-red-400 group-hover:scale-110 transition-transform origin-left">
                                                        {results.risky_clauses_found}
                                                    </p>
                                                    <p className="text-xs text-red-300/80 font-medium mt-1 uppercase">Risky Items</p>
                                                </button>
                                            </div>

                                            {/* Overall Risk */}
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                                <div className="flex justify-between items-end mb-2">
                                                    <p className="text-sm font-semibold text-slate-300">Risk Score</p>
                                                    <span className={`text-2xl font-bold ${results.overall_risk_score >= 8 ? 'text-red-400' :
                                                        results.overall_risk_score >= 5 ? 'text-amber-400' : 'text-emerald-400'
                                                        }`}>
                                                        {results.overall_risk_score}/10
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${results.overall_risk_score >= 8 ? 'bg-red-500' :
                                                            results.overall_risk_score >= 5 ? 'bg-amber-500' : 'bg-emerald-500'
                                                            }`}
                                                        style={{ width: `${results.overall_risk_score * 10}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-400 mt-3 font-medium text-right">
                                                    {results.overall_risk_category} Risk Level
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => { setResults(null); setFile(null); setAnswer(null); }}
                                                className="w-full btn-secondary text-sm"
                                            >
                                                ← Analyze New Contract
                                            </button>
                                        </div>
                                    </Card>
                                </div>

                                {/* RIGHT PANEL: Risky Clauses */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            {clauseFilter === 'risky' ? '⚠️ Risk Analysis' : '📑 Full Contract Analysis'}
                                        </h2>
                                        <Badge variant="outline">
                                            {getFilteredClauses().length} Items
                                        </Badge>
                                    </div>

                                    <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                        {getFilteredClauses().length === 0 ? (
                                            <Card className="flex flex-col items-center justify-center py-12 text-center">
                                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <p className="text-lg font-semibold text-emerald-400">No Risky Clauses Detected</p>
                                                <p className="text-slate-400 max-w-xs mt-2">The contract appears safe based on our standard risk parameters.</p>
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
                            <div className="animate-fade-in-up">
                                <HRValidationPanel
                                    results={results}
                                    onReset={() => { setResults(null); setFile(null); }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="glass border-t border-white/5 py-8 mt-auto">
                <div className="max-w-5xl mx-auto px-6 text-center text-slate-500 text-sm">
                    <p>© 2024 AI Legal Sentinel • Powered by Gemini Pro • India Edition</p>
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

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
