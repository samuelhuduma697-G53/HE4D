import { Card } from '../common/Card'

export const HelperStats = ({ stats }) => {
  if (!stats) return null

  const statItems = [
    { label: 'Total Cases', value: stats.totalCases || 0 },
    { label: 'Completed', value: stats.completedCases || 0 },
    { label: 'Trust Score', value: `${stats.trustScore?.toFixed(1) || '5.0'}/5.0` },
    { label: 'Active Crises', value: stats.activeCrises || 0 }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="text-center">
          <p className="text-3xl font-bold text-primary-gold">{item.value}</p>
          <p className="text-gray-400 text-sm">{item.label}</p>
        </Card>
      ))}
    </div>
  )
}
