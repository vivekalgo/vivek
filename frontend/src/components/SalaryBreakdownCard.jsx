import Card from './Card'
import Badge from './Badge'

function SalaryBreakdownCard({ breakdown }) {
    if (!breakdown) return null

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const getInHandColor = (percentage) => {
        if (percentage >= 75) return 'text-emerald-400'
        if (percentage >= 65) return 'text-amber-400'
        return 'text-red-400'
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">💰 Salary Breakdown</h2>
                <Badge variant="default">Monthly</Badge>
            </div>

            <div className="space-y-4">
                {/* CTC */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-xs text-blue-300 font-medium mb-1">Annual CTC</p>
                    <p className="text-2xl font-bold text-white">
                        {formatCurrency(breakdown.ctc_annual)}
                    </p>
                    <p className="text-sm text-blue-200/80 mt-1">
                        {formatCurrency(breakdown.ctc_monthly)}/month
                    </p>
                </div>

                {/* In-Hand */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-xs text-emerald-300 font-medium mb-1">In-Hand Salary</p>
                    <p className="text-2xl font-bold text-white">
                        {formatCurrency(breakdown.in_hand_monthly)}
                    </p>
                    <p className={`text-sm font-semibold mt-1 ${getInHandColor(breakdown.in_hand_percentage)}`}>
                        {breakdown.in_hand_percentage}% of CTC
                    </p>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deductions</p>

                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-sm text-slate-300">Employee PF (12%)</span>
                        <span className="font-semibold text-white">
                            {formatCurrency(breakdown.pf_employee)}
                        </span>
                    </div>

                    {breakdown.other_deductions && Object.keys(breakdown.other_deductions).length > 0 && (
                        Object.entries(breakdown.other_deductions).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-sm text-slate-300 capitalize">
                                    {key.replace('_', ' ')}
                                </span>
                                <span className="font-semibold text-white">
                                    {formatCurrency(value)}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Employer Contribution (Info) */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mt-2">
                    <p className="text-xs text-slate-400 mb-1">ℹ️ Employer PF Contribution</p>
                    <p className="text-sm font-semibold text-slate-200">
                        {formatCurrency(breakdown.pf_employer)} (not in your account)
                    </p>
                </div>
            </div>
        </Card>
    )
}

export default SalaryBreakdownCard
