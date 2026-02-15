import { useState } from 'react'
import Card from './Card'
import Button from './Button'

// Professional Upload Card with Drag & Drop
export default function UploadCard({ onFileSelect, selectedFile, onAnalyze, loading, mode }) {
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0])
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {mode === 'salary' ? 'Upload Your Salary Annexure' : 'Upload Your Contract'}
                </h2>
                <p className="text-slate-400">
                    {mode === 'salary'
                        ? 'Get CTC breakdown, PF analysis, and answers to 7 key questions'
                        : mode === 'hr'
                            ? 'Validate under Indian Labour Laws'
                            : 'Analyze under Indian Contract Act, 1872'
                    }
                </p>
            </div>

            {/* Drag & Drop Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${dragActive
                        ? 'border-primary-400 bg-primary-400/10'
                        : 'border-white/10 hover:border-primary-400/50 hover:bg-white/5'
                    }
        `}
            >
                <div className="flex flex-col items-center gap-6">
                    {/* Upload Icon */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${dragActive ? 'bg-primary-500/20 scale-110' : 'bg-white/5'}`}>
                        <svg className={`w-10 h-10 transition-colors ${dragActive ? 'text-primary-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>

                    {selectedFile ? (
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-white">
                                {selectedFile.name}
                            </p>
                            <p className="text-sm text-slate-400">
                                {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-lg font-medium text-slate-200">
                                {mode === 'salary'
                                    ? 'Drop your salary annexure here'
                                    : 'Drop your contract here'
                                }
                            </p>
                            <p className="text-sm text-slate-500">
                                Supports PDF and DOCX files
                            </p>
                        </div>
                    )}

                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.docx"
                        onChange={handleChange}
                    />
                    <label
                        htmlFor="file-upload"
                        className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/30 rounded-xl font-medium transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Browse Files
                    </label>
                </div>
            </div>

            {/* Privacy Note */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Files are processed in-memory and never stored</span>
            </div>

            {/* Analyze Button */}
            {selectedFile && (
                <div className="mt-8 animate-fade-in-up">
                    <Button
                        onClick={onAnalyze}
                        disabled={loading}
                        className="w-full text-lg py-4 shadow-primary-500/25"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-3">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Analyzing...
                            </span>
                        ) : (
                            mode === 'salary' ? 'Analyze Salary Structure' : 'Analyze Contract Risks'
                        )}
                    </Button>
                </div>
            )}
        </Card>
    )
}
