import { useState, useEffect, useCallback } from 'react'
import { getContracts, getAlerts, getLatestSnapshot, getMarketHistory } from './lib/api'
import type { Contract, Alert, MarketSnapshot } from './lib/api'
import Dashboard from './components/Dashboard'
import Contracts from './components/Contracts'
import MarketWatch from './components/MarketWatch'
import Analytics from './components/Analytics'

const TABS = ['Dashboard', 'Contracts', 'Market Watch', 'Analytics']

export default function App() {
  const [tab, setTab] = useState('Dashboard')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [snapshot, setSnapshot] = useState<{ corn: MarketSnapshot | null; beans: MarketSnapshot | null }>({ corn: null, beans: null })
  const [cornHistory, setCornHistory] = useState<MarketSnapshot[]>([])
  const [beansHistory, setBeansHistory] = useState<MarketSnapshot[]>([])

  const refresh = useCallback(async () => {
    const [c, a, s, ch, bh] = await Promise.all([
      getContracts(),
      getAlerts(),
      getLatestSnapshot(),
      getMarketHistory('corn', 30),
      getMarketHistory('soybeans', 30),
    ])
    setContracts(c)
    setAlerts(a)
    setSnapshot(s)
    setCornHistory(ch)
    setBeansHistory(bh)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center font-bold text-xl">🌾</div>
            <div>
              <div className="font-bold text-lg leading-tight">Grain Market</div>
              <div className="text-xs text-gray-400">Root Risk Management</div>
            </div>
          </div>
          <nav className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}>
                {t}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto">
        {tab === 'Dashboard' && (
          <Dashboard contracts={contracts} alerts={alerts}
            cornHistory={cornHistory} beansHistory={beansHistory} snapshot={snapshot} />
        )}
        {tab === 'Contracts' && (
          <Contracts contracts={contracts} onRefresh={refresh} />
        )}
        {tab === 'Market Watch' && (
          <MarketWatch snapshot={snapshot} cornHistory={cornHistory} beansHistory={beansHistory}
            alerts={alerts} onRefresh={refresh} />
        )}
        {tab === 'Analytics' && (
          <Analytics contracts={contracts} snapshot={snapshot} />
        )}
      </main>
    </div>
  )
}
