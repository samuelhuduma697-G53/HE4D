import { useEffect, useState } from 'react'
import { Card } from '../common/Card'
import { HelperVerification } from './HelperVerification'
import { UserManagement } from './UserManagement'
import { CrisisMonitor } from './CrisisMonitor'
import { Analytics } from './Analytics'
import { AuditLogs } from './AuditLogs'
import { SafetyIncidents } from './SafetyIncidents'
import { adminService } from '../../services/adminService'

const tabs = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'verifications', label: '✅ Verifications' },
  { id: 'users', label: '👥 Users' },
  { id: 'crises', label: '🚨 Crises' },
  { id: 'analytics', label: '📈 Analytics' },
  { id: 'audit', label: '📋 Audit Logs' },
  { id: 'safety', label: '🛡️ Safety' },
]

export const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    adminService.getDashboard().then(setDashboard)
  }, [])

  if (!dashboard) return null

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={"px-4 py-2 rounded-lg text-sm transition " + (activeTab === tab.id ? 'bg-primary-gold text-dark-base font-semibold' : 'bg-dark-elevated text-gray-400 hover:text-white')}
          >
            {tab.id === 'verifications' && dashboard.stats?.verifications?.pending > 0 ? (
              <>{tab.label} <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">{dashboard.stats.verifications.pending}</span></>
            ) : tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center"><p className="text-3xl font-bold text-primary-gold">{dashboard.stats?.users?.totalSeekers || 0}</p><p className="text-gray-400">Seekers</p></Card>
            <Card className="text-center"><p className="text-3xl font-bold text-primary-gold">{dashboard.stats?.users?.totalHelpers || 0}</p><p className="text-gray-400">Helpers</p></Card>
            <Card className="text-center"><p className="text-3xl font-bold text-primary-gold">{dashboard.stats?.crises?.activeCrises || 0}</p><p className="text-gray-400">Active Crises</p></Card>
            <Card className="text-center"><p className="text-3xl font-bold text-primary-gold">{dashboard.stats?.verifications?.pending || 0}</p><p className="text-gray-400">Pending Verifications</p></Card>
          </div>
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Recent Crises</h3>
            {dashboard.recentCrises?.map(c => (
              <div key={c._id} className="flex justify-between p-3 glass-card mb-2">
                <div><p className="text-white text-sm">{c.rawInput?.substring(0, 50)}...</p><p className="text-gray-500 text-xs">{c.seekerId?.name || 'Anonymous'}</p></div>
                <span className="text-gray-400 text-xs capitalize">{c.status}</span>
              </div>
            ))}
          </Card>
        </>
      )}
      {activeTab === 'verifications' && <HelperVerification />}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'crises' && <CrisisMonitor />}
      {activeTab === 'analytics' && <Analytics />}
      {activeTab === 'audit' && <AuditLogs />}
      {activeTab === 'safety' && <SafetyIncidents />}
    </div>
  )
}
