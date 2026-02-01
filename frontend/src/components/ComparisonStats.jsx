import Card from './Card'
import Badge from './Badge'

function ComparisonStats({ data }) {
    if (!data) return null

    const getStatusColor = (status) => {
        switch (status) {
            case 'CORRECT':
            case 'ACCEPTABLE':
            case 'NONE':
                return 'bg-green-50 border-green-200 text-green-800'
            case 'HIGH':
            case 'LOW':
                return 'bg-red-50 border-red-200 text-red-800'
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800'
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
                    <h3 className="text-sm font-semibold text-slate-700">PF Deduction Rate</h3>
                    <Badge variant={data.pf_status === 'CORRECT' ? 'success' : 'high'}>
                        {getStatusIcon(data.pf_status)} {data.pf_status}
                    </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">{data.pf_rate}%</span>
                    <span className="text-sm text-slate-500">vs 12% standard</span>
                </div>
                <div className="mt-3 bg-slate-50 rounded-lg p-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Standard Rate</span>
                        <span className="font-semibold text-slate-700">12%</span>
                    </div>
                </div>
            </Card>

            {/* Admin Charges Card */}
            <Card>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">Admin Charges</h3>
                    <Badge variant={data.admin_charges_status === 'NONE' || data.admin_charges_status === 'ACCEPTABLE' ? 'success' : 'high'}>
                        {getStatusIcon(data.admin_charges_status)} {data.admin_charges_status}
                    </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">₹{data.admin_charges || 0}</span>
                    <span className="text-sm text-slate-500">per month</span>
                </div>
                {data.admin_charges > 0 && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
                        <p className="text-xs text-amber-800">
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
