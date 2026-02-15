import Card from './Card'

function SevenAnswers({ answers }) {
    if (!answers) return null

    const questions = [
        { key: 'pf_correct', question: '1. Is PF being cut correctly?', icon: '💰' },
        { key: 'deductions_comparison', question: '2. Are deductions higher/lower than standard?', icon: '📊' },
        { key: 'ctc_vs_inhand', question: '3. Is employee getting full in-hand or CTC illusion?', icon: '💵' },
        { key: 'legally_wrong', question: '4. Is company doing something legally wrong?', icon: '⚖️' },
        { key: 'ethically_questionable', question: '5. Is company doing something ethically questionable?', icon: '🤔' },
        { key: 'company_should_do', question: '6. What should company ideally do?', icon: '💡' },
        { key: 'employee_should_know', question: '7. What should employee understand before signing?', icon: '📝' }
    ]

    const getAnswerStyle = (answer) => {
        if (answer.includes('✓') || answer.includes('YES') || answer.includes('GOOD')) {
            return 'bg-emerald-500/10 border-emerald-500/20'
        } else if (answer.includes('✗') || answer.includes('NO -') || answer.includes('HIGH')) {
            return 'bg-red-500/10 border-red-500/20'
        } else {
            return 'bg-amber-500/10 border-amber-500/20'
        }
    }

    const getAnswerTextColor = (answer) => {
        if (answer.includes('✓') || answer.includes('YES') || answer.includes('GOOD')) {
            return 'text-emerald-200/90'
        } else if (answer.includes('✗') || answer.includes('NO -') || answer.includes('HIGH')) {
            return 'text-red-200/90'
        } else {
            return 'text-amber-200/90'
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">7 Key Questions Answered</h2>
                <span className="text-sm text-slate-400">Auto-generated insights</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {questions.map(({ key, question, icon }) => (
                    <Card key={key} className={`${getAnswerStyle(answers[key])} border transition-all hover:shadow-glow hover:-translate-y-0.5`}>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">{icon}</span>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white mb-2">{question}</h3>
                                <p className={`text-sm leading-relaxed whitespace-pre-line ${getAnswerTextColor(answers[key])}`}>
                                    {answers[key]}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default SevenAnswers
