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
        if (percentage >= 75) return 'text-green-600'
        if (percentage >= 65) return 'text-amber-600'
        return 'text-red-600'
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">💰 Salary Breakdown</h2>
                <Badge variant="default">Monthly</Badge>
            </div>

            <div className="space-y-4">
                {/* CTC */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-700 font-medium mb-1">Annual CTC</p>
                    <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(breakdown.ctc_annual)}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                        {formatCurrency(breakdown.ctc_monthly)}/month
                    </p>
                </div>

                {/* In-Hand */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-green-700 font-medium mb-1">In-Hand Salary</p>
                    <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(breakdown.in_hand_monthly)}
                    </p>
                    <p className={`text-sm font-semibold mt-1 ${getInHandColor(breakdown.in_hand_percentage)}`}>
                        {breakdown.in_hand_percentage}% of CTC
                    </p>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 uppercase">Deductions</p>

                    <div className="flex justify-between items-center py-2 border-b border-slate-200">
                        <span className="text-sm text-slate-700">Employee PF (12%)</span>
                        <span className="font-semibold text-slate-900">
                            {formatCurrency(breakdown.pf_employee)}
                        </span>
                    </div>

                    {breakdown.other_deductions && Object.keys(breakdown.other_deductions).length > 0 && (
                        Object.entries(breakdown.other_deductions).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-2 border-b border-slate-200">
                                <span className="text-sm text-slate-700 capitalize">
                                    {key.replace('_', ' ')}
                                </span>
                                <span className="font-semibold text-slate-900">
                                    {formatCurrency(value)}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Employer Contribution (Info) */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">ℹ️ Employer PF Contribution</p>
                    <p className="text-sm font-semibold text-slate-700">
                        {formatCurrency(breakdown.pf_employer)} (not in your account)
                    </p>
                </div>
            </div>
        </Card>
    )
}

export default SalaryBreakdownCard
