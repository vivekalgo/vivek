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
            return 'bg-green-50 border-green-200'
        } else if (answer.includes('✗') || answer.includes('NO -') || answer.includes('HIGH')) {
            return 'bg-red-50 border-red-200'
        } else {
            return 'bg-amber-50 border-amber-200'
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">7 Key Questions Answered</h2>
                <span className="text-sm text-slate-600">Auto-generated insights</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {questions.map(({ key, question, icon }) => (
                    <Card key={key} className={`${getAnswerStyle(answers[key])} border-2 transition-all hover:shadow-md`}>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">{icon}</span>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 mb-2">{question}</h3>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
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
