import Card from './Card'
import Badge from './Badge'

function ComparisonStats({ data }) {
    if (!data) return null

    const getStatusColor = (status) => {
        switch (status) {
            case 'CORRECT':
            case 'ACCEPTABLE':
            case 'NONE':
                return 'success'
            case 'HIGH':
            case 'LOW':
                return 'high'
            default:
                return 'default'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'CORRECT':
            case 'ACCEPTABLE':
            case 'NONE':
                return '✓'
            case 'HIGH':
            case 'LOW':
                return '⚠'
            default:
                return '?'
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PF Rate Card */}
            <Card>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-300">PF Deduction Rate</h3>
                    <Badge variant={getStatusColor(data.pf_status)}>
                        {getStatusIcon(data.pf_status)} {data.pf_status}
                    </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{data.pf_rate}%</span>
                    <span className="text-sm text-slate-400">vs 12% standard</span>
                </div>
                <div className="mt-4 bg-white/5 rounded-lg p-2 border border-white/10">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Standard Rate</span>
                        <span className="font-semibold text-slate-200">12%</span>
                    </div>
                </div>
            </Card>

            {/* Admin Charges Card */}
            <Card>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-300">Admin Charges</h3>
                    <Badge variant={data.admin_charges_status === 'NONE' || data.admin_charges_status === 'ACCEPTABLE' ? 'success' : 'high'}>
                        {getStatusIcon(data.admin_charges_status)} {data.admin_charges_status}
                    </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">₹{data.admin_charges || 0}</span>
                    <span className="text-sm text-slate-400">per month</span>
                </div>
                {data.admin_charges > 0 && (
                    <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <p className="text-xs text-amber-200/80">
                            {data.admin_charges > 500
                                ? '⚠ Higher than typical (₹200-300/month)'
                                : '✓ Within acceptable range'}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default ComparisonStats
