import { useMemo } from 'react'
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts'
import type { Contract, Alert, MarketSnapshot } from '../lib/api'
import { fmtBushels, fmtPrice, fmtCurrency } from '../lib/utils'

interface Props {
  contracts: Contract[]
  alerts: Alert[]
  cornHistory: MarketSnapshot[]
  beansHistory: MarketSnapshot[]
  snapshot: { corn: MarketSnapshot | null; beans: MarketSnapshot | null }
}

const ESTIMATED_CROP = { corn: 50000, soybeans: 20000 }

export default function Dashboard({ contracts, alerts, cornHistory, beansHistory, snapshot }: Props) {
  const open = contracts.filter(c => c.status === 'open')

  const cornBu = useMemo(() => open.filter(c => c.crop === 'corn').reduce((s, c) => s + c.bushels, 0), [open])
  const beansBu = useMemo(() => open.filter(c => c.crop === 'soybeans').reduce((s, c) => s + c.bushels, 0), [open])

  const avgCornPrice = useMemo(() => {
    const cc = open.filter(c => c.crop === 'corn')
    return cc.length ? cc.reduce((s, c) => s + c.price * c.bushels, 0) / cc.reduce((s, c) => s + c.bushels, 0) : null
  }, [open])
  const avgBeansPrice = useMemo(() => {
    const bb = open.filter(c => c.crop === 'soybeans')
    return bb.length ? bb.reduce((s, c) => s + c.price * c.bushels, 0) / bb.reduce((s, c) => s + c.bushels, 0) : null
  }, [open])

  const thisMonth = useMemo(() => {
    const now = new Date()
    const mo = now.toISOString().slice(0, 7)
    return open.filter(c => c.deliveryEnd && c.deliveryEnd.startsWith(mo))
  }, [open])

  const activeAlerts = alerts.filter(a => a.active === 1)

  const cornSparkData = cornHistory.slice(-14).map(s => ({ v: s.futuresPrice }))
  const beansSparkData = beansHistory.slice(-14).map(s => ({ v: s.futuresPrice }))

  return (
    <div className="space-y-6 p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Corn Contracted" value={fmtBushels(cornBu)}
          sub={`${Math.round(cornBu / ESTIMATED_CROP.corn * 100)}% of est. crop`}
          accent="yellow" />
        <Card title="Beans Contracted" value={fmtBushels(beansBu)}
          sub={`${Math.round(beansBu / ESTIMATED_CROP.soybeans * 100)}% of est. crop`}
          accent="green" />
        <Card title="Avg Corn Price" value={fmtPrice(avgCornPrice)}
          sub={snapshot.corn ? `Market: ${fmtPrice(snapshot.corn.cashPrice)}` : 'No market data'}
          accent="yellow" />
        <Card title="Avg Bean Price" value={fmtPrice(avgBeansPrice)}
          sub={snapshot.beans ? `Market: ${fmtPrice(snapshot.beans.cashPrice)}` : 'No market data'}
          accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sparklines */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Recent Price Movement</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-yellow-700 font-medium mb-1">🌽 Corn Futures (ZC)</div>
              <div className="text-2xl font-bold">{snapshot.corn ? fmtPrice(snapshot.corn.futuresPrice) : '—'}</div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={cornSparkData}>
                  <Line type="monotone" dataKey="v" stroke="#ca8a04" strokeWidth={2} dot={false} />
                  <Tooltip formatter={(v: number) => ['$' + v.toFixed(4), 'ZC']} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="text-sm text-green-700 font-medium mb-1">🫘 Soybean Futures (ZS)</div>
              <div className="text-2xl font-bold">{snapshot.beans ? fmtPrice(snapshot.beans.futuresPrice) : '—'}</div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={beansSparkData}>
                  <Line type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={2} dot={false} />
                  <Tooltip formatter={(v: number) => ['$' + v.toFixed(4), 'ZS']} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Active Alerts ({activeAlerts.length})</h3>
          {activeAlerts.length === 0 ? (
            <p className="text-gray-400 text-sm">No active alerts</p>
          ) : (
            <ul className="space-y-2">
              {activeAlerts.map(a => (
                <li key={a.id} className="text-sm flex justify-between">
                  <span className={a.crop === 'corn' ? 'text-yellow-700' : 'text-green-700'}>
                    {a.crop === 'corn' ? '🌽' : '🫘'} {a.alertType.replace('_', ' ')}
                  </span>
                  <span className="font-mono font-medium">{fmtPrice(a.targetValue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Deliver this month */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold text-gray-700 mb-3">
          Contracts to Deliver This Month ({thisMonth.length})
        </h3>
        {thisMonth.length === 0 ? (
          <p className="text-gray-400 text-sm">No deliveries due this month</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Crop</th><th className="pb-2">Elevator</th>
                <th className="pb-2">Bushels</th><th className="pb-2">Price</th>
                <th className="pb-2">Revenue</th><th className="pb-2">Delivery</th>
              </tr>
            </thead>
            <tbody>
              {thisMonth.map(c => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-1">{c.crop === 'corn' ? '🌽' : '🫘'} {c.crop}</td>
                  <td className="py-1">{c.elevator}</td>
                  <td className="py-1">{fmtBushels(c.bushels)}</td>
                  <td className="py-1">{fmtPrice(c.price)}</td>
                  <td className="py-1">{fmtCurrency(c.price * c.bushels)}</td>
                  <td className="py-1 text-gray-500">{c.deliveryEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Card({ title, value, sub, accent }: { title: string; value: string; sub: string; accent: 'yellow' | 'green' }) {
  return (
    <div className={`bg-white rounded-xl shadow p-4 border-l-4 ${accent === 'yellow' ? 'border-yellow-500' : 'border-green-600'}`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  )
}
